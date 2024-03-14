import { Sequelize, DataTypes } from 'sequelize';

const Message = (sequelize) => {
  const Message = sequelize.define(
    'Message',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_date: {
        type: DataTypes.DATE
      }
    },
    {
      tableName: 'messages',
      timestamps: false
    }
  );

  return Message;
};

export default Message;
