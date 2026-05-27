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
  '소재설명': '크림', '인증/수상': '딥네이비', '사용 장면': '올리브',
}

export const AUTO_TPL = {
  HERO: 'hero', '문제 공감': 'material', '해결 제안': 'points3',
  '특징 강조': 'detail2col', '사용 상황': 'scene', '비교': 'compare',
  '추천 대상': 'target', CTA: 'cta', '브랜드 스토리': 'scene',
  '소재설명': 'material', '인증/수상': 'points3', '사용 장면': 'scene',
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
  sectionType: '', title: '', mainCopy: '', subCopy: '', bodyText: '',
  points: [], description: '', designStyle: '크림',
  template: 'material', photoDir: '{}', imagePrompt: '', cta: '',
  secImg: null, secImg2: null, secImg3: null, secImg4: null,
  ...o,
})

// ── 상세페이지 섹션 템플릿 빌더 ────────────────────────
const _NO = '--no illustration, cartoon, CGI, Western appearance, blonde hair, blue eyes, oversaturated, plastic look, stock photo, ai generated look, dramatic, extreme emotion'

const _S = {
  HERO: n => `[SECTION ${n} - HERO]
메인카피: (15자 이내, 강렬한 핵심 한 줄)
서브카피: (1-2줄, 제품 핵심 가치 + 대상)
본문내용: (2-3줄. 제품 핵심 특징·성분·효능 중 가장 임팩트 있는 정보. 서술형 금지. 짧고 강한 문구로)
포인트:
• (핵심 특징1 — 구체적 수치/성분/효과 포함)
• (핵심 특징2)
• (핵심 특징3)
촬영기획:
  - 장면: (어떤 장면)
  - 분위기: (조명·배경)
  - 구도: (카메라 앵글)
AI프롬프트: (제품 단독 메인샷 — product photography, [제품] on [배경], [조명], shot on Sony A7 35mm lens, shallow depth of field, [색감/분위기], ${_NO})`,

  '문제 공감': n => `[SECTION ${n} - 문제 공감]
메인카피: (15자 이내, 타겟의 불편함을 직접 표현)
서브카피: (문제 상황 공감 1-2줄)
본문내용: (3줄. 타겟이 실제로 겪는 불편함과 문제 상황을 구체적으로. 서술형 금지. 짧은 포인트로)
포인트:
• (불편함 1 — 구체적 상황)
• (불편함 2)
• (불편함 3)
촬영기획:
  - 장면:
  - 분위기:
  - 구도:
AI프롬프트: (불편함·문제 상황 장면 — lifestyle photography, [불편한 상황 묘사], [배경/환경], natural lighting from [방향], shot on Canon 5D Mark IV 50mm lens, shallow depth of field, [색감/분위기], ${_NO})`,

  '해결 제안': n => `[SECTION ${n} - 해결 제안]
메인카피: (15자 이내, 해결책 제시)
서브카피: (제품이 어떻게 해결하는지 1-2줄)
본문내용: (2-3줄. 제품의 핵심 해결 원리·성분·기술을 짧고 임팩트 있게. 서술형 금지)
포인트:
• (해결 방법 1 — 구체적 성분/기술 포함)
• (해결 방법 2)
• (해결 방법 3)
촬영기획:
  - 장면:
  - 분위기:
  - 구도:
AI프롬프트: (제품 사용으로 해결되는 순간 — lifestyle photography, [해결 장면 묘사], [배경/환경], soft studio lighting, shot on Sony A7 85mm lens, shallow depth of field, [색감/분위기], ${_NO})`,

  '특징 강조': n => `[SECTION ${n} - 특징 강조]
메인카피: (15자 이내)
서브카피: (제품 차별화 특징 1-2줄)
본문내용: (3줄. 제품 성분·소재·제조방식·기술 등 구체적 특징. 수치/인증/원산지 포함. 서술형 금지)
포인트:
• (특징1 — 수치/성분/소재 구체적으로)
• (특징2)
• (특징3)
• (특징4)
촬영기획:
  - 장면:
  - 분위기:
  - 구도:
AI프롬프트: (제품 디테일 클로즈업 — product photography, extreme close-up of [제품 특징 부위], [배경/소재], soft studio lighting diffused from top, shot on Sony A7 100mm macro lens, shallow depth of field, [색감/분위기], ${_NO})`,

  '사용 상황': n => `[SECTION ${n} - 사용 상황]
메인카피: (15자 이내)
서브카피: (언제·어떻게 쓰는지 1-2줄)
본문내용: (2-3줄. 구체적인 사용 방법·용량·횟수·사용 타이밍. 서술형 금지. 짧은 포인트로)
포인트:
• (사용법 1 — 구체적으로)
• (사용법 2)
촬영기획:
  - 장면:
  - 분위기:
  - 구도:
AI프롬프트: (실제 사용 라이프스타일 장면 — lifestyle photography, [사용 중인 구체적 장면], [생활공간 배경], natural lighting from [방향], shot on Canon 5D Mark IV 35mm lens, shallow depth of field, [색감/분위기], ${_NO})`,

  '비교': n => `[SECTION ${n} - 비교]
메인카피: (15자 이내)
서브카피: (비교 요약 1줄)
본문내용: (2줄. 이 제품이 경쟁사 대비 왜 더 나은지 핵심 근거. 수치·인증·성분으로 뒷받침)
포인트:
• 일반제품: (약점 구체적으로) / 이제품: (강점 구체적으로)
• 일반제품: / 이제품:
• 일반제품: / 이제품:
AI프롬프트: (비교 또는 before/after 장면 — lifestyle photography, [before/after 또는 나란히 비교 장면], [깔끔한 중성 배경], soft studio lighting, shot on Sony A7 50mm lens, shallow depth of field, [색감/분위기], ${_NO})`,

  '추천 대상': n => `[SECTION ${n} - 추천 대상]
메인카피: (15자 이내)
서브카피: (누구에게 맞는지 1-2줄)
본문내용: (2-3줄. 추천 대상의 특성·상황·니즈를 구체적으로. 서술형 금지)
포인트:
• (추천 대상 1 — 구체적 상황/특성 포함)
• (추천 대상 2)
• (추천 대상 3)
• (추천 대상 4)
AI프롬프트: (타겟 고객 라이프스타일 장면 — lifestyle photography, [타겟이 제품을 쓰는 구체적 상황], [타겟 생활환경 배경], natural lighting, shot on Canon 5D Mark IV 35mm lens, shallow depth of field, [색감/분위기], ${_NO})`,

  '브랜드 스토리': n => `[SECTION ${n} - 브랜드 스토리]
메인카피: (15자 이내)
서브카피: (브랜드 철학 핵심 1-2줄)
본문내용: (3줄. 브랜드 창업 배경·철학·가치·생산 방식의 차별점. 서술형 금지. 임팩트 있게)
포인트:
• (브랜드 가치 1)
• (브랜드 가치 2)
• (브랜드 가치 3)
촬영기획:
  - 장면:
  - 분위기:
  - 구도:
AI프롬프트: (브랜드 철학·스토리 감성 장면 — lifestyle photography, [브랜드 가치와 진정성을 담은 장면], [자연스럽고 따뜻한 배경], natural lighting from side, shot on Canon 5D Mark IV 35mm lens, shallow depth of field, warm authentic tones, ${_NO})`,

  CTA: n => `[SECTION ${n} - CTA]
메인카피: (15자 이내, 구매 행동 유발)
서브카피: (한정·혜택·이유 1-2줄)
본문내용: (2줄. 구매를 망설이는 이유를 해소하는 문구. 보장·혜택·한정 수량 등 포함)
버튼문구: (5자)
AI프롬프트: (구매욕구 자극 감성샷 — product photography, [제품을 가장 매력적으로 보여주는 구도], [고급스러운 배경/소품], soft studio lighting with [빛의 방향], shot on Sony A7 50mm lens, shallow depth of field, [색감/분위기], ${_NO})`,

  '소재설명': n => `[SECTION ${n} - 소재설명]
메인카피: (15자 이내)
서브카피: (소재·성분 핵심 1-2줄)
본문내용: (3줄. 주요 성분·원산지·함량·효능을 구체적으로. 수치 포함. 서술형 금지)
포인트:
• (성분/소재 1 — 함량·원산지·효능 구체적으로)
• (성분/소재 2)
• (성분/소재 3)
촬영기획:
  - 장면:
  - 분위기:
  - 구도:
AI프롬프트: (소재·성분·원료 클로즈업 — product photography, extreme close-up of [소재/원료], [자연스러운 배경], soft studio lighting diffused from above, shot on Sony A7 100mm macro lens, shallow depth of field, [색감/분위기], ${_NO})`,

  '인증/수상': n => `[SECTION ${n} - 인증/수상]
메인카피: (15자 이내)
서브카피: (인증·수상 신뢰 요약 1-2줄)
본문내용: (2-3줄. 구체적인 인증 기관명·수상 이력·인증 의미. 소비자 신뢰 근거)
포인트:
• (인증/수상 1 — 기관명·연도 구체적으로)
• (인증/수상 2)
• (인증/수상 3)
AI프롬프트: (신뢰·인증 강조 장면 — product photography, [제품과 인증서/수상 배지 배치], [깔끔한 밝은 배경], soft studio lighting, shot on Sony A7 50mm lens, shallow depth of field, [색감/분위기], ${_NO})`,

  '사용 장면': n => `[SECTION ${n} - 사용 장면]
메인카피: (15자 이내)
서브카피: (사용 장면 감성 1-2줄)
본문내용: (2-3줄. 구체적인 사용 장면·상황·효과를 묘사. 서술형 금지. 짧고 임팩트 있게)
포인트:
• (장면/효과 1)
• (장면/효과 2)
촬영기획:
  - 장면:
  - 분위기:
  - 구도:
AI프롬프트: (제품 활용 라이프스타일 장면 2 — lifestyle photography, [사용 중인 두 번째 구체적 장면], [생활 공간 배경], natural lighting from [방향], shot on Canon 5D Mark IV 35mm lens, shallow depth of field, [색감/분위기], ${_NO})`,
}

