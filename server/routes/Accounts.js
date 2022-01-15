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
 * For creating debit accounts. since credit accounts need to be authorized, that's a different process
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
