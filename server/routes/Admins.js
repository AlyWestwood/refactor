const { response } = require("express");
const express = require("express");
const { validateToken, validateAdminToken } = require("../misc/authware");
const router = express.Router();
const { Users } = require("../models");
const { Accounts } = require("../models");

/**
 * returns the inactive users in an array of objects
 */
router.get("/approveUsers", validateAdminToken, async (req, res) => {
  const listOfUsers = await Users.findAll({
    where: { activeStatus: "inactive" },
  });

  res.json({ listOfUsers: listOfUsers });
});

/** this method needs an array of user ids ie [1,2,3]
 * it will set each user status to active
 */
router.post("/approveUsers", validateAdminToken, async (req, res) => {
  if (verifyAdmin(req.userId) !== true) {
    res.status(403).json({ error: "Forbidden user" });
  }
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

router.put("/approveCreditAccounts", validateAdminToken, async (req, res) => {
  const { creditLimit, interestRate, accountId } = req.body;

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
    activeStatus: "active"
  }

  await Accounts.update(updateAccount, {where: {id: accountId}})

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

module.exports = router;
