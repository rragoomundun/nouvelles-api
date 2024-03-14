import dbUtil from './db.util.js';

// TODO: make transaction
const deleteUser = async (userId) => {
  await dbUtil.UserRole.destroy({ where: { user_id: userId } });
  await dbUtil.Token.destroy({ where: { user_id: userId } });
  await dbUtil.User.destroy({ where: { id: userId } });
};

export { deleteUser };
