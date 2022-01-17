const express = require("express");
const router = express.Router();
const { Users } = require("../models");
const { Accounts } = require("../models");
const { validateToken } = require("../misc/authware");

/**
 * Returns the logged in user's accounts
 */
router.get("/getAccounts", validateToken, async (req, res) => {
  const userId = req.userId;
  const listOfAccounts = await Accounts.findAll({
    where: { UserId: userId },
  });

  res.json({ listOfAccounts: listOfAccounts });
});

/**
 * params: logged in user, account id in url
 * returns: account requested
 * 
 * checks the logged in user can access the account, returns the account if correct
 */
router.get("/singleAccount/:id", validateToken, async (req, res) => {
  const accountId = req.params.id;
  const account = await Accounts.findOne({where: {UserId: req.userId, id: accountId}});

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
    UserId: userId,
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
