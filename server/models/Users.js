module.exports = (sequelize, DataTypes) => {
    const Users = sequelize.define("Users", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      firstName: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(360),
        allowNull: false,
        unique: true,
      },
      phone: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM("client", "admin"),
        allowNull: false,
      },
      birthdate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      sin: {
        type: DataTypes.STRING(10),
        allowNull: false,
        unique: true,
      },
      activeStatus: {
        type: DataTypes.ENUM("active", "inactive", "disabled"),
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING(100),
        allowNull: false,
      }
    });
  
    Users.associate = (models) => {
      Users.hasMany(models.Accounts, {as: 'userId'});
    };
  
    return Users;
  };
  