const express = require("express");
const router = express.Router();
const { Users } = require("../models");
const { Accounts } = require("../models");
const { validateToken, validateAdminToken } = require("../misc/authware");
const { exchangeCurrency } = require("../utils/utils");

/**
 * Returns the logged in user's accounts
 */
router.get("/getAccounts", validateToken, async (req, res) => {
  const userId = req.userId;
  const listOfAccounts = await Accounts.findAll({
    where: { userId: userId },
  });

  res.json({ listOfAccounts: listOfAccounts });
});

/**
 * returns the totals of all accounts in different currencies and the cad equivalent 
 * 
 */
router.get("/totals", validateToken, async (req, res) => {
  const userId = req.userId;
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

    if (listOfAccounts[i].currency !== "CAD") {
      await exchangeCurrency(
        listOfAccounts[i].currency,
        "CAD",
        listOfAccounts[i].balance
      ).then((response) => {
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
/**
 * params: logged in user, account id in url
 * returns: account requested
 *
 * checks the logged in user can access the account, returns the account if correct
 */
router.get("/singleAccount/:id", validateToken, async (req, res) => {
  const accountId = req.params.id;
  const account = await Accounts.findOne({
    where: { userId: req.userId, id: accountId },
  });

  if (!account) {
    return res.status(404).json({ error: "No account found" });
  }

  res.json({ account: account });
});

/**
 * Creadting debit or credit accounts. passed values should be accountType, currency
 */
router.post("/createAccount", validateToken, async (req, res) => {
  const userId = req.userId;
  const { currency, accountType } = req.body;

  const user = await Users.findByPk(userId);

  const error = validateAccountApplication(user, req.body);
  if (error) {
    return res.status(400).json(error);
  }

  const account = {
    accountType: accountType,
    currency: currency,
    userId: userId,
  };

  if (accountType === "debit") {
    account.activeStatus = "active";
  }

  Accounts.create(account)
    .then((response) => {
      res.json({
        message: "Account created successfully",
        account: response,
      });
    })
    .catch((error) => {
      res.status(400).json(error);
    });
});

/**
 * for a user to close one of their own accounts
 *
 * params: a logged in user, account id
 *
 */
router.post("/closeAccount", validateToken, async (req, res) => {
  const userId = req.userId;
  const { accountId } = req.body;
  const account = await Accounts.findOne({
    where: { userId: userId, id: accountId },
  });

  if (!account) {
    return res.status(404).json("Cannot find the account");
  }

  if (account.activeStatus !== "active") {
    return res.status(400).json("Cannot disabled inactive accounts");
  }

  if (account.balance != 0) {
    return res.status(400).json("Cannot close accounts with a balance");
  }

  Accounts.update({ activeStatus: "disabled" }, { where: { id: accountId } })
    .then((response) => {
      return res.json("account " + accountId + " disabled");
    })
    .catch((error) => {
      return res.json(error);
    });
});

function validateAccountApplication(user, requestBody) {
  const { currency, accountType } = requestBody;
  if (!user) {
    return { error: "User not found" };
  }

  if (user.activeStatus !== "active") {
    return { error: "User not active" };
  }

  if (!["debit", "credit"].includes(accountType)) {
    return { error: "Invalid account type" };
  }

  if (accountType === "credit" && currency !== "CAD") {
    return { error: "Credit accounts must be CAD" };
  }

  if (!["USD", "GBP", "EUR", "CAD"].includes(currency)) {
    return { error: "Currency must be USD, CAD, GBP, EUR" };
  }
}
module.exports = router;
