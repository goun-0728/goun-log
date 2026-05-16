// src/components/CardNewsEditor.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react'
import { C } from '../constants'
import { parseBlocks, capturePNG, readFileAsDataURL } from '../utils'

/* ── 상수 ─────────────────────────────────────────────────────── */
const CARD_W = 1080, CARD_H = 1350

const FONT_SIZES = {
  sm: { main: 52, sub: 24, title: 44, body: 22 },
  md: { main: 72, sub: 32, title: 56, body: 28 },
  lg: { main: 92, sub: 40, title: 72, body: 36 },
  xl: { main: 112, sub: 48, title: 88, body: 44 },
}

const LAYOUTS = [
  { k: 'gradient', l: '그라데이션형' },
  { k: 'overlay',  l: '직접 오버레이형' },
  { k: 'textbox',  l: '하단 텍스트박스형' },
  { k: 'border',   l: '테두리형' },
  { k: 'simple',   l: '심플형' },
  { k: 'toptext',  l: '상단텍스트형' },
]

/* ── 레이아웃별 기본 텍스트 위치 ────────────────────────────────── */
function getDefaultPos(layout, pos) {
  const PAD = 72
  switch (layout) {
    case 'gradient':
      return { x: PAD, y: pos === 'top' ? 760 : pos === 'center' ? 870 : 1000 }
    case 'overlay':
      return { x: PAD, y: pos === 'top' ? 80  : pos === 'center' ? 460 : 860  }
    case 'textbox': {
      const zoneTop = Math.round(CARD_H * 0.65)
      return { x: PAD, y: pos === 'top' ? zoneTop + 36 : pos === 'center' ? zoneTop + 120 : zoneTop + 210 }
    }
    case 'border':
      return { x: 96, y: pos === 'top' ? 80  : pos === 'center' ? 180 : 340  }
    case 'simple':
      return { x: PAD, y: pos === 'top' ? 200 : pos === 'center' ? 460 : 720  }
    case 'toptext':
      return { x: PAD, y: pos === 'top' ? 56  : pos === 'center' ? 120 : 240  }
    default:
      return { x: PAD, y: 800 }
  }
}

/* ── AI 결과 파서 ──────────────────────────────────────────────── */
function parseCardResult(text) {
  const mkCard = (i, type, layout, textPosition, bgColor, fgColor, accentColor) => ({
    id: i + 1, type,
    mainText: '', subText: '', title: '', content: '', highlight: '', buttonText: '',
    bgColor, fgColor, accentColor,
    image: null,
    cardLayout: layout,
    textPosition,
    fontSize: 'md',
    textColor: null,   // null → use fgColor
    textPosX: null,    // null → auto (getDefaultPos)
    textPosY: null,
  })
  const DEFS = [
    mkCard(0, '훅',    'gradient', 'bottom', '#1a1a2e', '#ffffff', '#e94560'),
    mkCard(1, '공감',  'textbox',  'top',    '#fffbf5', '#2d2926', '#d4845a'),
    mkCard(2, '핵심',  'textbox',  'top',    '#f0f5ff', '#1e3a8a', '#3b82f6'),
    mkCard(3, '차별점', 'textbox', 'top',    '#faf5ff', '#4c1d95', '#8b5cf6'),
    mkCard(4, 'CTA',   'simple',   'center', '#1d6b45', '#ffffff', '#6fcf9e'),
  ]
  try {
    const section = text.match(/▼ 카드 구성([\s\S]*?)(?=\n▼|$)/)?.[1] || text
    const re = /\[카드\s*(\d+)[^\]]*\]([\s\S]*?)(?=\[카드\s*\d+|$)/g
    const result = DEFS.map(d => ({ ...d }))
    let m
    while ((m = re.exec(section)) !== null) {
      const i = parseInt(m[1]) - 1
      if (i < 0 || i >= 5) continue
      const body = m[2]
      const gf = k => { const f = body.match(new RegExp(k + ':\\s*([^\\n]+)')); return f ? f[1].trim() : '' }
      result[i] = {
        ...result[i],
        mainText:    gf('메인문구'),
        subText:     gf('서브문구'),
        title:       gf('제목'),
        content:     gf('내용'),
        highlight:   gf('강조단어'),
        buttonText:  gf('버튼문구'),
        bgColor:     gf('배경색')   || result[i].bgColor,
        fgColor:     gf('글자색')   || result[i].fgColor,
        accentColor: gf('포인트색') || result[i].accentColor,
      }
    }
    return result
  } catch { return DEFS }
}

