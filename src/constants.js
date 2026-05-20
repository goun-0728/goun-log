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
]

export const BLOG_TONES = ['생활형', '후기형', '공감형', '정보형', '전문가형']

export const DS = {
  '프리미엄블랙': { bg: '#18170F', fg: '#F5F4F0', ac: '#C8A96E', sub: '#272420', bd: '#3A3828' },
  '딥네이비':     { bg: '#0D1B2A', fg: '#E8F0F8', ac: '#7EB8D4', sub: '#162436', bd: '#243548' },
  '포레스트그린': { bg: '#1A3020', fg: '#F0FFF8', ac: '#5B9E6E', sub: '#243828', bd: '#2E4835' },
  '버건디':       { bg: '#2D0A0A', fg: '#FFF0EE', ac: '#C0614A', sub: '#3D1212', bd: '#501A1A' },
  '슬레이트':     { bg: '#2D3748', fg: '#F7FAFC', ac: '#90CDF4', sub: '#3D4A5C', bd: '#4A5568' },
  '웜베이지':     { bg: '#FAF3E0', fg: '#2D2000', ac: '#8B6914', sub: '#F0E8CC', bd: '#DDD0A0' },
  '로즈':         { bg: '#FDF2F2', fg: '#2D0808', ac: '#C0404A', sub: '#F8E8E8', bd: '#E8C0C0' },
  '올리브':       { bg: '#2A2E1A', fg: '#F8F8E8', ac: '#8B9E3A', sub: '#383C28', bd: '#484C38' },
  '스틸블루':     { bg: '#1A2A3A', fg: '#EEF4F8', ac: '#5B8DB8', sub: '#253545', bd: '#304555' },
  '크림':         { bg: '#FDFAF5', fg: '#2A2010', ac: '#A0784A', sub: '#F5F0E8', bd: '#E0D8C8' },
}
export const DS_KEYS = Object.keys(DS)

export const AUTO_DS = {
  HERO: '웜베이지', '문제 공감': '크림', '해결 제안': '포레스트그린',
  '특징 강조': '딥네이비', '사용 상황': '올리브', '비교': '슬레이트',
  '추천 대상': '웜베이지', CTA: '버건디', '브랜드 스토리': '웜베이지',
}

export const AUTO_TPL = {
  HERO: 'hero', '문제 공감': 'material', '해결 제안': 'points3',
  '특징 강조': 'detail2col', '사용 상황': 'scene', '비교': 'compare',
  '추천 대상': 'target', CTA: 'cta', '브랜드 스토리': 'scene',
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
  { k: 'specTable',  l: '제품상세표시' },
]

// 추가 가능한 섹션 목록
export const EXTRA_SECTIONS = [
  { type: '재료/성분',    label: '재료/성분',    sub: '원재료 설명',      template: 'material',   designStyle: '크림' },
  { type: '제조과정',     label: '제조과정',     sub: '만드는 방법',      template: 'points3',    designStyle: '크림' },
  { type: '수상/인증',    label: '수상/인증',     sub: '품질 인증',        template: 'points3',    designStyle: '크림' },
  { type: '실제후기',     label: '실제 후기',    sub: '고객 리뷰',        template: 'target',     designStyle: '크림' },
  { type: 'FAQ',          label: 'FAQ',          sub: '자주 묻는 질문',   template: 'material',   designStyle: '크림' },
  { type: '보관방법',     label: '보관방법',     sub: '사용/보관 안내',   template: 'detail2col', designStyle: '크림' },
  { type: '제품상세표시', label: '제품상세표시', sub: '법적 필수 표기',   template: 'specTable',  designStyle: '크림' },
  { type: '브랜드소개',   label: '브랜드소개',   sub: '회사/브랜드 소개', template: 'hero',       designStyle: '크림' },
]

// 추가 섹션 AI 시스템 프롬프트
export function getExtraSectSys(typeKey) {
  if (typeKey === '제품상세표시') {
    return `당신은 스마트스토어 상세페이지 전문가입니다.
제품 정보를 참고하여 법적 필수 표시 정보를 작성하세요.
:: 구분자로 항목명과 값을 구분합니다. 값을 최대한 구체적으로 추정해서 채워주세요.
반드시 아래 형식만 출력:
메인카피: 제품 상세 정보
서브카피: 상품 구매 전 필독 사항
포인트:
• 제품명::
• 식품유형::
• 업소명::
• 소재지::
• 유통기한::
• 중량::
• 원재료::
• 보관방법::
• 주의사항::`
  }
  return `당신은 스마트스토어 상세페이지 전문 기획자입니다.
제품 정보를 참고하여 섹션 내용을 간결하게 작성하세요.
반드시 아래 형식만 출력:
메인카피: (15자 이내)
서브카피: (1줄)
포인트:
• 항목1
• 항목2
• 항목3`
}

