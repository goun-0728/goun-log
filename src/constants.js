// src/constants.js

export const C = {
  bg: '#F5F4F0', sur: '#FFF', alt: '#FAFAF8',
  bd: '#E4E2DC', bdm: '#CCC9C0',
  tx: '#18170F', mu: '#78766E', fa: '#B0ADA5',
}

export const TASKS = [
  { id: 'detail', label: '상세페이지', sub: '기획+섹션카드', icon: '◫', col: '#1D6B45', li: '#E9F7F0' },
  { id: 'blog',   label: '블로그',     sub: '완성형포스팅',  icon: '✎', col: '#1A3FA3', li: '#EBF1FF' },
  { id: 'card',   label: '카드뉴스',   sub: '인스타디자인',  icon: '▦', col: '#6D1FA0', li: '#F7EEFF' },
  { id: 'reels',  label: '릴스/쇼츠',  sub: '영상기획안',    icon: '▶', col: '#A01F38', li: '#FFEEF1' },
]

export const BLOG_TONES = ['생활형', '후기형', '공감형', '정보형', '전문가형']

export const DS = {
  // ── 다크/프리미엄 계열
  '블랙':      { bg: '#0F0F0F', fg: '#F0EEE8', ac: '#D4A853', sub: '#1C1C1C', bd: '#2E2E2E' },
  '프리미엄':  { bg: '#18170F', fg: '#F5F4F0', ac: '#C8A96E', sub: '#272420', bd: '#3A3828' },
  '네이비':    { bg: '#0D1B2A', fg: '#E8F0F8', ac: '#4A9EE8', sub: '#162436', bd: '#243548' },
  '다크그린':  { bg: '#0A1F1A', fg: '#E8F5F0', ac: '#3DBE82', sub: '#122A23', bd: '#1E3D33' },
  '버건디':    { bg: '#1A0808', fg: '#F5EEE8', ac: '#C8614A', sub: '#2A1212', bd: '#3D1E1E' },

  // ── 뉴트럴/미니멀 계열
  '화이트':    { bg: '#FFFFFF', fg: '#18170F', ac: '#18170F', sub: '#F5F4F0', bd: '#E4E2DC' },
  '크림':      { bg: '#FAF8F3', fg: '#2A2620', ac: '#8B6914', sub: '#F0EDE4', bd: '#DDD8CC' },
  '미니멀':    { bg: '#FFFFFF', fg: '#18170F', ac: '#1D6B45', sub: '#F5F4F0', bd: '#E4E2DC' },
  '라이트그레이': { bg: '#F2F2F0', fg: '#1A1A1A', ac: '#333333', sub: '#E8E8E6', bd: '#D0D0CC' },
  '웜화이트':  { bg: '#FDFAF5', fg: '#2A2418', ac: '#A0784A', sub: '#F5F0E8', bd: '#E0D8CC' },

  // ── 컬러 계열
  '포레스트':  { bg: '#F5F9F5', fg: '#1A3020', ac: '#1D6B45', sub: '#E8F2EC', bd: '#C8DED0' },
  '오션':      { bg: '#F3F7FB', fg: '#0D2B45', ac: '#1A6FA3', sub: '#E4EFF8', bd: '#BDD4E8' },
  '테라코타': { bg: '#FAF5F0', fg: '#2D1810', ac: '#B85C38', sub: '#F2E8E0', bd: '#DEC8B8' },
  '차콜':      { bg: '#2D2D2D', fg: '#F0F0F0', ac: '#E8C84A', sub: '#3A3A3A', bd: '#484848' },
  '인디고':    { bg: '#F4F2FF', fg: '#1A1560', ac: '#4A3FCC', sub: '#EAE8FF', bd: '#C8C3F0' },
}
export const DS_KEYS = Object.keys(DS)

export const AUTO_DS = {
  HERO: '프리미엄', '문제 공감': '크림', '해결 제안': '화이트',
  '특징 강조': '오션', '사용 상황': '포레스트', '비교': '라이트그레이',
  '추천 대상': '웜화이트', CTA: '블랙',
}

export const AUTO_TPL = {
  HERO: 'hero', '문제 공감': 'material', '해결 제안': 'points3',
  '특징 강조': 'detail2col', '사용 상황': 'scene', '비교': 'compare',
  '추천 대상': 'target', CTA: 'cta',
}

export const TPL_LABELS = [
  { k: 'hero',       l: 'Hero형' },
  { k: 'material',   l: '소재설명형' },
  { k: 'detail2col', l: '디테일형' },
  { k: 'scene',      l: '사용장면형' },
  { k: 'compare',    l: '비교형' },
  { k: 'points3',    l: '포인트3단형' },
  { k: 'target',     l: '추천대상형' },
  { k: 'cta',        l: 'CTA형' },
]

export const AUTO_ICONS = ['✦', '◆', '▲', '●', '★', '◉', '▶', '✿', '◈', '♦']

