import type { IPaymentRepository } from "@/application/repositories/payment.repository.interface.js";
import type { Payment } from "@/domain/entities/payment.entity.js";
import { NotFoundError } from "@/shared/errors/index.js";

/**
 * 결제 조회 Input
 */
export interface GetPaymentInput {
  // Payment ID
  paymentId: string;
}

/**
 * 결제 조회 Result
 */
export interface GetPaymentResult {
  payment: Payment;
}

/**
 * 결제 단건 조회 Use Case
 */
export class GetPaymentUseCase {
  constructor(private readonly paymentRepo: IPaymentRepository) {}

  /**
   * Payment ID로 결제 조회
   */
  async execute(input: GetPaymentInput): Promise<GetPaymentResult> {
    const payment = await this.paymentRepo.findById(input.paymentId);
    
    if (!payment) {
      throw new NotFoundError("Payment not found");
    }

    return { payment };
  }
}