export const AUTO_ICONS = ['Ⅰ','Ⅱ','Ⅲ','Ⅳ','Ⅴ','Ⅵ','Ⅶ','Ⅷ','Ⅸ','Ⅹ'] // 하위호환용, 실제는 SectionTemplates의 ROMAN 사용

// 섹션 데이터 기본 스키마
export const mkSec = (o = {}) => ({
  _id: Math.random().toString(36).slice(2, 9),
  sectionType: '', title: '', mainCopy: '', subCopy: '',
  points: [], description: '', designStyle: '크림',
  template: 'material', photoDir: '{}', imagePrompt: '', cta: '',
  secImg: null, secImg2: null, secImg3: null, secImg4: null,
  ...o,
})

// ── 상세페이지 섹션 템플릿 빌더 ────────────────────────
const _NO = '--no illustration, cartoon, CGI, Western appearance, blonde hair, blue eyes, oversaturated, plastic look, stock photo, ai generated look, dramatic, extreme emotion'

const _S = {
  HERO: n => `[SECTION ${n} - HERO]
메인카피: (15자 이내)
서브카피: (1줄)
포인트:
•
•
•
촬영기획:
  - 장면: (어떤 장면)
  - 분위기: (조명·배경)
  - 구도: (카메라 앵글)
AI프롬프트: (제품 단독 메인샷 — product photography, [제품] on [배경], [조명], shot on Sony A7 35mm lens, shallow depth of field, [색감/분위기], ${_NO})`,

  '문제 공감': n => `[SECTION ${n} - 문제 공감]
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
AI프롬프트: (불편함·문제 상황 장면 — lifestyle photography, [불편한 상황 묘사], [배경/환경], natural lighting from [방향], shot on Canon 5D Mark IV 50mm lens, shallow depth of field, [색감/분위기], ${_NO})`,

  '해결 제안': n => `[SECTION ${n} - 해결 제안]
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
AI프롬프트: (제품 사용으로 해결되는 순간 — lifestyle photography, [해결 장면 묘사], [배경/환경], soft studio lighting, shot on Sony A7 85mm lens, shallow depth of field, [색감/분위기], ${_NO})`,

  '특징 강조': n => `[SECTION ${n} - 특징 강조]
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
AI프롬프트: (제품 디테일 클로즈업 — product photography, extreme close-up of [제품 특징 부위], [배경/소재], soft studio lighting diffused from top, shot on Sony A7 100mm macro lens, shallow depth of field, [색감/분위기], ${_NO})`,

  '사용 상황': n => `[SECTION ${n} - 사용 상황]
메인카피:
서브카피:
포인트:
•
•
촬영기획:
  - 장면:
  - 분위기:
  - 구도:
AI프롬프트: (실제 사용 라이프스타일 장면 — lifestyle photography, [사용 중인 구체적 장면], [생활공간 배경], natural lighting from [방향], shot on Canon 5D Mark IV 35mm lens, shallow depth of field, [색감/분위기], ${_NO})`,

  '비교': n => `[SECTION ${n} - 비교]
메인카피:
서브카피:
포인트:
• 일반제품: / 이제품:
• 일반제품: / 이제품:
• 일반제품: / 이제품:
AI프롬프트: (비교 또는 before/after 장면 — lifestyle photography, [before/after 또는 나란히 비교 장면], [깔끔한 중성 배경], soft studio lighting, shot on Sony A7 50mm lens, shallow depth of field, [색감/분위기], ${_NO})`,

  '추천 대상': n => `[SECTION ${n} - 추천 대상]
메인카피:
서브카피:
포인트:
•
•
•
•
AI프롬프트: (타겟 고객 라이프스타일 장면 — lifestyle photography, [타겟이 제품을 쓰는 구체적 상황], [타겟 생활환경 배경], natural lighting, shot on Canon 5D Mark IV 35mm lens, shallow depth of field, [색감/분위기], ${_NO})`,

  '브랜드 스토리': n => `[SECTION ${n} - 브랜드 스토리]
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
AI프롬프트: (브랜드 철학·스토리 감성 장면 — lifestyle photography, [브랜드 가치와 진정성을 담은 장면], [자연스럽고 따뜻한 배경], natural lighting from side, shot on Canon 5D Mark IV 35mm lens, shallow depth of field, warm authentic tones, ${_NO})`,

  CTA: n => `[SECTION ${n} - CTA]
메인카피:
서브카피:
버튼문구: (5자)
AI프롬프트: (구매욕구 자극 감성샷 — product photography, [제품을 가장 매력적으로 보여주는 구도], [고급스러운 배경/소품], soft studio lighting with [빛의 방향], shot on Sony A7 50mm lens, shallow depth of field, [색감/분위기], ${_NO})`,
}

