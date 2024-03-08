import { DataTypes } from 'sequelize';

const Forum = (sequelize) => {
  const Forum = sequelize.define(
    'Forum',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      label: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      }
    },
    {
      tableName: 'forums',
      timestamps: false
    }
  );

  return Forum;
};

export default Forum;
