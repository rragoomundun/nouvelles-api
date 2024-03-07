import express from 'express';
import morgan from 'morgan';
import colors from 'colors';

const app = express();

if (process.env.NODE_ENV === 'dev') {
  app.use(morgan('dev'));
}

// Set static folder
app.use(express.static('public'));

const apiPrefix = '/v1';

// Route files
import apiRoute from './routes/api.route.js';

// Mount routers
app.use(`${apiPrefix}/api`, apiRoute);

app.listen(process.env.PORT, () => {
  console.log('');
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${process.env.PORT}`.green.bold);
});
