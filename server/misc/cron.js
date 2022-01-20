const nodeCron = require("node-cron");
const express = require("express");
const { Users, Accounts, Cheques } = require("../models");
const db = require("../models/index");
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

function cron() {
  nodeCron.schedule("0 8 * * *", async function () {
    console.log("daily at 8");

    db.sequelize
      .query(
        // "select * from accounts inner join users on users.id = accounts.userId where (accountType = 'credit' and creditLimit - balance <= 50) or (accountType = 'debit' and balance <= 50)"
        "select *,  accounts.id as accountId, users.id as usersId from accounts inner join users on users.id = accounts.userId where (accountType = 'credit' and creditLimit - balance <= 50) or (accountType = 'debit' and balance <= 50)"
      )
      .then((response) => {
        // console.log(response[0]);
        for(let i = 0; i < response[0].length; i++){
          const accountObj = response[0][i];
          // console.log(accountObj)
          // send email
          let message;
          let warning;
          if(accountObj.accountType === "credit"){
            warning = "You're getting close to your credit limit."
            message = "You are $" + (accountObj.creditLimit - accountObj.balance) + " from your credit limit in account " + accountObj.accountId + "." ;
          }else{
            warning = "Your balance is running low."
            message = "You have $" + accountObj.balance + " left in account " + accountObj.accountId + ".";
          }
          const values = {
            email: accountObj.email,
            firstName: accountObj.firstName,
            lastName: accountObj.lastName,
            message: message
          }
          console.log("values: ");
          console.log(values);
          // email(accountObj.email, accountObj.firstName, accountObj.lastName, message, warning);
        }
      })
      .catch((err) => {
        console.log(err);
      });

  });
}

function email(to, firstName, lastName, message, warning) {

  console.log({from: process.env.SENDGRID_SENDER_EMAIL, template: process.env.SENDGRID_TEMPLATE})
  const msg = {
    to: to,
    name: firstName + " " + lastName, // Change to your recipient
    from: process.env.SENDGRID_SENDER_EMAIL,
    template_id:  process.env.SENDGRID_TEMPLATE,
    dynamic_template_data: {
      user: firstName,
      message: message,
      warning: warning
    }
  }

  console.log(msg);

  sgMail
  .send(msg)
  .then((response) => {
    console.log(response[0].statusCode)
    console.log(response[0].headers)
  })
  .catch((error) => {
    console.error(error)
  })

}

module.exports = { cron };
