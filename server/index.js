const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors');

// for deployment

// app.use(express.static(__dirname)); //here is important thing - no static directory, because all static :)

// app.get("/*", function(req, res) {
  //   res.sendFile(path.join(__dirname, "build/index.html"));
  // });
  //for deployment
  const path = require('path');
  // app.use(express.static(path.join(__dirname, 'build')));
  
  
  const db = require('./models');
  
  const {cron, checkCreditUpdates, checkRecurringPayments} = require("./misc/cron");
  
  
  app.use(express.json())
  app.use(cors());
  app.use(bodyParser.urlencoded({extended: true}));
  
  
  const transactionsRouter = require('./routes/Transactions');
  const usersRouter = require('./routes/Users');
  const adminsRouter = require('./routes/Admins');
  const accountsRouter = require('./routes/Accounts');
  
  app.use("/transactions", transactionsRouter);
  app.use("/users", usersRouter);
  app.use("/admins", adminsRouter);
  app.use("/accounts", accountsRouter);
  
  app.use(express.static("./build"));

  app.get("/*", function (req, res) {
    res.sendFile(path.resolve(__dirname, 'build', 'index.html'));
 })
  

db.sequelize.sync().then(() => {
    cron();
    app.listen(process.env.PORT, () => {
    console.log("running on port " + process.env.PORT);
});
})
