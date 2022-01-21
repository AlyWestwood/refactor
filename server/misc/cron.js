const nodeCron = require("node-cron");
const express = require("express");
const { RecurringPayments, Accounts, Transactions } = require("../models");
const db = require("../models/index");
const sgMail = require("@sendgrid/mail");
const { exchangeCurrency } = require("../utils/utils");
const { Op } = require("sequelize");
const { Account } = require("aws-sdk");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

function cron() {
  nodeCron.schedule("0 8 * * *", async function () {
    console.log("daily at 8");

    checkWarnings();
    checkRecurringPayments();
    checkCreditUpdates();
  });
}

async function checkCreditUpdates() {
  const creditFeesDueAccounts = await Accounts.findAll({
    where: {
      nextPaymentDueDate: { [Op.eq]: new Date() },
      balance: { [Op.gt]: 0 },
      activeStatus: "active",
    },
  });

  console.log(creditFeesDueAccounts);

  for (let i = 0; i < creditFeesDueAccounts.length; i++) {
    const account = creditFeesDueAccounts[i];

    const today = new Date().setUTCHours(0, 0, 0, 0);
    const dbDate = new Date(account.nextPaymentDueDate).setUTCHours(0, 0, 0, 0);

    //if this is the first time we're seeing this account (ie, it's today), decide the minimum payment and calculate the interest on this balance for the 
    let updateValues = {};
    if (dbDate === today) {
      const minimumPayment = account.balance * 0.10;
      const accruedInterest =  Number(account.balance) * (Number(account.interestRate) / 100 );
      updateValues.minimumPayment = minimumPayment;
      updateValues.balance = Number(account.balance) + Number(accruedInterest);
      const prevPayDate = new Date(account.nextPaymentDueDate);
      updateValues.nextPaymentDueDate = new Date(prevPayDate.setMonth(prevPayDate.getMonth()+1));
    }
  }

  //add late payment fees daily to accounts with outstanding minimum payments
  const minimumPaymentNotPaid = await Accounts.findAll({
    where: {
      minimumPayment: {[Op.gt]: 0}
    }
  });
  for(let i = 0; i < minimumPaymentNotPaid.length; i++){
    let updateValues = {};
    updateValues.latePaymentFees = Number(minimumPaymentNotPaid[i].latePaymentFees) + 2;
    Accounts.update(updateValues, {where: {id: minimumPaymentNotPaid[i].id}});
  }
}

async function checkRecurringPayments() {
  const recurringPayment = await RecurringPayments.findAll({
    where: { activeStatus: "active", paymentDate: new Date() },
  });

  for (let i = 0; i < recurringPayment.length; i++) {
    console.log(recurringPayment[i].id);
    let success = await recurringTransactions(recurringPayment[i]);
    if (success !== "error") {
      //update next date
      const dateModifier = new Date(recurringPayment[i].paymentDate);
      const numberOfDaysToAdd = recurringPayment[i].interval;
      dateModifier.setDate(dateModifier.getDate() + numberOfDaysToAdd);
      RecurringPayments.update(
        { paymentDate: dateModifier },
        { where: { id: recurringPayment[i].id } }
      );
    }
  }
}

async function recurringTransactions(recurringPayment) {
  if (!recurringPayment) {
    return "error";
  }
  const payerAccountId = recurringPayment.payerAccount;
  const payeeAccountId = recurringPayment.payeeAccount;
  const originValue = recurringPayment.originValue;
  const originAccount = await Accounts.findOne({
    where: { id: payerAccountId },
  });
  const targetAccount = await Accounts.findByPk(payeeAccountId);

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
    payeeAccount: payeeAccountId,
    payerAccount: payerAccountId,
    recurringPaymentId: recurringPayment.id,
  };

  let transactionResult;
  await Transactions.create(transaction)
    .then((result) => {
      transactionResult = result;
    })
    .catch((error) => {
      return "error";
    });

  if (originAccount.accountType === "debit") {
    if (Number(originAccount.balance) < originValue) {
      const transactionUpdate = { status: "denied" };
      Transactions.update(transactionUpdate, {
        where: { id: transactionResult.id },
      });
      return "error";
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
    return "error";
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
  return "Transferred successfully";
}

function checkWarnings() {
  db.sequelize
    .query(
      // "select * from accounts inner join users on users.id = accounts.userId where (accountType = 'credit' and creditLimit - balance <= 50) or (accountType = 'debit' and balance <= 50)"
      "select *,  accounts.id as accountId, users.id as usersId from accounts inner join users on users.id = accounts.userId where (accountType = 'credit' and creditLimit - balance <= 50) or (accountType = 'debit' and balance <= 50)"
    )
    .then((response) => {
      for (let i = 0; i < response[0].length; i++) {
        const accountObj = response[0][i];
        // send email
        let message;
        let warning;
        if (accountObj.accountType === "credit") {
          warning = "You're getting close to your credit limit.";
          message =
            "You are $" +
            (accountObj.creditLimit - accountObj.balance) +
            " from your credit limit in account " +
            accountObj.accountId +
            ".";
        } else {
          warning = "Your balance is running low.";
          message =
            "You have $" +
            accountObj.balance +
            " left in account " +
            accountObj.accountId +
            ".";
        }
        const values = {
          email: accountObj.email,
          firstName: accountObj.firstName,
          lastName: accountObj.lastName,
          message: message,
        };
        console.log("values: ");
        console.log(values);
        email(
          accountObj.email,
          accountObj.firstName,
          accountObj.lastName,
          message,
          warning
        );
      }
    })
    .catch((err) => {
      console.log(err);
    });
}

function email(to, firstName, lastName, message, warning) {
  console.log({
    from: process.env.SENDGRID_SENDER_EMAIL,
    template: process.env.SENDGRID_TEMPLATE,
  });
  const msg = {
    to: to,
    name: firstName + " " + lastName, // Change to your recipient
    from: process.env.SENDGRID_SENDER_EMAIL,
    template_id: process.env.SENDGRID_TEMPLATE,
    dynamic_template_data: {
      user: firstName,
      message: message,
      warning: warning,
    },
  };

  console.log(msg);

  sgMail
    .send(msg)
    .then((response) => {
      console.log(response[0].statusCode);
      console.log(response[0].headers);
    })
    .catch((error) => {
      console.error(error);
    });
}

module.exports = { cron, checkRecurringPayments, checkCreditUpdates};
