module.exports = (sequelize, DataTypes) => {
    const RecurringPayments = sequelize.define("RecurringPayments", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      paymentDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      //as days?
      interval: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      payerAccount: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Accounts',
          key: 'id',
        },
        allowNull: false,
      },
      payeeAccount: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Accounts',
          key: 'id',
        },
        allowNull: false,
      }
    });
    
    return RecurringPayments;
  };
  