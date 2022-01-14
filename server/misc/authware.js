const { sign, verify } = require("jsonwebtoken");

const createTokens = (user) => {
  const accessToken = sign(
    { username: user.usermame, id: user.id },
    "supersecuresecret",
    {}
  );

  return accessToken;
};

const validateToken = (req, res, next) => {
    const accessToken = req.header("accessToken");
    console.log(accessToken);
    if(!accessToken) 
        return res.status(403).json({error: "User not autheticated"});
    try{
        const validToken = verify(accessToken, "supersecuresecret");
        
        if(validToken){
            req.authenticated = true;
            req.userId = validToken.id;
            console.log("going next" + req.userId);
            return next();
        }
    }catch(err){
        return res.status(400).json({error: err});
    }

}

module.exports = { createTokens, validateToken };
