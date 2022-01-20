const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors');

const db = require('./models');

const {cron} = require("./misc/cron");


app.use(express.json())
app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));



const transactionsRouter = require('./routes/Transactions');
const usersRouter = require('./routes/Users');
const adminsRouter = require('./routes/Admins');
const accountsRouter = require('./routes/Accounts');

app.use("/transactions", transactionsRouter);
app.use("/users", usersRouter);
app.use("/admin", adminsRouter);
app.use("/accounts", accountsRouter);

db.sequelize.sync().then(() => {
    cron();
    app.listen(process.env.PORT, () => {
    console.log("running on port " + process.env.PORT);
});
})
