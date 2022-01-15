module.exports = (sequelize, DataTypes) => {
    const Cheques = sequelize.define("Cheques", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      imagePath: {
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
    });
  
    Cheques.associate = (models) => {
        Cheques.hasOne(models.Transactions);
    };
  
    return Cheques;
  };
  