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

- Node.js + TypeScript + Express
- Zod (검증), Vitest (테스트), Winston (로깅)
- JWT (인증), Passport (OAuth)
- Stripe, Google Play, Apple IAP (결제)
- FCM (푸시), node-cron (배치)
- AWS S3 (파일 업로드), Sharp (이미지 압축)

## 구조

```
src/
├── domain/
│   └── entities/              # User, Payment, File, FCM Message
├── application/
│   ├── repositories/          # Repository 인터페이스
│   └── use-cases/
│       ├── user/              # User CRUD (5개)
│       ├── payment/           # Payment 검증/환불/조회/분쟁 (7개)
│       └── file/              # File 업로드/조회/삭제 (3개)
├── infrastructure/
│   ├── repositories/          # In-Memory 구현체
│   ├── db/                    # SQLite, Supabase, MariaDB, MongoDB
│   ├── auth/                  # Passport OAuth 설정
│   ├── payment/               # Stripe, Google Play, Apple IAP
│   ├── storage/               # AWS S3
│   └── fcm/                   # Firebase Admin SDK
├── presentation/
│   ├── routes/                # user, auth, payment, file
│   └── middleware/            # JWT, Rate Limit, Error Handler, Logger
├── validation/                # Zod 스키마
├── shared/
│   ├── errors/                # AppError, ValidationError, NotFoundError, ConflictError
│   └── logger/                # Winston Logger
├── jobs/                      # FCM Batch, Google Play Pub/Sub
├── container.ts               # DI Container
└── index.ts                   # Entry Point

config/
└── env.ts                     # Zod 기반 환경 변수 검증

tests/
└── user/                      # Use Case 테스트 (26개)
```

## API

**v1 엔드포인트:**
- `GET /health`
- `GET /v1/users`, `POST /v1/users`, `GET /v1/users/:id`, `PATCH /v1/users/:id`, `DELETE /v1/users/:id`
- `GET /v1/auth/google`, `GET /v1/auth/google/callback`
- `POST /v1/payment/webhooks/stripe`, `POST /v1/payment/webhooks/apple`
- `GET /v1/payment/:paymentId`, `GET /v1/payment/users/:userId`, `POST /v1/payment/:paymentId/refund`
- `POST /v1/files/upload`, `GET /v1/files/:fileId`, `GET /v1/files/:fileId/download`, `DELETE /v1/files/:fileId`

응답 포맷: `{ data, meta }`

## 특징

- **다중 DB**: env로 DB 선택 (Repository 패턴)
- **기능 스위치**: ENABLE_* 플래그로 기능 on/off
- **TDD**: Use Case 단위 테스트
- **보안**: JWT, OAuth, Rate Limit, CORS, Helmet
- **결제**: Stripe, Google Play Pub/Sub, Apple IAP (환불/분쟁 지원)
- **배치**: FCM 푸시 스케줄링 (node-cron)
- **파일 업로드**: S3 업로드, 용량 체크, 이미지 압축, Signed URL 조회
- **Docker**: 멀티스테이지 빌드, Profile 기반 DB 선택
