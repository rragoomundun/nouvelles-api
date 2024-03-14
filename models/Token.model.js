import { DataTypes, Sequelize } from 'sequelize';

import cryptUtil from '../utils/crypt.util.js';

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
      timestamps: false,
      hooks: {
        beforeCreate: (token) => {
          token.token = cryptUtil.getToken();
          token.token = cryptUtil.getDigestHash(token.token);

          token.expire = Date.now() + 1000 * 60 * 60;
        }
      }
    }
  );

  return Token;
};

export default Token;
