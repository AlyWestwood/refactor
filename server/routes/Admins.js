const { response } = require("express");
const express = require("express");
const {
  validateAdminToken,
  validateAdminTokenDirect,
} = require("../misc/authware");
const router = express.Router();
const { Users, Accounts, Cheques, Transactions } = require("../models");
const { downloadCheque } = require("../utils/utils");
const db = require("../models/index");
const paginate = require('jw-paginate');
const { exchangeCurrency } = require("../utils/utils");


/**
 * returns the inactive users in an array of objects
 */
router.get("/approveUsers", validateAdminToken, async (req, res) => {
  const listOfUsers = await Users.findAll({
    where: { activeStatus: "inactive" },
  });

  res.json({ listOfUsers: listOfUsers });
});

/**
 * returns all users 
 */
router.get("/allUsers", validateAdminToken, async (req, res) => {
  let sort = req.query.sort;
  if(!sort){
    sort = "activeStatus";
  }
  const listOfUsers = await Users.findAll({order: [[sort, 'DESC']]});

  
  res.json({listOfUsers: listOfUsers});
})

/**
 * Admins can disable users - not delete
 * all that users accounts must be zeroed first
 * params - admin logged in, user id to be disabled
 */
router.post("/disableUser", validateAdminToken, async (req, res) => {
  const { userId } = req.body;
  let data;
  await Accounts.findAll({ where: { UserId: userId } })
    .then((response) => {
      data = response;
    })
    .catch((error) => {
      return res.status(400).json(error);
    });

  for (let i = 0; i < data.length; i++) {
    if (data[i].balance != 0) {
      console.log(data.balance);
      return res.status(400).json("cannot disable users with active balances");
    }
  }

  Users.update({ activeStatus: "disabled" }, { where: { id: userId } })
    .then((response) => {
      Accounts.update(
        { activeStatus: "disabled" },
        { where: { UserId: userId } }
      );
      return res.json({ message: "User " + userId + " disabled" });
    })
    .catch((error) => {
      return res.status(400).json(error);
    });
});

router.put("/enableUser", validateAdminToken, (req, res) => {
  const { userId } = req.body;
  Users.update({ activeStatus: "active" }, { where: { id: userId } })
    .then((result) => {
      if (result == true) {
        return res.json({
          message: "updated user " + userId + " to active status",
        });
      } else {
        return res.status(404).json("Could not find user");
      }
    })
    .catch((err) => {
      return res.status(400).json(err);
    });
});

/** this method needs an array of user ids ie [1,2,3]
 * it will set each user status to active
 */
router.put("/approveUsers", validateAdminToken, async (req, res) => {
  //an arry of user ids
  const usersToApprove = req.body;
  let failedUpdates = [];
  for (let i = 0; i < usersToApprove.length; i++) {
    await Users.update(
      { activeStatus: "active" },
      { where: { id: usersToApprove[i] } }
    )
      .then((result) => {})
      .catch((err) => {
        failedUpdates.push(i);
      });
  }

  res.json({
    failedUpdates: failedUpdates,
    message: "Updated users to active",
  });
});

/**
 * list of credit accounts for approval. admins would then individually update the credit specific info
 */
router.get("/approveCreditAccounts", validateAdminToken, async (req, res) => {
  const listOfInactiveCreditAccounts = await Accounts.findAll({
    where: { activeStatus: "inactive" },
  });

  res.json({ listOfInactiveCreditAccounts: listOfInactiveCreditAccounts });
});

/**
 * admin get cheque image - accessToken must be in the url
 * use with /approvecheque - 1 to display check img, 1 to display cheque info and transaction info
 */
router.get("/chequeImage/:chequeId/:token", async (req, res) => {
  const token = req.params.token;
  const chequeId = req.params.chequeId;
  const validate = await validateAdminTokenDirect(token).catch((err) => {
    console.log(err);
  });
  if (!validate) {
    return res.status(403).json("User not authenticated");
  }

  downloadCheque(chequeId)
    .then((result) => {
      res.header("Content-Type", "image/jpeg").send(result.Body);
    })
    .catch((err) => {
      console.log("after download cheque");
      console.log("err" + err);
      res.status(400).json(err);
    });

//   const cheque = await downloadCheque(chequeId);
// console.log(cheque);
//   if(cheque){
//     res.header("Content-Type", "image/jpeg").send(cheque.body);
//   }
});


/**
 * get all cheques on hold
 */
router.get("/approveCheques", validateAdminToken, async (req, res) => {
  const chequeList = await db.sequelize.query('select firstName, lastName, uploadDate, transactions.payerAccount, transactions.payeeAccount, chequeNumber, originValue, targetValue, originCurrency, targetCurrency, cheques.id as chequeId from cheques join transactions on cheques.id = transactions.chequeId join accounts on accounts.id = transactions.payeeAccount left join users on users.id = accounts.userId where cheques.`status` = "on hold";');
  if(!chequeList){
    return res.status(400).json("No Cheques");
  }
  const page = parseInt(req.query.page) || 1;
  const pageSize = 4;
  const pager = paginate(chequeList[0].length, page, pageSize);
  const pageOfCheques = chequeList[0].slice(pager.startIndex, pager.endIndex + 1);

  return res.json({pager, pageOfCheques});
})


router.get("/approveCheque/:chequeId", validateAdminToken, async (req, res) => {
  const chequeId = req.params.chequeId;
  const cheque = await Cheques.findByPk(chequeId).catch((error) => {
    console.log(error);
  });

  if (!cheque) {
    return res.status(404).json("Could not find cheque");
  }

  return res.json(cheque);
});

