import { Router } from "express";
import passport from "passport";
import { env } from "../../../config/env.js";
import { generateToken } from "@/shared/auth/jwt.js";

/**
 * 인증 라우터 생성
 * OAuth 로그인 및 JWT 발급
 */
export function createAuthRouter(): Router {
  const router = Router();

  // OAuth가 비활성화되어 있으면 빈 라우터 반환
  if (!env.ENABLE_OAUTH) {
    return router;
  }

  /**
   * GET /auth/google
   * Google OAuth 로그인 시작
   */
  router.get(
    "/google",
    passport.authenticate("google", {
      scope: ["profile", "email"],
      session: false, // 세션 사용 안 함 (JWT 사용)
    })
  );

  /**
   * GET /auth/google/callback
   * Google OAuth 콜백
   * 성공 시 JWT 발급
   */
  router.get(
    "/google/callback",
    passport.authenticate("google", {
      session: false,
      failureRedirect: "/auth/failure",
    }),
    (req, res) => {
      const user = req.user!;

      // JWT 토큰 생성
      const token = generateToken({
        userId: user.userId,
        email: user.email,
      });

      // 클라이언트에 토큰 반환 (실제로는 리다이렉트 또는 쿠키 설정)
      res.json({
        data: {
          token,
          user: {
            userId: user.userId,
            email: user.email,
          },
        },
        meta: {},
      });
    }
  );

  /**
   * GET /auth/failure
   * OAuth 로그인 실패
   */
  router.get("/failure", (req, res) => {
    res.status(401).json({
      error: {
        code: "OAUTH_FAILED",
        message: "OAuth authentication failed",
      },
    });
  });

  return router;
}
