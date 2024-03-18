import { DataTypes, Sequelize } from 'sequelize';

const Topic = (sequelize) => {
  const Topic = sequelize.define(
    'Topic',
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
      tableName: 'topics',
      timestamps: false
    }
  );

  return Topic;
};

export default Topic;
