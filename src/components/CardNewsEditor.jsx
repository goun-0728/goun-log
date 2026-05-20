// src/components/CardNewsEditor.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react'
import { C } from '../constants'
import { parseBlocks, capturePNG, readFileAsDataURL } from '../utils'

/* ── 상수 ──────────────────────────────────────────────────── */
const CARD_W = 1080, CARD_H = 1350

const FONT_SIZES = {
  sm: { main: 52, sub: 24, title: 44, body: 22 },
  md: { main: 72, sub: 32, title: 56, body: 28 },
  lg: { main: 92, sub: 40, title: 72, body: 36 },
  xl: { main: 112, sub: 48, title: 88, body: 44 },
}

// 추가 텍스트 블록 fontSizeKey → 카드 실제 px
const EXTRA_FS = { sm: 36, md: 48, lg: 64, xl: 88 }

const LAYOUTS = [
  { k: 'gradient', l: '그라데이션형' },
  { k: 'overlay',  l: '직접 오버레이형' },
  { k: 'textbox',  l: '하단 텍스트박스형' },
  { k: 'border',   l: '테두리형' },
  { k: 'simple',   l: '심플형' },
  { k: 'toptext',  l: '상단텍스트형' },
]

/* ── 레이아웃별 기본 텍스트 위치 ──────────────────────────── */
function getDefaultPos(layout, pos) {
  const PAD = 72
  switch (layout) {
    case 'gradient':
      return { x: PAD, y: pos === 'top' ? 760 : pos === 'center' ? 870 : 1000 }
    case 'overlay':
      return { x: PAD, y: pos === 'top' ? 80  : pos === 'center' ? 460 : 860 }
    case 'textbox': {
      const zoneTop = Math.round(CARD_H * 0.65)
      return { x: PAD, y: pos === 'top' ? zoneTop + 36 : pos === 'center' ? zoneTop + 120 : zoneTop + 210 }
    }
    case 'border':
      return { x: 96, y: pos === 'top' ? 80 : pos === 'center' ? 180 : 340 }
    case 'simple':
      return { x: PAD, y: pos === 'top' ? 200 : pos === 'center' ? 460 : 720 }
    case 'toptext':
      return { x: PAD, y: pos === 'top' ? 56 : pos === 'center' ? 120 : 240 }
    default:
      return { x: PAD, y: 800 }
  }
}

/* ── AI 결과 파서 ──────────────────────────────────────────── */
function parseCardResult(text) {
  const mkCard = (i, type, layout, textPosition, bgColor, fgColor, accentColor) => ({
    id: i + 1, type,
    mainText: '', subText: '', title: '', content: '', highlight: '', buttonText: '',
    bgColor, fgColor, accentColor,
    image: null,
    imgX: 50, imgY: 50, imgScale: 1,
    cardLayout: layout, textPosition,
    fontSize: 'md', textColor: null,
    textPosX: null, textPosY: null,
    extraTexts: [],
  })
  const DEFS = [
    mkCard(0, '훅',    'gradient', 'bottom', '#1a1a2e', '#ffffff', '#e94560'),
    mkCard(1, '공감',  'textbox',  'top',    '#fffbf5', '#2d2926', '#d4845a'),
    mkCard(2, '핵심',  'textbox',  'top',    '#f0f5ff', '#1e3a8a', '#3b82f6'),
    mkCard(3, '차별점','textbox',  'top',    '#faf5ff', '#4c1d95', '#8b5cf6'),
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
        mainText:    gf('메인문구'),   subText:     gf('서브문구'),
        title:       gf('제목'),       content:     gf('내용'),
        highlight:   gf('강조단어'),   buttonText:  gf('버튼문구'),
        bgColor:     gf('배경색')   || result[i].bgColor,
        fgColor:     gf('글자색')   || result[i].fgColor,
        accentColor: gf('포인트색') || result[i].accentColor,
      }
    }
    return result
  } catch { return DEFS }
}

/* ── 사진 drag/zoom 스타일 헬퍼 ──────────────────────────── */
function imgSt(card) {
  return {
    position: 'absolute', inset: 0,
    width: '100%', height: '100%',
    objectFit: 'cover', display: 'block',
    objectPosition: `${card.imgX ?? 50}% ${card.imgY ?? 50}%`,
    transform: `scale(${card.imgScale ?? 1})`,
    transformOrigin: `${card.imgX ?? 50}% ${card.imgY ?? 50}%`,
  }
}

/* ── 미니 컴포넌트 ────────────────────────────────────────── */
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

function SL({ children }) {
  return <p style={{ fontSize: 10, fontWeight: 700, color: C.fa, letterSpacing: '0.07em', textTransform: 'uppercase', margin: '0 0 7px' }}>{children}</p>
}

/* ── 업로드 버튼 (정중앙, 반투명) ────────────────────────── */
function UploadButton({ onClick }) {
  const [hover, setHover] = useState(false)
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
        background: hover ? 'rgba(255,255,255,0.30)' : 'rgba(255,255,255,0.14)',
        border: '2px dashed rgba(255,255,255,0.80)',
        borderRadius: 24, padding: '36px 52px',
        cursor: 'pointer', pointerEvents: 'auto',
        transition: 'background .18s, box-shadow .18s',
        boxShadow: hover ? '0 0 0 4px rgba(255,255,255,0.12)' : 'none',
        outline: 'none',
      }}>
      <span style={{ fontSize: 44, lineHeight: 1, filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.55))' }}>📷</span>
      <span style={{ fontSize: 14, color: '#ffffff', fontWeight: 700, textShadow: '0 1px 8px rgba(0,0,0,0.65)', whiteSpace: 'nowrap' }}>사진 업로드</span>
    </button>
  )
}