function _buildSections(opts = {}) {
  const { planningStyle } = opts
  let order
  switch (planningStyle) {
    case '문제해결형':   order = ['HERO', '문제 공감', '해결 제안', '특징 강조', '비교', 'CTA']; break
    case '감성소구형':   order = ['HERO', '브랜드 스토리', '사용 상황', '추천 대상', 'CTA']; break
    case '전문성강조형': order = ['HERO', '소재설명', '특징 강조', '인증/수상', 'CTA']; break
    case '라이프스타일형': order = ['HERO', '사용 상황', '사용 장면', '추천 대상', 'CTA']; break
    case '비교우위형':   order = ['HERO', '문제 공감', '비교', '특징 강조', 'CTA']; break
    case '스토리텔링형': order = ['HERO', '브랜드 스토리', '소재설명', '사용 상황', 'CTA']; break
    default: order = ['HERO', '문제 공감', '해결 제안', '특징 강조', '사용 상황', '비교', '추천 대상', 'CTA']
  }
  return order.map((name, i) => _S[name](i + 1)).join('\n\n')
}

const _TONE_MAP = {
  '따뜻한/감성적': '따뜻하고 감성적인 문체, 공감과 위로 중심, 부드러운 어휘',
  '신뢰감/전문적': '전문적·신뢰감 있는 문체, 근거·수치 중심, 권위 있는 어조',
  '힙/트렌디': 'MZ세대 감성, 짧고 임팩트 있는 카피, 세련되고 현대적인 표현',
  '레트로/빈티지': '레트로·빈티지 감성, 향수와 정서를 자극하는 클래식한 어휘',
  '유머/B급': 'B급 감성과 유머, 재치 있는 표현, 예상치 못한 웃음 포인트',
  '고급스러운': '고급스럽고 세련된 문체, 품격 있는 어조, 감각적인 표현',
  '친근한/편안한': '친근하고 편안한 문체, 가까운 친구처럼 이야기하는 어조',
}
const _EMPH_MAP = {
  '품질/성능': '품질과 성능의 차별점을 구체적 근거와 함께 강조',
  '원산지/성분': '원산지·성분의 품질과 안전성을 구체적으로 강조',
  '가격/가성비': '가격 대비 우수한 가치와 실용성을 명확한 근거로 제시',
  '편의성': '사용 편리성·시간 절약·간편함을 전면에 강조',
  '브랜드스토리': '브랜드의 철학·역사·스토리를 중심으로 신뢰와 감성 구축',
  '인증/수상': '인증·수상 이력을 근거로 품질 신뢰 강조',
  '환경/윤리': '친환경·윤리적 생산·지속가능성 가치를 강조',
  '디자인/패키지': '디자인과 패키지의 감성과 차별점 강조',
}

