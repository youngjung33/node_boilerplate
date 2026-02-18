# ============================================
# Stage 1: Dependencies
# ============================================
FROM node:24-alpine AS deps

WORKDIR /app

# package.json과 package-lock.json 복사
COPY package*.json ./

# 프로덕션 의존성만 설치
RUN npm ci --only=production && \
    npm cache clean --force

# ============================================
# Stage 2: Build (TypeScript는 tsx로 실행하므로 생략 가능)
# ============================================
FROM node:24-alpine AS builder

WORKDIR /app

# 전체 패키지 파일 복사
COPY package*.json ./

# 모든 의존성 설치 (devDependencies 포함)
RUN npm ci

# 소스 코드 복사
COPY . .

# TypeScript 타입 체크만 수행 (빌드는 tsx로 런타임에 수행)
RUN npm run typecheck || true

# ============================================
# Stage 3: Production
# ============================================
FROM node:24-alpine AS production

# 보안: non-root 사용자 생성
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# 프로덕션 의존성 복사
COPY --from=deps --chown=nodejs:nodejs /app/node_modules ./node_modules

# 소스 코드 복사 (TypeScript 원본)
COPY --chown=nodejs:nodejs . .

# 데이터 디렉토리 생성 (SQLite용)
RUN mkdir -p /app/data && \
    chown -R nodejs:nodejs /app/data

# 로그 디렉토리 생성
RUN mkdir -p /app/logs && \
    chown -R nodejs:nodejs /app/logs

# non-root 사용자로 전환
USER nodejs

# 포트 노출
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# tsx로 TypeScript 직접 실행
CMD ["npm", "start"]
