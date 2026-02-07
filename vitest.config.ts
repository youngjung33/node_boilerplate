import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

/**
 * Vitest 테스트 설정
 * - tsconfig.json의 path alias 해석
 * - Node.js 환경에서 테스트 실행
 * - tests 폴더의 spec.ts 파일들을 테스트 대상으로 인식
 */
export default defineConfig({
  // tsconfig.json의 paths 해석 플러그인
  plugins: [tsconfigPaths()],
  test: {
    // describe, it 등을 import 없이 사용
    globals: true,
    // Node.js 환경
    environment: "node",
    // 테스트 파일 패턴
    include: ["tests/**/*.spec.ts"],
  },
});
