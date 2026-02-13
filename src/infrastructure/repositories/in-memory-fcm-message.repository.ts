import type { FcmMessage } from "@/domain/entities/fcm-message.entity.js";
import type { IFcmMessageRepository } from "@/application/repositories/fcm-message.repository.interface.js";

/**
 * 인메모리 FCM 메시지 Repository
 * 개발/테스트용
 */
export class InMemoryFcmMessageRepository implements IFcmMessageRepository {
  // FCM 메시지 저장소
  private readonly store = new Map<string, FcmMessage>();
  // ID 시퀀스
  private idSeq = 1;

  /**
   * 대기 중인 메시지 조회
   */
  async findPending(limit: number): Promise<FcmMessage[]> {
    const pending: FcmMessage[] = [];
    for (const msg of this.store.values()) {
      if (msg.status === "pending") {
        pending.push(msg);
        if (pending.length >= limit) break;
      }
    }
    return pending;
  }

  /**
   * 발송 성공 처리
   */
  async markAsSent(id: string): Promise<void> {
    const msg = this.store.get(id);
    if (msg) {
      msg.status = "sent";
      msg.sentAt = new Date();
      this.store.set(id, msg);
    }
  }

  /**
   * 발송 실패 처리
   */
  async markAsFailed(id: string, errorMessage: string): Promise<void> {
    const msg = this.store.get(id);
    if (msg) {
      msg.status = "failed";
      msg.errorMessage = errorMessage;
      this.store.set(id, msg);
    }
  }

  /**
   * 메시지 생성
   */
  async create(data: {
    token: string;
    title: string;
    body: string;
    data?: Record<string, string>;
  }): Promise<FcmMessage> {
    const id = String(this.idSeq++);
    const message: FcmMessage = {
      id,
      token: data.token,
      title: data.title,
      body: data.body,
      data: data.data,
      status: "pending",
      createdAt: new Date(),
    };
    this.store.set(id, message);
    return message;
  }
}
