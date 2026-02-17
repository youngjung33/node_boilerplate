import type { Payment } from "@/domain/entities/payment.entity.js";

/**
 * Payment Repository 인터페이스
 */
export interface IPaymentRepository {
  /**
   * ID로 Payment 조회
   */
  findById(id: string): Promise<Payment | null>;

  /**
   * Provider 트랜잭션 ID로 Payment 조회
   */
  findByProviderTransactionId(providerTransactionId: string): Promise<Payment | null>;

  /**
   * 사용자 ID로 Payment 목록 조회
   */
  findByUserId(userId: string): Promise<Payment[]>;

  /**
   * 새 Payment 생성
   */
  create(data: {
    provider: Payment["provider"];
    userId: string;
    amount: number;
    currency: string;
    status: Payment["status"];
    providerTransactionId: string;
    productId?: string;
    subscriptionId?: string;
    receiptData?: string;
    metadata?: Record<string, any>;
  }): Promise<Payment>;

  /**
   * Payment 상태 업데이트
   */
  updateStatus(id: string, status: Payment["status"]): Promise<Payment | null>;

  /**
   * Payment 정보 수정
   */
  update(
    id: string,
    data: {
      status?: Payment["status"];
      metadata?: Record<string, any>;
      receiptData?: string;
    }
  ): Promise<Payment | null>;
}
