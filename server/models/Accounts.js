module.exports = (sequelize, DataTypes) => {
  const Accounts = sequelize.define("Accounts", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nextPaymentDueDate: {
      type: DataTypes.DATEONLY,
    },
    balance: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    creditLimit: {
      type: DataTypes.DECIMAL(10, 2),
    },
    interestRate: {
      type: DataTypes.DECIMAL(10, 4),
    },
    cashBackBalance: {
      type: DataTypes.DECIMAL(10, 2),
    },
    latePaymentFees: {
      type: DataTypes.DECIMAL(10, 2),
    },
    accountType: {
      type: DataTypes.ENUM("debit", "credit"),
      allowNull: false,
    },
    currency: {
      type: DataTypes.ENUM("CAD", "USD", "EUR", "GBP"),
      allowNull: false,
    },
    minimumPayment: {
      type: DataTypes.DECIMAL(10, 2),
    },
    activeStatus: {
      type: DataTypes.ENUM("active", "inactive", "disabled"),
      defaultValue: "inactive",
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Users',
        key: 'id',
      },
      allowNull: false,
    }
  });

  return Accounts;
};
