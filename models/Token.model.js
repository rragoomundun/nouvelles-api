import { DataTypes, Sequelize } from 'sequelize';

const Token = (sequelize) => {
  const Token = sequelize.define(
    'Token',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      token: {
        type: DataTypes.STRING,
        allowNull: false
      },
      expire: {
        type: DataTypes.DATE,
        allowNull: false
      },
      type: {
        type: DataTypes.ENUM('register-confirm', 'password-reset'),
        allowNull: false
      }
    },
    {
      tableName: 'tokens',
      timestamps: false
    }
  );

  return Token;
};

export default Token;
