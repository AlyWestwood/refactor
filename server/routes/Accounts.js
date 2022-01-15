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
router.post("/createDebitAccount", validateToken, async (req, res) => {
  const userId = req.userId;
  const { currency } = req.body;

  const user = await Users.findByPk(userId);

  const error = validateBasicAccount(user, req.body);
  if (error) {
    return res.status(400).json(error);
  }

  const account = {
    accountType: "debit",
    currency: currency,
    UserId: userId,
    activeStatus: "active",
  };

  Accounts.create(account)
    .then((response) => {
      res.json({
        message: "Debit account created successfully",
        account: response,
      });
    })
    .catch((error) => {
      res.status(400).json(error);
    });
});



function validateBasicAccount(user, requestBody) {
  const { currency } = requestBody;
  if (!user) {
    return { error: "User not found" };
  }

  if (user.activeStatus !== "active") {
    return { error: "User not active" };
  }

  if (!["USD", "GBP", "EUR", "CAD"].includes(currency)) {
    return { error: "Currency must be USD, CAD, GBP, EUR" };
  }
}
module.exports = router;
