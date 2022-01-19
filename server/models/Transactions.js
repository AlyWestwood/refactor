module.exports = (sequelize, DataTypes) => {
  const Transactions = sequelize.define("Transactions", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    originValue: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    targetValue: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    originCurrency: {
      type: DataTypes.STRING(5),
      allowNull: false,
    },
    targetCurrency: {
      type: DataTypes.STRING(5),
      allowNull: false,
    },
    transactionDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("requested", "pending", "accepted", "denied"),
      allowNull: false,
    },
  });


  Transactions.associate = (models) => {
    Transactions.belongsTo(models.Cheques, {allowNull: true, foreignKey: "chequeId"});
  };

  Transactions.associate = (models) => {
    Transactions.belongsTo(models.Accounts, { as: "payeeAccount" });
  };

  Transactions.associate = (models) => {
    Transactions.belongsTo(models.Accounts, { as: "payerAccount" });
  };



  return Transactions;
};
