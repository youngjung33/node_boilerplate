import type { IPaymentRepository } from "@/application/repositories/payment.repository.interface.js";
import type { Payment } from "@/domain/entities/payment.entity.js";

/**
 * Apple IAP 결제 검증 Input
 */
export interface VerifyAppleIAPPaymentInput {
  // Apple 트랜잭션 ID
  transactionId: string;
  // 원본 트랜잭션 ID (구독 갱신인 경우)
  originalTransactionId?: string;
  // 상품 ID
  productId: string;
  // 사용자 ID
  userId: string;
  // 영수증 데이터
  receiptData: string;
  // 메타데이터
  metadata?: Record<string, any>;
}

/**
 * Apple IAP 결제 검증 Result
 */
export interface VerifyAppleIAPPaymentResult {
  payment: Payment;
}

/**
 * Apple IAP 결제 검증·생성 Use Case
 */
export class VerifyAppleIAPPaymentUseCase {
  constructor(private readonly paymentRepo: IPaymentRepository) {}

  /**
   * Apple App Store Server Notification으로부터 받은 결제 정보를 검증하고 Payment 생성
   */
  async execute(input: VerifyAppleIAPPaymentInput): Promise<VerifyAppleIAPPaymentResult> {
    // 이미 처리된 결제인지 확인 (중복 알림 방지)
    const existing = await this.paymentRepo.findByProviderTransactionId(input.transactionId);
    if (existing) {
      return { payment: existing };
    }

    // Apple API로 실제 영수증 검증은 Infrastructure 레이어에서 수행 후
    // Use Case는 검증된 데이터를 받아서 Payment 생성
    const payment = await this.paymentRepo.create({
      provider: "apple_iap",
      userId: input.userId,
      amount: 0, // Apple은 금액을 영수증 검증 응답에서 가져옴
      currency: "USD", // 기본값, 실제로는 영수증 응답에서 가져옴
      status: "completed",
      providerTransactionId: input.transactionId,
      productId: input.productId,
      subscriptionId: input.originalTransactionId,
      receiptData: input.receiptData,
      metadata: input.metadata,
    });

    return { payment };
  }
}
