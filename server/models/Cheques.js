module.exports = (sequelize, DataTypes) => {
    const Cheques = sequelize.define("Cheques", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      s3key: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      uploadDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("cleared", "on hold", "bounced"),
        allowNull: false,
      },
      transactionId: {
        type: DataTypes.INTEGER,
      },
      chequeNumber: {
        type: DataTypes.INTEGER,
      },
    });
  
    Cheques.associate = (models) => {
        Cheques.hasOne(models.Transactions, {foreignKey: "chequeNumber"});
    };

    Cheques.associate = (models) => {
      Cheques.belongsTo(models.Accounts, {as: 'payerAccount'});
  }

    return Cheques;
  };
  