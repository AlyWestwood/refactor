const config = {
  development: {
    username: process.env.DBUSER,
    password: process.env.DBPASS,
    database: process.env.DATABASE,
    host: process.env.DBHOST,
    dialect: "mysql"
  },  
  test: {
    username: process.env.DBUSER,
    password: process.env.DBPASS,
    database: process.env.DATABASE,
    host: process.env.DBHOST,
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