/**
 * data required: 
 * {
    "status": "cleared",
    "chequeId": 2
}
 */
router.put("/approveCheque", validateAdminToken, async (req, res) => {
  const { status, chequeId } = req.body;
  const result = await db.sequelize
  .query(
    "select payerAccount.id as payerAccountId, transactions.payeeAccount as payeeAccountId, transactions.id as transactionId, payerAccount.balance as payerBalance, payeeAccount.accountType as payeeAccountType, payeeAccount.balance as payeeBalance, originValue, targetValue from transactions join accounts as payerAccount on payerAccount.id = transactions.payerAccount join accounts as payeeAccount on payeeAccount.id = transactions.payeeAccount where chequeId = ?", {replacements: [chequeId]}
  );
  if(!result[0][0]){
    return res.status(404).json("No transaction found");
  }
  const {payerAccountId, payeeAccountId, transactionId, payerBalance, payeeAccountType, payeeBalance, originValue, targetValue} = result[0][0];

  if (status === "cleared") {
      if(payerBalance - originValue > 0){
        //proceed with transaction
        const payerUpdate = await Accounts.update({balance: (payerBalance - originValue)}, {where: {id: payerAccountId}});
        const payeeUpdateValues = {
          balance:
          payeeAccountType === "credit"
              ? Number(payeeBalance) - Number(targetValue)
              : Number(payeeBalance) + Number(targetValue),
        };
        Accounts.update(payeeUpdateValues, {where: {id: payeeAccountId}});
        Transactions.update({status: "accepted"}, {where: {id: transactionId}});
        Cheques.update({status: "cleared"}, {where: {id: chequeId}});
        return res.json("Cheque successfully cleared");
      }
  }

Transactions.update({status: "denied"}, {where: {id: transactionId}});
Cheques.update({status: "bounced"}, {where: {id: chequeId}});
return res.json("Successfully rejected cheque");

});

/**
 * status should be "active" or "disabled"
 */
router.put("/approveCreditAccounts", validateAdminToken, async (req, res) => {
  const { creditLimit, interestRate, accountId, status } = req.body;

  let error = await validateCreditUpdate(req.body);
  if (error) {
    return res.status(400).json(error);
  }

  //set the first payment due date to 14 days from account approval
  const date = new Date();
  date.setDate(date.getDate() + 14);

  const updateAccount = {
    creditLimit: creditLimit,
    interestRate: interestRate,
    nextPaymentDueDate: date,
    activeStatus: status,
    latePaymentFees: 0.00,
    minimumPayment: 0.00
  };

  await Accounts.update(updateAccount, { where: { id: accountId } });

  res.json({ message: "Update Successful" });
});

async function validateCreditUpdate(requestBody) {
  const { creditLimit, interestRate, accountId } = requestBody;

  const account = await Accounts.findByPk(accountId);
  if (!account) {
    return { error: "Account not found" };
  }

  if (account.accountType !== "credit" || account.activeStatus === "active") {
    return { error: "You cannot approve this account" };
  }

  if (creditLimit < 100 || creditLimit > 100000) {
    return { error: "Credit Limit must be 100 - 100,000" };
  }

  if (!interestRate.toString().match(/^[0-9]{0,2}\.{1}[0-9]{0,3}$/)) {
    return { error: "Interest should be xx.xxx format" };
  }

  if (interestRate > 50 || interestRate < 0.05) {
    return { error: "Interest Rate should be .05% to 50%" };
  }
}

router.get("/totals/:userId", validateAdminToken, async (req, res) => {
  const userId = req.params.userId;
  const listOfAccounts = await Accounts.findAll({
    where: { userId: userId },
  });

  if (!listOfAccounts) {
    return res.json("No accounts");
  }

  let totals = [];
  let totalConverted = 0;
  let totalUSD = 0;
  let totalCAD = 0;
  let totalEUR = 0;
  let totalGBP = 0;

  for (let i = 0; i < listOfAccounts.length; i++) {
    let account = {};
    account.accountId = listOfAccounts[i].id;
    account.availableBalance = listOfAccounts[i].balance;
    account.currency = listOfAccounts[i].currency;
    account.accountType = listOfAccounts[i].accountType;

    if (listOfAccounts[i].accountType === "credit") {
      account.availableBalance =
        listOfAccounts[i].creditLimit - Number(listOfAccounts[i].balance);
      totalCAD += account.availableBalance;
    } else {
      switch (listOfAccounts[i].currency) {
        case "USD":
          totalUSD += Number(listOfAccounts[i].balance);
          break;
        case "EUR":
          totalEUR += Number(listOfAccounts[i].balance);
          break;
        case "GBP":
          totalGBP += Number(listOfAccounts[i].balance);
          break;
          case "CAD":
          totalCAD += Number(listOfAccounts[i].balance);
      }
    }

    if (listOfAccounts[i].currency !== "CAD" && listOfAccounts[i].balance != 0) {
      await exchangeCurrency(
        listOfAccounts[i].currency,
        "CAD",
        listOfAccounts[i].balance
      ).then((response) => {
        console.log(response)
        account.equivalentBalance = response;
        totalConverted += response;
      });
    }
    totals.push(account);
  }

  const values = { totalUSD, totalCAD, totalEUR, totalGBP };
  totalConverted += totalCAD;
  console.log("at end");

  return res.json({
    accountTotals: totals,
    totalBalanceInCad: totalConverted,
    totalForeign: values,
  });
});


module.exports = router;
