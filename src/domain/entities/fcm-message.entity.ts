/**
 * FCM 메시지 엔티티
 * 발송 대기 중인 푸시 메시지
 */
export interface FcmMessage {
  // 메시지 ID
  id: string;
  // 수신자 FCM 토큰
  token: string;
  // 메시지 제목
  title: string;
  // 메시지 본문
  body: string;
  // 추가 데이터 (선택)
  data?: Record<string, string>;
  // 발송 상태
  status: "pending" | "sent" | "failed";
  // 에러 메시지 (실패 시)
  errorMessage?: string;
  // 생성 시각
  createdAt: Date;
  // 발송 시각 (발송 완료 시)
  sentAt?: Date;
}
