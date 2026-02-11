import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { env } from "../../../config/env.js";

/**
 * Passport 설정
 * OAuth 로그인 전략 초기화
 */
export function configurePassport(): void {
  // OAuth가 비활성화되어 있으면 초기화하지 않음
  if (!env.ENABLE_OAUTH) {
    return;
  }

  // Google OAuth 전략
  if (env.OAUTH_GOOGLE_CLIENT_ID && env.OAUTH_GOOGLE_CLIENT_SECRET && env.OAUTH_GOOGLE_CALLBACK_URL) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: env.OAUTH_GOOGLE_CLIENT_ID,
          clientSecret: env.OAUTH_GOOGLE_CLIENT_SECRET,
          callbackURL: env.OAUTH_GOOGLE_CALLBACK_URL,
        },
        (accessToken, refreshToken, profile, done) => {
          // OAuth 로그인 성공 시 콜백
          // 실제로는 DB에서 유저 조회/생성 로직 필요
          const user = {
            userId: profile.id,
            email: profile.emails?.[0]?.value || "",
          };
          done(null, user);
        }
      )
    );
  }

  // Serialize/Deserialize (세션 사용 시 필요, JWT 방식에서는 사용 안 함)
  passport.serializeUser((user: any, done) => {
    done(null, user);
  });

  passport.deserializeUser((user: any, done) => {
    done(null, user);
  });
}
