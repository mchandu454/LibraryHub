const { Model } = require("sequelize");
const bcrypt = require("bcryptjs");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    validPassword(password) {
      return bcrypt.compareSync(password, this.password);
    }
  }

  User.init(
    {
      name: DataTypes.STRING,
      email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate: { isEmail: true },
      },
      password: DataTypes.STRING,
      isAdmin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "User",
      freezeTableName: true,
      tableName: 'users',
      hooks: {
        beforeCreate: (user) => {
          if (user.password) {
            user.password = bcrypt.hashSync(user.password, 10);
          }
        },
      },
    }
  );

  return User;
};
