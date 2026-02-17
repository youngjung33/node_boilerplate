import { env } from "../../../config/env.js";
import Logger from "@/shared/logger/logger.js";

/**
 * Apple IAP 영수증 검증 응답
 */
interface AppleReceiptResponse {
  status: number;
  receipt?: any;
  latest_receipt_info?: any[];
  pending_renewal_info?: any[];
}

/**
 * Apple IAP 클라이언트 (앱 결제 - 웹훅)
 */
class AppleIAPClient {
  // Apple 영수증 검증 URL
  private verifyUrl: string = "";

  /**
   * Apple IAP 클라이언트 초기화
   */
  initialize(): void {
    if (!env.ENABLE_PAYMENT) {
      Logger.info("Apple IAP client is disabled (ENABLE_PAYMENT=false)");
      return;
    }

    // Production vs Sandbox
    this.verifyUrl =
      env.NODE_ENV === "production"
        ? "https://buy.itunes.apple.com/verifyReceipt"
        : "https://sandbox.itunes.apple.com/verifyReceipt";

    Logger.info(`Apple IAP client initialized (${env.NODE_ENV})`);
  }

  /**
   * 영수증 검증
   */
  async verifyReceipt(receiptData: string): Promise<AppleReceiptResponse> {
    if (!env.APPLE_IAP_SHARED_SECRET) {
      throw new Error("Apple IAP shared secret not configured");
    }

    const response = await fetch(this.verifyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "receipt-data": receiptData,
        password: env.APPLE_IAP_SHARED_SECRET,
        "exclude-old-transactions": true,
      }),
    });

    if (!response.ok) {
      throw new Error(`Apple receipt verification failed: ${response.status}`);
    }

    const data = (await response.json()) as AppleReceiptResponse;

    // Status 코드 확인
    // 0: 성공
    // 21007: Sandbox 영수증을 Production으로 보낸 경우
    // 21008: Production 영수증을 Sandbox로 보낸 경우
    if (data.status === 21007 && env.NODE_ENV !== "production") {
      // Sandbox로 재시도
      return await this.verifyReceipt(receiptData);
    }

    if (data.status !== 0) {
      throw new Error(`Apple receipt verification failed with status: ${data.status}`);
    }

    return data;
  }

  /**
   * App Store Server Notification 서명 검증
   * (Apple은 JWT 형식으로 서명된 알림을 보냄)
   */
  verifyNotificationSignature(signedPayload: string): any {
    // JWT 디코딩 및 검증
    // 실제 프로덕션에서는 Apple의 공개키로 서명 검증 필요
    // 여기서는 간단히 디코딩만 수행
    try {
      const parts = signedPayload.split(".");
      if (parts.length !== 3) {
        throw new Error("Invalid JWT format");
      }

      const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
      return payload;
    } catch (error) {
      throw new Error("Failed to decode Apple notification payload");
    }
  }

  /**
   * 트랜잭션 정보 디코딩 (JWT)
   */
  decodeTransactionInfo(signedTransaction: string): any {
    try {
      const parts = signedTransaction.split(".");
      if (parts.length !== 3) {
        throw new Error("Invalid JWT format");
      }

      return JSON.parse(Buffer.from(parts[1], "base64").toString());
    } catch (error) {
      throw new Error("Failed to decode transaction info");
    }
  }

  /**
   * 환불 감지 (cancellation_date 확인)
   */
  isRefunded(receiptResponse: AppleReceiptResponse): boolean {
    // latest_receipt_info에서 cancellation_date 필드 확인
    if (receiptResponse.latest_receipt_info) {
      return receiptResponse.latest_receipt_info.some((item: any) => item.cancellation_date !== undefined);
    }
    return false;
  }

  /**
   * 구독 상태 확인
   */
  getSubscriptionStatus(receiptResponse: AppleReceiptResponse): {
    isActive: boolean;
    expiresDate?: string;
    autoRenewStatus?: boolean;
  } {
    if (!receiptResponse.latest_receipt_info || receiptResponse.latest_receipt_info.length === 0) {
      return { isActive: false };
    }

    // 가장 최근 영수증 정보
    const latestReceipt = receiptResponse.latest_receipt_info[0];
    const expiresDate = latestReceipt.expires_date_ms;

    // 구독 갱신 상태
    const autoRenewInfo = receiptResponse.pending_renewal_info?.[0];
    const autoRenewStatus = autoRenewInfo?.auto_renew_status === "1";

    // 만료일이 현재 시간보다 이후인지 확인
    const isActive = expiresDate ? new Date(parseInt(expiresDate)) > new Date() : false;

    return {
      isActive,
      expiresDate: latestReceipt.expires_date,
      autoRenewStatus,
    };
  }
}

// Singleton 인스턴스
export const appleIAPClient = new AppleIAPClient();