/* ── 카드 텍스트 내용 (인라인 편집) ──────────────────────── */
function TextContent({ card, editing, onChangeText }) {
  const fs = FONT_SIZES[card.fontSize] || FONT_SIZES.md
  const tc = card.textColor || card.fgColor || '#ffffff'
  const ts = card.cardLayout === 'overlay'
    ? '0 2px 20px rgba(0,0,0,0.95), 0 0 50px rgba(0,0,0,0.8)'
    : card.cardLayout === 'gradient' ? '0 2px 16px rgba(0,0,0,0.85)' : 'none'

  const E = ({ value, fieldKey, tag: Tag = 'div', style }) => {
    if (!editing) return <Tag style={style}>{value || ''}</Tag>
    return (
      <Tag contentEditable suppressContentEditableWarning
        onMouseDown={e => e.stopPropagation()}
        onClick={e => e.stopPropagation()}
        onBlur={e => onChangeText?.(fieldKey, e.currentTarget.innerText)}
        dangerouslySetInnerHTML={{ __html: value || '' }}
        style={{ ...style, outline: 'none', borderBottom: '2px solid rgba(96,165,250,0.7)', cursor: 'text', minWidth: 40, whiteSpace: 'pre-wrap' }}
      />
    )
  }

  if (card.type === '훅') return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ width: 48, height: 4, background: card.accentColor, margin: '0 auto 44px', borderRadius: 2 }} />
      <E tag="h1" value={card.mainText || '메인 문구'} fieldKey="mainText"
        style={{ fontSize: fs.main, fontWeight: 900, color: tc, lineHeight: 1.15, margin: '0 0 28px', textShadow: ts, wordBreak: 'keep-all' }} />
      <div style={{ width: 48, height: 2, background: card.accentColor, opacity: 0.5, margin: '0 auto 28px', borderRadius: 2 }} />
      <E tag="p" value={card.subText || '서브 문구'} fieldKey="subText"
        style={{ fontSize: fs.sub, color: tc, opacity: 0.88, lineHeight: 1.65, margin: 0, textShadow: ts, wordBreak: 'keep-all' }} />
    </div>
  )

  if (card.type === 'CTA') return (
    <div style={{ textAlign: 'center' }}>
      <E tag="p" value={card.subText || '서브 문구'} fieldKey="subText"
        style={{ fontSize: fs.sub, color: tc, opacity: 0.78, margin: '0 0 22px', lineHeight: 1.65, textShadow: ts }} />
      <div style={{ width: 48, height: 4, background: card.accentColor, margin: '0 auto 24px', borderRadius: 2 }} />
      <E tag="h1" value={card.mainText || '메인 문구'} fieldKey="mainText"
        style={{ fontSize: fs.main, fontWeight: 900, color: tc, lineHeight: 1.2, margin: 0, textShadow: ts, wordBreak: 'keep-all' }} />
    </div>
  )

  return (
    <div>
      <div style={{ fontSize: 18, color: card.accentColor, fontWeight: 700, letterSpacing: '0.15em', marginBottom: 20, textShadow: ts }}>
        {String(card.id).padStart(2, '0')}
      </div>
      <E tag="h2" value={card.title || '제목'} fieldKey="title"
        style={{ fontSize: fs.title, fontWeight: 800, color: tc, lineHeight: 1.2, margin: '0 0 28px', textShadow: ts, wordBreak: 'keep-all' }} />
      <E tag="p" value={card.content || '내용'} fieldKey="content"
        style={{ fontSize: fs.body, color: tc, opacity: 0.9, lineHeight: 1.75, margin: 0, textShadow: ts, wordBreak: 'keep-all' }} />
    </div>
  )
}

/* ── 레이아웃 배경 레이어 ──────────────────────────────── */
function LayoutBg({ card }) {
  const { cardLayout, image, bgColor, accentColor } = card
  const PH = Math.round(CARD_H * 0.65)
  const PT = Math.round(CARD_H * 0.38)

  if (cardLayout === 'gradient') return (
    <>
      <div style={{ position: 'absolute', inset: 0, background: bgColor }} />
      {image && <img src={image} alt="" style={imgSt(card)} />}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.96) 0%, rgba(0,0,0,0.88) 20%, rgba(0,0,0,0.55) 42%, rgba(0,0,0,0.18) 65%, transparent 100%)' }} />
    </>
  )
  if (cardLayout === 'overlay') return (
    <>
      <div style={{ position: 'absolute', inset: 0, background: bgColor }} />
      {image && <img src={image} alt="" style={imgSt(card)} />}
      {image && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.18)' }} />}
    </>
  )
  if (cardLayout === 'textbox') return (
    <>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: PH, background: '#1a1a1a', overflow: 'hidden' }}>
        {image && <img src={image} alt="" style={imgSt(card)} />}
      </div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: CARD_H - PH, background: bgColor }} />
    </>
  )
  if (cardLayout === 'border') return (
    <>
      <div style={{ position: 'absolute', inset: 0, background: bgColor }} />
      <div style={{ position: 'absolute', inset: 0, border: `28px solid ${accentColor}`, boxSizing: 'border-box', pointerEvents: 'none', zIndex: 4 }} />
      {image && (
        <div style={{ position: 'absolute', left: 52, right: 52, bottom: 52, height: 660, overflow: 'hidden' }}>
          <img src={image} alt="" style={imgSt(card)} />
        </div>
      )}
    </>
  )
  if (cardLayout === 'toptext') return (
    <>
      <div style={{ position: 'absolute', inset: 0, background: bgColor }} />
      {image && (
        <div style={{ position: 'absolute', top: PT, left: 0, right: 0, bottom: 0, overflow: 'hidden' }}>
          <img src={image} alt="" style={imgSt(card)} />
        </div>
      )}
    </>
  )
  return <div style={{ position: 'absolute', inset: 0, background: bgColor }} />
}

