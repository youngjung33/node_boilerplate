import { PubSub } from "@google-cloud/pubsub";
import { google } from "googleapis";
import { env } from "../../../config/env.js";
import Logger from "@/shared/logger/logger.js";

/**
 * Google Play 결제 클라이언트 (앱 결제 - Pub/Sub)
 */
class GooglePlayClient {
  // Pub/Sub 클라이언트
  private pubsub: PubSub | null = null;
  // Android Publisher API 클라이언트
  private androidPublisher: any = null;

  /**
   * Google Play 클라이언트 초기화
   */
  async initialize(): Promise<void> {
    if (!env.ENABLE_PAYMENT) {
      Logger.info("Google Play client is disabled (ENABLE_PAYMENT=false)");
      return;
    }

    if (!env.GOOGLE_PLAY_SERVICE_ACCOUNT_PATH) {
      Logger.warn("Google Play service account not provided, skipping initialization");
      return;
    }

    try {
      // Service Account로 인증
      const auth = new google.auth.GoogleAuth({
        keyFile: env.GOOGLE_PLAY_SERVICE_ACCOUNT_PATH,
        scopes: ["https://www.googleapis.com/auth/androidpublisher"],
      });

      // Android Publisher API 클라이언트
      this.androidPublisher = google.androidpublisher({
        version: "v3",
        auth: auth,
      });

      // Pub/Sub 클라이언트
      this.pubsub = new PubSub({
        keyFilename: env.GOOGLE_PLAY_SERVICE_ACCOUNT_PATH,
      });

      Logger.info("Google Play client initialized");
    } catch (error) {
      Logger.error("Failed to initialize Google Play client", error);
    }
  }

  /**
   * Pub/Sub 구독 시작
   */
  startSubscription(subscriptionName: string, messageHandler: (message: any) => Promise<void>): void {
    if (!this.pubsub) {
      throw new Error("Google Play Pub/Sub client not initialized");
    }

    const subscription = this.pubsub.subscription(subscriptionName);

    subscription.on("message", async (message) => {
      try {
        const data = JSON.parse(message.data.toString());
        await messageHandler(data);
        message.ack();
      } catch (error) {
        Logger.error("Error processing Google Play Pub/Sub message", error);
        message.nack();
      }
    });

    subscription.on("error", (error) => {
      Logger.error("Google Play Pub/Sub subscription error", error);
    });

    Logger.info(`Google Play Pub/Sub subscription started: ${subscriptionName}`);
  }

  /**
   * 구매 검증 (제품 구매)
   */
  async verifyProduct(packageName: string, productId: string, purchaseToken: string): Promise<any> {
    if (!this.androidPublisher) {
      throw new Error("Google Play Android Publisher client not initialized");
    }

    const response = await this.androidPublisher.purchases.products.get({
      packageName,
      productId,
      token: purchaseToken,
    });

    return response.data;
  }

  /**
   * 구매 검증 (구독)
   */
  async verifySubscription(packageName: string, subscriptionId: string, purchaseToken: string): Promise<any> {
    if (!this.androidPublisher) {
      throw new Error("Google Play Android Publisher client not initialized");
    }

    const response = await this.androidPublisher.purchases.subscriptions.get({
      packageName,
      subscriptionId,
      token: purchaseToken,
    });

    return response.data;
  }

  /**
   * 제품 구매 환불
   */
  async refundProduct(packageName: string, productId: string, purchaseToken: string): Promise<void> {
    if (!this.androidPublisher) {
      throw new Error("Google Play Android Publisher client not initialized");
    }

    await this.androidPublisher.purchases.products.refund({
      packageName,
      productId,
      token: purchaseToken,
    });
  }

  /**
   * 구독 취소
   */
  async cancelSubscription(packageName: string, subscriptionId: string, purchaseToken: string): Promise<void> {
    if (!this.androidPublisher) {
      throw new Error("Google Play Android Publisher client not initialized");
    }

    await this.androidPublisher.purchases.subscriptions.cancel({
      packageName,
      subscriptionId,
      token: purchaseToken,
    });
  }

  /**
   * 구독 환불
   */
  async refundSubscription(packageName: string, subscriptionId: string, purchaseToken: string): Promise<void> {
    if (!this.androidPublisher) {
      throw new Error("Google Play Android Publisher client not initialized");
    }

    await this.androidPublisher.purchases.subscriptions.refund({
      packageName,
      subscriptionId,
      token: purchaseToken,
    });
  }

  /**
   * 구독 취소 및 환불
   */
  async revokeSubscription(packageName: string, subscriptionId: string, purchaseToken: string): Promise<void> {
    if (!this.androidPublisher) {
      throw new Error("Google Play Android Publisher client not initialized");
    }

    await this.androidPublisher.purchases.subscriptions.revoke({
      packageName,
      subscriptionId,
      token: purchaseToken,
    });
  }
}

// Singleton 인스턴스
export const googlePlayClient = new GooglePlayClient();
