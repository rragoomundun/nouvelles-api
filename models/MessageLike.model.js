import { DataTypes } from 'sequelize';

const MessageLike = (sequelize, User, Message) => {
  const MessageLike = sequelize.define(
    'MessageLike',
    {
      user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
          model: User,
          key: 'id'
        }
      },
      message_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
          model: Message,
          key: 'id'
        }
      },
      like: {
        type: DataTypes.ENUM('like', 'dislike'),
        allowNull: false
      }
    },
    {
      tableName: 'messages_likes',
      timestamps: false
    }
  );

  return MessageLike;
};

export default MessageLike;
