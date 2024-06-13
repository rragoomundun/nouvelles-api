import express from 'express';
import morgan from 'morgan';
import colors from 'colors';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import hpp from 'hpp';
import rateLimit from 'express-rate-limit';

import xssProtectMiddleware from './middlewares/xssProtect.middleware.js';
import errorMiddleware from './middlewares/error.middleware.js';

const app = express();

if (process.env.NODE_ENV === 'dev') {
  app.use(morgan('dev'));
}

// Enable CORS
const origin = [];

if (process.env.NODE_ENV === 'dev') {
  origin.push(
    /http:\/\/localhost:.*/,
    /https:\/\/localhost:.*/,
    /http:\/\/127\.0\.0\.1:.*/,
    /https:\/\/127\.0\.0\.1:.*/
  );
}

app.use(
  cors({
    origin,
    credentials: true
  })
);

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Set static folder
app.use(express.static('public'));

// Add security headers
app.use(helmet());

// Prevent HTTP parameters pollution
app.use(hpp());

// Protect against XSS attacks
app.use(xssProtectMiddleware);

// Limit the number of requests per minute in prod mode
if (process.env.NODE_ENV === 'prod') {
  app.use(
    rateLimit({
      windowMs: 60 * 1000, // 1 minute
      max: process.env.RATE_LIMIT
    })
  );
}

const apiPrefix = '/v1';

// Route files
import apiRoute from './routes/api.route.js';
import authRoute from './routes/auth.route.js';
import userRoute from './routes/user.route.js';
import categoryRoute from './routes/category.route.js';
import homeRoute from './routes/home.route.js';
import articleRoute from './routes/article.route.js';
import forumRoute from './routes/forum.route.js';
import fileRoute from './routes/file.route.js';

// Mount routers
app.use(`${apiPrefix}/api`, apiRoute);
app.use(`${apiPrefix}/auth`, authRoute);
app.use(`${apiPrefix}/user`, userRoute);
app.use(`${apiPrefix}/category`, categoryRoute);
app.use(`${apiPrefix}/home`, homeRoute);
app.use(`${apiPrefix}/article`, articleRoute);
app.use(`${apiPrefix}/forum`, forumRoute);
app.use(`${apiPrefix}/file`, fileRoute);

app.use(errorMiddleware);

// Crons
import tokenCron from './crons/token.cron.js';

tokenCron.clearTokens();

app.listen(process.env.PORT, () => {
  console.log('');
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${process.env.PORT}`.green.bold);
});
