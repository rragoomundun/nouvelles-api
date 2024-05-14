import { Sequelize } from 'sequelize';

import User from '../models/User.model.js';
import Token from '../models/Token.model.js';
import Category from '../models/Category.model.js';
import Article from '../models/Article.model.js';
import FrontPage from '../models/FrontPage.model.js';
import Role from '../models/Role.model.js';
import UserRole from '../models/UserRole.model.js';
import Forum from '../models/Forum.model.js';
import Topic from '../models/Topic.model.js';
import Message from '../models/Message.model.js';
import MessageLike from '../models/MessageLike.model.js';

const sequelize = new Sequelize(
  `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`,
  { logging: false }
);

try {
  await sequelize.authenticate();
  console.log(`Connected to database ${process.env.DB_DATABASE} on port ${process.env.DB_PORT}`);
} catch {
  console.log('Connection to database failed');
}

const db = {
  sequelize,
  Sequelize
};

db.User = User(sequelize);
db.Token = Token(sequelize);
db.Category = Category(sequelize);
db.Article = Article(sequelize);
db.FrontPage = FrontPage(sequelize, db.Article);
db.Role = Role(sequelize);
db.UserRole = UserRole(sequelize, db.User, db.Role);
db.Forum = Forum(sequelize);
db.Topic = Topic(sequelize);
db.Message = Message(sequelize);
db.MessageLike = MessageLike(sequelize, db.User, db.Message);

// Setup relationships between tables

db.User.hasOne(db.Token, {
  foreignKey: {
    allowNull: false,
    name: 'user_id'
  }
});
db.Token.belongsTo(db.User, {
  foreignKey: {
    allowNull: false,
    name: 'user_id'
  }
});

db.User.hasMany(db.Article, {
  foreignKey: {
    allowNull: false,
    name: 'user_id'
  }
});
db.Article.belongsTo(db.User, {
  foreignKey: {
    allowNull: false,
    name: 'user_id'
  }
});

db.Category.hasMany(db.Article, {
  foreignKey: {
    allowNull: false,
    name: 'category_id'
  }
});
db.Article.belongsTo(db.Category, {
  foreignKey: {
    allowNull: false,
    name: 'category_id'
  }
});

db.Article.hasOne(db.FrontPage, {
  foreignKey: {
    allowNull: false,
    name: 'article_id'
  }
});
db.FrontPage.belongsTo(db.Article, {
  foreignKey: {
    allowNull: false,
    name: 'article_id'
  }
});

db.Role.belongsToMany(db.User, {
  through: db.UserRole,
  foreignKey: {
    allowNull: false,
    name: 'role_id'
  }
});
db.User.belongsToMany(db.Role, {
  through: db.UserRole,
  foreignKey: {
    allowNull: false,
    name: 'user_id'
  }
});

db.Forum.hasMany(db.Topic, {
  foreignKey: {
    allowNull: false,
    name: 'forum_id'
  }
});
db.Topic.belongsTo(db.Forum, {
  foreignKey: {
    allowNull: false,
    name: 'forum_id'
  }
});

db.User.hasMany(db.Topic, {
  foreignKey: {
    allowNull: false,
    name: 'user_id'
  }
});
db.Topic.belongsTo(db.User, {
  foreignKey: {
    allowNull: false,
    name: 'user_id'
  }
});

db.Topic.hasMany(db.Message, {
  foreignKey: {
    allowNull: false,
    name: 'topic_id'
  }
});
db.Message.belongsTo(db.Topic, {
  foreignKey: {
    allowNull: false,
    name: 'topic_id'
  }
});

db.User.hasMany(db.Message, {
  foreignKey: {
    allowNull: false,
    name: 'user_id'
  }
});
db.Message.belongsTo(db.User, {
  foreignKey: {
    allowNull: false,
    name: 'user_id'
  }
});

db.Message.belongsToMany(db.User, {
  through: db.MessageLike,
  foreignKey: {
    allowNull: false,
    name: 'user_id'
  }
});
db.User.belongsToMany(db.Message, {
  through: db.MessageLike,
  foreignKey: {
    allowNull: false,
    name: 'message_id'
  }
});

export default db;
