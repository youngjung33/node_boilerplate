import type { IPaymentRepository } from "@/application/repositories/payment.repository.interface.js";
import type { Payment } from "@/domain/entities/payment.entity.js";

/**
 * Google Play 결제 검증 Input
 */
export interface VerifyGooglePlayPaymentInput {
  // Google Play 주문 ID
  orderId: string;
  // 패키지명
  packageName: string;
  // 상품 ID (SKU)
  productId: string;
  // 구매 토큰
  purchaseToken: string;
  // 사용자 ID
  userId: string;
  // 구독 ID (구독인 경우)
  subscriptionId?: string;
  // 메타데이터
  metadata?: Record<string, any>;
}

/**
 * Google Play 결제 검증 Result
 */
export interface VerifyGooglePlayPaymentResult {
  payment: Payment;
}

/**
 * Google Play 결제 검증·생성 Use Case
 */
export class VerifyGooglePlayPaymentUseCase {
  constructor(private readonly paymentRepo: IPaymentRepository) {}

  /**
   * Google Play Pub/Sub으로부터 받은 결제 정보를 검증하고 Payment 생성
   */
  async execute(input: VerifyGooglePlayPaymentInput): Promise<VerifyGooglePlayPaymentResult> {
    // 이미 처리된 결제인지 확인 (중복 알림 방지)
    const existing = await this.paymentRepo.findByProviderTransactionId(input.orderId);
    if (existing) {
      return { payment: existing };
    }

    // Google Play API로 실제 구매 검증은 Infrastructure 레이어에서 수행 후
    // Use Case는 검증된 데이터를 받아서 Payment 생성
    const payment = await this.paymentRepo.create({
      provider: "google_play",
      userId: input.userId,
      amount: 0, // Google Play는 금액을 API로 별도 조회
      currency: "USD", // 기본값, 실제로는 API 응답에서 가져옴
      status: "completed",
      providerTransactionId: input.orderId,
      productId: input.productId,
      subscriptionId: input.subscriptionId,
      receiptData: input.purchaseToken,
      metadata: {
        ...input.metadata,
        packageName: input.packageName,
      },
    });

    return { payment };
  }
}
