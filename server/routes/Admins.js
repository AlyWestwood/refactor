const express = require("express");
const router = express.Router();
const { Users } = require("../models");

/**
 * returns the inactive users in an array of objects
 */
router.get("/approveUsers", async (req, res) => {
  const listOfUsers = await Users.findAll({
    where: { activeStatus: "inactive" },
  });

  res.json({ listOfUsers: listOfUsers });
});

/** this method needs an array of user ids ie [1,2,3]
 * it will set each user status to active
*/
router.post("/approveUsers", async (req, res) => {
  //an arry of user ids
  const usersToApprove = req.body;
  let failedUpdates = [];
  for (let i = 0; i < usersToApprove.length; i++) {
    await Users.update(
      { activeStatus: "active" },
      { where: { id: usersToApprove[i] } }
    )
      .then((result) => {
      })
      .catch((err) => {
        failedUpdates.push(i);
      });
  }

  res.json({ failedUpdates: failedUpdates, message: "Updated users to active" });
});

module.exports = router;
