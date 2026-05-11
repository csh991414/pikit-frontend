# Pickit 프로젝트 컨텍스트

## 서비스 개요
- 서비스명: Pickit
- 컨셉: 인스타그램에서 댓글로 공유되는 AI 이미지 프롬프트를 한곳에 모아 
  검색·열람할 수 있는 아카이브 사이트
- 타겟 사용자: AI 이미지 생성에 관심 있는 사용자
- 핵심 기능:
  1. AI 이미지 + 프롬프트 페어 갤러리
  2. 키워드/스타일/모델별 검색
  3. 프롬프트 원클릭 복사
  4. 원본 인스타그램 게시물 링크 제공

## 기술 스택 (최종 확정)
- Frontend: Next.js 14+ (App Router) + TypeScript + Tailwind CSS
- Backend: Spring Boot 3.x + Java 17 + Spring Data JPA + Gradle
- Database: PostgreSQL (Supabase 호스팅)
- Image Storage: Cloudflare R2
- 배포:
  - Frontend: Cloudflare Pages
  - Backend: Render
  - DNS: Cloudflare

## 프로젝트 구조 (분리된 레포)
- Frontend 레포: pickit-frontend
- Backend 레포: pickit-backend
- 두 레포는 완전히 독립적으로 관리됨
- 로컬 개발 시에는 같은 부모 폴더 안에 두 레포를 클론해서 사용

부모폴더/
├── pickit-frontend/   ← Next.js 프로젝트 (별도 GitHub 레포)
└── pickit-backend/    ← Spring Boot 프로젝트 (별도 GitHub 레포)

## 코드 스타일 규칙
- TypeScript: strict 모드
- Java: Java 17 문법 활용
- 변수명/함수명: camelCase
- 컴포넌트명/클래스명: PascalCase
- 한국어 주석 OK (가독성 우선)
- 에러 처리 필수
- 환경변수는 .env로 분리

## 개발 환경
- OS: (본인 OS 기재 - macOS / Windows / Linux)
- IDE: VSCode
- Node.js: 20+
- Java: 17+
- Git: 설치됨