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
    });
  
    RecurringPayments.associate = (models) => {
        RecurringPayments.belongsTo(models.Accounts, {as: 'payeeAccount'})
    }

    RecurringPayments.associate = (models) => {
        RecurringPayments.belongsTo(models.Accounts, {as: 'payerAccount'});
    }
  
    return RecurringPayments;
  };
  