import { DataTypes } from 'sequelize';

const Category = (sequelize) => {
  const Category = sequelize.define(
    'Category',
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
      label: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      position: {
        type: DataTypes.INTEGER,
        allowNull: false,
        default: 0
      }
    },
    {
      tableName: 'categories',
      timestamps: false
    }
  );

  return Category;
};

export default Category;
