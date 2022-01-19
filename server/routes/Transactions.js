const express = require("express");
const router = express.Router();
const { Users } = require("../models");
const { Transactions, Accounts, Cheques } = require("../models");
const { validateToken } = require("../misc/authware");
const axios = require("axios");
const AWS = require("aws-sdk");
const fs = require("fs");
const multiparty = require("multiparty");
const detect = require("detect-file-type");
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

// Create S3 service object
var s3 = new AWS.S3({ apiVersion: "2006-03-01" });

/**
 * gets transactions of specific account after verifying account can be accessed by logged in user
 *
 * params: logged in user, account id in url
 * returns: all transactions of the account - deposits and withdrawls
 */
router.get("/byAccount/:accountId", validateToken, async (req, res) => {
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
router.get("/singleTransaction/:transactionId", validateToken, async (req, res) => {
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

  const targetValue = await exchangeCurrency(
    originAccount.currency,
    targetAccount.currency,
    originValue
  );

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

router.get("/cheques/:chequeId", validateToken, async (req, res) => {
  const userId = req.userId;
  const chequeId = req.params.chequeId;
  const cheque = await Cheques.findByPk(chequeId);
  if(!cheque || (cheque.uploadedBy !== userId && cheque.payerAccountId!== userId)){
    return res.status(403).json("User not authorized");
  }
  
  downloadFromS3(cheque.s3key).then((data) => {
    
    res.send(Buffer.from(data.Body).toString('base64'));
  }).catch((error) =>{
    console.log(error);
  });
})

router.post("/depositCheque", validateToken, async (req, res) => {
  const uploadResult = await uploadCheque(req);
  console.log(uploadResult);
  if (!uploadResult) {
    return res.status(400).json({ error: "could not record cheque" });
  }
  const tempData = {
    payeeAccountId: 4,
    payerAccountId: 3,
    value: 27,
    chequeNumber: 234,
  };
  const { payeeAccountId, payerAccountId, value, chequeNumber } = tempData;
  // const { payeeAccountId, payerAccountId, value} = req.body;
  const targetAccount = await Accounts.findOne({
    where: { id: payeeAccountId, UserId: req.userId },
  });
  const originAccount = await Accounts.findByPk(payerAccountId);

  if (
    !originAccount ||
    !targetAccount ||
    originAccount.accountType === "credit" ||
    payeeAccountId === payerAccountId
  ) {
    return res.status(403).json("Unable to transfer to that account");
  }
  const duplicateCheques = await Cheques.findAll({
    where: { payerAccountId: payerAccountId, chequeNumber: chequeNumber },
  });
  if (duplicateCheques) {
    for (let i = 0; i < duplicateCheques.length; i++) {
      if (duplicateCheques[i].status !== "on hold") {
        return res.status(400).json("That check has already been deposited");
      }
    }
  }

  const chequeData = {
    s3key: uploadResult.key,
    uploadDate: new Date(),
    status: "on hold",
    uploadedBy: req.userId,
    payerAccountId: payerAccountId,
  };
  let chequeId;
  const cheque = await Cheques.create(chequeData).then(
    (response) => (chequeId = response.id)
  );
  const targetValue = await exchangeCurrency(
    originAccount.currency,
    targetAccount.currency,
    value
  );

  console.log(chequeId);
  const transactionData = {
    originValue: value,
    targetValue: targetValue,
    originCurrency: originAccount.currency,
    targetCurrency: targetAccount.currency,
    transactionDate: new Date(),
    status: "pending",
    payeeAccountId: payeeAccountId,
    payerAccountId: payerAccountId,
    chequeId: chequeId,
  };

  //the cheque will stay on hold and the transaction pending until an admin reviews it and approves it.
  await Transactions.create(transactionData)
    .then((result) => {
      Cheques.update({ transactionId: result.id }, { where: { id: chequeId } });
      return res.json(result);
    })
    .catch((error) => {
      return res.status(400).json(error);
    });
});

async function uploadCheque(req) {
  return await new Promise((resolve, reject) => {
    const form = new multiparty.Form();
    form.parse(req, async (error, fields, files) => {
      if (error) {
        reject(error);
      }
      try {
        const path = files.file[0].path;
        const buffer = fs.readFileSync(path);
        let type = "jpg";
        await detect.fromBuffer(buffer, (err, result) => {
          type = result.ext;
        });
        const fileName = `cheques/${Date.now().toString()}`;
        const data = await uploadToS3(buffer, fileName, type);
        console.log(data);
        resolve(data);
      } catch (err) {
        console.log(err);
        reject(err);
      }
    });
  });
}

const downloadFromS3 = async (key) => {
  const downloadParams = {
    Bucket: process.env.S3BUCKET,
    Key: key,
  }

  return await s3.getObject(downloadParams).promise();
}

const uploadToS3 = async (buffer, name, type) => {
  const uploadParams = {
    Bucket: process.env.S3BUCKET,
    Key: name + "." + type,
    Body: buffer,
  };

  // call S3 to retrieve upload file to specified bucket
  return await s3.upload(uploadParams).promise();
};

const exchangeCurrency = async (originCurrency, targetCurrency, value) => {
  return await new Promise((resolve, reject) => {
    if (targetCurrency !== originCurrency) {
      const url =
        "https://v6.exchangerate-api.com/v6/" +
        process.env.EXCHANGEAPIKEY +
        "/pair/" +
        originCurrency +
        "/" +
        targetCurrency +
        "/" +
        value;
      axios
        .get(url)
        .then((response) => {
          console.log(response.data.conversion_result);
          resolve(response.data.conversion_result);
        })
        .catch((err) => reject(err));
    } else {
      resolve(value);
    }
  });
};
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