/* ── 추가 텍스트 블록 ────────────────────────────────────── */
// 싱글클릭: 선택 / 더블클릭(300ms 내 재클릭): 텍스트 편집 모드
function ExtraTextBlock({ block, editing, selected, textEditing, cardRef, onSelect, onStartTextEdit, onEndTextEdit, onDrag, onDelete }) {
  const [dragging, setDragging]   = useState(false)
  const didDragRef                = useRef(false)
  const lastClickTimeRef          = useRef(0)
  const textRef                   = useRef(null)

  // 텍스트 편집 모드 진입 시 contentEditable 자동 포커스 + 커서 끝으로
  useEffect(() => {
    if (textEditing && textRef.current) {
      textRef.current.focus()
      try {
        const sel = window.getSelection()
        const range = document.createRange()
        range.selectNodeContents(textRef.current)
        range.collapse(false)
        sel.removeAllRanges()
        sel.addRange(range)
      } catch {}
    }
  }, [textEditing])

  const handleMouseDown = (e) => {
    if (!editing) return
    // 텍스트 편집 중이면 contentEditable이 직접 처리
    if (textEditing) return
    e.stopPropagation()
    e.preventDefault()   // click 이벤트 억제 — onUp에서 직접 처리
    didDragRef.current = false
    setDragging(false)

    const sx = e.clientX, sy = e.clientY
    const bx = block.x,   by = block.y

    const onMove = (ev) => {
      // 4px 이상 이동 시 드래그로 확정
      if (!didDragRef.current && (Math.abs(ev.clientX - sx) > 4 || Math.abs(ev.clientY - sy) > 4)) {
        didDragRef.current = true
        setDragging(true)
      }
      if (!didDragRef.current) return
      const rect = cardRef.current?.getBoundingClientRect()
      if (!rect) return
      const sc = rect.width / CARD_W
      onDrag(
        block.id,
        Math.max(0, Math.min(CARD_W - 120, bx + (ev.clientX - sx) / sc)),
        Math.max(0, Math.min(CARD_H - 60,  by + (ev.clientY - sy) / sc)),
      )
    }

    const onUp = () => {
      setDragging(false)
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup',   onUp)
      if (!didDragRef.current) {
        // 클릭 — 싱글 vs 더블 판별 (시간 기반, 렌더링 타이밍 무관)
        const now = Date.now()
        if (now - lastClickTimeRef.current < 300) {
          // 300ms 내 재클릭 → 더블클릭: 텍스트 편집 모드
          lastClickTimeRef.current = 0
          onStartTextEdit(block.id)
        } else {
          // 싱글클릭: 선택
          lastClickTimeRef.current = now
          onSelect(block.id)
        }
      }
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup',   onUp)
  }

  const textStyle = {
    fontSize:   block.fontSize || 48,
    color:      block.color    || '#ffffff',
    fontWeight: 700,
    textShadow: '0 2px 10px rgba(0,0,0,0.75)',
    minWidth:   60,
    whiteSpace: 'pre-wrap',
    wordBreak:  'keep-all',
    fontFamily: "'Noto Sans KR','Apple SD Gothic Neo',sans-serif",
    lineHeight: 1.3,
  }

  const borderStyle = !editing ? 'none'
    : selected
      ? '2px solid rgba(59,130,246,0.95)'
      : '1.5px dashed rgba(148,163,184,0.4)'

  return (
    <div
      onMouseDown={handleMouseDown}
      onClick={editing ? e => e.stopPropagation() : undefined}
      style={{
        position:   'absolute',
        left:       block.x,
        top:        block.y,
        zIndex:     8,
        userSelect: 'none',
        cursor:     !editing ? 'default' : textEditing ? 'text' : dragging ? 'grabbing' : 'grab',
      }}
    >
      {/* 선택/미선택 테두리 */}
      {editing && (
        <div style={{
          position:  'absolute', inset: -8,
          border:    borderStyle,
          borderRadius: 4,
          pointerEvents: 'none',
          boxShadow: selected ? '0 0 0 3px rgba(59,130,246,0.12)' : 'none',
          transition: 'border .1s, box-shadow .1s',
        }} />
      )}

      {/* 삭제 버튼 — 선택 상태에서만 표시 */}
      {editing && selected && (
        <button
          onMouseDown={e => e.stopPropagation()}
          onClick={e => { e.stopPropagation(); onDelete(block.id) }}
          style={{
            position: 'absolute', top: -16, right: -16,
            width: 24, height: 24, borderRadius: '50%',
            background: '#ef4444', color: '#fff',
            border: '2px solid #fff', fontSize: 13,
            cursor: 'pointer', padding: 0, fontWeight: 900,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 10, lineHeight: 1,
          }}
        >×</button>
      )}

      {/* 텍스트: 편집 모드면 contentEditable, 아니면 일반 div */}
      {textEditing ? (
        <div
          ref={textRef}
          contentEditable suppressContentEditableWarning
          onMouseDown={e => e.stopPropagation()}
          onClick={e => e.stopPropagation()}
          onBlur={e => onEndTextEdit(block.id, e.currentTarget.innerText)}
          onKeyDown={e => { if (e.key === 'Escape') { e.preventDefault(); e.currentTarget.blur() } }}
          dangerouslySetInnerHTML={{ __html: block.text }}
          style={{ ...textStyle, outline: 'none', borderBottom: '2px solid rgba(96,165,250,0.7)', cursor: 'text', userSelect: 'text' }}
        />
      ) : (
        <div style={textStyle}>{block.text || '텍스트'}</div>
      )}
    </div>
  )
}

/* ── 카드 렌더러 ─────────────────────────────────────────── */
function CardContent({ card, editing, textBlockRef, onDragStart, isDragging, onChangeText,
  onDragExtra, onDeleteExtra, onSelectExtra, onStartTextEdit, onEndTextEdit, selectedExtraId, editingExtraId, cardRef }) {
  const def  = getDefaultPos(card.cardLayout, card.textPosition)
  const tx   = card.textPosX ?? def.x
  const ty   = card.textPosY ?? def.y
  const maxW = (card.type === '훅' || card.type === 'CTA') ? 936 : Math.max(320, CARD_W - tx - 56)

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', fontFamily: "'Noto Sans KR','Apple SD Gothic Neo',sans-serif" }}>
      <LayoutBg card={card} />

      <div ref={textBlockRef}
        onMouseDown={editing ? onDragStart : undefined}
        onTouchStart={editing ? onDragStart : undefined}
        onClick={editing ? e => e.stopPropagation() : undefined}
        style={{ position: 'absolute', left: tx, top: ty, maxWidth: maxW, zIndex: 5,
          cursor: editing ? (isDragging ? 'grabbing' : 'grab') : 'default',
          userSelect: 'none', WebkitUserSelect: 'none' }}>
        {editing && <div style={{ position: 'absolute', inset: -10, border: '2px dashed rgba(96,165,250,0.75)', borderRadius: 6, pointerEvents: 'none' }} />}
        <TextContent card={card} editing={editing} onChangeText={onChangeText} />
      </div>

      {(card.extraTexts || []).map(block => (
        <ExtraTextBlock
          key={block.id}
          block={block}
          editing={editing}
          selected={selectedExtraId === block.id}
          textEditing={editingExtraId === block.id}
          cardRef={cardRef}
          onSelect={onSelectExtra}
          onStartTextEdit={onStartTextEdit}
          onEndTextEdit={onEndTextEdit}
          onDrag={onDragExtra}
          onDelete={onDeleteExtra}
        />
      ))}

      <div style={{ position: 'absolute', bottom: 20, right: 28, fontSize: 14, color: card.fgColor, opacity: 0.12, zIndex: 3, pointerEvents: 'none' }}>ContentOS</div>
    </div>
  )
}

