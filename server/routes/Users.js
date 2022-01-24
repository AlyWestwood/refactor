const express = require("express");
const router = express.Router();
const { Users } = require("../models");
const bcrypt = require("bcrypt");
var validator = require("email-validator");
const { createTokens, validateToken } = require("../misc/authware");
const Op = require("sequelize").Op;

router.get("/client", validateToken, async (req, res) => {
  const userId = req.userId;

  const user = await Users.findByPk(userId);
  user.password = "";

  return res.json(user);
});

router.put("/updatePassword", validateToken, async (req, res) => {
  const userId = req.userId;

  const user = await Users.findByPk(userId);
  if (!user) {
    return res.status(404).json("No user found");
  }

  const { oldPassword, newPassword } = req.body;

  let pwMatch;
  await bcrypt.compare(oldPassword, user.password).then((match) => {
    pwMatch = match;
  });

  if (!pwMatch) {
    return res.status(400).json("Old password does not match.");
  }

  if (newPassword.length > 50 || newPassword.length < 4) {
    res.status(400).json("Password must be 4-50 characters");
    return;
  }

  bcrypt.hash(newPassword, 10).then((hash) => {
    const pwUpdate = hash;

    Users.update({ password: pwUpdate }, { where: { id: userId } })
      .then((result) => {
        return res.json("Password updated");
      })
      .catch((err) => {
        return res.status(400).json("Could not update password.");
      });
  });
});

router.put("/updateUser", validateToken, async (req, res) => {
  const userId = req.userId;

  const { email, phone } = req.body;

  let update = {};
  if (email) {
    const emailInUse = await Users.findOne({ where: { email: email } });
    if (emailInUse) {
      return res.status(403).json("Email is already in use.");
    }

    if (!validator.validate(email)) {
      res.status(400).json("Email must look like a valid email");
      return;
    }
    update.email = email;
  }
  if(phone){
      if (!phone.match(/[0-9]{10}/)) {
    return res
      .status(400)
      .json({ error: "Phone number must be exactly 10 digits" });
  }
  update.phone = phone;
  }

  if(update){
    Users.update(update, {where: {id: userId}}).then((result) => {
      res.json(result);
    });
  }
});

router.post("/register", async (req, res) => {
  const user = req.body;

  const { email, password } = user;

  const duplicate = await Users.findOne({where: {[Op.or]: {email: email, sin: user.sin}}});
  if(duplicate){
    return res.status(400).json("SIN and email must not be in use already.")
  }

  if (!validator.validate(email)) {
    res
      .status(400)
      .json( "Email must look like a valid email" );
    return;
  }
  if (password.length > 50 || password.length < 4) {
    res.status(400).json("Password must be 4-50 characters");
    return;
  }
  if (
    user.firstName.length > 100 ||
    user.firstName < 2 ||
    user.lastName > 100 ||
    user.lastName < 2
  ) {
    res.status(400).json("Names must be 2 - 100 characters");
    return;
  }
  if (!user.phone.match(/[0-9]{10}/)) {
    return res
      .status(400)
      .json({ error: "Phone number must be exactly 10 digits" });
  }
  if (!user.sin.match(/[0-9]{9}/)) {
    return res.status(400).json({ error: "SIN must be exactly 9 digits" });
  }
  user.activeStatus = "inactive";
  user.role = "client";
  delete user.confirmPassword;

  bcrypt.hash(password, 10).then((hash) => {
    user.password = hash;

    Users.create(user)
      .then(() => {
        res.json({ message: "Successful registration" });
      })
      .catch((err) => {
        if (err) {
          res.status(403).json({ error: err });
        }
      });
  });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await Users.findOne({ where: { email: email } });
  if (!user) {
    res.status(403).json({ error: "No user found" });
    return;
  }

  bcrypt.compare(password, user.password).then((match) => {
    if (!match) {
      return res.status(403).json({ error: "No match" });
    }

    const accessToken = createTokens(user);

    console.log(user);
    res.json({
      message: "Logged in",
      token: accessToken,
      user: {
        id: user.id,
        role: user.role,
        status: user.activeStatus
      }
      });
  });
});

router.post("/auth", validateToken, async (req, res) => {
  const user = await Users.findByPk(req.userId);
  if (!user) {
    res.status(403).json({ error: "No user found" });//
    return;
  }
  res.json({
    message: "Logged in",
    token: req.header("accessToken"),
    user: {
      id: user.id,
      role: user.role,
      status: user.activeStatus
    }
  });
});




module.exports = router;
