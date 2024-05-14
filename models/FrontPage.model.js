import { DataTypes } from 'sequelize';

const FrontPage = (sequelize, Article) => {
  const FrontPage = sequelize.define(
    'FrontPage',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      article_id: {
        type: DataTypes.INTEGER,
        references: {
          model: Article,
          key: 'id'
        }
      },
      position: {
        type: DataTypes.INTEGER,
        allowNull: false,
        default: 0
      }
    },
    {
      tableName: 'front_page',
      timestamps: false
    }
  );

  return FrontPage;
};

export default FrontPage;
