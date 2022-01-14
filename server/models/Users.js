module.exports = (sequelize, DataTypes) => {
    const Users = sequelize.define("users", {
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
        type: DataTypes.STRING(15),
        allowNull: false,
      },
      isDone: {
        type: DataTypes.ENUM("pending", "done"),
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING(100),
        allowNull: false,
      }
    });
  
    Users.associate = (models) => {
      Users.hasMany(models.todos, {});
    };
  
    return Users;
  };
  