import cron from 'node-cron';
import { Op } from 'sequelize';

import dbUtil from '../utils/db.util.js';
import userUtil from '../utils/user.util.js';

const clearTokens = () => {
  cron.schedule(process.env.CLEAR_TOKENS_CRON_DATE, async () => {
    // Delete register-confirm tokens with the respective user configuration
    const confirmTokens = await dbUtil.Token.findAll({
      where: {
        expire: { [Op.lt]: new Date() },
        type: 'register-confirm'
      }
    });
    const confirmTokensUserIds = confirmTokens.map((token) => token.dataValues.user_id);

    userUtil.deleteUsers(confirmTokensUserIds);

    // Delete password-reset token
    await dbUtil.Token.destroy({
      where: {
        expire: { [Op.lt]: new Date() },
        type: 'password-reset'
      }
    });
  });
};

export default { clearTokens };
