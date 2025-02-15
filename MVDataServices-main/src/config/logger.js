// config/logger.js

const pino = require('pino');

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() };
    },
  },
  base: undefined,
  serializers: {
    err: pino.stdSerializers.err,
    error: pino.stdSerializers.err
  }
});

module.exports = logger;