function _buildCustomBlock(opts = {}) {
  const {
    category, priceRange,
    gender, ageGroup, purchaseSituation,
    pricePosition, competition,
    differentiator, differentiatorTypes = [],
    planningStyle, brandTone = [], emphasis = [],
  } = opts
  const lines = ['━━━ 맞춤 기획 설정 ━━━']

  if (category || priceRange) {
    const parts = [category, priceRange].filter(Boolean)
    lines.push(`■ 제품 카테고리/가격대: ${parts.join(' / ')}`)
  }

  const targetParts = [gender, ageGroup].filter(Boolean)
  if (targetParts.length || purchaseSituation) {
    if (targetParts.length) lines.push(`■ 타겟 고객: ${targetParts.join(' ')} 중심`)
    if (purchaseSituation) lines.push(`  구매 상황: ${purchaseSituation}`)
    lines.push(`  → 이 타겟의 언어·관심사·구매 심리에 맞게 카피 작성`)
  }

  if (pricePosition || competition) {
    const pp = [pricePosition, competition].filter(Boolean)
    lines.push(`■ 시장 포지션: ${pp.join(' / ')}`)
  }

  if (differentiator) {
    lines.push(`■ 핵심 차별점: ${differentiator}`)
    if (differentiatorTypes.length) lines.push(`  차별점 유형: ${differentiatorTypes.join(', ')}`)
    lines.push(`  → 비교·특징 섹션에 이 차별점을 구체적으로 활용`)
  }

  if (planningStyle) {
    lines.push(`■ 기획 방식: ${planningStyle} → 아래 섹션 순서대로 작성`)
  }

  if (brandTone.length) {
    lines.push(`■ 브랜드 톤: ${brandTone.join(', ')}`)
    lines.push(`  → ${brandTone.map(t => _TONE_MAP[t] || t).join(' / ')}`)
    lines.push(`  → 모든 카피와 섹션에 이 톤을 일관되게 반영`)
  }

  if (emphasis.length) {
    lines.push(`■ 강조 포인트: ${emphasis.join(', ')}`)
    lines.push(`  → ${emphasis.map(e => _EMPH_MAP[e] || e).join(' / ')}`)
    lines.push(`  → 카피·섹션 구성 전반에 이 강조점을 최우선 반영`)
  }

  lines.push('━━━━━━━━━━━━━━━━━━')
  return lines.join('\n')
}

function _buildQuizContext(opts = {}) {
  const { gender, ageGroup, purchaseSituation, brandTone = [], emphasis = [] } = opts
  const parts = []
  const target = [gender, ageGroup].filter(Boolean)
  if (target.length) parts.push(`타겟: ${target.join(' ')} 중심${purchaseSituation ? ', ' + purchaseSituation : ''}`)
  if (brandTone.length) parts.push(`톤: ${brandTone.join('·')}`)
  if (emphasis.length) parts.push(`강조: ${emphasis.join('·')}`)
  return parts.length ? `[참고 컨텍스트] ${parts.join(' / ')}\n위 정보를 참고해 콘텐츠 톤과 타겟 언어를 조정하세요.\n\n` : ''
}

// 시스템 프롬프트
export function getSys(id, tone = '생활형', opts = {}) {
  const ctx = _buildQuizContext(opts)

  if (id === 'blog') return `당신은 네이버 블로그 마케팅 전문가입니다.
말투: ${tone}. 최소 1500자. AI티 완전 제거. 실제 사람이 쓴 느낌. 광고 문체 금지.
${ctx}
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
${ctx}
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
  const customBlock = _buildCustomBlock(opts)
  const sectionsBlock = _buildSections(opts)

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