/* ── 개별 카드 에디터 ────────────────────────────────────── */
function CardEditor({ card, idx, onUpdate }) {
  const [editing,         setEditing]        = useState(true)
  const [dr,              setDr]             = useState({ ...card })
  const [saved,           setSaved]          = useState(true)
  const [dl,              setDl]             = useState(false)
  const [showPanel,       setShowPanel]      = useState(true)
  const [scale,           setScale]          = useState(0.5)
  const [isDragging,      setIsDragging]     = useState(false)
  const [isImgDrag,       setIsImgDrag]      = useState(false)
  const [selectedExtraId, setSelectedExtraId] = useState(null)  // 선택된 추가 텍스트 블록 ID
  const [editingExtraId,  setEditingExtraId]  = useState(null)  // 텍스트 편집 중인 블록 ID

  const ref          = useRef(null)
  const wrapRef      = useRef(null)
  const textBlockRef = useRef(null)
  const fileRef      = useRef(null)
  const dragInfo     = useRef(null)
  const imgDragRef   = useRef(null)
  const drRef        = useRef(dr)
  drRef.current = dr

  useEffect(() => { setDr({ ...card }); setSaved(true) }, [card])

  useEffect(() => {
    const el = wrapRef.current; if (!el) return
    const obs = new ResizeObserver(() => setScale(el.offsetWidth / CARD_W))
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  /* 마우스 휠 → 사진 크기 조절 (non-passive) */
  useEffect(() => {
    const el = wrapRef.current; if (!el) return
    const onWheel = (e) => {
      e.preventDefault()
      setDr(d => {
        if (!d.image) return d
        const delta = e.deltaY > 0 ? -0.06 : 0.06
        return { ...d, imgScale: Math.max(0.4, Math.min(5, (d.imgScale ?? 1) + delta)) }
      })
      setSaved(false)
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  const changeMulti = useCallback((updates) => { setDr(d => ({ ...d, ...updates })); setSaved(false) }, [])
  const change      = useCallback((key, val) => changeMulti({ [key]: val }), [changeMulti])

  const clearExtraSelection = () => { setSelectedExtraId(null); setEditingExtraId(null) }

  const save   = () => { onUpdate(idx, { ...dr }); setEditing(false); setSaved(true); clearExtraSelection() }
  const cancel = () => { setDr({ ...card });        setEditing(false); setSaved(true); clearExtraSelection() }

  const dlPNG = async () => {
    if (!ref.current || !saved) return
    setDl(true)
    const scaledEl = ref.current.parentElement
    const origTx = scaledEl?.style.transform ?? ''
    try {
      if (scaledEl) scaledEl.style.transform = 'none'
      await capturePNG(ref.current, `card_${idx + 1}_${card.type}.png`)
    } catch (e) { alert('저장 오류: ' + e.message) }
    finally { if (scaledEl) scaledEl.style.transform = origTx; setDl(false) }
  }

  const handleImg = async e => {
    const f = e.target.files[0]; if (!f) return
    change('image', await readFileAsDataURL(f)); e.target.value = ''
  }

  /* 메인 텍스트 블록 드래그 */
  const handleDragStart = useCallback((e) => {
    if (!editing) return
    e.preventDefault(); e.stopPropagation()
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
      const rect = ref.current?.getBoundingClientRect()
      const sc = rect ? rect.width / CARD_W : 0.5
      let nx = dragInfo.current.startCardPos.x + (cx - dragInfo.current.startScreen.x) / sc
      let ny = dragInfo.current.startCardPos.y + (cy - dragInfo.current.startScreen.y) / sc
      const bW = textBlockRef.current?.offsetWidth  ?? 400
      const bH = textBlockRef.current?.offsetHeight ?? 200
      nx = Math.max(0, Math.min(CARD_W - bW, nx))
      ny = Math.max(0, Math.min(CARD_H - bH, ny))
      setDr(d => ({ ...d, textPosX: nx, textPosY: ny }))
      setSaved(false)
    }
    const onEnd = () => {
      dragInfo.current = null; setIsDragging(false)
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup',   onEnd)
      document.removeEventListener('touchmove', onMove)
      document.removeEventListener('touchend',  onEnd)
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup',   onEnd)
    document.addEventListener('touchmove', onMove, { passive: false })
    document.addEventListener('touchend',  onEnd)
  }, [editing])

  /* 사진 드래그 */
  const handleImgDragStart = useCallback((e) => {
    if (!editing || !drRef.current.image) return
    e.preventDefault()
    imgDragRef.current = { sx: e.clientX, sy: e.clientY, ix: drRef.current.imgX ?? 50, iy: drRef.current.imgY ?? 50 }
    setIsImgDrag(true)
    const onMove = (ev) => {
      if (!imgDragRef.current) return
      const { sx, sy, ix, iy } = imgDragRef.current
      const rect = ref.current?.getBoundingClientRect()
      const sc = rect ? rect.width / CARD_W : 0.5
      setDr(d => ({
        ...d,
        imgX: Math.max(0, Math.min(100, ix - (ev.clientX - sx) / sc / CARD_W * 100)),
        imgY: Math.max(0, Math.min(100, iy - (ev.clientY - sy) / sc / CARD_H * 100)),
      }))
      setSaved(false)
    }
    const onEnd = () => {
      imgDragRef.current = null; setIsImgDrag(false)
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup',   onEnd)
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup',   onEnd)
  }, [editing])

  /* 추가 텍스트 블록 CRUD */
  const addExtraText = () => {
    const block = {
      id:          Math.random().toString(36).slice(2, 9),
      text:        '텍스트',
      x: 100, y:   180,
      fontSizeKey: 'md',
      fontSize:    EXTRA_FS.md,
      color:       dr.textColor || dr.fgColor || '#ffffff',
    }
    setDr(d => ({ ...d, extraTexts: [...(d.extraTexts || []), block] }))
    setSelectedExtraId(block.id)
    setEditingExtraId(block.id)  // 추가 즉시 텍스트 편집 모드
    setSaved(false)
  }

  const dragExtra = useCallback((id, x, y) => {
    setDr(d => ({ ...d, extraTexts: (d.extraTexts || []).map(b => b.id === id ? { ...b, x, y } : b) }))
    setSaved(false)
  }, [])

  const deleteExtra = useCallback((id) => {
    setDr(d => ({ ...d, extraTexts: (d.extraTexts || []).filter(b => b.id !== id) }))
    setSelectedExtraId(prev => prev === id ? null : prev)
    setEditingExtraId(prev => prev === id ? null : prev)
    setSaved(false)
  }, [])

  const startTextEdit = useCallback((id) => {
    setSelectedExtraId(id)
    setEditingExtraId(id)
  }, [])

  const endTextEdit = useCallback((id, text) => {
    setDr(d => ({ ...d, extraTexts: (d.extraTexts || []).map(b => b.id === id ? { ...b, text } : b) }))
    setEditingExtraId(null)
    setSaved(false)
  }, [])

  /* 추가 텍스트 블록 스타일 즉시 적용 */
  const updateExtraStyle = useCallback((id, key, val) => {
    setDr(d => ({
      ...d,
      extraTexts: (d.extraTexts || []).map(b => {
        if (b.id !== id) return b
        if (key === 'fontSizeKey') return { ...b, fontSizeKey: val, fontSize: EXTRA_FS[val] || 48 }
        return { ...b, [key]: val }
      }),
    }))
    setSaved(false)
  }, [])

  // 선택된 블록 데이터 (패널 표시용)
  const selectedBlock = selectedExtraId ? (dr.extraTexts || []).find(b => b.id === selectedExtraId) : null

  const dlDisabled  = dl || !saved
  const hasDragPos  = dr.textPosX !== null || dr.textPosY !== null
  const hasImgMoved = dr.image && (dr.imgX !== 50 || dr.imgY !== 50 || (dr.imgScale ?? 1) !== 1)
  const wrapCursor  = editing && dr.image ? (isImgDrag ? 'grabbing' : 'grab') : 'default'

  return (
    <div style={{ marginBottom: 20, borderRadius: 12, overflow: 'hidden', border: `2px solid ${editing ? '#3b82f6' : C.bd}`, transition: 'border-color .2s' }}>

      {/* ── 툴바 */}
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
                style={{ padding: '6px 14px', fontSize: 12, borderRadius: 7, border: 'none', background: '#3b82f6', color: '#fff', cursor: 'pointer', fontWeight: 700 }}>✎ 수정</button>
          }
          <button onClick={dlPNG} disabled={dlDisabled}
            title={!saved ? '수정 후 저장해야 다운로드 가능합니다' : 'PNG 저장'}
            style={{ padding: '5px 10px', fontSize: 11, borderRadius: 7, border: `1px solid ${dlDisabled ? C.bd : '#1d6b45'}`, background: dlDisabled ? C.alt : '#f0fdf4', color: dlDisabled ? C.fa : '#1d6b45', cursor: dlDisabled ? 'not-allowed' : 'pointer', fontWeight: dlDisabled ? 400 : 600 }}>
            {dl ? '변환 중…' : dlDisabled ? '저장 후 다운로드' : '↓ PNG'}
          </button>
        </div>
      </div>

      {/* ── 2단: 미리보기 + 사이드패널 */}
      <div style={{ display: 'flex', alignItems: 'stretch' }}>

        {/* 카드 미리보기 */}
        <div
          ref={wrapRef}
          onMouseDown={editing ? handleImgDragStart : undefined}
          onClick={editing ? clearExtraSelection : undefined}
          style={{ flex: 1, minWidth: 0, position: 'relative', background: '#e0ddd8', overflow: 'hidden', cursor: wrapCursor }}>
          <div style={{ paddingTop: '125%', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' }}>
              <div style={{ width: CARD_W, transformOrigin: 'top left', transform: `scale(${scale})` }}>
                <div ref={ref} data-card-img style={{ width: CARD_W, height: CARD_H, position: 'relative', overflow: 'hidden' }}>
                  <CardContent
                    card={dr} editing={editing}
                    textBlockRef={textBlockRef}
                    onDragStart={handleDragStart}
                    isDragging={isDragging}
                    onChangeText={(key, val) => change(key, val)}
                    onDragExtra={dragExtra}
                    onDeleteExtra={deleteExtra}
                    onSelectExtra={setSelectedExtraId}
                    onStartTextEdit={startTextEdit}
                    onEndTextEdit={endTextEdit}
                    selectedExtraId={selectedExtraId}
                    editingExtraId={editingExtraId}
                    cardRef={ref}
                  />
                </div>
              </div>
            </div>

            {/* 사진 없을 때 업로드 버튼 */}
            {editing && !dr.image && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, pointerEvents: 'none' }}>
                <UploadButton onClick={() => fileRef.current?.click()} />
              </div>
            )}

            {/* 사진 있을 때 교체/제거 */}
            {editing && dr.image && (
              <div style={{ position: 'absolute', top: 8, left: 8, display: 'flex', gap: 4, zIndex: 10 }}>
                <button onMouseDown={e => e.stopPropagation()} onClick={() => fileRef.current?.click()}
                  style={{ padding: '5px 10px', fontSize: 11, fontWeight: 700, background: 'rgba(0,0,0,0.65)', color: '#fff', border: 'none', borderRadius: 7, cursor: 'pointer' }}>
                  📷 교체
                </button>
                <button onMouseDown={e => e.stopPropagation()} onClick={() => change('image', null)}
                  style={{ padding: '5px 8px', fontSize: 11, background: 'rgba(220,38,38,0.75)', color: '#fff', border: 'none', borderRadius: 7, cursor: 'pointer', fontWeight: 700 }}>
                  ✕
                </button>
              </div>
            )}
          </div>

          {editing && (
            <div style={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', background: 'rgba(30,30,30,0.72)', color: '#fff', fontSize: 11, padding: '5px 12px', borderRadius: 20, pointerEvents: 'none', whiteSpace: 'nowrap' }}>
              {dr.image ? '⠿ 드래그: 텍스트/사진 이동  ·  휠: 사진 크기' : '⠿ 텍스트 드래그로 이동  ·  글자 클릭으로 수정'}
            </div>
          )}
        </div>

        {/* 사이드 패널 */}
        {(editing || showPanel) && (
          <div style={{ width: 220, minWidth: 220, borderLeft: `1px solid ${C.bd}`, background: '#F8FAFF', overflowY: 'auto' }}>
            <div style={{ padding: '14px 14px 20px' }}>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleImg} style={{ display: 'none' }} />

              {/* ━━ 선택된 추가 텍스트 블록 스타일 ━━ */}
              {selectedBlock ? (
                <div style={{ background: '#EFF6FF', border: '1.5px solid #93C5FD', borderRadius: 10, padding: '12px 12px 14px', marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#1D4ED8' }}>
                      {editingExtraId === selectedBlock.id ? '✎ 텍스트 편집 중' : '✎ 추가 텍스트 스타일'}
                    </span>
                    <button
                      onClick={() => clearExtraSelection()}
                      style={{ fontSize: 10, color: C.fa, background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px' }}>
                      ✕
                    </button>
                  </div>

                  {/* 글자 크기 */}
                  <p style={{ fontSize: 10, fontWeight: 700, color: '#3B82F6', margin: '0 0 5px', letterSpacing: '0.05em' }}>글자 크기</p>
                  <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
                    {[['sm', '작게'], ['md', '보통'], ['lg', '크게'], ['xl', '아주크게']].map(([v, l]) => {
                      const on = (selectedBlock.fontSizeKey || 'md') === v
                      return (
                        <button key={v} onClick={() => updateExtraStyle(selectedExtraId, 'fontSizeKey', v)}
                          style={{ flex: 1, padding: '6px 1px', fontSize: 9, borderRadius: 6, border: `1.5px solid ${on ? '#3b82f6' : C.bd}`, background: on ? '#DBEAFE' : C.sur, color: on ? '#1d4ed8' : C.mu, cursor: 'pointer', fontWeight: on ? 700 : 400 }}>
                          {l}
                        </button>
                      )
                    })}
                  </div>

                  {/* 글자색 */}
                  <p style={{ fontSize: 10, fontWeight: 700, color: '#3B82F6', margin: '0 0 5px', letterSpacing: '0.05em' }}>글자색</p>
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', alignItems: 'center' }}>
                    {[['#ffffff', '흰색', '#bbb'], ['#1a1a1a', '검정', '#1a1a1a'], ['#ffd700', '노랑', '#b8960c']].map(([v, l, border]) => {
                      const on = selectedBlock.color === v
                      return (
                        <button key={v} onClick={() => updateExtraStyle(selectedExtraId, 'color', v)}
                          style={{ padding: '5px 7px', fontSize: 10, borderRadius: 6, border: `2px solid ${on ? '#3b82f6' : border}`, background: v, color: v === '#ffffff' ? '#333' : '#fff', cursor: 'pointer', fontWeight: on ? 700 : 400, minWidth: 38 }}>
                          {l}
                        </button>
                      )
                    })}
                    <label style={{ display: 'flex', alignItems: 'center', gap: 3, cursor: 'pointer' }}>
                      <input type="color" value={selectedBlock.color || '#ffffff'}
                        onChange={e => updateExtraStyle(selectedExtraId, 'color', e.target.value)}
                        style={{ width: 26, height: 26, padding: 2, border: `1px solid ${C.bd}`, borderRadius: 5, cursor: 'pointer' }} />
                      <span style={{ fontSize: 10, color: C.fa }}>직접</span>
                    </label>
                  </div>

                  {editingExtraId !== selectedBlock.id && (
                    <p style={{ fontSize: 10, color: '#6B7280', margin: '10px 0 0', lineHeight: 1.5 }}>
                      블록을 더블클릭하면 텍스트를 수정할 수 있어요
                    </p>
                  )}
                </div>
              ) : (
                editing && (dr.extraTexts || []).length > 0 && (
                  <p style={{ fontSize: 10, color: C.fa, margin: '0 0 12px', padding: '8px 10px', background: C.alt, borderRadius: 7, border: `1px dashed ${C.bd}`, lineHeight: 1.6 }}>
                    추가된 텍스트를 클릭하면<br />여기서 스타일을 설정할 수 있어요
                  </p>
                )
              )}

              {/* ── 레이아웃 */}
              <SL>레이아웃</SL>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5, marginBottom: 14 }}>
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

              {/* ── 텍스트 위치 */}
              <SL>텍스트 위치</SL>
              <div style={{ display: 'flex', gap: 5, marginBottom: 6 }}>
                {[['top', '위'], ['center', '중앙'], ['bottom', '아래']].map(([v, l]) => {
                  const on = dr.textPosition === v
                  return (
                    <button key={v} onClick={() => changeMulti({ textPosition: v, textPosX: null, textPosY: null })}
                      style={{ flex: 1, padding: '7px', fontSize: 11, borderRadius: 7, border: `1.5px solid ${on ? '#3b82f6' : C.bd}`, background: on ? '#EFF6FF' : C.sur, color: on ? '#1d4ed8' : C.mu, cursor: 'pointer', fontWeight: on ? 700 : 400 }}>
                      {l}
                    </button>
                  )
                })}
              </div>
              {hasDragPos && (
                <button onClick={() => changeMulti({ textPosX: null, textPosY: null })}
                  style={{ width: '100%', padding: '5px', fontSize: 10, borderRadius: 6, border: `1px solid ${C.bd}`, background: C.sur, color: '#3b82f6', cursor: 'pointer', marginBottom: 4, fontWeight: 600 }}>
                  ↺ 텍스트 위치 초기화
                </button>
              )}
              {hasImgMoved && (
                <button onClick={() => changeMulti({ imgX: 50, imgY: 50, imgScale: 1 })}
                  style={{ width: '100%', padding: '5px', fontSize: 10, borderRadius: 6, border: `1px solid ${C.bd}`, background: C.sur, color: '#3b82f6', cursor: 'pointer', marginBottom: 4, fontWeight: 600 }}>
                  ↺ 사진 위치/크기 초기화
                </button>
              )}
              <div style={{ marginBottom: 12 }} />

              {/* ── 글자 크기 (카드 전체) */}
              <SL>카드 글자 크기</SL>
              <div style={{ display: 'flex', gap: 4, marginBottom: 14 }}>
                {[['sm', '작게'], ['md', '보통'], ['lg', '크게'], ['xl', '아주크게']].map(([v, l]) => {
                  const on = dr.fontSize === v
                  return (
                    <button key={v} onClick={() => change('fontSize', v)}
                      style={{ flex: 1, padding: '6px 1px', fontSize: 9, borderRadius: 6, border: `1.5px solid ${on ? '#3b82f6' : C.bd}`, background: on ? '#EFF6FF' : C.sur, color: on ? '#1d4ed8' : C.mu, cursor: 'pointer', fontWeight: on ? 700 : 400 }}>
                      {l}
                    </button>
                  )
                })}
              </div>

              {/* ── 글자색 (카드 전체) */}
              <SL>카드 글자색</SL>
              <div style={{ display: 'flex', gap: 5, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
                {[['#ffffff', '흰색', '#bbb'], ['#1a1a1a', '검정', '#1a1a1a'], ['#ffd700', '노랑', '#b8960c']].map(([v, l, border]) => {
                  const on = dr.textColor === v
                  return (
                    <button key={v} onClick={() => change('textColor', v)}
                      style={{ padding: '5px 8px', fontSize: 10, borderRadius: 6, border: `2px solid ${on ? '#3b82f6' : border}`, background: v, color: v === '#ffffff' ? '#333' : '#fff', cursor: 'pointer', fontWeight: on ? 700 : 400 }}>
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

              {/* ── 배경·포인트색 */}
              <SL>배경·포인트색</SL>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                {[['bgColor', '배경색'], ['accentColor', '포인트색']].map(([key, label]) => (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input type="color" value={dr[key]} onChange={e => change(key, e.target.value)}
                      style={{ width: 32, height: 32, padding: 2, border: `1px solid ${C.bd}`, borderRadius: 6, cursor: 'pointer', flexShrink: 0 }} />
                    <span style={{ fontSize: 11, color: C.mu }}>{label}</span>
                    <span style={{ fontSize: 10, color: C.fa, fontFamily: 'monospace', marginLeft: 'auto' }}>{dr[key]}</span>
                  </div>
                ))}
              </div>

              {/* ── 텍스트 추가 버튼 */}
              <div style={{ borderTop: `1px solid ${C.bd}`, paddingTop: 14 }}>
                <button onClick={addExtraText}
                  style={{ width: '100%', padding: '10px', fontSize: 12, fontWeight: 700, borderRadius: 8, border: '1.5px dashed #3b82f6', background: '#EFF6FF', color: '#1d4ed8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  + 텍스트 추가
                </button>
                {(dr.extraTexts || []).length > 0 && (
                  <p style={{ fontSize: 10, color: C.fa, margin: '7px 0 0', textAlign: 'center', lineHeight: 1.6 }}>
                    클릭: 선택  ·  더블클릭: 수정  ·  드래그: 이동
                  </p>
                )}
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ── 카드뉴스 전체 뷰 ────────────────────────────────────── */
export default function CardNewsView({ result, savedCards, onCardsChange }) {
  const [cards, setCards] = useState(() => savedCards ?? parseCardResult(result))
  const [dlAll, setDlAll] = useState(false)

  const cardsInit = useRef(false)
  useEffect(() => {
    if (!cardsInit.current) { cardsInit.current = true; return }
    onCardsChange?.(cards)
  }, [cards])

  const updateCard = useCallback((idx, newCard) => {
    setCards(prev => prev.map((c, i) => i === idx ? { ...newCard } : c))
  }, [])

  const dlAllPNG = async () => {
    setDlAll(true)
    const els = document.querySelectorAll('[data-card-img]')
    for (let i = 0; i < els.length; i++) {
      const el = els[i]
      const scaledEl = el.parentElement
      const origTx = scaledEl?.style.transform ?? ''
      try {
        if (scaledEl) scaledEl.style.transform = 'none'
        await capturePNG(el, `card_${i + 1}.png`)
      } catch (e) { console.error(e) }
      finally { if (scaledEl) scaledEl.style.transform = origTx }
      await new Promise(r => setTimeout(r, 600))
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
      {caption && <Blk title="캡션"    lines={caption.lines} />}
      {hashtag && <Blk title="해시태그" lines={hashtag.lines} />}
    </div>
  )
}
