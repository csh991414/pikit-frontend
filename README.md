# Pikit Frontend

프롬프트 공유 및 관리 플랫폼 'Pikit'의 프론트엔드 저장소입니다.

## 기술 스택
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: (TBD)

## 로컬 실행 방법

1. 의존성 설치:
   ```bash
   npm install
   ```

2. 환경변수 설정:
   `.env.local.example` 파일을 복사하여 `.env.local` 파일을 생성하고 필요한 값을 설정합니다.
   ```bash
   cp .env.local.example .env.local
   ```

3. 개발 서버 실행:
   ```bash
   npm run dev
   ```
   실행 후 [http://localhost:3000](http://localhost:3000)에서 확인할 수 있습니다.

## 환경변수 설명
- `NEXT_PUBLIC_API_URL`: 백엔드 API 서버 주소 (기본값: http://localhost:8080)
- `NEXT_PUBLIC_SITE_URL`: 프론트엔드 사이트 주소 (기본값: http://localhost:3000)

## 백엔드 저장소
- [Pickit Backend](https://github.com/Reazon-team/Pikit_Backend) (placeholder)