/* ── 강조 텍스트 ───────────────────────────────────────────────── */
function HL({ text, word, color }) {
  if (!text) return null
  if (!word) return <>{text}</>
  const parts = text.split(word)
  return (
    <>
      {parts.map((p, i) => (
        <React.Fragment key={i}>
          {p}
          {i < parts.length - 1 && <span style={{ color }}>{word}</span>}
        </React.Fragment>
      ))}
    </>
  )
}

/* ── 미니 컴포넌트 ─────────────────────────────────────────────── */
function CopyBtn({ text }) {
  const [ok, set] = useState(false)
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); set(true); setTimeout(() => set(false), 2000) }}
      style={{ padding: '4px 10px', fontSize: 11, borderRadius: 6, border: `1px solid ${C.bd}`, background: ok ? '#f0fdf4' : C.sur, color: ok ? '#15803d' : C.mu, cursor: 'pointer' }}>
      {ok ? '✓ 복사됨' : '⎘ 복사'}
    </button>
  )
}

function Blk({ title, lines }) {
  const tx = lines.join('\n').trim()
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: C.fa, textTransform: 'uppercase' }}>{title}</span>
        <CopyBtn text={tx} />
      </div>
      <div style={{ background: C.alt, borderRadius: 10, border: `1px solid ${C.bd}`, padding: '14px 16px' }}>
        <pre style={{ margin: 0, fontFamily: 'inherit', fontSize: 13.5, lineHeight: 1.9, color: C.tx, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{tx}</pre>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, multiline }) {
  return (
    <div>
      <label style={{ fontSize: 10, color: C.mu, display: 'block', marginBottom: 3 }}>{label}</label>
      {multiline
        ? <textarea value={value} onChange={e => onChange(e.target.value)} rows={3}
            style={{ width: '100%', padding: '6px 8px', fontSize: 12, border: `1px solid ${C.bd}`, borderRadius: 6, fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box', outline: 'none' }} />
        : <input value={value} onChange={e => onChange(e.target.value)}
            style={{ width: '100%', padding: '6px 8px', fontSize: 12, border: `1px solid ${C.bd}`, borderRadius: 6, fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none' }} />
      }
    </div>
  )
}

/* ── 카드 텍스트 내용 ────────────────────────────────────────────
   textShadow는 레이아웃/배경에 따라 조정:
   overlay  → 매우 강한 shadow (어떤 배경에서도 보임)
   gradient → 중간 shadow
   나머지   → 없음 (배경색이 있으므로)
─────────────────────────────────────────────────────────────── */
function TextContent({ card }) {
  const fs = FONT_SIZES[card.fontSize] || FONT_SIZES.md
  const tc = card.textColor || card.fgColor || '#ffffff'
  const ts =
    card.cardLayout === 'overlay'
      ? '0 2px 20px rgba(0,0,0,0.95), 0 0 50px rgba(0,0,0,0.8)'
      : card.cardLayout === 'gradient'
      ? '0 2px 16px rgba(0,0,0,0.85)'
      : 'none'

  if (card.type === '훅') return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ width: 48, height: 4, background: card.accentColor, margin: '0 auto 44px', borderRadius: 2 }} />
      <h1 style={{ fontSize: fs.main, fontWeight: 900, color: tc, lineHeight: 1.15, margin: '0 0 28px', whiteSpace: 'pre-wrap', textShadow: ts, wordBreak: 'keep-all' }}>
        {card.mainText || '메인 문구'}
      </h1>
      <div style={{ width: 48, height: 2, background: card.accentColor, opacity: 0.5, margin: '0 auto 28px', borderRadius: 2 }} />
      <p style={{ fontSize: fs.sub, color: tc, opacity: 0.88, lineHeight: 1.65, margin: 0, textShadow: ts, wordBreak: 'keep-all' }}>
        {card.subText || '서브 문구'}
      </p>
    </div>
  )

  if (card.type === 'CTA') return (
    <div style={{ textAlign: 'center' }}>
      <p style={{ fontSize: fs.sub, color: tc, opacity: 0.78, margin: '0 0 22px', lineHeight: 1.65, textShadow: ts }}>
        {card.subText || '서브 문구'}
      </p>
      <div style={{ width: 48, height: 4, background: card.accentColor, margin: '0 auto 24px', borderRadius: 2 }} />
      <h1 style={{ fontSize: fs.main, fontWeight: 900, color: tc, lineHeight: 1.2, margin: '0 0 48px', whiteSpace: 'pre-wrap', textShadow: ts, wordBreak: 'keep-all' }}>
        {card.mainText || '메인 문구'}
      </h1>
      <div style={{ display: 'inline-block', background: card.accentColor, borderRadius: 100, padding: '20px 60px' }}>
        <span style={{ fontSize: fs.body, fontWeight: 700, color: card.bgColor }}>{card.buttonText || '버튼 문구'}</span>
      </div>
    </div>
  )

  // 공감 / 핵심 / 차별점
  return (
    <div>
      <div style={{ fontSize: 18, color: card.accentColor, fontWeight: 700, letterSpacing: '0.15em', marginBottom: 20, textShadow: ts }}>
        {String(card.id).padStart(2, '0')}
      </div>
      <h2 style={{ fontSize: fs.title, fontWeight: 800, color: tc, lineHeight: 1.2, margin: '0 0 28px', textShadow: ts, wordBreak: 'keep-all' }}>
        {card.title || '제목'}
      </h2>
      <p style={{ fontSize: fs.body, color: tc, opacity: 0.9, lineHeight: 1.75, margin: 0, textShadow: ts, wordBreak: 'keep-all' }}>
        <HL text={card.content || '내용'} word={card.highlight} color={card.accentColor} />
      </p>
    </div>
  )
}

/* ── 레이아웃 배경 레이어 ────────────────────────────────────────
   6종 레이아웃:
   gradient  사진 전체 + 하단 강한 그라데이션
   overlay   사진 전체 + 오버레이 없음 (텍스트 shadow 활용)
   textbox   상단 65% 사진 + 하단 35% 배경색 박스
   border    굵은 테두리 + 하단에 사진 (텍스트는 상단)
   simple    배경색만 (사진 무시)
   toptext   상단 38% 배경색 + 하단 62% 사진
─────────────────────────────────────────────────────────────── */
function LayoutBg({ card }) {
  const { cardLayout, image, bgColor, accentColor } = card
  const PHOTO_H_TEXTBOX = Math.round(CARD_H * 0.65)  // 877px
  const PHOTO_Y_TOPTEXT = Math.round(CARD_H * 0.38)  // 513px
  const IMG_STYLE = { width: '100%', height: '100%', objectFit: 'cover', display: 'block' }

  if (cardLayout === 'gradient') return (
    <>
      <div style={{ position: 'absolute', inset: 0, background: bgColor }} />
      {image && <img src={image} alt="" style={{ position: 'absolute', inset: 0, ...IMG_STYLE }} />}
      {/* 충분히 강한 그라데이션 — 글자가 항상 보임 */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.96) 0%, rgba(0,0,0,0.88) 20%, rgba(0,0,0,0.55) 42%, rgba(0,0,0,0.18) 65%, transparent 100%)' }} />
    </>
  )

  if (cardLayout === 'overlay') return (
    <>
      <div style={{ position: 'absolute', inset: 0, background: bgColor }} />
      {image && <img src={image} alt="" style={{ position: 'absolute', inset: 0, ...IMG_STYLE }} />}
      {/* 은은한 암막 — 텍스트 shadow가 메인 가독성 처리 */}
      {image && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.18)' }} />}
    </>
  )

  if (cardLayout === 'textbox') return (
    <>
      {/* 상단 65% — 사진 */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: PHOTO_H_TEXTBOX, background: '#1a1a1a', overflow: 'hidden' }}>
        {image && <img src={image} alt="" style={IMG_STYLE} />}
      </div>
      {/* 하단 35% — 배경색 텍스트 영역 */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: CARD_H - PHOTO_H_TEXTBOX, background: bgColor }} />
    </>
  )

  if (cardLayout === 'border') return (
    <>
      <div style={{ position: 'absolute', inset: 0, background: bgColor }} />
      {/* 굵은 테두리 */}
      <div style={{ position: 'absolute', inset: 0, border: `28px solid ${accentColor}`, boxSizing: 'border-box', pointerEvents: 'none', zIndex: 4 }} />
      {/* 하단 사진 (테두리 안쪽) */}
      {image && (
        <div style={{ position: 'absolute', left: 52, right: 52, bottom: 52, height: 660, overflow: 'hidden' }}>
          <img src={image} alt="" style={IMG_STYLE} />
        </div>
      )}
    </>
  )

  if (cardLayout === 'simple') return (
    <div style={{ position: 'absolute', inset: 0, background: bgColor }} />
  )

  if (cardLayout === 'toptext') return (
    <>
      <div style={{ position: 'absolute', inset: 0, background: bgColor }} />
      {/* 하단 62% — 사진 */}
      {image && (
        <div style={{ position: 'absolute', top: PHOTO_Y_TOPTEXT, left: 0, right: 0, bottom: 0, overflow: 'hidden' }}>
          <img src={image} alt="" style={IMG_STYLE} />
        </div>
      )}
    </>
  )

  return <div style={{ position: 'absolute', inset: 0, background: bgColor }} />
}

