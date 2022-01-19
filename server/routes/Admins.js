const { response } = require("express");
const express = require("express");
const { validateAdminToken, validateAdminTokenDirect } = require("../misc/authware");
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
      Accounts.update({activeStatus: "disabled"}, {where: {UserId: userId}});
      return res.json({ message: "User " + userId + " disabled" });
    })
    .catch((error) => {
      return res.status(400).json(error);
    });
});

router.put("/enableUser", validateAdminToken, (req, res) => {
  const { userId } = req.body;
  Users.update({activeStatus: "active"}, {where: {id: userId}}).then((result) =>{
    if(result == true){
      return res.json({message: "updated user " + userId + " to active status"});
    }else{
      return res.status(404).json("Could not find user");
    }
  }).catch((err) => {
    return res.status(400).json(err);
  })
})


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

router.get("/approveCheque/:id/:token", async (req, res) => {
  
})

/**
 * admin get cheque image - accessToken must be in the url
 */
router.get("/chequeImage/:chequeId/:token", async (req, res) => {
  const token = req.params.token;
  const validate = await validateAdminTokenDirect(token);

  if(!validate){
    return res.status(403).json("User not authenticated");
  }

  

})

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
    activeStatus: "active",
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

module.exports = router;
