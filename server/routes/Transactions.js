const express = require("express");
const router = express.Router();
const { Users } = require("../models");
const { Transactions, Accounts } = require("../models");
const { validateToken } = require("../misc/authware");
const axios = require("axios");
var AWS = require('aws-sdk');
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

/**
 * gets transactions of specific account after verifying account can be accessed by logged in user
 *
 * params: logged in user, account id in url
 * returns: all transactions of the account - deposits and withdrawls
 */
router.get("/:accountId", validateToken, async (req, res) => {
  const accountId = req.params.accountId;
  const account = await Accounts.findOne({ where: { UserId: req.userId } });
  if (!account) {
    return res.status(404).json({ error: "No account found" });
  }
  const listOfTransactions = await Transactions.findAll({
    where: { payeeAccountId: accountId, payerAccountId: accountId },
  });

  res.json(listOfTransactions);
});

/**
 * gets single transaction
 * params: transaction id
 * return: single transaction
 */
router.get("/:transactionId", validateToken, async (req, res) => {
  const { transactionId } = req.params;

  const transaction = await Transactions.findByPk(transactionId);

  if (!transaction) {
    return res.status(404).json("Transaction not found");
  }

  return res.json(transaction);
});

/**
 * post here when a user creates a transaction - requesting payment, transferring funds, paying fees
 *
 * params: logged in user, target account id, origin account id, value (in origin account currency)
 */

router.post("/transferFunds", validateToken, async (req, res) => {
  const userId = req.userId;
  const { payerAccountId, payeeAccountId, originValue } = req.body;
  if (payerAccountId === payeeAccountId) {
    return res.status(400).json("Cannot transfer funds to same account");
  }
  const originAccount = await Accounts.findOne({
    where: { id: payerAccountId, UserId: userId },
  });
  const targetAccount = await Accounts.findByPk(payeeAccountId);

  if (
    !originAccount ||
    !targetAccount ||
    payerAccountId === 1 ||
    payeeAccountId === 1 ||
    originAccount.activeStatus !== "active" ||
    targetAccount.activeStatus !== "active"
  ) {
    return res.status(403).json("Cannot transfer funds with this account");
  }

  let targetValue;
  if (targetAccount.currency !== originAccount.currency) {
    const url =
      "https://v6.exchangerate-api.com/v6/" +
      process.env.EXCHANGEAPIKEY +
      "/pair/" +
      originAccount.currency +
      "/" +
      targetAccount.currency +
      "/" +
      originValue;
    await axios.get(url).then((response) => {
      targetValue = response.data.conversion_result;
      console.log(targetValue);
    });
  } else {
    targetValue = originValue;
  }

  const transaction = {
    originValue: originValue,
    targetValue: targetValue,
    originCurrency: originAccount.currency,
    targetCurrency: targetAccount.currency,
    transactionDate: new Date(),
    status: "pending",
    payeeAccountId: payeeAccountId,
    payerAccountId: payerAccountId,
  };

  let transactionResult;
  await Transactions.create(transaction)
    .then((result) => {
      transactionResult = result;
    })
    .catch((error) => {
      return res.status(400).json(error);
    });

  if (originAccount.accountType === "debit") {
    if (Number(originAccount.balance) < originValue) {
      const transactionUpdate = { status: "denied" };
      Transactions.update(transactionUpdate, {
        where: { id: transactionResult.id },
      });
      return res.status(400).json("Insufficient funds");
    }
  }
  //in credit, balance is how much credit has been used up to the limit. so if the balance plus the transfer would be more than the limit, deny it
  if (
    originAccount.accountType === "credit" &&
    Number(originAccount.balance) + originValue > originAccount.creditLimit
  ) {
    const transactionUpdate = { status: "denied" };
    Transactions.update(transactionUpdate, {
      where: { id: transactionResult.id },
    });
    return res.status(400).json("Insufficient funds");
  }

  const payerUpdate = {
    balance:
      originAccount.accountType === "credit"
        ? Number(originAccount.balance) + transactionResult.originValue
        : Number(originAccount.balance) - transactionResult.originValue,
  };

  const payeeUpdate = {
    balance:
      targetAccount.accountType === "credit"
        ? Number(targetAccount.balance) - transactionResult.targetValue
        : Number(targetAccount.balance) + transactionResult.targetValue,
  };

  Accounts.update(payerUpdate, { where: { id: payerAccountId } })
    .then((result) => {
      console.log(result);
    })
    .catch((err) => {
      console.log(err);
    });
  Accounts.update(payeeUpdate, { where: { id: payeeAccountId } })
    .then((result) => {
      console.log(result);
    })
    .catch((err) => {
      console.log(err);
    });
  const transactionUpdate = { status: "accepted" };
  Transactions.update(transactionUpdate, {
    where: { id: transactionResult.id },
  });
  return res.json("Transferred successfully");
});



/**
 * cheques !!
 */


router.post("/upload", (req, res) => {
    const {fileName} = req.body;
    // Create S3 service object
    var s3 = new AWS.S3({apiVersion: '2006-03-01'});
    
    // call S3 to retrieve upload file to specified bucket
    var uploadParams = {Bucket: process.env.S3BUCKET, Key: '', Body: ''};
    var file = "test/" + fileName;
    
    // Configure the file stream and obtain the upload parameters
    var fs = require('fs');
    var fileStream = fs.createReadStream(file);
    fileStream.on('error', function(err) {
      console.log('File Error', err);
    });
    uploadParams.Body = fileStream;
    var path = require('path');
    uploadParams.Key = path.basename(file);
    
    // call S3 to retrieve upload file to specified bucket
    s3.upload (uploadParams, function (err, data) {
      if (err) {
        console.log("Error", err);
      } if (data) {
        console.log("Upload Success", data.Location);
      }
    });
    

    res.json("completed");
})




/**
 * request payment
 * params: value (value is in payee account currency), payer account (account to send money), payee account (requester, logged in user)
 */
// router.post("/requestPayment", validateToken, async (req, res) => {
//     // const payeeUserId = req.userId;
//     const { payeeEmail, payerAccountId, value} = req.body;
//     /
// })

module.exports = router;
