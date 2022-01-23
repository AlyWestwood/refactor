const express = require("express");
const router = express.Router();
const db = require("../models/index");
const {
  Transactions,
  Accounts,
  Cheques,
  RecurringPayments,
} = require("../models");
const {
  validateToken,
  validateTokenDirect,
  validateAdminTokenDirect,
} = require("../misc/authware");

const {
  uploadCheque,
  exchangeCurrency,
  downloadCheque,
} = require("../utils/utils");
const Op = require("Sequelize").Op;
const multiparty = require("multiparty");

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
    where: {
      [Op.or]: [{ payeeAccount: accountId }, { payerAccount: accountId }],
    },
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
 * set up a recurring payment
 * interval in days
 */

router.post("/recurringPayments", validateToken, async (req, res) => {
  const userId = req.userId;
  const { payerAccountId, payeeAccountId, originValue, interval, startDate } =
    req.body;

  const payerAccount = await Accounts.findOne({
    where: { id: payerAccountId, userId: userId },
  });
  const payeeAccount = await Accounts.findByPk(payeeAccountId);

  if (originValue < 1) {
    return res.status(400).json("Cannot have a negative value");
  }

  if (
    !payerAccount ||
    !payeeAccount ||
    payerAccountId === payeeAccountId ||
    payerAccount.activeStatus !== "active" ||
    payeeAccount.activeStatus !== "active"
  ) {
    return res
      .status(400)
      .json("Cannot create a recurring payment with these accounts");
  }

  const startDateObj = new Date(startDate);

  if (startDateObj <= new Date()) {
    return res.status(400).json("Start date must be after today");
  }

  if (originValue < 1) {
    return res.status(400).json("The payment value must be more than 1");
  }

  if (interval < 1) {
    return res
      .status(400)
      .json("The recurring interval must be at least 1 day");
  }

  const recurringPayment = {
    payerAccount: payerAccountId,
    payeeAccount: payeeAccountId,
    originValue: originValue,
    activeStatus: "active",
    paymentDate: startDate,
    interval: interval,
  };
  RecurringPayments.create(recurringPayment)
    .then((response) => {
      return res.json("Successfully created a recurring payment");
    })
    .catch((err) => {
      return res.status(400).json(err);
    });
});

/**
 * cancel recurring payment - sets to disabled in db
 * params - logged in user, recurring payment id
 */
router.put("/cancelRecurringPayment", validateToken, (req, res) => {
  const { recurringPaymentId } = req.body;
  const userId = req.userId;

  db.sequelize
    .query(
      "select accounts.userId as userId from recurringPayments join accounts on accounts.id = recurringPayments.payerAccount where recurringPayments.id = ?",
      { replacements: [recurringPaymentId] }
    )
    .then((response) => {
      if (response[0].length > 0) {
        //result
        RecurringPayments.update(
          { activeStatus: "inactive" },
          { where: { id: recurringPaymentId } }
        );
        return res.json("Disabled recurring payment");
      } else {
        //no result
        res.status(400).json("Cannot cancel this recurring payment");
      }
    });
});

/**
 * recurring payments by user
 */
router.get("/recurringPayments", validateToken, async (req, res) => {
  const userId = req.userId;
  db.sequelize
    .query(
      'select recurringpayments.id, recurringpayments.activeStatus, paymentDate, originValue, `interval`, payerAccount, accountType, payeeAccount, currency from recurringPayments join accounts on recurringPayments.payerAccount = accounts.id join users on accounts.userId = users.id where recurringpayments.activeStatus = "active" and userId = ?',
      { replacements: [userId] }
    )
    .then((response) => {
      console.log(response)
      res.json(response);
    })
    .catch((error) => {
      res.status(404).json("Could not find any recurring payments");
    });
});

/**
 * return active recurring payments by account - not user
 */
router.get(
  "/recurringPayments/:accountNumber",
  validateToken,
  async (req, res) => {
    const userId = req.userId;
    const { accountNumber } = req.params;

    const recurringPayments = await db.sequelize.query(
      "select recurringpayments.id, `interval`, paymentDate, originValue, recurringpayments.activeStatus, payerAccount, payeeAccount, accountType, currency from recurringpayments join accounts on accounts.id = recurringpayments.payerAccount where payerAccount = ? and accounts.userId = ?;",
      { replacements: [accountNumber, userId] }
    );
    if (recurringPayments.length > 0) {
      return res.json(recurringPayments[0])
      // const account = await Accounts.findByPk(
      //   recurringPayments[0].payerAccount
      // );
      // if (account.userId === userId) {
      //   return res.json(recurringPayments);
      // }
    }
    return res.json("No recurring payments on this accounts");
  }
);

/**
 * post here when a user creates a transaction - requesting payment, transferring funds, paying fees
 *
 * if a paying fees transaction -- add payingFees: true and accountWithFees: accountId to req body
 *
 * params: logged in user, target account id, origin account id, value (in origin account currency)
 */

