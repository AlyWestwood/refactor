const { sign, verify } = require("jsonwebtoken");
const { Users } = require("../models");

const createTokens = (user) => {
  const accessToken = sign(
    { username: user.usermame, id: user.id },
    process.env.AUTHSECRET,
    {}
  );

  return accessToken;
};

const validateToken = (req, res, next) => {
  const accessToken = req.header("accessToken");
  if (!accessToken)
    return res
      .status(403)
      .json({ error: "User not authenticated (no access token)" });
  try {
    const validToken = verify(accessToken, process.env.AUTHSECRET);

    if (validToken) {
      req.authenticated = true;
      req.userId = validToken.id;
      return next();
    }
  } catch (err) {
    return res.status(400).json({ error: err });
  }
};

const validateTokenDirect = (accessToken) => {
  return new Promise((resolve, reject) => {
    if (!accessToken)
      reject({ error: "User not authenticated (no access token)" });
    try {
      const validToken = verify(accessToken, process.env.AUTHSECRET);

      if (validToken) {
        resolve({ success: "User authenticated", userId: validToken.id });
      }
    } catch (err) {
      reject({ error: err });
    }
  });
};

const validateAdminTokenDirect = async (accessToken) => {
  return new Promise((resolve, reject) => {
    if (!accessToken) {
      reject({ error: "User not auntheticated" });
    }
    try {
      const validToken = verify(accessToken, process.env.AUTHSECRET);

      if (validToken) {
        Users.findByPk(validToken.id)
          .then((response) => {
            if (response.dataValues.role === "admin") {
              resolve({
                success: "User authenticated",
                userId: validateToken.id,
              });
            } else {
              reject({ error: "User not auntheticated" });
            }
          })
          .catch((err) => {
            reject({ error: "User not auntheticated" });
          });
      }
      reject({ error: "User not auntheticated" });
    } catch (err) {
      console.log(err);
      reject({ error: "User not auntheticated" });
    }
  });
};

const validateAdminToken = async (req, res, next) => {
  const accessToken = req.header("accessToken");
  if (!accessToken)
    return res.status(403).json({ error: "User not auntheticated" });
  try {
    const validToken = verify(accessToken, process.env.AUTHSECRET);

    if (validToken) {
      req.authenticated = true;
      req.userId = validToken.id;

      await Users.findByPk(validToken.id)
        .then((response) => {
          if (response.dataValues.role === "admin") {
            return next();
          } else {
            return res
              .status(403)
              .json({ error: "User not admin autheticated" });
          }
        })
        .catch((err) => {
          return res.status(403).json({ error: "User not autheticated" });
        });
    }
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: err });
  }
};

module.exports = {
  createTokens,
  validateToken,
  validateAdminToken,
  validateTokenDirect,
  validateAdminTokenDirect
};
