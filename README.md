# ContentOS

온라인 판매자를 위한 AI 마케팅 콘텐츠 생성 시스템

## 로컬 개발 시작

```bash
# 1. 의존성 설치
npm install

# 2. 환경변수 설정
cp .env.example .env.local
# .env.local 파일에 OpenAI API 키 입력:
# OPENAI_API_KEY=sk-...

# 3. 개발 서버 실행
npm run dev
```

## Vercel 배포

```bash
# 1. GitHub에 올리기
git init
git add .
git commit -m "init"
git remote add origin https://github.com/YOUR_USERNAME/contentos.git
git push -u origin main

# 2. Vercel 연결
# vercel.com → New Project → GitHub 연결

# 3. 환경변수 설정
# Vercel 대시보드 → Settings → Environment Variables
# OPENAI_API_KEY = sk-...
```

## 프로젝트 구조

```
contentos/
├── api/
│   └── generate.js          # Vercel Serverless Function (GPT API 프록시)
├── public/
│   └── icons/               # 섹션 아이콘 SVG/PNG 파일 위치
├── src/
│   ├── api/
│   │   └── generate.js      # 클라이언트 API 호출
│   ├── components/
│   │   ├── SectionTemplates.jsx  # 8가지 섹션 디자인 템플릿
│   │   └── SectionEditor.jsx     # 섹션별 편집 + 이미지 업로드
│   ├── App.jsx              # 메인 앱
│   ├── constants.js         # 디자인 토큰, 프롬프트
│   └── utils.js             # 파서, 이미지 유틸
├── .env.example
├── index.html
├── package.json
└── vite.config.js
```

## 주요 기능

- 상세페이지 기획 + 8개 섹션 카드 자동 생성
- 블로그 (말투 선택)
- 인스타 카드뉴스
- 릴스/쇼츠 기획
- 섹션별 이미지 업로드 + 텍스트 편집
- PNG 다운로드 (섹션별 / 전체)
- 히스토리 저장 (localStorage)
