import { DataTypes, Sequelize } from 'sequelize';

const Discussion = (sequelize) => {
  const Discussion = sequelize.define(
    'Discussion',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      creation_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    },
    {
      tableName: 'discussions',
      timestamps: false
    }
  );

  return Discussion;
};

export default Discussion;
