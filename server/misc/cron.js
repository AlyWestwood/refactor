// const nodeCron = require("node-cron");
// const express = require("express");
// const { Users, Accounts, Cheques } = require("../models");
// const db = require("../models/index");
// const sgMail = require('@sendgrid/mail');
// sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// function cron() {
//   nodeCron.schedule("* * * * *", async function () {
//     console.log("daily at 8");

//     db.sequelize
//       .query(
//         "select * from accounts where (accountType = 'credit' and creditLimit - balance <= 50) or (accountType = 'debit' and balance <= 50)",
//         { model: Accounts }
//       )
//       .then((response) => {
//         for(let i = 0; i < response.length; i++){
//           const accountObj = response[i];
//           // send email
//           let message;
//           if(response[i].accountType === "credit"){
//             message = "You are $" + (accountObj.creditLimit - accountObj.balance) + " from your credit limit in account " + accountObj.id + "." ;
//           }else{
//             message = "You have $" + accountObj.balance + " left in account " + accountObj.id + ".";
//           }
//           email(accountObj.email, accountObj.firstName, accountObj.lastName, message);
//         }

//         console.log("Emailing");
//         email();
//       })
//       .catch((err) => {
//         console.log(err);
//       });

//   });
// }

// function email(to, firstName, lastName, message) {

//   console.log({from: process.env.SENDGRID_SENDER_EMAIL, template: process.env.SENDGRID_TEMPLATE})
//   const msg = {
//     to: to,
//     name: firstName + " " + lastName, // Change to your recipient
//     from: process.env.SENDGRID_SENDER_EMAIL,
//     template_id:  process.env.SENDGRID_TEMPLATE,
//     dynamic_template_data: {
//       user: firstName,
//       message: message,
//     }
//   }

//   console.log(msg);

//   sgMail
//   .send(msg)
//   .then((response) => {
//     console.log(response[0].statusCode)
//     console.log(response[0].headers)
//   })
//   .catch((error) => {
//     console.error(error)
//   })

// }

// module.exports = { cron };
