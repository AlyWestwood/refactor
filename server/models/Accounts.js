module.exports = (sequelize, DataTypes) => {
    const Accounts = sequelize.define("Accounts", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      nextPaymentDueDate: {
        type: DataTypes.DATEONLY
      },
      balance: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      creditLimit: {
        type: DataTypes.DECIMAL(10, 2)
      },
      interestRate: {
        type: DataTypes.DECIMAL(10, 4)
      },
      cashBackBalance: {
        type: DataTypes.DECIMAL(10, 2)
      },
      latePaymentFees: {
        type: DataTypes.DECIMAL(10, 2)
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
        type: DataTypes.DECIMAL(10, 2)
      },
      activeStatus: {
        type: DataTypes.ENUM("active", "inactive", "disabled"),
        defaultValue: "inactive",
        allowNull: false,
      }
    });
  
    Accounts.associate = (models) => {
        Accounts.belongsTo(models.Users, { as: 'user' });
    };

    Accounts.associate = (models) => {
        Accounts.hasMany(models.Transactions, {foreignKey:{
            name: 'payeeAccountId'
        } });
    };

    Accounts.associate = (models) => {
        Accounts.hasMany(models.RecurringPayments, {foreignKey:{
            name: 'payeeAccountId'
        } });
    };

    // Accounts.associate = (models) => {
    //     Accounts.hasMany(models.Transactions, {as: 'payerAccountId'});
    // };

    return Accounts;
  };
  