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
    return res.status(403).json({ error: "User not autheticated" });
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
const validateAdminToken = async (req, res, next) => {
  const accessToken = req.header("accessToken");
  if (!accessToken)
    return res.status(403).json({ error: "User not autheticated" });
  try {
    const validToken = verify(accessToken, "supersecuresecret");

    if (validToken) {
      req.authenticated = true;
      req.userId = validToken.id;

      
      await Users.findByPk(validToken.id)
        .then((response) => {
          if (response.dataValues.role === "admin") {
            
            return next();
          }else{
            return res.status(403).json({ error: "User not admin autheticated" });
          }
        })
        .catch((err) => {
            return res.status(403).json({ error: "User not autheticated" });
        });
    }
  } catch (err) {
      console.log(err)
    return res.status(400).json({ error: err });
  }
};

module.exports = { createTokens, validateToken, validateAdminToken };
