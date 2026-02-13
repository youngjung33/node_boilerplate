import cron from "node-cron";
import { env } from "../../config/env.js";
import { SendFcmBatchUseCase } from "@/application/use-cases/fcm/send-fcm-batch.use-case.js";
import { InMemoryFcmMessageRepository } from "@/infrastructure/repositories/in-memory-fcm-message.repository.js";
import { initializeFcm } from "@/infrastructure/fcm/fcm.client.js";
import Logger from "@/shared/logger/logger.js";

/**
 * FCM 배치 러너
 * Cron으로 주기적으로 대기 중인 메시지 발송
 */
export function startFcmBatchRunner(): void {
  // FCM이 비활성화되어 있으면 시작하지 않음
  if (!env.ENABLE_FCM) {
    Logger.info("FCM batch runner is disabled (ENABLE_FCM=false)");
    return;
  }

  // FCM 초기화
  initializeFcm();

  // Repository와 Use Case 생성
  const fcmMessageRepo = new InMemoryFcmMessageRepository();
  const sendFcmBatch = new SendFcmBatchUseCase(fcmMessageRepo);

  // Cron 스케줄 설정
  const cronSchedule = env.FCM_BATCH_CRON;
  const batchSize = env.FCM_BATCH_SIZE;

  Logger.info(`🚀 FCM batch runner started (schedule: ${cronSchedule}, batch size: ${batchSize})`);

  // Cron 작업 시작
  cron.schedule(cronSchedule, async () => {
    try {
      await sendFcmBatch.execute(batchSize);
    } catch (error) {
      Logger.error(`FCM batch runner error: ${error}`);
    }
  });
}
