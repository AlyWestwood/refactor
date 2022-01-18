const express = require("express");
const router = express.Router();
const { Users } = require("../models");
const bcrypt = require("bcrypt");
var validator = require("email-validator");
const { createTokens, validateToken } = require("../misc/authware");

router.post("/register", async (req, res) => {
  const user = req.body;

  const { email, password } = user;

  if (!validator.validate(email)) {
    res
      .status(400)
      .json({ error: "Error: Email must look like a valid email" });
    return;
  }
  if (password.length > 50 || password.length < 4) {
    res.status(400).json({ error: "Error: Password must be 4-50 characters" });
    return;
  }
  if (
    user.firstName.length > 100 ||
    user.firstName < 2 ||
    user.lastName > 100 ||
    user.lastName < 2
  ) {
    res.status(400).json({ error: "Error: Names must be 2 - 100 characters" });
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
      userId: user.id,
      token: accessToken,
      role: user.role,
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
    userId: user.id,
    token: req.header("accessToken"),
    role: user.role,
  });
});




module.exports = router;
