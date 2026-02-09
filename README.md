# Node.js Clean Architecture Boilerplate

## 아키텍처

**Clean Architecture 4계층 구조**

| 레이어 | 역할 | 의존 방향 |
|--------|------|-----------|
| **Domain** | 엔티티, 비즈니스 규칙 | 없음 |
| **Application** | Use Cases, Repository 인터페이스 | → Domain |
| **Infrastructure** | DB 구현체, 외부 API | → Application, Domain |
| **Presentation** | HTTP 라우트, 미들웨어 | → Application |

## 기술 스택

- Node.js + TypeScript
- Express
- Zod (검증)
- Vitest (테스트)
- JWT (인증)
- Passport (OAuth)
- FCM (푸시)

## 주요 특징

- **다중 DB 지원**: Supabase, SQLite, MariaDB, MongoDB (env로 선택)
- **기능 스위치**: OAuth, 결제, FCM을 env로 on/off
- **API 버저닝**: `/v1/users`
- **통일 응답**: `{ data, meta }`
- **TDD**: Use Case 단위 테스트

## 구조

```
src/
├── domain/              # 엔티티
├── application/         # Use Cases, Repository 인터페이스
├── infrastructure/      # DB 구현체
├── presentation/        # Express 라우트, 미들웨어
├── validation/          # Zod 스키마
├── shared/              # Logger, 에러
└── container.ts         # DI Container
```
