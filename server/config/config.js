const config = {
  development: {
    username: process.env.DBUSER,
    password: process.env.DBPASS,
    database: "refactor",
    host: "localhost",
    dialect: "mysql"
  },  
  test: {
    username: process.env.DBUSER,
    password: process.env.DBPASS,
    database: "refactor",
    host: "localhost",
    dialect: "mysql"
  },  
  production: {
    username: process.env.DBUSER,
    password: process.env.DBPASS,
    database: "refactor",
    host: "localhost",
    dialect: "postgres"
  }
}

module.exports = config;
