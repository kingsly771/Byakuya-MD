// utils/logger.js
const pino = require('pino');

// Create a custom log level system
const customLevels = {
  levels: {
    fatal: 60,
    error: 50,
    warn: 40,
    info: 30,
    debug: 20,
    trace: 10
  },
  colors: {
    fatal: 'red',
    error: 'red',
    warn: 'yellow',
    info: 'green',
    debug: 'blue',
    trace: 'gray'
  }
};

// Determine if we're in production
const isProduction = process.env.NODE_ENV === 'production';
const logLevel = process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug');

// Create the logger instance
const logger = pino({
  level: logLevel,
  customLevels: customLevels.levels,
  useOnlyCustomLevels: false,
  formatters: {
    level: (label, number) => {
      return { level: label.toUpperCase() };
    }
  },
  timestamp: () => `,"time":"${new Date().toISOString()}"`,
  transport: isProduction ? undefined : {
    target: 'pino-pretty',
    options: {
      colorize: true,
      levelFirst: true,
      translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
      ignore: 'pid,hostname',
      customColors: customLevels.colors,
      customLevels: Object.keys(customLevels.levels).join(','),
      useOnlyCustomLevels: false
    }
  }
});

// Add custom methods for better logging
logger.success = function (msg, ...args) {
  this.info(`✅ ${msg}`, ...args);
};

logger.fail = function (msg, ...args) {
  this.error(`❌ ${msg}`, ...args);
};

logger.warning = function (msg, ...args) {
  this.warn(`⚠️ ${msg}`, ...args);
};

logger.loading = function (msg, ...args) {
  this.info(`⏳ ${msg}`, ...args);
};

logger.command = function (cmd, user, ...args) {
  this.debug(`📝 Command: ${cmd} by ${user}`, ...args);
};

logger.plugin = function (name, action, ...args) {
  this.debug(`🧩 Plugin ${name}: ${action}`, ...args);
};

logger.connection = function (status, ...args) {
  this.info(`📱 Connection: ${status}`, ...args);
};

// Test the logger
if (process.env.NODE_ENV !== 'test') {
  logger.info('Logger initialized successfully');
  logger.debug(`Log level set to: ${logLevel}`);
  logger.debug(`Environment: ${process.env.NODE_ENV || 'development'}`);
}

module.exports = logger;
