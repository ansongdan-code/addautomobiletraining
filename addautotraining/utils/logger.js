const fs = require('fs');
const path = require('path');
const winston = require('winston');
require('winston-daily-rotate-file');

const isProduction = process.env.NODE_ENV === 'production';
const logLevel = process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug');
const logDir = process.env.LOG_DIR
  ? path.resolve(process.env.LOG_DIR)
  : path.join(__dirname, '..', 'logs');
const enableFileLogging = process.env.ENABLE_FILE_LOGGING === 'true' || isProduction;

if (enableFileLogging && !fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const baseFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true })
);

const logger = winston.createLogger({
  level: logLevel,
  levels: winston.config.npm.levels,
  defaultMeta: {
    service: 'addautotraining-api',
    environment: process.env.NODE_ENV || 'development'
  },
  format: baseFormat,
  transports: [
    new winston.transports.Console({
      format: isProduction
        ? winston.format.combine(baseFormat, winston.format.json())
        : winston.format.combine(
          baseFormat,
          winston.format.colorize(),
          winston.format.printf(({ timestamp, level, message, stack }) => {
            return `${timestamp} ${level}: ${stack || message}`;
          })
        )
    })
  ],
  exitOnError: false
});

if (enableFileLogging) {
  const fileRotateTransport = new winston.transports.DailyRotateFile({
    filename: path.join(logDir, 'application-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    format: winston.format.combine(baseFormat, winston.format.json())
  });

  const errorRotateTransport = new winston.transports.DailyRotateFile({
    filename: path.join(logDir, 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '30d',
    level: 'error',
    format: winston.format.combine(baseFormat, winston.format.json())
  });

  logger.add(fileRotateTransport);
  logger.add(errorRotateTransport);
}


logger.stream = {
  write: (message) => {
    logger.http(message.trim());
  }
};

module.exports = logger;
