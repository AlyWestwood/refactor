module.exports = (sequelize, DataTypes) => {
    const Transactions = sequelize.define("Transactions", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      value: {
        type: DataTypes.DECIMAL(10, 2),
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
        Transactions.belongsTo(models.Cheques, {
            foreignKey: {
              allowNull: true
            }
        })
    };

    Transactions.associate = (models) => {
        Transactions.belongsTo(models.Accounts,{
            foreignKey: {
              name: 'payeeAccountId'
            }
        })
    }

    Transactions.associate = (models) => {
        Transactions.belongsTo(models.Accounts, {as: 'payerAccount'});
    }
  
    return Transactions;
  };
  