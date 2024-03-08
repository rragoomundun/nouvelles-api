import { DataTypes } from 'sequelize';

const UserRole = (sequelize, User, Role) => {
  const UserRole = sequelize.define(
    'UserRole',
    {
      user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
          model: User,
          key: 'id'
        }
      },
      role_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
          model: Role,
          key: 'id'
        }
      }
    },
    {
      tableName: 'users_roles',
      timestamps: false
    }
  );

  return UserRole;
};

export default UserRole;
