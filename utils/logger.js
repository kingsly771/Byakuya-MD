// utils/logger.js
// Simple, reliable logger without external dependencies

const logLevel = process.env.LOG_LEVEL || 'info';
const levels = ['fatal', 'error', 'warn', 'info', 'debug', 'trace'];

// Determine if we should log based on level
const shouldLog = (level) => {
  const levelIndex = levels.indexOf(level);
  const currentIndex = levels.indexOf(logLevel);
  return levelIndex <= currentIndex;
};

// Console colors
const colors = {
  fatal: '\x1b[31m', // red
  error: '\x1b[31m', // red
  warn: '\x1b[33m',  // yellow
  info: '\x1b[32m',  // green
  debug: '\x1b[36m', // cyan
  trace: '\x1b[37m', // white
  reset: '\x1b[0m'   // reset
};

// Emojis for better visual identification
const emojis = {
  fatal: '💀',
  error: '❌',
  warn: '⚠️',
  info: 'ℹ️',
  debug: '🐛',
  trace: '🔍'
};

// Main logger object
const logger = {};

// Create log methods for each level
levels.forEach(level => {
  logger[level] = (message, ...args) => {
    if (shouldLog(level)) {
      const timestamp = new Date().toLocaleString();
      const emoji = emojis[level] || '';
      const color = colors[level] || colors.reset;
      
      // Format the log message
      const logMessage = `${color}[${timestamp}] ${emoji} ${level.toUpperCase()}: ${message}${colors.reset}`;
      
      // Use appropriate console method
      const consoleMethod = level === 'error' || level === 'fatal' ? console.error : 
                           level === 'warn' ? console.warn : console.log;
      
      consoleMethod(logMessage, ...args);
    }
  };
});

// Custom methods for specific log types
logger.success = (message, ...args) => {
  if (shouldLog('info')) {
    const timestamp = new Date().toLocaleString();
    console.log(`\x1b[32m[${timestamp}] ✅ SUCCESS: ${message}\x1b[0m`, ...args);
  }
};

logger.fail = (message, ...args) => {
  if (shouldLog('error')) {
    const timestamp = new Date().toLocaleString();
    console.error(`\x1b[31m[${timestamp}] ❌ FAIL: ${message}\x1b[0m`, ...args);
  }
};

logger.warning = (message, ...args) => {
  if (shouldLog('warn')) {
    const timestamp = new Date().toLocaleString();
    console.warn(`\x1b[33m[${timestamp}] ⚠️ WARNING: ${message}\x1b[0m`, ...args);
  }
};

logger.loading = (message, ...args) => {
  if (shouldLog('info')) {
    const timestamp = new Date().toLocaleString();
    console.log(`\x1b[36m[${timestamp}] ⏳ LOADING: ${message}\x1b[0m`, ...args);
  }
};

logger.command = (cmd, user, ...args) => {
  if (shouldLog('debug')) {
    const timestamp = new Date().toLocaleString();
    console.log(`\x1b[35m[${timestamp}] 📝 COMMAND: ${cmd} by ${user}\x1b[0m`, ...args);
  }
};

logger.plugin = (name, action, ...args) => {
  if (shouldLog('debug')) {
    const timestamp = new Date().toLocaleString();
    console.log(`\x1b[34m[${timestamp}] 🧩 PLUGIN: ${name} - ${action}\x1b[0m`, ...args);
  }
};

logger.connection = (status, ...args) => {
  if (shouldLog('info')) {
    const timestamp = new Date().toLocaleString();
    console.log(`\x1b[36m[${timestamp}] 📱 CONNECTION: ${status}\x1b[0m`, ...args);
  }
};

logger.database = (action, ...args) => {
  if (shouldLog('debug')) {
    const timestamp = new Date().toLocaleString();
    console.log(`\x1b[35m[${timestamp}] 💾 DATABASE: ${action}\x1b[0m`, ...args);
  }
};

logger.api = (endpoint, ...args) => {
  if (shouldLog('debug')) {
    const timestamp = new Date().toLocaleString();
    console.log(`\x1b[34m[${timestamp}] 🌐 API: ${endpoint}\x1b[0m`, ...args);
  }
};

// Test the logger
logger.info('Custom logger initialized successfully');
logger.debug(`Log level set to: ${logLevel}`);
logger.debug(`Environment: ${process.env.NODE_ENV || 'development'}`);

module.exports = logger;
