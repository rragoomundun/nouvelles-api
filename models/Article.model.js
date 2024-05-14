import { DataTypes } from 'sequelize';

const Article = (sequelize) => {
  const Article = sequelize.define(
    'Article',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      image: {
        type: DataTypes.STRING(500),
        allowNull: false,
        unique: true
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true
      },
      date: {
        type: DataTypes.DATE
      },
      updated_date: {
        type: DataTypes.DATE
      },
      published: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      views: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      }
    },
    { tableName: 'articles', timestamps: false }
  );

  return Article;
};

export default Article;
