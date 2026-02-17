import { Router } from "express";
import type { VerifyStripePaymentUseCase } from "@/application/use-cases/payment/verify-stripe-payment.use-case.js";
import type { VerifyGooglePlayPaymentUseCase } from "@/application/use-cases/payment/verify-google-play-payment.use-case.js";
import type { VerifyAppleIAPPaymentUseCase } from "@/application/use-cases/payment/verify-apple-iap-payment.use-case.js";
import type { RefundPaymentUseCase } from "@/application/use-cases/payment/refund-payment.use-case.js";
import type { GetPaymentUseCase } from "@/application/use-cases/payment/get-payment.use-case.js";
import type { GetUserPaymentsUseCase } from "@/application/use-cases/payment/get-user-payments.use-case.js";
import type { HandleDisputeUseCase } from "@/application/use-cases/payment/handle-dispute.use-case.js";
import { stripeClient } from "@/infrastructure/payment/stripe.client.js";
import { appleIAPClient } from "@/infrastructure/payment/apple-iap.client.js";
import Logger from "@/shared/logger/logger.js";

/**
 * Payment Use Cases 타입
 */
export interface PaymentUseCases {
  verifyStripePayment: VerifyStripePaymentUseCase;
  verifyGooglePlayPayment: VerifyGooglePlayPaymentUseCase;
  verifyAppleIAPPayment: VerifyAppleIAPPaymentUseCase;
  refundPayment: RefundPaymentUseCase;
  getPayment: GetPaymentUseCase;
  getUserPayments: GetUserPaymentsUseCase;
  handleDispute: HandleDisputeUseCase;
}

/**
 * Payment 라우터 생성
 * 웹훅 엔드포인트: Stripe, Apple IAP
 * Google Play는 Pub/Sub 사용하므로 별도 처리
 */
export function createPaymentRouter(useCases: PaymentUseCases): Router {
  const router = Router();

  /**
   * Stripe 웹훅 엔드포인트
   * POST /webhooks/stripe
   */
  router.post(
    "/webhooks/stripe",
    // raw body가 필요하므로 별도 처리 필요 (app.ts에서 설정)
    async (req, res, next) => {
      try {
        const signature = req.headers["stripe-signature"] as string;

        if (!signature) {
          res.status(400).json({ error: "Missing stripe-signature header" });
          return;
        }

        // 웹훅 서명 검증
        const event = stripeClient.verifyWebhookSignature(req.body, signature);

        Logger.info(`Stripe webhook received: ${event.type}`);

        // payment_intent.succeeded 이벤트 처리
        if (event.type === "payment_intent.succeeded") {
          const paymentIntent = event.data.object as any;

          await useCases.verifyStripePayment.execute({
            transactionId: paymentIntent.id,
            amount: paymentIntent.amount,
            currency: paymentIntent.currency,
            userId: paymentIntent.metadata?.userId || "unknown",
            metadata: paymentIntent.metadata,
          });

          Logger.info(`Stripe payment verified: ${paymentIntent.id}`);
        }

        // charge.refunded 이벤트 처리
        if (event.type === "charge.refunded") {
          const charge = event.data.object as any;
          const paymentIntentId = charge.payment_intent;

          // Payment를 provider transaction ID로 조회 후 환불 처리
          Logger.info(`Stripe refund webhook received for: ${paymentIntentId}`);
        }

        // charge.dispute.created 이벤트 처리
        if (event.type === "charge.dispute.created") {
          const dispute = event.data.object as any;

          await useCases.handleDispute.execute({
            providerTransactionId: dispute.payment_intent,
            disputeId: dispute.id,
            reason: dispute.reason,
            disputeStatus: "opened",
            amount: dispute.amount,
            metadata: { charge: dispute.charge },
          });

          Logger.info(`Stripe dispute opened: ${dispute.id}`);
        }

        // charge.dispute.closed 이벤트 처리
        if (event.type === "charge.dispute.closed") {
          const dispute = event.data.object as any;
          const status = dispute.status === "won" ? "won" : "lost";

          await useCases.handleDispute.execute({
            providerTransactionId: dispute.payment_intent,
            disputeId: dispute.id,
            reason: dispute.reason,
            disputeStatus: status,
            amount: dispute.amount,
          });

          Logger.info(`Stripe dispute closed: ${dispute.id}, status: ${status}`);
        }

        res.json({ received: true });
      } catch (err) {
        Logger.error("Stripe webhook error", err);
        next(err);
      }
    }
  );

  /**
   * Apple IAP 웹훅 엔드포인트
   * POST /webhooks/apple
   */
  router.post("/webhooks/apple", async (req, res, next) => {
    try {
      const { signedPayload } = req.body;

      if (!signedPayload) {
        res.status(400).json({ error: "Missing signedPayload" });
        return;
      }

      // 서명 검증 및 페이로드 추출
      const payload = appleIAPClient.verifyNotificationSignature(signedPayload);

      Logger.info(`Apple IAP webhook received: ${payload.notificationType}`);

      // 알림 타입별 처리
      if (payload.notificationType === "CONSUMPTION_REQUEST" || payload.notificationType === "DID_RENEW") {
        const transactionInfo = payload.data?.signedTransactionInfo;

        if (transactionInfo) {
          // JWT 디코딩하여 트랜잭션 정보 추출
          const parts = transactionInfo.split(".");
          const transaction = JSON.parse(Buffer.from(parts[1], "base64").toString());

          await useCases.verifyAppleIAPPayment.execute({
            transactionId: transaction.transactionId,
            originalTransactionId: transaction.originalTransactionId,
            productId: transaction.productId,
            userId: transaction.appAccountToken || "unknown",
            receiptData: signedPayload,
            metadata: payload,
          });

          Logger.info(`Apple IAP payment verified: ${transaction.transactionId}`);
        }
      }

      res.json({ received: true });
    } catch (err) {
      Logger.error("Apple IAP webhook error", err);
      next(err);
    }
  });

  /**
   * 결제 조회
   * GET /:paymentId
   */
  router.get("/:paymentId", async (req, res, next) => {
    try {
      const { paymentId } = req.params;
      const result = await useCases.getPayment.execute({ paymentId });
      res.json({ data: result.payment, meta: {} });
    } catch (err) {
      next(err);
    }
  });

  /**
   * 사용자 결제 내역 조회
   * GET /users/:userId
   */
  router.get("/users/:userId", async (req, res, next) => {
    try {
      const { userId } = req.params;
      const result = await useCases.getUserPayments.execute({ userId });
      res.json({
        data: result.payments,
        meta: { total: result.total },
      });
    } catch (err) {
      next(err);
    }
  });

  /**
   * 환불 처리
   * POST /:paymentId/refund
   */
  router.post("/:paymentId/refund", async (req, res, next) => {
    try {
      const { paymentId } = req.params;
      const { reason, metadata } = req.body;

      const result = await useCases.refundPayment.execute({
        paymentId,
        reason,
        metadata,
      });

      res.json({ data: result.payment, meta: { refundId: result.refundId } });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