router.post("/transferFunds", validateToken, async (req, res) => {
  const userId = req.userId;
  let {
    payerAccountId,
    payeeAccountId,
    originValue,
    payingFees,
    accountWithFees,
  } = req.body;
  if (payerAccountId == payeeAccountId) {
    return res.status(400).json("Cannot transfer funds to same account");
  }

  let accountCarryingFees;
  //this needs to be the admin account!!!
  if (payingFees === true) {
    payeeAccountId = 0;
    if (payerAccountId == accountWithFees) {
      return res
        .status(400)
        .json("Cannot pay fess on account with that account");
    }
  }

  const originAccount = await Accounts.findOne({
    where: { id: payerAccountId, userId: userId },
  });
  const targetAccount = await Accounts.findByPk(payeeAccountId);

  if (
    !originAccount ||
    !targetAccount ||
    originAccount.activeStatus !== "active" ||
    targetAccount.activeStatus !== "active"
  ) {
    return res.status(403).json("Cannot transfer funds with this account");
  }

  if (payingFees === true) {
    accountCarryingFees = await Accounts.findByPk(accountWithFees);
    if (accountCarryingFees.userId !== originAccount.userId) {
      return res.status(403).json("You cannot pay the fees on that account");
    }
    if (accountCarryingFees.latePaymentFees < originValue) {
      return res.status(400).json("Cannot over pay late fees.");
    }
  }

  const targetValue = await exchangeCurrency(
    originAccount.currency,
    targetAccount.currency,
    originValue
  );

  if (payingFees === true) {
    accountCarryingFees = await Accounts.findByPk(accountWithFees);
    if (accountCarryingFees.userId !== originAccount.userId) {
      return res.status(403).json("You cannot pay the fees on that account");
    }
    if (accountCarryingFees.latePaymentFees < targetValue) {
      return res.status(400).json("Cannot over pay late fees.");
    }
  }

  const transaction = {
    originValue: originValue,
    targetValue: targetValue,
    originCurrency: originAccount.currency,
    targetCurrency: targetAccount.currency,
    transactionDate: new Date(),
    status: "pending",
    payeeAccount: payeeAccountId,
    payerAccount: payerAccountId,
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

  let payeeUpdate = {
    balance:
      targetAccount.accountType === "credit"
        ? Number(targetAccount.balance) - transactionResult.targetValue
        : Number(targetAccount.balance) + transactionResult.targetValue,
  };

  if (
    targetAccount.accountType === "credit" &&
    targetAccount.minimumPayment > 0
  ) {
    targetAccount.minimumPayment = targetAccount.minimumPayment - targetValue;
    if (targetAccount.minimumPayment < 0) {
      payeeUpdate.minimumPayment = 0;
    } else {
      payeeUpdate.minimumPayment = minimumPayment;
    }
  }

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

  if (payingFees === true) {
    const latePaymentFees = accountCarryingFees.latePaymentFees - targetValue;
    console.log(latePaymentFees);
    Accounts.update(
      { latePaymentFees: latePaymentFees },
      { where: { id: accountWithFees } }
    ).then((result) => {
      console.log(result);
    });
    return res.json("Fees have been paid");
  } else {
    return res.json("Transferred successfully");
  }
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
  if (!validate) {
    return res.status(403).json("user not auth");
  }
  const userId = validate.userId;

  const chequeId = req.params.chequeId;
  const cheque = await Cheques.findByPk(chequeId);
  if (
    !cheque ||
    (cheque.uploadedBy !== userId && cheque.payerAccount !== userId)
  ) {
    return res.status(403).json({
      error: "User not authorized",
      cheque: cheque,
      validate: validate,
    });
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

  downloadCheque(chequeId)
    .then((result) => {
      res.header("Content-Type", "image/jpeg").send(result.Body);
    })
    .catch((err) => {
      console.log("after download cheque");
      console.log("err" + err);
      res.status(400).json(err);
    });
});

router.post("/depositCheque", validateToken, async (req, res) => {
  const userId = req.userId;

  const form = new multiparty.Form();
  let request;
  await new Promise(async (resolve, reject) => {
    form.parse(req, async (error, fields, files) => {
      if (error) {
        reject(error);
      }
      try {
        const path = files.file[0].path;
        if (!path) reject("No file uploaded");
        const body = { path: path, fields: fields };
        resolve(body);
      } catch (err) {
        reject(err);
      }
    });
  })
    .then((result) => {
      request = result;
      console.log(result);
    })
    .catch((err) => {
      console.log(err);
    });

  if (!request) {
    return res.status(400).json("Bad request");
  }
  const uploadResult = await uploadCheque(request.path);
  const { payeeAccountId, payerAccountId, value, chequeNumber } =
    request.fields;

  // const tempData = {
  //   payeeAccountId: 3,
  //   payerAccountId: 2,
  //   value: 10,
  //   chequeNumber: 265,
  // };
  // const { payeeAccountId, payerAccountId, value, chequeNumber } = tempData;

  const targetAccount = await Accounts.findOne({
    where: { id: payeeAccountId, userId: userId, activeStatus: "active" },
  });
  const originAccount = await Accounts.findOne({
    where: { id: payerAccountId, activeStatus: "active" },
  });

  if (
    !originAccount ||
    !targetAccount ||
    originAccount.accountType === "credit" ||
    payeeAccountId === payerAccountId ||
    originAccount.userId === targetAccount.userId
  ) {
    return res.status(403).json("Unable to transfer to that account");
  }
  const duplicateCheques = await Cheques.findAll({
    where: { payerAccount: payerAccountId, chequeNumber: chequeNumber },
  });
  if (duplicateCheques.length > 0) {
    return res.status(400).json("That check has already been deposited");
  }

  const chequeData = {
    s3key: uploadResult.key,
    uploadDate: new Date(),
    status: "on hold",
    payeeAccount: payeeAccountId,
    payerAccount: payerAccountId,
    chequeNumber: chequeNumber,
  };
  let chequeId;
  await Cheques.create(chequeData).then((response) => (chequeId = response.id));
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
    payeeAccount: payeeAccountId,
    payerAccount: payerAccountId,
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
