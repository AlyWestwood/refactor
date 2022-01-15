const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

const db = require('./models');


app.use(cors());
app.use(express.json())
app.use(bodyParser.urlencoded({extended: true}));

// const transactionsRouter = require('./routes/Transactions');
const usersRouter = require('./routes/Users');
const adminsRouter = require('./routes/Admins');
const accountsRouter = require('./routes/Accounts');

// app.use("/transactions", transactionsRouter);
app.use("/users", usersRouter);
app.use("/admin", adminsRouter);
app.use("/accounts", accountsRouter);

db.sequelize.sync().then(() => {
    app.listen(process.env.PORT, () => {
    console.log("running on port " + process.env.PORT);
});
})