// 섹션 데이터 기본 스키마
export const mkSec = (o = {}) => ({
  sectionType: '', title: '', mainCopy: '', subCopy: '',
  points: [], description: '', designStyle: '미니멀',
  template: 'material', photoDir: '{}', imagePrompt: '', cta: '',
  secImg: null,   // 이미지 슬롯 1
  secImg2: null,  // 이미지 슬롯 2
  ...o,
})

// 시스템 프롬프트
export function getSys(id, tone = '생활형') {
  if (id === 'blog') return `당신은 네이버 블로그 마케팅 전문가입니다.
말투: ${tone}. 최소 1500자. AI티 완전 제거. 실제 사람이 쓴 느낌. 광고 문체 금지.

반드시 아래 형식만 출력:
▼ 제목 후보
1.
2.
3.
▼ 본문
[도입부]
[소제목 1]
[소제목 2]
[소제목 3]
[마무리]
▼ SEO 키워드
(8개)
▼ 해시태그
(10개)`

  if (id === 'card') return `당신은 인스타그램 카드뉴스 기획 전문가입니다.

반드시 아래 형식만 출력:
▼ 콘텐츠 컨셉
▼ 카드 구성
[카드 1 - 훅]
메인문구: (8자 이내)
서브문구:
배경색: #1a1a2e
글자색: #fff
포인트색: #e94560
[카드 2 - 공감]
제목:
내용:
강조단어:
배경색: #fffbf5
글자색: #2d2926
포인트색: #d4845a
[카드 3 - 핵심]
제목:
내용:
강조단어:
배경색: #f0f5ff
글자색: #1e3a8a
포인트색: #3b82f6
[카드 4 - 차별점]
제목:
내용:
강조단어:
배경색: #faf5ff
글자색: #4c1d95
포인트색: #8b5cf6
[카드 5 - CTA]
메인문구:
서브문구:
버튼문구:
배경색: #1d6b45
글자색: #fff
포인트색: #6fcf9e
▼ 캡션
(150자 이내)
▼ 해시태그
(15개)`

  if (id === 'reels') return `당신은 숏폼 영상 기획 전문가입니다.

반드시 아래 형식만 출력:
▼ 영상 컨셉
▼ 제목 후보
1.
2.
▼ 썸네일 문구
(15자 이내)
▼ 훅 문구
(3초, 강렬하게)
▼ 씬 구성
[씬1·훅]
촬영방법:
자막:
[씬2]
촬영방법:
자막:
[씬3]
촬영방법:
자막:
[씬4·CTA]
촬영방법:
자막:
▼ BGM 분위기
▼ 업로드 캡션
(100자 이내)
▼ 해시태그
(10개)`

  // 상세페이지
  return `당신은 스마트스토어 상세페이지 전문 기획자 겸 카피라이터입니다.
제품 정보를 바탕으로 기획안을 작성합니다.
과장·허위 표현 금지. AI 느낌 제거. 실무형으로 작성.

반드시 아래 형식만 출력:

▼ 기획 보고서

[타겟 고객]
(4~5줄 구체적으로)

[핵심 문제]
• 문제1: (구체적 상황)
• 문제2: (구체적 상황)
• 문제3: (구체적 상황)

[구매 포인트]
• 포인트1:
• 포인트2:
• 포인트3:

[경쟁력 분석]
(3~4줄)

▼ 섹션 구성

[SECTION 1 - HERO]
메인카피: (15자 이내)
서브카피: (1줄)
포인트:
• 포인트A
• 포인트B
• 포인트C
촬영기획:
  - 장면: (어떤 장면)
  - 분위기: (조명·배경)
  - 구도: (카메라 앵글)
AI프롬프트: (Midjourney용 영문)

[SECTION 2 - 문제 공감]
메인카피:
서브카피:
포인트:
•
•
•
촬영기획:
  - 장면:
  - 분위기:
  - 구도:
AI프롬프트:

[SECTION 3 - 해결 제안]
메인카피:
서브카피:
포인트:
•
•
•
촬영기획:
  - 장면:
  - 분위기:
  - 구도:
AI프롬프트:

[SECTION 4 - 특징 강조]
메인카피:
서브카피:
포인트:
•
•
•
•
촬영기획:
  - 장면:
  - 분위기:
  - 구도:
AI프롬프트:

[SECTION 5 - 사용 상황]
메인카피:
서브카피:
포인트:
•
•
촬영기획:
  - 장면:
  - 분위기:
  - 구도:
AI프롬프트:

[SECTION 6 - 비교]
메인카피:
서브카피:
포인트:
• 일반제품: / 이제품:
• 일반제품: / 이제품:
• 일반제품: / 이제품:
AI프롬프트:

[SECTION 7 - 추천 대상]
메인카피:
서브카피:
포인트:
• 추천1:
• 추천2:
• 추천3:
• 추천4:
AI프롬프트:

[SECTION 8 - CTA]
메인카피:
서브카피:
버튼문구: (5자)
AI프롬프트:

▼ SEO 키워드
메인: (3개)
롱테일: (7개)`
}
