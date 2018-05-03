import winston from 'winston';
import path from 'path';
import fs from 'fs';
import DailyRotateFile from 'winston-daily-rotate-file';

const logDir = 'logs';
if (!fs.existsSync(logDir)) {
  // Create the directory if it does not exist
  fs.mkdirSync(logDir);
}

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({
      filename: path.join(logDir, '/server-error-logs.log'),
      handleExceptions: true,
      level: 'error',
    }),
    new DailyRotateFile({
      filename: 'server-all-logs-%DATE%.log',
      level: 'info',
      handleExceptions: true,
      dirname: logDir,
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      datePattern: 'YYYY-MM-DD',
    }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
      level: 'debug',
      colorize: true,
    })
  );
}

logger.stream = {
  write: function(message, encoding) {
    logger.info(message);
  },
};
logger.info('Start');
