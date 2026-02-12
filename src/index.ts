import { createWiredApp } from "./container.js";
import Logger from "@/shared/logger/logger.js";
import { env } from "../config/env.js";

// DI 컨테이너에서 wired된 앱 가져오기
const app = createWiredApp();

// 서버 시작
app.listen(env.PORT, () => {
  Logger.info(`🚀 Server listening on http://localhost:${env.PORT}`);
  Logger.info(`📋 Health check: http://localhost:${env.PORT}/health`);
  Logger.info(`🌍 Environment: ${env.NODE_ENV}`);
});
