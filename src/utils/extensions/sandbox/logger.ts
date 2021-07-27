import DailyRotateFile from "winston-daily-rotate-file";
import path from "path";
import winston from "winston";

export function createLogger(basePath: string) {
  return winston.createLogger({
    format: winston.format.combine(
      winston.format.timestamp({ format: 'DD-MM-YYYY hh:mm:ss A' }),
      winston.format.align(),
      winston.format.splat(),
      winston.format.json(),
      winston.format.printf(info => `[${info.timestamp}] [${info.level}] [${info.label}]: ${info.message}`)
    ),
    transports: [
      new winston.transports.Console(),
      new DailyRotateFile({
        filename: path.join(basePath, 'moosync-extensions-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d'
      })
    ]
  });
}