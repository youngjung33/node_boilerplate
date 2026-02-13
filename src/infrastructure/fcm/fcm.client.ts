import admin from "firebase-admin";
import { env } from "../../../config/env.js";
import Logger from "@/shared/logger/logger.js";
import * as fs from "fs";

/**
 * FCM 클라이언트 초기화 여부
 */
let isInitialized = false;

/**
 * Firebase Admin SDK 초기화
 */
export function initializeFcm(): void {
  // FCM이 비활성화되어 있으면 초기화하지 않음
  if (!env.ENABLE_FCM) {
    Logger.info("FCM is disabled (ENABLE_FCM=false)");
    return;
  }

  // 이미 초기화되어 있으면 스킵
  if (isInitialized) {
    return;
  }

  // Service Account 파일 경로 확인
  if (!env.FCM_SERVICE_ACCOUNT_PATH) {
    Logger.warn("FCM_SERVICE_ACCOUNT_PATH is not set. FCM will not be initialized.");
    return;
  }

  // Service Account 파일 존재 확인
  if (!fs.existsSync(env.FCM_SERVICE_ACCOUNT_PATH)) {
    Logger.error(`FCM service account file not found: ${env.FCM_SERVICE_ACCOUNT_PATH}`);
    return;
  }

  try {
    // Firebase Admin SDK 초기화
    admin.initializeApp({
      credential: admin.credential.cert(env.FCM_SERVICE_ACCOUNT_PATH),
    });

    isInitialized = true;
    Logger.info("✅ FCM initialized successfully");
  } catch (error) {
    Logger.error(`Failed to initialize FCM: ${error}`);
  }
}

/**
 * FCM 메시지 발송
 * @param token - FCM 토큰
 * @param title - 알림 제목
 * @param body - 알림 본문
 * @param data - 추가 데이터
 * @returns 발송 성공 여부
 */
export async function sendFcmMessage(
  token: string,
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<{ success: boolean; error?: string }> {
  if (!isInitialized) {
    return { success: false, error: "FCM is not initialized" };
  }

  try {
    await admin.messaging().send({
      token,
      notification: {
        title,
        body,
      },
      data,
    });

    return { success: true };
  } catch (error: any) {
    Logger.error(`FCM send failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}
