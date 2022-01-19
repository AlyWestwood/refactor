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
      chequeNumber: {
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
      },
    });

    return Cheques;
  };
  