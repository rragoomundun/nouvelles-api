import dbUtil from './db.util.js';

const deleteUser = async (userId) => {
  try {
    await dbUtil.sequelize.transaction(async (transaction) => {
      await dbUtil.UserRole.destroy({ where: { user_id: userId } }, { transaction });
      await dbUtil.Token.destroy({ where: { user_id: userId } }, { transaction });
      await dbUtil.User.destroy({ where: { id: userId } }, { transaction });
    });
  } catch {}
};

export default { deleteUser };
