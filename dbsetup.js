// Setup the database: create tables and add some data

import dbUtil from './utils/db.util.js';

await dbUtil.User.sync({ force: true });
await dbUtil.Token.sync({ force: true });
await dbUtil.Category.sync({ force: true });
await dbUtil.Article.sync({ force: true });
await dbUtil.FrontPage.sync({ force: true });
await dbUtil.Role.sync({ force: true });
await dbUtil.UserRole.sync({ force: true });
await dbUtil.Forum.sync({ force: true });
await dbUtil.Topic.sync({ force: true });
await dbUtil.Message.sync({ force: true });
await dbUtil.MessageLike.sync({ force: true });

// Create the admin user
await dbUtil.User.create({
  email: 'alien@fakeaddress.com',
  password: '1234567890112',
  name: 'Alien'
});

// Define available roles for the users
await dbUtil.Role.create({
  label: 'admin',
  name: 'Administrateur'
});

await dbUtil.Role.create({
  label: 'regulier',
  name: 'Régulier'
});

await dbUtil.Role.create({
  label: 'moderateur',
  name: 'Modérateur'
});

await dbUtil.Role.create({
  label: 'redacteur',
  name: 'Rédacteur'
});

// admin (id: 1) have user role admin (id: 1)
await dbUtil.UserRole.create({
  user_id: 1,
  role_id: 1
});
