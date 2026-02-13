import type { FcmMessage } from "@/domain/entities/fcm-message.entity.js";

/**
 * FCM 메시지 Repository 인터페이스
 */
export interface IFcmMessageRepository {
  /** 대기 중인 메시지 조회 (배치 크기만큼) */
  findPending(limit: number): Promise<FcmMessage[]>;
  
  /** 메시지 상태 업데이트 (발송 성공) */
  markAsSent(id: string): Promise<void>;
  
  /** 메시지 상태 업데이트 (발송 실패) */
  markAsFailed(id: string, errorMessage: string): Promise<void>;
  
  /** 메시지 생성 (테스트용) */
  create(data: {
    token: string;
    title: string;
    body: string;
    data?: Record<string, string>;
  }): Promise<FcmMessage>;
}