/* ── 카드 렌더러 (PNG 캡처 대상) ─────────────────────────────── */
function CardContent({ card, editing, textBlockRef, onDragStart, isDragging }) {
  const def = getDefaultPos(card.cardLayout, card.textPosition)
  const tx = card.textPosX ?? def.x
  const ty = card.textPosY ?? def.y
  // 텍스트 블록 최대 너비: 카드 오른쪽까지 여유 두기
  const maxW = (card.type === '훅' || card.type === 'CTA') ? 936 : Math.max(320, CARD_W - tx - 56)

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', fontFamily: "'Noto Sans KR','Apple SD Gothic Neo',sans-serif" }}>

      {/* 배경 레이어 */}
      <LayoutBg card={card} />

      {/* 드래그 가능 텍스트 블록 */}
      <div
        ref={textBlockRef}
        onMouseDown={editing ? onDragStart : undefined}
        onTouchStart={editing ? onDragStart : undefined}
        style={{
          position: 'absolute',
          left: tx,
          top: ty,
          maxWidth: maxW,
          zIndex: 5,
          cursor: editing ? (isDragging ? 'grabbing' : 'grab') : 'default',
          userSelect: 'none',
          WebkitUserSelect: 'none',
        }}
      >
        {/* 편집 모드 - 드래그 가이드 테두리 */}
        {editing && (
          <div style={{
            position: 'absolute',
            inset: -10,
            border: '2px dashed rgba(96,165,250,0.75)',
            borderRadius: 6,
            pointerEvents: 'none',
          }} />
        )}
        <TextContent card={card} />
      </div>

      {/* 브랜딩 */}
      <div style={{ position: 'absolute', bottom: 20, right: 28, fontSize: 14, color: card.fgColor, opacity: 0.12, zIndex: 3, pointerEvents: 'none' }}>
        ContentOS
      </div>
    </div>
  )
}

