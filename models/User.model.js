import { Sequelize, DataTypes } from 'sequelize';

const User = (sequelize) => {
  const User = sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      },
      registration_date: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.NOW
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      image: {
        type: DataTypes.STRING(500)
      },
      biography: {
        type: DataTypes.TEXT
      }
    },
    {
      tableName: 'users',
      timestamps: false
    }
  );

  return User;
};

export default User;
