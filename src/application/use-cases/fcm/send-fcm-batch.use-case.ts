import type { IFcmMessageRepository } from "@/application/repositories/fcm-message.repository.interface.js";
import { sendFcmMessage } from "@/infrastructure/fcm/fcm.client.js";
import Logger from "@/shared/logger/logger.js";

/**
 * FCM 배치 발송 Use Case
 * 대기 중인 메시지를 일괄 발송
 */
export class SendFcmBatchUseCase {
  constructor(private readonly repo: IFcmMessageRepository) {}

  /**
   * 배치 실행
   * @param batchSize - 한 번에 처리할 메시지 수
   * @returns 발송 결과 (성공/실패 개수)
   */
  async execute(batchSize: number): Promise<{ sent: number; failed: number }> {
    // 대기 중인 메시지 조회
    const messages = await this.repo.findPending(batchSize);

    if (messages.length === 0) {
      Logger.debug("No pending FCM messages");
      return { sent: 0, failed: 0 };
    }

    Logger.info(`Processing ${messages.length} FCM messages...`);

    let sent = 0;
    let failed = 0;

    // 각 메시지 발송
    for (const msg of messages) {
      const result = await sendFcmMessage(msg.token, msg.title, msg.body, msg.data);

      if (result.success) {
        await this.repo.markAsSent(msg.id);
        sent++;
      } else {
        await this.repo.markAsFailed(msg.id, result.error || "Unknown error");
        failed++;
      }
    }

    Logger.info(`FCM batch completed: ${sent} sent, ${failed} failed`);
    return { sent, failed };
  }
}