/* ── 개별 카드 에디터 ────────────────────────────────────────── */
function CardEditor({ card, idx, onUpdate }) {
  const [editing,    setEditing]    = useState(false)
  const [dr,         setDr]         = useState({ ...card })
  const [saved,      setSaved]      = useState(true)
  const [dl,         setDl]         = useState(false)
  const [showPanel,  setShowPanel]  = useState(true)   // 기본으로 패널 열림
  const [scale,      setScale]      = useState(0.5)
  const [isDragging, setIsDragging] = useState(false)

  const ref          = useRef(null)   // 카드 div (PNG 캡처 / getBoundingClientRect)
  const wrapRef      = useRef(null)   // 스케일 컨테이너
  const textBlockRef = useRef(null)   // 드래그 텍스트 블록
  const fileRef      = useRef(null)
  const dragInfo     = useRef(null)
  const drRef        = useRef(dr)
  drRef.current = dr                  // 항상 최신 dr 참조 (drag closure용)

  useEffect(() => { setDr({ ...card }); setSaved(true) }, [card])

  useEffect(() => {
    const el = wrapRef.current; if (!el) return
    const obs = new ResizeObserver(() => setScale(el.offsetWidth / CARD_W))
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const changeMulti = useCallback((updates) => {
    setDr(d => ({ ...d, ...updates }))
    setSaved(false)
  }, [])
  const change = useCallback((key, val) => changeMulti({ [key]: val }), [changeMulti])

  const save   = () => { onUpdate(idx, { ...dr }); setEditing(false); setSaved(true) }
  const cancel = () => { setDr({ ...card }); setEditing(false); setSaved(true) }

  const dlPNG = async () => {
    if (!ref.current || !saved) return
    setDl(true)
    try { await capturePNG(ref.current, `card_${idx + 1}_${card.type}.png`) }
    catch (e) { alert('저장 오류: ' + e.message) }
    finally { setDl(false) }
  }

  const handleImg = async e => {
    const f = e.target.files[0]; if (!f) return
    change('image', await readFileAsDataURL(f))
    e.target.value = ''
  }

  /* ── 드래그 핸들러 ─────────────────────────────────────────── */
  const handleDragStart = useCallback((e) => {
    if (!editing) return
    e.preventDefault()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    const cur = drRef.current
    const def = getDefaultPos(cur.cardLayout, cur.textPosition)
    dragInfo.current = {
      startScreen:  { x: clientX, y: clientY },
      startCardPos: { x: cur.textPosX ?? def.x, y: cur.textPosY ?? def.y },
    }
    setIsDragging(true)

    const onMove = (ev) => {
      if (!dragInfo.current) return
      if (ev.cancelable) ev.preventDefault()
      const cx = ev.touches ? ev.touches[0].clientX : ev.clientX
      const cy = ev.touches ? ev.touches[0].clientY : ev.clientY
      // 실제 표시 스케일 = 화면 픽셀 width / 카드 CSS width
      const rect = ref.current?.getBoundingClientRect()
      const dispScale = rect ? rect.width / CARD_W : 0.5
      const dx = (cx - dragInfo.current.startScreen.x) / dispScale
      const dy = (cy - dragInfo.current.startScreen.y) / dispScale
      let nx = dragInfo.current.startCardPos.x + dx
      let ny = dragInfo.current.startCardPos.y + dy
      // 카드 경계 제한
      const bW = textBlockRef.current?.offsetWidth  ?? 400
      const bH = textBlockRef.current?.offsetHeight ?? 200
      nx = Math.max(0, Math.min(CARD_W - bW, nx))
      ny = Math.max(0, Math.min(CARD_H - bH, ny))
      setDr(d => ({ ...d, textPosX: nx, textPosY: ny }))
      setSaved(false)
    }

    const onEnd = () => {
      dragInfo.current = null
      setIsDragging(false)
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup',   onEnd)
      document.removeEventListener('touchmove', onMove)
      document.removeEventListener('touchend',  onEnd)
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup',   onEnd)
    document.addEventListener('touchmove', onMove, { passive: false })
    document.addEventListener('touchend',  onEnd)
  }, [editing])   // editing만 의존 — dr은 drRef.current로 읽음

  const dlDisabled = dl || !saved
  const hasDragPos = dr.textPosX !== null || dr.textPosY !== null

  return (
    <div style={{ marginBottom: 20, borderRadius: 12, overflow: 'hidden', border: `2px solid ${editing ? '#3b82f6' : C.bd}`, transition: 'border-color .2s' }}>

      {/* ── 툴바 ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', background: editing ? '#EFF6FF' : C.alt, borderBottom: `1px solid ${editing ? '#BFDBFE' : C.bd}`, flexWrap: 'wrap', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: dr.accentColor }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: C.tx }}>카드 {idx + 1}</span>
          <span style={{ fontSize: 11, color: C.mu }}>{card.type}</span>
          {!saved && <span style={{ fontSize: 10, color: '#d97706', background: '#fffbeb', padding: '2px 7px', borderRadius: 10, border: '1px solid #fcd34d' }}>● 미저장</span>}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {(!saved || editing)
            ? <>
                <button onClick={save}   style={{ padding: '5px 14px', fontSize: 11, borderRadius: 7, border: 'none', background: '#3b82f6', color: '#fff', cursor: 'pointer', fontWeight: 700 }}>✓ 저장</button>
                <button onClick={cancel} style={{ padding: '5px 10px', fontSize: 11, borderRadius: 7, border: `1px solid ${C.bd}`, background: C.sur, color: C.mu, cursor: 'pointer' }}>취소</button>
              </>
            : <button onClick={() => { setEditing(true); setShowPanel(true) }}
                style={{ padding: '5px 12px', fontSize: 11, borderRadius: 7, border: `1px solid ${C.bd}`, background: C.sur, color: C.mu, cursor: 'pointer', fontWeight: 600 }}>✎ 수정</button>
          }
          <button onClick={dlPNG} disabled={dlDisabled}
            title={!saved ? '수정 후 저장해야 다운로드 가능합니다' : 'PNG 저장'}
            style={{ padding: '5px 10px', fontSize: 11, borderRadius: 7, border: `1px solid ${dlDisabled ? C.bd : '#1d6b45'}`, background: dlDisabled ? C.alt : '#f0fdf4', color: dlDisabled ? C.fa : '#1d6b45', cursor: dlDisabled ? 'not-allowed' : 'pointer', fontWeight: dlDisabled ? 400 : 600 }}>
            {dl ? '변환 중…' : dlDisabled ? '저장 후 다운로드' : '↓ PNG'}
          </button>
        </div>
      </div>

      {/* ── 2단: 카드 미리보기 + 사이드패널 ── */}
      <div style={{ display: 'flex', alignItems: 'stretch' }}>

        {/* 카드 미리보기 */}
        <div ref={wrapRef} style={{ flex: 1, minWidth: 0, position: 'relative', background: '#e0ddd8', overflow: 'hidden' }}>
          {/* 4:5 비율박스 */}
          <div style={{ paddingTop: '125%', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' }}>
              <div style={{ width: CARD_W, transformOrigin: 'top left', transform: `scale(${scale})` }}>
                <div ref={ref} data-card-img style={{ width: CARD_W, height: CARD_H, position: 'relative', overflow: 'hidden' }}>
                  <CardContent
                    card={dr}
                    editing={editing}
                    textBlockRef={textBlockRef}
                    onDragStart={handleDragStart}
                    isDragging={isDragging}
                  />
                </div>
              </div>
            </div>
          </div>
          {/* 편집 모드 힌트 오버레이 */}
          {editing && (
            <div style={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', background: 'rgba(30,30,30,0.72)', color: '#fff', fontSize: 11, padding: '5px 12px', borderRadius: 20, pointerEvents: 'none', whiteSpace: 'nowrap' }}>
              ⠿ 텍스트 블록 드래그로 이동
            </div>
          )}
        </div>

        {/* 사이드 패널 */}
        {(editing || showPanel) && (
          <div style={{ width: 288, minWidth: 288, borderLeft: `1px solid ${C.bd}`, background: '#F8FAFF', overflowY: 'auto', animation: 'slideInRight .22s ease' }}>
            <div style={{ padding: '16px 14px 32px' }}>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleImg} style={{ display: 'none' }} />

              {/* ── 사진 ── */}
              <SectionLabel>사진</SectionLabel>
              <div style={{ marginBottom: 18 }}>
                {dr.image
                  ? <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => fileRef.current?.click()} style={{ flex: 1, padding: '8px', fontSize: 11, borderRadius: 7, border: `1px solid ${C.bd}`, background: C.sur, cursor: 'pointer', color: C.tx, fontWeight: 600 }}>📷 교체</button>
                      <button onClick={() => change('image', null)} style={{ padding: '8px 12px', fontSize: 11, borderRadius: 7, border: '1px solid #fca5a5', background: '#fef2f2', cursor: 'pointer', color: '#ef4444' }}>✕ 제거</button>
                    </div>
                  : <button onClick={() => fileRef.current?.click()} style={{ width: '100%', padding: '12px', fontSize: 11, borderRadius: 7, border: `2px dashed ${C.bd}`, background: C.sur, cursor: 'pointer', color: C.mu }}>📷 사진 업로드</button>
                }
              </div>

              {/* ── 레이아웃 ── */}
              <SectionLabel>레이아웃</SectionLabel>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5, marginBottom: 18 }}>
                {LAYOUTS.map(({ k, l }) => {
                  const on = dr.cardLayout === k
                  return (
                    <button key={k} onClick={() => change('cardLayout', k)}
                      style={{ padding: '8px 5px', fontSize: 10, borderRadius: 7, border: `1.5px solid ${on ? '#3b82f6' : C.bd}`, background: on ? '#EFF6FF' : C.sur, color: on ? '#1d4ed8' : C.mu, cursor: 'pointer', fontWeight: on ? 700 : 400, textAlign: 'center', lineHeight: 1.4 }}>
                      {l}
                    </button>
                  )
                })}
              </div>

              {/* ── 텍스트 위치 ── */}
              <SectionLabel>텍스트 위치</SectionLabel>
              <div style={{ display: 'flex', gap: 5, marginBottom: 8 }}>
                {[['top', '위'], ['center', '중앙'], ['bottom', '아래']].map(([v, l]) => {
                  const on = dr.textPosition === v
                  return (
                    <button key={v}
                      onClick={() => changeMulti({ textPosition: v, textPosX: null, textPosY: null })}
                      style={{ flex: 1, padding: '7px', fontSize: 11, borderRadius: 7, border: `1.5px solid ${on ? '#3b82f6' : C.bd}`, background: on ? '#EFF6FF' : C.sur, color: on ? '#1d4ed8' : C.mu, cursor: 'pointer', fontWeight: on ? 700 : 400 }}>
                      {l}
                    </button>
                  )
                })}
              </div>
              {hasDragPos && (
                <button onClick={() => changeMulti({ textPosX: null, textPosY: null })}
                  style={{ width: '100%', padding: '5px', fontSize: 10, borderRadius: 6, border: `1px solid ${C.bd}`, background: C.sur, color: '#3b82f6', cursor: 'pointer', marginBottom: 6, fontWeight: 600 }}>
                  ↺ 위치 초기화
                </button>
              )}
              <div style={{ marginBottom: 12 }} />

              {/* ── 글자 크기 ── */}
              <SectionLabel>글자 크기</SectionLabel>
              <div style={{ display: 'flex', gap: 4, marginBottom: 18 }}>
                {[['sm', '작게'], ['md', '보통'], ['lg', '크게'], ['xl', '아주크게']].map(([v, l]) => {
                  const on = dr.fontSize === v
                  return (
                    <button key={v} onClick={() => change('fontSize', v)}
                      style={{ flex: 1, padding: '6px 2px', fontSize: 10, borderRadius: 6, border: `1.5px solid ${on ? '#3b82f6' : C.bd}`, background: on ? '#EFF6FF' : C.sur, color: on ? '#1d4ed8' : C.mu, cursor: 'pointer', fontWeight: on ? 700 : 400 }}>
                      {l}
                    </button>
                  )
                })}
              </div>

              {/* ── 글자색 ── */}
              <SectionLabel>글자색</SectionLabel>
              <div style={{ display: 'flex', gap: 5, marginBottom: 18, flexWrap: 'wrap', alignItems: 'center' }}>
                {[['#ffffff', '흰색', '#bbb'], ['#1a1a1a', '검정', '#1a1a1a'], ['#ffd700', '노랑', '#ffd700']].map(([v, l, border]) => {
                  const on = dr.textColor === v
                  return (
                    <button key={v} onClick={() => change('textColor', v)}
                      style={{ padding: '5px 10px', fontSize: 11, borderRadius: 6, border: `2px solid ${on ? '#3b82f6' : border}`, background: v, color: v === '#ffffff' ? '#333' : '#fff', cursor: 'pointer', fontWeight: on ? 700 : 400 }}>
                      {l}
                    </button>
                  )
                })}
                <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                  <input type="color" value={dr.textColor || '#ffffff'} onChange={e => change('textColor', e.target.value)}
                    style={{ width: 28, height: 28, padding: 2, border: `1px solid ${C.bd}`, borderRadius: 5, cursor: 'pointer' }} />
                  <span style={{ fontSize: 10, color: C.fa }}>커스텀</span>
                </label>
              </div>

              {/* ── 배경 / 포인트색 ── */}
              <SectionLabel>배경 / 포인트색</SectionLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
                {[['bgColor', '배경색'], ['accentColor', '포인트색']].map(([key, label]) => (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input type="color" value={dr[key]} onChange={e => change(key, e.target.value)}
                      style={{ width: 32, height: 32, padding: 2, border: `1px solid ${C.bd}`, borderRadius: 6, cursor: 'pointer', flexShrink: 0 }} />
                    <span style={{ fontSize: 11, color: C.mu }}>{label}</span>
                    <span style={{ fontSize: 10, color: C.fa, fontFamily: 'monospace', marginLeft: 'auto' }}>{dr[key]}</span>
                  </div>
                ))}
              </div>

              {/* ── 텍스트 편집 ── */}
              <SectionLabel>텍스트</SectionLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {card.type === '훅' && <>
                  <Field label="메인 문구 (8자 이내)" value={dr.mainText}   onChange={v => change('mainText',   v)} />
                  <Field label="서브 문구"            value={dr.subText}    onChange={v => change('subText',    v)} />
                </>}
                {card.type === 'CTA' && <>
                  <Field label="메인 문구"  value={dr.mainText}   onChange={v => change('mainText',   v)} />
                  <Field label="서브 문구"  value={dr.subText}    onChange={v => change('subText',    v)} />
                  <Field label="버튼 문구"  value={dr.buttonText} onChange={v => change('buttonText', v)} />
                </>}
                {['공감', '핵심', '차별점'].includes(card.type) && <>
                  <Field label="제목"      value={dr.title}     onChange={v => change('title',     v)} />
                  <Field label="내용"      value={dr.content}   onChange={v => change('content',   v)} multiline />
                  <Field label="강조 단어" value={dr.highlight} onChange={v => change('highlight', v)} />
                </>}
              </div>

              <div style={{ marginTop: 16, padding: '10px 12px', background: '#EFF6FF', borderRadius: 9, border: '1px solid #BFDBFE', fontSize: 11, color: '#1d4ed8', lineHeight: 1.85 }}>
                ⠿ 수정 모드에서 텍스트 블록 드래그<br />
                저장 후 PNG 다운로드 가능
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ── 섹션 레이블 ───────────────────────────────────────────────── */
function SectionLabel({ children }) {
  return <p style={{ fontSize: 10, fontWeight: 700, color: C.fa, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 7 }}>{children}</p>
}

/* ── 카드뉴스 전체 뷰 ────────────────────────────────────────── */
export default function CardNewsView({ result }) {
  const [cards, setCards] = useState(() => parseCardResult(result))
  const [dlAll, setDlAll] = useState(false)

  useEffect(() => { setCards(parseCardResult(result)) }, [result])

  const updateCard = useCallback((idx, newCard) => {
    setCards(prev => prev.map((c, i) => i === idx ? { ...newCard } : c))
  }, [])

  const dlAllPNG = async () => {
    setDlAll(true)
    const els = document.querySelectorAll('[data-card-img]')
    for (let i = 0; i < els.length; i++) {
      try {
        await capturePNG(els[i], `card_${i + 1}.png`)
        await new Promise(r => setTimeout(r, 600))
      } catch (e) { console.error(e) }
    }
    setDlAll(false)
  }

  const blocks = parseBlocks(result)
  const caption = blocks.find(b => b.title === '캡션')
  const hashtag = blocks.find(b => b.title === '해시태그')

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <span style={{ fontSize: 10, fontWeight: 700, color: C.fa, textTransform: 'uppercase', letterSpacing: '0.08em' }}>인스타그램 카드뉴스</span>
          <span style={{ fontSize: 11, color: C.mu, marginLeft: 8 }}>— 수정 후 PNG 저장</span>
        </div>
        <button onClick={dlAllPNG} disabled={dlAll}
          style={{ padding: '6px 12px', fontSize: 11, borderRadius: 7, border: `1px solid ${C.bd}`, background: C.sur, color: dlAll ? C.fa : C.mu, cursor: dlAll ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
          {dlAll ? '저장 중…' : '↓ 전체 PNG'}
        </button>
      </div>
      {cards.map((card, i) => (
        <CardEditor key={i} card={card} idx={i} onUpdate={updateCard} />
      ))}
      {caption && <Blk title="캡션"    lines={caption.lines}  />}
      {hashtag && <Blk title="해시태그" lines={hashtag.lines} />}
    </div>
  )
}
