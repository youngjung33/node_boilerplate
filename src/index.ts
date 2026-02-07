import { createWiredApp } from "./container.js";

// 서버 포트 (환경 변수 또는 기본값 3000)
const PORT = Number(process.env.PORT) || 3000;

// DI 컨테이너에서 wired된 앱 가져오기
const app = createWiredApp();

// 서버 시작
app.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
});
