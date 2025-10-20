const fs = require('fs');
const path = require('path');
const morgan = require('morgan');
const winston = require('winston');

const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat()
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message, stack }) => {
          const time = new Date(timestamp).toLocaleString();
          const msg = stack || message;
          return `${time} [${level.toUpperCase()}] ${msg}`;
        })
      )
    }),
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message, stack }) => {
          const time = new Date(timestamp).toLocaleString();
          const msg = stack || message;
          return `${time} [${level.toUpperCase()}] ${msg}`;
        })
      )
    })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp(),
      winston.format.printf(({ timestamp, level, message, stack }) => {
        const time = new Date(timestamp).toLocaleString();
        const msg = stack || message;
        return `${time} [${level}] ${msg}`;
      })
    )
  }));
}

const morganStream = {
  write: (message) => logger.info(message.trim())
};

module.exports = {
  logger,
  morganMiddleware: morgan('combined', { stream: morganStream })
};