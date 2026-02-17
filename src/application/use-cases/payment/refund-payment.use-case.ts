import type { IPaymentRepository } from "@/application/repositories/payment.repository.interface.js";
import type { Payment } from "@/domain/entities/payment.entity.js";
import { NotFoundError } from "@/shared/errors/index.js";

/**
 * 환불 처리 Input
 */
export interface RefundPaymentInput {
  // Payment ID
  paymentId: string;
  // 환불 사유 (선택)
  reason?: string;
  // 메타데이터
  metadata?: Record<string, any>;
}

/**
 * 환불 처리 Result
 */
export interface RefundPaymentResult {
  payment: Payment;
  refundId?: string;
}

/**
 * 환불 처리 Use Case
 * Stripe, Google Play, Apple IAP 모두 지원
 */
export class RefundPaymentUseCase {
  constructor(private readonly paymentRepo: IPaymentRepository) {}

  /**
   * 결제 환불 처리
   * Infrastructure 레이어에서 실제 환불 API 호출 후 상태 업데이트
   */
  async execute(input: RefundPaymentInput): Promise<RefundPaymentResult> {
    // 결제 조회
    const payment = await this.paymentRepo.findById(input.paymentId);
    if (!payment) {
      throw new NotFoundError("Payment not found");
    }

    // 이미 환불된 결제인지 확인
    if (payment.status === "refunded") {
      return { payment };
    }

    // 환불 가능 상태인지 확인
    if (payment.status !== "completed") {
      throw new Error(`Cannot refund payment with status: ${payment.status}`);
    }

    // 결제 상태를 'refunded'로 업데이트
    const refundedPayment = await this.paymentRepo.update(input.paymentId, {
      status: "refunded",
      metadata: {
        ...payment.metadata,
        refundReason: input.reason,
        refundedAt: new Date().toISOString(),
        ...input.metadata,
      },
    });

    return {
      payment: refundedPayment!,
      refundId: `refund_${payment.providerTransactionId}`,
    };
  }
}
