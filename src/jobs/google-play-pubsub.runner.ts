import { googlePlayClient } from "@/infrastructure/payment/google-play.client.js";
import type { VerifyGooglePlayPaymentUseCase } from "@/application/use-cases/payment/verify-google-play-payment.use-case.js";
import { env } from "../../config/env.js";
import Logger from "@/shared/logger/logger.js";

/**
 * Google Play Pub/Sub 메시지 핸들러
 */
export function startGooglePlayPubSubRunner(verifyUseCase: VerifyGooglePlayPaymentUseCase): void {
  if (!env.ENABLE_PAYMENT) {
    Logger.info("Google Play Pub/Sub runner is disabled (ENABLE_PAYMENT=false)");
    return;
  }

  if (!env.GOOGLE_PLAY_PUBSUB_SUBSCRIPTION) {
    Logger.info("Google Play Pub/Sub subscription not configured, skipping runner");
    return;
  }

  try {
    googlePlayClient.startSubscription(env.GOOGLE_PLAY_PUBSUB_SUBSCRIPTION, async (data) => {
      Logger.info("Google Play Pub/Sub message received", data);

      // Pub/Sub 메시지 파싱
      const { subscriptionNotification, oneTimeProductNotification } = data;

      if (subscriptionNotification) {
        // 구독 알림 처리
        await verifyUseCase.execute({
          orderId: subscriptionNotification.purchaseToken,
          packageName: subscriptionNotification.packageName,
          productId: subscriptionNotification.subscriptionId,
          purchaseToken: subscriptionNotification.purchaseToken,
          userId: "unknown", // 실제로는 purchaseToken으로 사용자 매핑 필요
          subscriptionId: subscriptionNotification.subscriptionId,
        });

        Logger.info(`Google Play subscription verified: ${subscriptionNotification.subscriptionId}`);
      }

      if (oneTimeProductNotification) {
        // 일회성 구매 알림 처리
        await verifyUseCase.execute({
          orderId: oneTimeProductNotification.purchaseToken,
          packageName: oneTimeProductNotification.packageName,
          productId: oneTimeProductNotification.sku,
          purchaseToken: oneTimeProductNotification.purchaseToken,
          userId: "unknown", // 실제로는 purchaseToken으로 사용자 매핑 필요
        });

        Logger.info(`Google Play product verified: ${oneTimeProductNotification.sku}`);
      }
    });

    Logger.info("Google Play Pub/Sub runner started");
  } catch (error) {
    Logger.error("Failed to start Google Play Pub/Sub runner", error);
  }
}