function _buildSections(emphasis = [], style = []) {
  let order
  if (emphasis.includes('문제 해결')) {
    order = ['HERO', '문제 공감', '해결 제안', '특징 강조', '비교', '추천 대상', 'CTA']
  } else if (emphasis.includes('브랜드 스토리') || style.includes('스토리텔링')) {
    order = ['HERO', '브랜드 스토리', '사용 상황', '추천 대상', 'CTA']
  } else if (emphasis.includes('라이프스타일')) {
    order = ['HERO', '사용 상황', '특징 강조', '추천 대상', '비교', 'CTA']
  } else {
    order = ['HERO', '문제 공감', '해결 제안', '특징 강조', '사용 상황', '비교', '추천 대상', 'CTA']
  }
  return order.map((name, i) => _S[name](i + 1)).join('\n\n')
}

function _buildCustomBlock(target = [], style = [], emphasis = []) {
  if (!target.length && !style.length && !emphasis.length) return ''
  const styleMap = {
    '신뢰/전문성 강조': '전문적·신뢰감 있는 문체, 근거·수치 중심, 권위 있는 어조',
    '따뜻한 감성': '따뜻하고 감성적인 문체, 공감과 위로 중심, 부드러운 어휘',
    '힙하고 트렌디': 'MZ세대 감성, 짧고 임팩트 있는 카피, 세련되고 현대적인 표현',
    '레트로/빈티지': '레트로·빈티지 감성, 향수와 정서를 자극하는 클래식한 어휘',
    'B급/유머': 'B급 감성과 유머, 재치 있는 표현, 예상치 못한 웃음 포인트',
    '스토리텔링': '서사 중심 구성, 브랜드·제품의 이야기를 스토리 형식으로 전개',
  }
  const emphasisMap = {
    '원산지/성분/소재': '원산지·성분·소재의 품질과 안전성을 섹션 전반에 구체적으로 강조',
    '맛/향/품질': '맛·향·품질의 차별점을 감각적이고 생생한 묘사로 표현',
    '가격 대비 가치': '가격 대비 우수한 가치·실용성을 명확한 근거로 제시',
    '브랜드 스토리': '브랜드의 철학·역사·스토리를 중심으로 신뢰와 감성 구축',
    '문제 해결': '고객 불편함→문제→해결 흐름을 극적으로 구성',
    '라이프스타일': '제품을 사용하는 일상 장면과 라이프스타일 이미지를 중심으로',
  }
  const lines = ['━━━ 맞춤 기획 설정 ━━━']
  if (target.length) {
    lines.push(`■ 타겟 고객: ${target.join(', ')}`)
    lines.push(`  → 이 타겟의 구매 동기·관심사·언어에 맞게 카피와 섹션 내용 작성`)
  }
  if (style.length) {
    lines.push(`■ 페이지 톤&매너: ${style.join(', ')}`)
    lines.push(`  → ${style.map(s => styleMap[s] || s).join(' / ')}`)
  }
  if (emphasis.length) {
    lines.push(`■ 핵심 강조점: ${emphasis.join(', ')}`)
    lines.push(`  → ${emphasis.map(e => emphasisMap[e] || e).join(' / ')}`)
    lines.push(`  → 섹션 구성·카피·AI프롬프트 전반에 이 강조점을 최우선 반영`)
  }
  lines.push('━━━━━━━━━━━━━━━━━━')
  return lines.join('\n')
}

// 시스템 프롬프트
export function getSys(id, tone = '생활형', opts = {}) {
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

  // 상세페이지
  const { target = [], style = [], emphasis = [] } = opts
  const customBlock = _buildCustomBlock(target, style, emphasis)
  const sectionsBlock = _buildSections(emphasis, style)

  return `당신은 스마트스토어 상세페이지 전문 기획자 겸 카피라이터입니다.
제품 정보를 바탕으로 기획안을 작성합니다.
과장·허위 표현 금지. AI 느낌 제거. 실무형으로 작성.
${customBlock ? '\n' + customBlock : ''}
━━━ AI이미지 프롬프트 생성 규칙 ━━━
각 섹션의 AI프롬프트는 반드시 아래 규칙을 모두 지켜 영어로만 출력한다.
구조: [촬영스타일], [피사체 상세묘사], [배경/환경], [조명 방향과 종류], [카메라설정: 렌즈·심도], [색감/분위기], --no [제외키워드]
- "product photography" 또는 "lifestyle photography" 로 시작
- "shot on Sony A7" 또는 "shot on Canon 5D Mark IV" 포함
- "natural lighting" 또는 "soft studio lighting" 포함
- "shallow depth of field" 반드시 포함
- 마지막은 항상: --no illustration, cartoon, CGI, Western appearance, blonde hair, blue eyes, oversaturated, plastic look, stock photo, ai generated look, dramatic, extreme emotion
- 한국 식품·생활용품 상세페이지에 어울리는 사실적이고 구체적인 장면
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

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

▼ Page Title & Meta Description
Page Title: (30~60자, 핵심 키워드 포함)
Meta Description: (80~160자, 구매 전환 유도 문장으로)

▼ 섹션 구성

${sectionsBlock}

▼ SEO 키워드
메인: (3개)
롱테일: (7개)`
}
