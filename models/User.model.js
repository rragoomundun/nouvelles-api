import { Sequelize, DataTypes } from 'sequelize';
import bcrypt from 'bcrypt';

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
        allowNull: false,
        validate: {
          len: {
            args: [12, 64],
            msg: 'Le mot de passe doit faire au moins 12 caractères'
          }
        }
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
      timestamps: false,
      hooks: {
        beforeSave: async (user) => {
          if (user.changed('password')) {
            const salt = await bcrypt.genSalt();
            user.password = await bcrypt.hash(user.password, salt);
          }
        }
      }
    }
  );

  User.prototype.verifyPassword = async (password, hash) => {
    return await bcrypt.compare(password, hash);
  };

  return User;
};

export default User;
