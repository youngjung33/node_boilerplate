import type { Payment } from "@/domain/entities/payment.entity.js";
import type { IPaymentRepository } from "@/application/repositories/payment.repository.interface.js";

/**
 * In-Memory Payment Repository 구현체
 */
export class InMemoryPaymentRepository implements IPaymentRepository {
  // In-memory 저장소
  private payments: Map<string, Payment> = new Map();
  // ID 생성용 카운터
  private currentId = 1;

  /**
   * ID로 Payment 조회
   */
  async findById(id: string): Promise<Payment | null> {
    return this.payments.get(id) || null;
  }

  /**
   * Provider 트랜잭션 ID로 Payment 조회
   */
  async findByProviderTransactionId(providerTransactionId: string): Promise<Payment | null> {
    for (const payment of this.payments.values()) {
      if (payment.providerTransactionId === providerTransactionId) {
        return payment;
      }
    }
    return null;
  }

  /**
   * 사용자 ID로 Payment 목록 조회
   */
  async findByUserId(userId: string): Promise<Payment[]> {
    const results: Payment[] = [];
    for (const payment of this.payments.values()) {
      if (payment.userId === userId) {
        results.push(payment);
      }
    }
    return results;
  }

  /**
   * 새 Payment 생성
   */
  async create(data: {
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
  }): Promise<Payment> {
    const id = String(this.currentId++);
    const now = new Date();

    const payment: Payment = {
      id,
      provider: data.provider,
      userId: data.userId,
      amount: data.amount,
      currency: data.currency,
      status: data.status,
      providerTransactionId: data.providerTransactionId,
      productId: data.productId,
      subscriptionId: data.subscriptionId,
      receiptData: data.receiptData,
      metadata: data.metadata,
      createdAt: now,
      updatedAt: now,
    };

    this.payments.set(id, payment);
    return payment;
  }

  /**
   * Payment 상태 업데이트
   */
  async updateStatus(id: string, status: Payment["status"]): Promise<Payment | null> {
    const payment = this.payments.get(id);
    if (!payment) return null;

    payment.status = status;
    payment.updatedAt = new Date();
    return payment;
  }

  /**
   * Payment 정보 수정
   */
  async update(
    id: string,
    data: {
      status?: Payment["status"];
      metadata?: Record<string, any>;
      receiptData?: string;
    }
  ): Promise<Payment | null> {
    const payment = this.payments.get(id);
    if (!payment) return null;

    if (data.status !== undefined) payment.status = data.status;
    if (data.metadata !== undefined) payment.metadata = data.metadata;
    if (data.receiptData !== undefined) payment.receiptData = data.receiptData;
    payment.updatedAt = new Date();

    return payment;
  }
}
