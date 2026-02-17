import type { IPaymentRepository } from "@/application/repositories/payment.repository.interface.js";
import type { Payment } from "@/domain/entities/payment.entity.js";

/**
 * 사용자 결제 내역 조회 Input
 */
export interface GetUserPaymentsInput {
  // 사용자 ID
  userId: string;
}

/**
 * 사용자 결제 내역 조회 Result
 */
export interface GetUserPaymentsResult {
  payments: Payment[];
  total: number;
}

/**
 * 사용자 결제 내역 조회 Use Case
 */
export class GetUserPaymentsUseCase {
  constructor(private readonly paymentRepo: IPaymentRepository) {}

  /**
   * 특정 사용자의 모든 결제 내역 조회
   */
  async execute(input: GetUserPaymentsInput): Promise<GetUserPaymentsResult> {
    const payments = await this.paymentRepo.findByUserId(input.userId);

    return {
      payments,
      total: payments.length,
    };
  }
}
