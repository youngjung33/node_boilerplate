/**
 * 결제 제공자 타입
 */
export type PaymentProvider = "stripe" | "google_play" | "apple_iap";

/**
 * 결제 상태
 */
export type PaymentStatus = "pending" | "completed" | "failed" | "refunded" | "cancelled";

/**
 * 결제 엔티티
 * 앱 결제(Google Play, Apple IAP) 및 일반 결제(Stripe) 통합 모델
 */
export interface Payment {
  // Payment 고유 식별자
  id: string;
  // 결제 제공자
  provider: PaymentProvider;
  // 사용자 ID
  userId: string;
  // 결제 금액 (센트 단위 또는 최소 단위)
  amount: number;
  // 통화 코드 (USD, KRW 등)
  currency: string;
  // 결제 상태
  status: PaymentStatus;
  // Provider별 고유 트랜잭션 ID
  providerTransactionId: string;
  // 상품 ID (앱 결제의 경우 SKU, 일반 결제는 product ID)
  productId?: string;
  // 구독 ID (구독 결제인 경우)
  subscriptionId?: string;
  // 영수증 데이터 (검증용 원본 데이터)
  receiptData?: string;
  // 메타데이터 (추가 정보)
  metadata?: Record<string, any>;
  // 생성 시각
  createdAt: Date;
  // 수정 시각
  updatedAt: Date;
}
