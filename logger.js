const fs = require("fs");
const os = require("os");

const EventEmitter = require("events");

function parseInterval(interval) {
  const match = interval.match(/(\d+)([smhd])/);
  if (!match) {
    throw new Error(
      "Invalid interval format. Use a format like '1d', '2h', etc."
    );
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case "s":
      return value * 1000; // seconds
    case "m":
      return value * 60 * 1000; // minutes
    case "h":
      return value * 60 * 60 * 1000; // hours
    case "d":
      return value * 24 * 60 * 60 * 1000; // days
    default:
      throw new Error("Invalid interval unit. Use 's', 'm', 'h', or 'd'.");
  }
}

class Logger extends EventEmitter {
  static Levels = {
    DEBUG: "DEBUG",
    INFO: "INFO",
    WARN: "WARN",
    ERROR: "ERROR",
  };

  constructor({ logFile = "logger.txt", refreshInterval = "1d" }) {
    super();
    this.refreshInterval = parseInterval(refreshInterval);

    // Refresh the file every refreshInterval time
    setInterval(() => {
      this.refreshFile(logFile);
    }, this.refreshInterval);

    const logToFile = (event) => {
      const logMessage = `[${event.level}] - ${new Date().toISOString()} - ${
        event.message
      }\n`;
      fs.appendFileSync(logFile, logMessage);
    };
    this.on("message", logToFile);
  }

  log(message, level = Logger.Levels.INFO) {
    if (!Object.values(Logger.Levels).includes(level)) {
      throw new Error(
        `Invalid log level: ${level}. Choose one of ${Object.keys(
          Logger.Levels
        ).join(", ")}.`
      );
    }

    this.emit("message", { message, level });
  }

  debug(message) {
    this.log(message, Logger.Levels.DEBUG);
  }

  warn(message) {
    this.log(message, Logger.Levels.WARN);
  }

  error(message) {
    this.log(message, Logger.Levels.ERROR);
  }

  refreshFile(logFile) {
    console.log(`Refreshing the log file: ${logFile}`);
    fs.writeFileSync(logFile, "");
    fs.appendFileSync(
      logFile,
      `[INFO] Log file refreshed at ${new Date().toISOString()}\n`
    );
  }
}

const logger = new Logger({
  logFile: "logger.log",
  refreshInterval: "10s",
});

setInterval(() => {
  const memoryUsage = (os.freemem() / os.totalmem()) * 100;
  logger.debug(`Current memory usage: ${memoryUsage.toFixed(2)}`);
}, 3000);

logger.log("Application started");
logger.log("Application event occured");
