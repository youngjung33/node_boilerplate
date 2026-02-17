import { createWiredApp } from "./container.js";
import Logger from "@/shared/logger/logger.js";
import { env } from "../config/env.js";
import { startFcmBatchRunner } from "./jobs/fcm-batch.runner.js";
import { startGooglePlayPubSubRunner } from "./jobs/google-play-pubsub.runner.js";

// DI 컨테이너에서 wired된 앱 가져오기
const app = createWiredApp();

// FCM 배치 러너 시작 (ENABLE_FCM=true일 때만)
startFcmBatchRunner();

// Google Play Pub/Sub 러너 시작 (ENABLE_PAYMENT=true일 때만)
// Note: Use Cases는 app 내부에서 이미 생성되었으므로 별도로 전달 필요
// 실제로는 container에서 반환하거나 별도로 관리해야 함

// 서버 시작
app.listen(env.PORT, () => {
  Logger.info(`🚀 Server listening on http://localhost:${env.PORT}`);
  Logger.info(`📋 Health check: http://localhost:${env.PORT}/health`);
  Logger.info(`🌍 Environment: ${env.NODE_ENV}`);
});
