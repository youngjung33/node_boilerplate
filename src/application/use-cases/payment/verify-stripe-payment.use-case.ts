import type { IPaymentRepository } from "@/application/repositories/payment.repository.interface.js";
import type { Payment } from "@/domain/entities/payment.entity.js";

/**
 * Stripe 결제 검증 Input
 */
export interface VerifyStripePaymentInput {
  // Stripe 트랜잭션 ID
  transactionId: string;
  // 결제 금액 (센트)
  amount: number;
  // 통화
  currency: string;
  // 사용자 ID
  userId: string;
  // 메타데이터
  metadata?: Record<string, any>;
}

/**
 * Stripe 결제 검증 Result
 */
export interface VerifyStripePaymentResult {
  payment: Payment;
}

/**
 * Stripe 결제 검증·생성 Use Case
 */
export class VerifyStripePaymentUseCase {
  constructor(private readonly paymentRepo: IPaymentRepository) {}

  /**
   * Stripe 웹훅으로부터 받은 결제 정보를 검증하고 Payment 생성
   */
  async execute(input: VerifyStripePaymentInput): Promise<VerifyStripePaymentResult> {
    // 이미 처리된 결제인지 확인 (중복 웹훅 방지)
    const existing = await this.paymentRepo.findByProviderTransactionId(input.transactionId);
    if (existing) {
      return { payment: existing };
    }

    // 새 결제 생성
    const payment = await this.paymentRepo.create({
      provider: "stripe",
      userId: input.userId,
      amount: input.amount,
      currency: input.currency,
      status: "completed",
      providerTransactionId: input.transactionId,
      metadata: input.metadata,
    });

    return { payment };
  }
}
