import type { IPaymentRepository } from "@/application/repositories/payment.repository.interface.js";
import type { Payment } from "@/domain/entities/payment.entity.js";
import { NotFoundError } from "@/shared/errors/index.js";

/**
 * 분쟁(Dispute) 처리 Input
 */
export interface HandleDisputeInput {
  // Provider 트랜잭션 ID
  providerTransactionId: string;
  // 분쟁 ID
  disputeId: string;
  // 분쟁 사유
  reason: string;
  // 분쟁 상태 (opened, under_review, won, lost)
  disputeStatus: "opened" | "under_review" | "won" | "lost";
  // 분쟁 금액
  amount?: number;
  // 메타데이터
  metadata?: Record<string, any>;
}

/**
 * 분쟁 처리 Result
 */
export interface HandleDisputeResult {
  payment: Payment;
}

/**
 * 분쟁(Dispute) 처리 Use Case
 * 주로 Stripe에서 사용 (카드 소유자가 결제 이의 제기)
 */
export class HandleDisputeUseCase {
  constructor(private readonly paymentRepo: IPaymentRepository) {}

  /**
   * 결제 분쟁 처리
   */
  async execute(input: HandleDisputeInput): Promise<HandleDisputeResult> {
    // Provider 트랜잭션 ID로 결제 조회
    const payment = await this.paymentRepo.findByProviderTransactionId(input.providerTransactionId);
    
    if (!payment) {
      throw new NotFoundError("Payment not found");
    }

    // 분쟁 정보 메타데이터에 추가
    const updatedPayment = await this.paymentRepo.update(payment.id, {
      metadata: {
        ...payment.metadata,
        dispute: {
          disputeId: input.disputeId,
          reason: input.reason,
          status: input.disputeStatus,
          amount: input.amount,
          createdAt: new Date().toISOString(),
          ...input.metadata,
        },
      },
    });

    // 분쟁이 패소(lost)한 경우 결제 상태를 'refunded'로 변경
    if (input.disputeStatus === "lost") {
      await this.paymentRepo.updateStatus(payment.id, "refunded");
    }

    return {
      payment: updatedPayment!,
    };
  }
}
