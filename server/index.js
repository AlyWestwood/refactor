const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();

const db = require('./models');


app.use(cors());
app.use(express.json())
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const transactionsRouter = require('./routes/Transactions');
const usersRouter = require('./routes/Users');

app.use("/transactions", transactionsRouter);
app.use("/users", usersRouter);

db.sequelize.sync().then(() => {
    app.listen(3001, () => {
    console.log("running on port 3001");
});
})
