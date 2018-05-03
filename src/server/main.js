import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import path from 'path';
import routes from './routes';
import bearerToken from 'express-bearer-token';
import { logger } from './libs/logging';

const app = express();

app.use(bearerToken());
app.use(morgan('combined', { stream: logger.stream }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  const error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500).json({ message: err.message, error });
});

app.use('/', express.static(path.resolve(__dirname, '../../dist')));
app.use('/api', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler

app.get('*', (req, res, next) => {
  const path1 = path.resolve(__dirname, '../../dist', 'index.html');
  res.sendFile(path1);
});

app.listen(8080, () => console.log('Listening on port 8080!'));
