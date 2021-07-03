import DailyRotateFile from "winston-daily-rotate-file";
import { app } from "electron";
import path from "path";
import winston from "winston";

export const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp({ format: 'DD-MM-YYYY hh:mm:ss A' }),
    winston.format.align(),
    winston.format.printf(info => `[${info.timestamp}] [${info.level}] [${info.label}]: ${info.message}`)
  ),
  transports: [
    new DailyRotateFile({
      filename: path.join(app.getPath('logs'), 'moosync-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d'
    })
  ]
});