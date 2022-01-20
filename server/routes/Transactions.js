const express = require("express");
const router = express.Router();
const { Users } = require("../models");
const { Transactions, Accounts, Cheques } = require("../models");
const { validateToken, validateTokenDirect, validateAdminTokenDirect } = require("../misc/authware");

const {uploadCheque, exchangeCurrency, downloadCheque} = require("../utils/utils");
const Op = require('Sequelize').Op


/**
 * gets transactions of specific account after verifying account can be accessed by logged in user
 *
 * params: logged in user, account id in url
 * returns: all transactions of the account - deposits and withdrawls
 */
router.get("/byAccount/:accountId", validateToken, async (req, res) => {
  const accountId = req.params.accountId;
  const account = await Accounts.findOne({ where: { userId: req.userId } });
  if (!account) {
    return res.status(404).json({ error: "No account found" });
  }
  const listOfTransactions = await Transactions.findAll({
    where:  {  [Op.or]: [{payeeAccount: accountId}, {payerAccount: accountId}] },
  });

  res.json(listOfTransactions);
});

/**
 * gets single transaction
 * params: transaction id
 * return: single transaction
 */
router.get(
  "/singleTransaction/:transactionId",
  validateToken,
  async (req, res) => {
    const { transactionId } = req.params;

    const transaction = await Transactions.findByPk(transactionId);

    if (!transaction) {
      return res.status(404).json("Transaction not found");
    }

    return res.json(transaction);
  }
);

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

router.get("/cheques/:chequeId/:accessToken", async (req, res) => {
  // const userId = req.userId;
  const accessToken = req.params.accessToken;
  const validate = await validateTokenDirect(accessToken).catch((err) => {
    console.log(err);
  });
  if(!validate){
    return res.status(403).json("user not auth");
  }
  const userId = validate.userId;

  const chequeId = req.params.chequeId;
  const cheque = await Cheques.findByPk(chequeId);
  if(!cheque || (cheque.uploadedBy !== userId && cheque.payerAccountId!== userId)){
    return res.status(403).json({error: "User not authorized", cheque: cheque,  validate: validate});
  }

//   downloadFromS3(chequeId)
// .then((data) => {
//   // downloadFromS3(cheque.s3key).then((data) => {

//   // res.send(Buffer.from(data.Body).toString('base64'));
//   res.header("Content-Type", "image/jpeg").send(data.Body);
// })
// .catch((error) => {
//   console.log(error);
// });

downloadCheque(chequeId).then((result) => {
  res.header("Content-Type", "image/jpeg").send(result.Body);
}).catch((err) => {
  console.log("after download cheque");
  console.log("err" + err)
  res.status(400).json(err);
})
});

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
