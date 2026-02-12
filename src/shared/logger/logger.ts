import winston from "winston";
import { env } from "../../../config/env.js";

/**
 * 로그 레벨 정의
 */
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

/**
 * 환경에 따른 로그 레벨
 */
const level = () => {
  const isDevelopment = env.NODE_ENV === "development";
  return isDevelopment ? "debug" : "info";
};

/**
 * 로그 색상 정의
 */
const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "white",
};

winston.addColors(colors);

/**
 * 로그 포맷 정의
 */
const format = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

/**
 * Transport 정의
 */
const transports = [
  // 콘솔 출력
  new winston.transports.Console(),
  
  // 에러 로그 파일 (production에서만)
  ...(env.NODE_ENV === "production"
    ? [
        new winston.transports.File({
          filename: "logs/error.log",
          level: "error",
        }),
        new winston.transports.File({
          filename: "logs/all.log",
        }),
      ]
    : []),
];

/**
 * Winston Logger 인스턴스
 */
const Logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
});

export default Logger;
