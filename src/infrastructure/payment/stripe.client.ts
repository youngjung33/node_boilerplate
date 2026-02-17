import Stripe from "stripe";
import { env } from "../../../config/env.js";
import Logger from "@/shared/logger/logger.js";

/**
 * Stripe 클라이언트 (일반 결제)
 */
class StripeClient {
  // Stripe SDK 인스턴스
  private stripe: Stripe | null = null;

  /**
   * Stripe 클라이언트 초기화
   */
  initialize(): void {
    if (!env.ENABLE_PAYMENT) {
      Logger.info("Stripe client is disabled (ENABLE_PAYMENT=false)");
      return;
    }

    if (!env.STRIPE_SECRET_KEY) {
      Logger.warn("Stripe secret key not provided, skipping initialization");
      return;
    }

    this.stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-01-28.clover",
    });

    Logger.info("Stripe client initialized");
  }

  /**
   * Stripe SDK 인스턴스 반환
   */
  getClient(): Stripe {
    if (!this.stripe) {
      throw new Error("Stripe client not initialized");
    }
    return this.stripe;
  }

  /**
   * 웹훅 서명 검증
   */
  verifyWebhookSignature(payload: string | Buffer, signature: string): Stripe.Event {
    if (!this.stripe) {
      throw new Error("Stripe client not initialized");
    }

    if (!env.STRIPE_WEBHOOK_SECRET) {
      throw new Error("Stripe webhook secret not configured");
    }

    return this.stripe.webhooks.constructEvent(payload, signature, env.STRIPE_WEBHOOK_SECRET);
  }

  /**
   * Payment Intent 조회
   */
  async getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    if (!this.stripe) {
      throw new Error("Stripe client not initialized");
    }

    return await this.stripe.paymentIntents.retrieve(paymentIntentId);
  }

  /**
   * 환불 처리
   */
  async createRefund(paymentIntentId: string, amount?: number, reason?: string): Promise<Stripe.Refund> {
    if (!this.stripe) {
      throw new Error("Stripe client not initialized");
    }

    const refundParams: Stripe.RefundCreateParams = {
      payment_intent: paymentIntentId,
    };

    if (amount !== undefined) {
      refundParams.amount = amount;
    }

    if (reason) {
      refundParams.reason = reason as Stripe.RefundCreateParams.Reason;
    }

    return await this.stripe.refunds.create(refundParams);
  }

  /**
   * 환불 조회
   */
  async getRefund(refundId: string): Promise<Stripe.Refund> {
    if (!this.stripe) {
      throw new Error("Stripe client not initialized");
    }

    return await this.stripe.refunds.retrieve(refundId);
  }

  /**
   * Dispute 조회
   */
  async getDispute(disputeId: string): Promise<Stripe.Dispute> {
    if (!this.stripe) {
      throw new Error("Stripe client not initialized");
    }

    return await this.stripe.disputes.retrieve(disputeId);
  }
}

// Singleton 인스턴스
export const stripeClient = new StripeClient();
