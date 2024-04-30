import dbUtil from './db.util.js';

const getCategoryFromLabel = async (categoryLabel) => {
  return await dbUtil.Category.findOne({
    where: {
      label: categoryLabel
    }
  });
};

const getCategoryId = async (categoryLabel) => {
  const category = await getCategoryFromLabel(categoryLabel);

  if (category) {
    return category.dataValues.id;
  }

  return null;
};

const getCategoryName = async (categoryLabel) => {
  const category = await getCategoryFromLabel(categoryLabel);

  if (category) {
    return category.dataValues.name;
  }

  return null;
};

export default { getCategoryFromLabel, getCategoryId, getCategoryName };
