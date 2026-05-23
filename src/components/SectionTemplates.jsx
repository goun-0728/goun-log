// src/components/SectionTemplates.jsx
import React, { useRef, useState, useEffect, useCallback } from 'react'

const CARD_W = 860

const SAMPLE_IMGS = [
  'https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=800',
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800',
  'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=800',
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800',
  'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
  'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800',
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
]

export const FONT_OPTS = [
  { l: '나눔고딕', v: "'Nanum Gothic', sans-serif" },
  { l: '나눔명조', v: "'Nanum Myeongjo', serif" },
  { l: '고딕A1',   v: "'Gothic A1', sans-serif" },
  { l: '도현',     v: "'Do Hyeon', sans-serif" },
  { l: '제주고딕', v: "'Jeju Gothic', sans-serif" },
  { l: '검은고딕', v: "'Black Han Sans', sans-serif" },
]

export const SHAPE_DEFS = [
  { k: 'circle',   l: '원형' },
  { k: 'square',   l: '네모' },
  { k: 'triangle', l: '삼각형' },
  { k: 'pentagon', l: '오각형' },
  { k: 'hexagon',  l: '육각형' },
]

function shapeCSS(k) {
  if (k === 'square')   return { borderRadius: 10 }
  if (k === 'triangle') return { borderRadius: 0, clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }
  if (k === 'pentagon') return { borderRadius: 0, clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)' }
  if (k === 'hexagon')  return { borderRadius: 0, clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' }
  return { borderRadius: '50%' }
}

// 그라데이션 CSS 생성 헬퍼
export function mkGrad(dir, alpha) {
  const a = (alpha ?? 70) / 100
  if (!dir || dir === 'none') return null
  if (dir === 'bottom') return `linear-gradient(to top, rgba(0,0,0,${a}) 0%, transparent 60%)`
  if (dir === 'top')    return `linear-gradient(to bottom, rgba(0,0,0,${a}) 0%, transparent 60%)`
  if (dir === 'full')   return `rgba(0,0,0,${(a * 0.55).toFixed(2)})`
  return null
}

const ROMAN = ['Ⅰ','Ⅱ','Ⅲ','Ⅳ','Ⅴ','Ⅵ','Ⅶ','Ⅷ','Ⅸ','Ⅹ']

/* ── ImageAdjust: 이미지 드래그+휠 조작 ── */
export function ImageAdjust({ url, editing, imgMeta, onMetaChange, fixedH, fitMode = 'cover' }) {
  const [dragging, setDragging] = useState(false)
  const [start, setStart]       = useState({ x: 0, y: 0 })
  const meta    = imgMeta || { scale: 1, x: 0, y: 0 }
  const divRef  = useRef(null)
  const snapRef = useRef(null)
  snapRef.current = { editing, meta, onMetaChange }

  const handleMouseDown = e => {
    if (!editing) return
    setDragging(true)
    setStart({ x: e.clientX - meta.x, y: e.clientY - meta.y })
    e.preventDefault()
  }
  const handleMouseMove = e => { if (!dragging) return; onMetaChange({ ...meta, x: e.clientX - start.x, y: e.clientY - start.y }) }
  const handleMouseUp   = () => setDragging(false)

  useEffect(() => {
    const el = divRef.current; if (!el) return
    const handler = e => {
      const { editing, meta, onMetaChange } = snapRef.current
      if (!editing) return
      e.preventDefault()
      onMetaChange({ ...meta, scale: Math.max(0.5, Math.min(4, meta.scale + (e.deltaY > 0 ? -0.05 : 0.05))) })
    }
    el.addEventListener('wheel', handler, { passive: false })
    return () => el.removeEventListener('wheel', handler)
  }, [])

  return (
    <div ref={divRef} style={{ position: 'relative', overflow: 'hidden', ...(fixedH ? { height: fixedH } : {}) }}
      onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
      <img src={url} alt="" draggable={false}
        style={{ width: '100%', height: fixedH ? '100%' : 'auto', display: 'block', userSelect: 'none',
          objectFit: fixedH ? fitMode : 'initial',
          transform: `scale(${meta.scale}) translate(${meta.x / meta.scale}px, ${meta.y / meta.scale}px)`,
          transformOrigin: 'center center',
          cursor: editing ? (dragging ? 'grabbing' : 'grab') : 'default',
          transition: dragging ? 'none' : 'transform 0.1s' }}
        onMouseDown={handleMouseDown} />
    </div>
  )
}

/* ── ImgBox: 이미지 슬롯 (업로드 + ImageAdjust 통합) ── */
export function ImgBox({ url, t, editing, onImgChange, minH = 320, imgMeta, onMetaChange, fixedH, fitMode }) {
  const ref = useRef(null)
  const sampleRef = useRef(SAMPLE_IMGS[Math.floor(Math.random() * SAMPLE_IMGS.length)])
  const handleFile = e => {
    const f = e.target.files[0]; if (!f || !onImgChange) return
    const fr = new FileReader()
    fr.onload = ev => onImgChange(ev.target.result)
    fr.readAsDataURL(f); e.target.value = ''
  }
  if (!url) return null
  if (url === 'slot') return (
    <div style={{ position:'relative', aspectRatio: '3/4', overflow:'hidden' }}>
      <input ref={ref} type="file" accept="image/*" onChange={handleFile} style={{ display:'none' }} />
      <img
        src={sampleRef.current}
        alt=""
        crossOrigin="anonymous"
        style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}
      />
      <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.08)' }}>
        <div style={{ position:'absolute', top:12, left:0, right:0, textAlign:'center', padding:'6px 12px' }}>
          <span style={{ fontSize:11, fontWeight:700, color:'#fff', background:'rgba(0,0,0,0.55)', padding:'4px 12px', borderRadius:20, letterSpacing:'0.02em' }}>
            📷 판매 제품 사진으로 교체해주세요
          </span>
        </div>
        <div onClick={e => { e.stopPropagation(); ref.current?.click() }}
          style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:10,
            cursor:'pointer', background:'rgba(255,255,255,0.9)', padding:'20px 32px',
            borderRadius:16, boxShadow:'0 4px 20px rgba(0,0,0,0.2)', backdropFilter:'blur(4px)' }}>
          <span style={{ fontSize:36 }}>📷</span>
          <span style={{ fontSize:13, fontWeight:700, color:'#111' }}>클릭해서 사진 교체</span>
        </div>
      </div>
    </div>
  )
  return (
    <div style={{ position: 'relative' }}>
      <input ref={ref} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
      {editing && (
        <button onClick={e => { e.stopPropagation(); ref.current?.click() }}
          style={{ position: 'absolute', top: 10, left: 10, zIndex: 10, padding: '8px 18px', fontSize: 13, fontWeight: 700, background: 'rgba(0,0,0,0.65)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
          📷 교체
        </button>
      )}
      <ImageAdjust url={url} editing={editing} imgMeta={imgMeta} onMetaChange={onMetaChange || (() => {})} fixedH={fixedH} fitMode={fitMode} />
      {editing && <div style={{ position: 'absolute', inset: 0, border: `2px dashed ${t?.bd || '#ccc'}`, pointerEvents: 'none', zIndex: 5 }} />}
    </div>
  )
}

/* ── 텍스트 스타일 읽기 helper ── */
function getTS(s, field, def = {}) {
  const stored = s.textStyles?.[field] || {}
  return {
    fontSize:      stored.fontSize      ?? def.fontSize      ?? 18,
    color:         stored.color         ?? def.color         ?? '#111',
    fontFamily:    stored.fontFamily    ?? def.fontFamily    ?? "'Nanum Gothic', sans-serif",
    fontWeight:    stored.bold ? 700 : (def.fontWeight ?? 400),
    lineHeight:    def.lineHeight    || 1.6,
    letterSpacing: def.letterSpacing || 'normal',
    wordBreak: 'keep-all',
    whiteSpace: 'pre-wrap',
  }
}

/* ── ET: 클릭하면 인라인 편집 + placeholder + 모서리 리사이즈 핸들 ── */
function ET({ s, field, editing, onChange, onFocus, def = {}, style: extra = {}, placeholder = '' }) {
  const st  = { ...getTS(s, field, def), ...extra }
  const val = s[field] || ''
  const [hovered,  setHovered]  = useState(false)
  const [resizing, setResizing] = useState(false)
  const [focused,  setFocused]  = useState(false)
  const rsRef = useRef(null)

  useEffect(() => {
    if (!resizing) return
    const onMove = e => {
      const { startX, startY, startSize, snapStyles, corner } = rsRef.current
      const dx = e.clientX - startX
      const dy = e.clientY - startY
      const delta = corner === 'se' ? (dx + dy) / 4 : corner === 'nw' ? (-dx - dy) / 4 : corner === 'ne' ? (dx - dy) / 4 : (-dx + dy) / 4
      const newSize = Math.max(10, Math.min(120, Math.round(startSize + delta)))
      onChange('textStyles', { ...snapStyles, [field]: { ...(snapStyles[field] || {}), fontSize: newSize } })
    }
    const onUp = () => setResizing(false)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [resizing]) // eslint-disable-line

  if (!editing) {
    const display = val || placeholder
    if (!display) return null
    return <div style={{ ...st, opacity: val ? 1 : 0.35 }}>{display}</div>
  }
  const showPH = !!placeholder && !val && !focused
  return (
    <div
      style={{ position: 'relative', display: extra.display || 'block' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {showPH && (
        <div style={{ ...st, display: undefined, opacity: 0.32, position: 'absolute', top: 0, left: 0, right: 0, pointerEvents: 'none', zIndex: 1 }}>
          {placeholder}
        </div>
      )}
      <div contentEditable suppressContentEditableWarning
        onFocus={e => { setFocused(true); onFocus?.(field) }}
        onBlur={e => { setFocused(false); onChange(field, e.currentTarget.innerText) }}
        style={{ ...st, display: undefined, outline: 'none', borderBottom: '1.5px dashed rgba(59,130,246,0.55)', minHeight: 20, cursor: 'text', position: 'relative', zIndex: 2 }}
        dangerouslySetInnerHTML={{ __html: val }}
      />
      {(hovered || resizing) && [
        ['nw', { top: -5, left: -5 }, 'nw-resize'],
        ['ne', { top: -5, right: -5 }, 'ne-resize'],
        ['sw', { bottom: -5, left: -5 }, 'sw-resize'],
        ['se', { bottom: -5, right: -5 }, 'se-resize'],
      ].map(([corner, pos, cur]) => (
        <div key={corner}
          style={{ position:'absolute', ...pos, width:10, height:10, borderRadius:2, background:'#3b82f6', cursor:cur, zIndex:30, border:'1.5px solid #fff', boxShadow:'0 1px 4px rgba(0,0,0,0.25)' }}
          onMouseDown={e => {
            e.preventDefault(); e.stopPropagation()
            rsRef.current = { startX: e.clientX, startY: e.clientY, startSize: st.fontSize, snapStyles: s.textStyles || {}, corner }
            setResizing(true)
          }}
        />
      ))}
    </div>
  )
}

/* ── DragET: 이미지 위 절대좌표 드래그 가능 텍스트 ── */
function DragET({ s, field, editing, onChange, onFocus, def = {}, placeholder = '' }) {
  const stored  = s.textStyles?.[field] || {}
  const xp      = stored.x ?? def.x ?? 6
  const yp      = stored.y ?? def.y ?? 60
  const st      = getTS(s, field, def)
  const val     = s[field] || ''
  const dragRef = useRef(null)
  const [dragging,  setDragging]  = useState(false)
  const [hdHovered, setHdHovered] = useState(false)
  const [resizing,  setResizing]  = useState(false)
  const startRef = useRef(null)
  const rsRef    = useRef(null)

  useEffect(() => {
    if (!resizing) return
    const onMove = e => {
      const { startX, startY, startSize, snapStyles, corner } = rsRef.current
      const dx = e.clientX - startX
      const dy = e.clientY - startY
      const delta = corner === 'se' ? (dx + dy) / 4 : corner === 'nw' ? (-dx - dy) / 4 : corner === 'ne' ? (dx - dy) / 4 : (-dx + dy) / 4
      const newSize = Math.max(10, Math.min(120, Math.round(startSize + delta)))
      onChange('textStyles', { ...snapStyles, [field]: { ...(snapStyles[field] || {}), fontSize: newSize } })
    }
    const onUp = () => setResizing(false)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [resizing]) // eslint-disable-line

  const setPos = useCallback((x, y) => {
    onChange('textStyles', {
      ...(s.textStyles || {}),
      [field]: { ...(s.textStyles?.[field] || {}), x: Math.max(0, Math.min(88, x)), y: Math.max(0, Math.min(92, y)) }
    })
  }, [s.textStyles, field, onChange])

  useEffect(() => {
    if (!dragging) return
    const onMove = e => {
      const container = dragRef.current?.parentElement
      if (!container || !startRef.current) return
      const rect = container.getBoundingClientRect()
      const { mx, my, ox, oy } = startRef.current
      setPos(ox + (e.clientX - mx) / rect.width * 100, oy + (e.clientY - my) / rect.height * 100)
    }
    const onUp = () => setDragging(false)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [dragging, setPos])

  const onMD = e => {
    if (!editing || e.target.getAttribute('contenteditable') === 'true') return
    startRef.current = { mx: e.clientX, my: e.clientY, ox: xp, oy: yp }
    setDragging(true)
    e.preventDefault()
  }

  return (
    <div ref={dragRef}
      style={{ position: 'absolute', left: `${xp}%`, top: `${yp}%`, zIndex: 5, maxWidth: '82%',
        cursor: editing ? (dragging ? 'grabbing' : 'grab') : 'default',
        padding: editing ? '4px 8px' : 0,
        outline: editing ? '1px dashed rgba(255,255,255,0.45)' : 'none' }}
      onMouseDown={onMD}
      onClick={() => editing && onFocus?.(field)}
      onMouseEnter={() => setHdHovered(true)}
      onMouseLeave={() => setHdHovered(false)}
    >
      {editing
        ? <>
            {!val && !!placeholder && (
              <div style={{ ...st, opacity: 0.38, pointerEvents: 'none', textShadow: '0 2px 14px rgba(0,0,0,0.9)' }}>{placeholder}</div>
            )}
            <div contentEditable suppressContentEditableWarning
              onFocus={() => onFocus?.(field)}
              onBlur={e => onChange(field, e.currentTarget.innerText)}
              style={{ ...st, outline: 'none', cursor: 'text', textShadow: '0 2px 14px rgba(0,0,0,0.9)', position: 'relative' }}
              dangerouslySetInnerHTML={{ __html: val }}
            />
          </>
        : <div style={{ ...st, textShadow: '0 2px 14px rgba(0,0,0,0.9)' }}>{val}</div>
      }
      {editing && (hdHovered || resizing) && [
        ['nw', { top: -5, left: -5 }, 'nw-resize'],
        ['ne', { top: -5, right: -5 }, 'ne-resize'],
        ['sw', { bottom: -5, left: -5 }, 'sw-resize'],
        ['se', { bottom: -5, right: -5 }, 'se-resize'],
      ].map(([corner, pos, cur]) => (
        <div key={corner}
          style={{ position:'absolute', ...pos, width:10, height:10, borderRadius:2, background:'#3b82f6', cursor:cur, zIndex:30, border:'1.5px solid #fff', boxShadow:'0 1px 4px rgba(0,0,0,0.25)' }}
          onMouseDown={e => {
            e.preventDefault(); e.stopPropagation()
            rsRef.current = { startX: e.clientX, startY: e.clientY, startSize: st.fontSize, snapStyles: s.textStyles || {}, corner }
            setResizing(true)
          }}
        />
      ))}
    </div>
  )
}

/* ── PointInput: 포인트 항목 textarea ── */
function PointInput({ value, onChange }) {
  return (
    <textarea value={value} onChange={e => onChange(e.target.value)}
      rows={Math.max(2, (value || '').split('\n').length)}
      style={{ flex: 1, fontSize: 14, border: '1px solid #3b82f6', borderRadius: 6, padding: '7px 10px', outline: 'none', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6, width: '100%' }}
    />
  )
}

const delBtnInline   = { width: 26, height: 26, borderRadius: 6, border: '1px solid #fca5a5', background: '#fef2f2', color: '#ef4444', fontSize: 14, cursor: 'pointer', flexShrink: 0, fontWeight: 700, lineHeight: 1 }
const delBtnAbsolute = { position: 'absolute', top: 8, right: 8, width: 22, height: 22, borderRadius: '50%', border: '1px solid #fca5a5', background: '#fef2f2', color: '#ef4444', fontSize: 12, cursor: 'pointer', fontWeight: 700, lineHeight: 1, zIndex: 2 }
const addBtnStyle    = { padding: '12px 32px', fontSize: 13, fontWeight: 600, border: '1.5px dashed #bbb', borderRadius: 8, background: 'transparent', color: '#888', cursor: 'pointer' }

/* ══════════════════════════════════════════════════
   1. 풀이미지형 (fullHero)
   전체 배경 이미지 + 그라데이션 + 드래그 텍스트
══════════════════════════════════════════════════ */
export function TplFullHero({ s, img, t, editing, onChange, secMeta, onSecMeta, onFieldFocus }) {
  const imgNode = img || (editing ? 'slot' : null)
  return (
    <div style={{ width: CARD_W, background: t.bg, overflow: 'hidden' }}>
      <div style={{ position: 'relative', height: 1529 }}>
        {imgNode
          ? <ImgBox url={imgNode} t={t} editing={editing} onImgChange={v => onChange('secImg', v)}
              imgMeta={secMeta?.img1} onMetaChange={m => onSecMeta?.('img1', m)} fixedH={1529} fitMode="cover" />
          : <div style={{ height: 720, background: `linear-gradient(135deg, ${t.ac}66 0%, ${t.bg} 100%)` }} />
        }
        {/* 그라데이션 오버레이 */}
        <div style={{ position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0) 20%, rgba(0,0,0,0.55) 65%, rgba(0,0,0,0.88) 100%)',
          pointerEvents: 'none' }} />
        {/* 드래그 가능한 텍스트들 */}
        {(s.badge || editing) && (
          <DragET s={s} field="badge" editing={editing} onChange={onChange} onFocus={onFieldFocus}
            def={{ x: 74, y: 3, fontSize: 12, color: '#fff', fontWeight: 700, letterSpacing: '0.15em' }}
            placeholder="BADGE" />
        )}
        <DragET s={s} field="subCopy" editing={editing} onChange={onChange} onFocus={onFieldFocus}
          def={{ x: 6, y: 58, fontSize: 28, color: 'rgba(255,255,255,0.88)', lineHeight: 1.5 }}
          placeholder="서브 제목" />
        <DragET s={s} field="mainCopy" editing={editing} onChange={onChange} onFocus={onFieldFocus}
          def={{ x: 6, y: 68, fontSize: 54, color: '#fff', fontWeight: 900, lineHeight: 1.18, letterSpacing: '-0.025em' }}
          placeholder="메인 제목" />
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════
   2. 상하분할형 (topBottom)
   상단 배경색+텍스트 / 하단 이미지
══════════════════════════════════════════════════ */
export function TplTopBottom({ s, img, t, editing, onChange, secMeta, onSecMeta, onFieldFocus }) {
  const imgNode = img || (editing ? 'slot' : null)
  return (
    <div style={{ width: CARD_W, background: t.bg }}>
      {/* 상단: 텍스트 */}
      <div style={{ background: t.bg, minHeight: 360, padding: '72px 80px 64px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {(s.description || editing) && (
          <div style={{ marginBottom: 18 }}>
            <ET s={s} field="description" editing={editing} onChange={onChange} onFocus={onFieldFocus}
              def={{ fontSize: 11, color: t.ac, fontWeight: 800, letterSpacing: '0.28em' }}
              style={{ textTransform: 'uppercase', display: 'inline-block' }}
              placeholder="카테고리" />
          </div>
        )}
        <div style={{ marginBottom: 20 }}>
          <ET s={s} field="mainCopy" editing={editing} onChange={onChange} onFocus={onFieldFocus}
            def={{ fontSize: 48, color: t.fg, fontWeight: 900, lineHeight: 1.22, letterSpacing: '-0.025em' }}
            placeholder="메인 제목" />
        </div>
        <ET s={s} field="subCopy" editing={editing} onChange={onChange} onFocus={onFieldFocus}
          def={{ fontSize: 28, color: t.fg, lineHeight: 1.62 }}
          style={{ opacity: 0.73, maxWidth: 540 }}
          placeholder="서브 제목" />
      </div>
      {/* 하단: 이미지 */}
      <div style={{ minHeight: 360 }}>
        {imgNode
          ? <ImgBox url={imgNode} t={t} editing={editing} onImgChange={v => onChange('secImg', v)}
              imgMeta={secMeta?.img1} onMetaChange={m => onSecMeta?.('img1', m)} minH={360} />
          : <div style={{ height: 360, background: t.sub, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 48, opacity: 0.15 }}>📷</span>
            </div>
        }
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════
   3. 좌우분할형 (leftRight)
   좌: 이미지 / 우: 배경색+텍스트 (좌우반전 옵션)
══════════════════════════════════════════════════ */
export function TplLeftRight({ s, img, t, editing, onChange, secMeta, onSecMeta, onFieldFocus }) {
  const imgNode = img || (editing ? 'slot' : null)
  const pts = s.points || []
  const displayPts = editing ? (pts.length ? pts : ['']) : pts.filter(p => p && p.trim())
  const addPt = () => onChange('points', [...pts, ''])
  const delPt = i => onChange('points', pts.filter((_, j) => j !== i))
  const flipped = s.flipped || false

  const imgPanel = (
    <div style={{ flex: 1, overflow: 'hidden', minHeight: 520 }}>
      {imgNode
        ? <ImgBox url={imgNode} t={t} editing={editing} onImgChange={v => onChange('secImg', v)}
            imgMeta={secMeta?.img1} onMetaChange={m => onSecMeta?.('img1', m)} fixedH={520} fitMode="cover" />
        : <div style={{ height: 520, background: t.sub, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 48, opacity: 0.15 }}>📷</span>
          </div>
      }
    </div>
  )

  const txtPanel = (
    <div style={{ flex: 1, background: t.bg, padding: '60px 52px', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 520 }}>
      {(s.description || editing) && (
        <div style={{ marginBottom: 16 }}>
          <ET s={s} field="description" editing={editing} onChange={onChange} onFocus={onFieldFocus}
            def={{ fontSize: 11, color: t.ac, fontWeight: 800, letterSpacing: '0.28em' }}
            style={{ textTransform: 'uppercase' }}
            placeholder="카테고리" />
        </div>
      )}
      <div style={{ marginBottom: 16 }}>
        <ET s={s} field="mainCopy" editing={editing} onChange={onChange} onFocus={onFieldFocus}
          def={{ fontSize: 48, color: t.fg, fontWeight: 900, lineHeight: 1.22, letterSpacing: '-0.025em' }}
          placeholder="메인 제목" />
      </div>
      <div style={{ marginBottom: 28 }}>
        <ET s={s} field="subCopy" editing={editing} onChange={onChange} onFocus={onFieldFocus}
          def={{ fontSize: 28, color: t.fg, lineHeight: 1.55 }}
          style={{ opacity: 0.7 }}
          placeholder="서브 제목" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {displayPts.map((p, i) => (
          <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '13px 0', borderBottom: `1px solid ${t.bd}` }}>
            <div style={{ width: 26, height: 26, borderRadius: '50%', background: t.ac, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
              <span style={{ fontSize: 12, color: '#fff', fontWeight: 800 }}>✓</span>
            </div>
            {editing
              ? <PointInput value={p} onChange={v => { const n = [...pts]; n[i] = v; onChange('points', n) }} />
              : <span style={{ fontSize: 15, color: t.fg, lineHeight: 1.72, opacity: 0.85, whiteSpace: 'pre-wrap' }}>{p}</span>
            }
            {editing && <button onClick={() => delPt(i)} style={delBtnInline}>×</button>}
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div style={{ width: CARD_W, display: 'flex', overflow: 'hidden' }}>
      {flipped ? <>{txtPanel}{imgPanel}</> : <>{imgPanel}{txtPanel}</>}
    </div>
  )
}

/* ══════════════════════════════════════════════════
   4. 포인트3단형 (points3icon)
   상단 이미지 + 타이틀 + 3단 아이콘 카드
   아이콘 모양 변경 가능
══════════════════════════════════════════════════ */
export function TplPoints3Icon({ s, img, t, editing, onChange, secMeta, onSecMeta, onFieldFocus }) {
  const imgNode = img || (editing ? 'slot' : null)
  const pts = s.points || []
  const displayPts = pts.length ? pts : (editing ? ['', '', ''] : [])
  const cols = Math.max(1, Math.min(displayPts.length || 1, 3))
  const addPt = () => onChange('points', [...pts, ''])
  const delPt = i => onChange('points', pts.filter((_, j) => j !== i))
  const shape = s.pointShape || 'circle'

  return (
    <div style={{ width: CARD_W, background: t.bg }}>
      {imgNode
        ? <ImgBox url={imgNode} t={t} editing={editing} onImgChange={v => onChange('secImg', v)}
            imgMeta={secMeta?.img1} onMetaChange={m => onSecMeta?.('img1', m)} minH={380} />
        : <div style={{ height: 280, background: t.sub, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 48, opacity: 0.12 }}>📷</span>
          </div>
      }
      <div style={{ padding: '60px 64px 28px', textAlign: 'center' }}>
        <div style={{ marginBottom: 14 }}>
          <ET s={s} field="mainCopy" editing={editing} onChange={onChange} onFocus={onFieldFocus}
            def={{ fontSize: 48, color: t.fg, fontWeight: 900, lineHeight: 1.22, letterSpacing: '-0.025em' }}
            placeholder="메인 제목" />
        </div>
        <ET s={s} field="subCopy" editing={editing} onChange={onChange} onFocus={onFieldFocus}
          def={{ fontSize: 28, color: t.fg, lineHeight: 1.55 }}
          style={{ opacity: 0.62 }}
          placeholder="서브 제목" />
      </div>
      <div style={{ padding: '20px 48px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 24 }}>
          {displayPts.map((p, i) => {
            const lines = p.split('\n')
            const title = lines[0]?.trim() || `포인트 ${i + 1}`
            const desc  = lines.slice(1).join('\n').trim()
            return (
              <div key={i} style={{ position: 'relative', textAlign: 'center', background: t.sub, borderRadius: 20, padding: '44px 24px 40px' }}>
                {editing && <button onClick={() => delPt(i)} style={delBtnAbsolute}>×</button>}
                <div style={{ width: 80, height: 80, background: t.ac, margin: '0 auto 24px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', ...shapeCSS(shape) }}>
                  <span style={{ fontSize: 30, fontWeight: 700, color: '#fff' }}>{ROMAN[i % ROMAN.length]}</span>
                </div>
                {editing
                  ? <PointInput value={p} onChange={v => { const n = [...pts]; n[i] = v; onChange('points', n) }} />
                  : <>
                      <p style={{ fontSize: 18, fontWeight: 800, color: t.fg, margin: '0 0 10px', lineHeight: 1.3, wordBreak: 'keep-all' }}>{title}</p>
                      {desc && <p style={{ fontSize: 14, color: t.fg, opacity: 0.6, margin: 0, lineHeight: 1.68, whiteSpace: 'pre-wrap' }}>{desc}</p>}
                    </>
                }
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════
   5. 스토리형 (story)
   배경색 전체 + 큰 타이틀 + 서술형 텍스트 + 이미지/인용구
══════════════════════════════════════════════════ */
export function TplStory({ s, img, t, editing, onChange, secMeta, onSecMeta, onFieldFocus }) {
  const imgNode = img || (editing ? 'slot' : null)
  const isQuote = s.storyMode === 'quote'

  return (
    <div style={{ width: CARD_W, background: t.bg }}>
      <div style={{ padding: '80px 80px 56px' }}>
        <div style={{ marginBottom: 32 }}>
          <ET s={s} field="mainCopy" editing={editing} onChange={onChange} onFocus={onFieldFocus}
            def={{ fontSize: 48, color: t.fg, fontWeight: 900, lineHeight: 1.22, letterSpacing: '-0.028em' }}
            placeholder="메인 제목" />
        </div>
        <div style={{ marginBottom: 40 }}>
          <ET s={s} field="subCopy" editing={editing} onChange={onChange} onFocus={onFieldFocus}
            def={{ fontSize: 28, color: t.fg, lineHeight: 1.6 }}
            style={{ opacity: 0.78 }}
            placeholder="서브 제목" />
        </div>
        {(s.description || editing) && (
          <ET s={s} field="description" editing={editing} onChange={onChange} onFocus={onFieldFocus}
            def={{ fontSize: 20, color: t.fg, lineHeight: 1.88 }}
            style={{ opacity: 0.58 }}
            placeholder="본문 내용" />
        )}
      </div>

      {/* 하단: 이미지 또는 인용구 */}
      {!isQuote && imgNode && (
        <div style={{ margin: '0 80px 80px', borderRadius: 16, overflow: 'hidden' }}>
          <ImgBox url={imgNode} t={t} editing={editing} onImgChange={v => onChange('secImg', v)}
            imgMeta={secMeta?.img1} onMetaChange={m => onSecMeta?.('img1', m)} minH={260} />
        </div>
      )}

      {isQuote && s.points?.[0] && (
        <div style={{ margin: '0 80px 80px', padding: '30px 40px', background: t.sub, borderLeft: `4px solid ${t.ac}`, borderRadius: '0 12px 12px 0' }}>
          <span style={{ fontSize: 19, fontStyle: 'italic', color: t.fg, lineHeight: 1.76, opacity: 0.85 }}>"{s.points[0]}"</span>
        </div>
      )}

      {editing && (
        <div style={{ padding: '0 80px 32px', display: 'flex', gap: 8 }}>
          <button onClick={() => onChange('storyMode', isQuote ? 'image' : 'quote')}
            style={{ padding: '8px 14px', fontSize: 11, borderRadius: 7, border: '1px solid #3b82f6', background: '#EFF6FF', color: '#1d4ed8', cursor: 'pointer', fontWeight: 600 }}>
            {isQuote ? '📷 이미지로 전환' : '💬 인용구로 전환'}
          </button>
          {isQuote && (
            <input value={s.points?.[0] || ''} onChange={e => onChange('points', [e.target.value])}
              placeholder="인용구 입력..."
              style={{ flex: 1, padding: '8px 12px', fontSize: 14, border: '1px solid #3b82f6', borderRadius: 7, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
          )}
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════
   6. 활용법형 (howTo)
   로고/제목 + 큰 이미지 + 번호 리스트
══════════════════════════════════════════════════ */
export function TplHowTo({ s, img, t, editing, onChange, secMeta, onSecMeta, onFieldFocus }) {
  const imgNode = img || (editing ? 'slot' : null)
  const pts = s.points || []
  const displayPts = editing ? (pts.length ? pts : ['', '', '']) : pts.filter(p => p && p.trim())
  const addPt = () => onChange('points', [...pts, ''])
  const delPt = i => onChange('points', pts.filter((_, j) => j !== i))

  return (
    <div style={{ width: CARD_W, background: t.bg }}>
      {/* 로고/제목 헤더 — 대비색 박스 배경 */}
      <div style={{ padding: '56px 72px 48px', textAlign: 'center', background: t.fg }}>
        {(s.description || editing) && (
          <div style={{ marginBottom: 14 }}>
            <ET s={s} field="description" editing={editing} onChange={onChange} onFocus={onFieldFocus}
              def={{ fontSize: 11, color: t.ac, fontWeight: 800, letterSpacing: '0.3em' }}
              style={{ textTransform: 'uppercase', display: 'inline-block' }}
              placeholder="카테고리" />
          </div>
        )}
        <ET s={s} field="mainCopy" editing={editing} onChange={onChange} onFocus={onFieldFocus}
          def={{ fontSize: 48, color: t.bg, fontWeight: 900, lineHeight: 1.22, letterSpacing: '-0.025em' }}
          placeholder="메인 제목" />
      </div>

      {/* 큰 이미지 */}
      {imgNode && (
        <ImgBox url={imgNode} t={t} editing={editing} onImgChange={v => onChange('secImg', v)}
          imgMeta={secMeta?.img1} onMetaChange={m => onSecMeta?.('img1', m)} minH={420} />
      )}

      {/* 서브타이틀 */}
      {(s.subCopy || editing) && (
        <div style={{ padding: '40px 72px 20px' }}>
          <ET s={s} field="subCopy" editing={editing} onChange={onChange} onFocus={onFieldFocus}
            def={{ fontSize: 28, color: t.fg, fontWeight: 700, lineHeight: 1.4, letterSpacing: '-0.01em' }}
            placeholder="서브 제목" />
        </div>
      )}

      {/* 항목 리스트 */}
      <div style={{ padding: '8px 72px 80px' }}>
        {displayPts.map((p, i) => {
          const lines = p.split('\n')
          return (
            <div key={i} style={{ display: 'flex', gap: 20, alignItems: 'flex-start', padding: '22px 0', borderBottom: `1px solid ${t.bd}` }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: t.ac,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>{i + 1}</span>
              </div>
              <div style={{ flex: 1, paddingTop: 4 }}>
                {editing
                  ? <PointInput value={p} onChange={v => { const n = [...pts]; n[i] = v; onChange('points', n) }} />
                  : <>
                      <div style={{ fontSize: 17, fontWeight: 700, color: t.fg, lineHeight: 1.4, marginBottom: 5, wordBreak: 'keep-all' }}>{lines[0]}</div>
                      {lines.slice(1).join('\n') && <div style={{ fontSize: 14, color: t.fg, opacity: 0.6, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{lines.slice(1).join('\n')}</div>}
                    </>
                }
              </div>
              {editing && <button onClick={() => delPt(i)} style={delBtnInline}>×</button>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════
   7. 비교형 (compare)
   타이틀 + 좌우 비교표 + 제품 이미지
══════════════════════════════════════════════════ */
export function TplCompare({ s, img, t, editing, onChange, secMeta, onSecMeta, onFieldFocus }) {
  const imgNode = img || (editing ? 'slot' : null)
  const pts = s.points || []
  const displayPts = pts.length ? pts : (editing ? ['', '', ''] : [])
  const addPt = () => onChange('points', [...pts, ''])
  const delPt = i => onChange('points', pts.filter((_, j) => j !== i))

  return (
    <div style={{ width: CARD_W, background: t.bg }}>
      {/* 타이틀 */}
      <div style={{ padding: '64px 64px 48px', textAlign: 'center' }}>
        <div style={{ marginBottom: 16 }}>
          <ET s={s} field="mainCopy" editing={editing} onChange={onChange} onFocus={onFieldFocus}
            def={{ fontSize: 48, color: t.fg, fontWeight: 900, lineHeight: 1.22, letterSpacing: '-0.025em' }}
            placeholder="메인 제목" />
        </div>
        <ET s={s} field="subCopy" editing={editing} onChange={onChange} onFocus={onFieldFocus}
          def={{ fontSize: 28, color: t.fg, lineHeight: 1.55 }}
          style={{ opacity: 0.62 }}
          placeholder="서브 제목" />
      </div>

      {/* 비교표 */}
      <div style={{ padding: '0 52px 52px' }}>
        <div style={{ border: `2.5px solid ${t.ac}`, borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
            <div style={{ padding: '20px 28px', textAlign: 'center', background: '#f5f4f0', borderRight: `2.5px solid ${t.ac}` }}>
              <ET s={s} field="compareLeft" editing={editing} onChange={onChange} onFocus={onFieldFocus}
                def={{ fontSize: 15, color: '#999', fontWeight: 700 }}
                style={{ textAlign: 'center' }} />
            </div>
            <div style={{ padding: '20px 28px', textAlign: 'center', background: t.ac }}>
              <ET s={s} field="compareRight" editing={editing} onChange={onChange} onFocus={onFieldFocus}
                def={{ fontSize: 15, color: '#fff', fontWeight: 800 }}
                style={{ textAlign: 'center' }} />
            </div>
          </div>
          {displayPts.map((p, i) => {
            const sep = p.indexOf('/')
            const a = sep >= 0 ? p.slice(0, sep).trim() : p.trim()
            const b = sep >= 0 ? p.slice(sep + 1).trim() : ''
            return editing ? (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', borderTop: `1px solid ${t.bd}` }}>
                <div style={{ padding: '10px 14px', borderRight: `2.5px solid ${t.ac}` }}>
                  <input value={a} onChange={e => { const n=[...pts]; n[i]=e.target.value+' / '+b; onChange('points',n) }}
                    placeholder="일반 제품"
                    style={{ width:'100%',fontSize:14,border:'1px solid #3b82f6',borderRadius:6,padding:'6px 10px',outline:'none',fontFamily:'inherit',boxSizing:'border-box' }} />
                </div>
                <div style={{ padding: '10px 14px' }}>
                  <input value={b} onChange={e => { const n=[...pts]; n[i]=a+' / '+e.target.value; onChange('points',n) }}
                    placeholder="이 제품"
                    style={{ width:'100%',fontSize:14,border:'1px solid #3b82f6',borderRadius:6,padding:'6px 10px',outline:'none',fontFamily:'inherit',boxSizing:'border-box' }} />
                </div>
                <div style={{ display:'flex',alignItems:'center',padding:'0 10px' }}>
                  <button onClick={() => delPt(i)} style={delBtnInline}>×</button>
                </div>
              </div>
            ) : (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderTop: `1px solid ${t.bd}`, background: i % 2 === 0 ? '#fafaf8' : '#fff' }}>
                <div style={{ padding: '20px 28px', fontSize: 15, color: '#bbb', textAlign: 'center', borderRight: `2.5px solid ${t.ac}`, textDecoration: 'line-through' }}>{a}</div>
                <div style={{ padding: '20px 28px', fontSize: 15, color: t.ac, fontWeight: 700, textAlign: 'center' }}>{b || '—'}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 제품 이미지 */}
      {imgNode && (
        <div style={{ padding: '0 52px 64px' }}>
          <ImgBox url={imgNode} t={t} editing={editing} onImgChange={v => onChange('secImg', v)}
            imgMeta={secMeta?.img1} onMetaChange={m => onSecMeta?.('img1', m)} />
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════
   8. 제품상세표시 (specTable)
   카테고리 선택(식품/뷰티/생활용품) → 항목 자동 변경
══════════════════════════════════════════════════ */
const SPEC_CATS = {
  food:   { label: '식품',    rows: ['제품명::','식품유형::','원산지::','유통기한::','중량::','원재료::','영양성분::','보관방법::','주의사항::'] },
  beauty: { label: '뷰티',    rows: ['제품명::','내용물::','사용기한::','사용방법::','주의사항::','제조사::','원산지::'] },
  living: { label: '생활용품', rows: ['제품명::','소재::','크기::','무게::','제조국::','인증::','주의사항::'] },
}

export function TplSpecTable({ s, img, t, editing, onChange, onFieldFocus }) {
  const cat = s.specCategory || 'food'
  const pts = s.points || []
  const displayPts = editing ? (pts.length ? pts : [...SPEC_CATS[cat].rows]) : pts.filter(p => p && p.trim())
  const addRow = () => onChange('points', [...pts, '항목::'])
  const delRow = i => onChange('points', pts.filter((_, j) => j !== i))

  const switchCat = k => { onChange('specCategory', k); onChange('points', [...SPEC_CATS[k].rows]) }

  return (
    <div style={{ width: CARD_W, background: '#FDFAF5' }}>
      <div style={{ padding: '52px 64px 32px', borderBottom: '2.5px solid #222' }}>
        {editing && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            {Object.entries(SPEC_CATS).map(([k, v]) => (
              <button key={k} onClick={() => switchCat(k)}
                style={{ padding: '6px 16px', fontSize: 12, borderRadius: 20,
                  border: `1.5px solid ${cat===k?'#3b82f6':'#ccc'}`,
                  background: cat===k?'#EFF6FF':'#fff',
                  color: cat===k?'#1d4ed8':'#666',
                  cursor: 'pointer', fontWeight: cat===k?700:400 }}>
                {v.label}
              </button>
            ))}
          </div>
        )}
        <div style={{ marginBottom: 8 }}>
          <ET s={s} field="mainCopy" editing={editing} onChange={onChange} onFocus={onFieldFocus}
            def={{ fontSize: 48, color: '#111', fontWeight: 900, letterSpacing: '-0.025em' }}
            placeholder="메인 제목" />
        </div>
        {(s.subCopy || editing) && (
          <ET s={s} field="subCopy" editing={editing} onChange={onChange} onFocus={onFieldFocus}
            def={{ fontSize: 14, color: '#888', lineHeight: 1.65 }}
            placeholder="서브 제목" />
        )}
      </div>
      <div style={{ padding: '0 64px 72px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 32 }}>
          <thead>
            <tr style={{ background: '#f0ede5', borderBottom: '2px solid #333' }}>
              <th style={{ padding: '14px 20px', fontSize: 13, fontWeight: 700, color: '#333', textAlign: 'left', width: '28%', borderRight: '1px solid #e0d8c8' }}>항목</th>
              <th style={{ padding: '14px 20px', fontSize: 13, fontWeight: 700, color: '#333', textAlign: 'left' }}>내용</th>
              {editing && <th style={{ width: 44 }} />}
            </tr>
          </thead>
          <tbody>
            {displayPts.map((p, i) => {
              const sep = p.indexOf('::')
              const key = sep >= 0 ? p.slice(0, sep) : p
              const val = sep >= 0 ? p.slice(sep + 2) : ''
              return (
                <tr key={i} style={{ borderBottom: '1px solid #e0d8c8', background: i % 2 === 0 ? '#fff' : '#fdfaf5' }}>
                  <td style={{ padding: '13px 20px', fontSize: 14, fontWeight: 600, color: '#555', borderRight: '1px solid #e0d8c8', verticalAlign: 'middle' }}>
                    {editing
                      ? <input value={key} onChange={e => { const n=[...pts]; n[i]=e.target.value+'::'+val; onChange('points',n) }}
                          style={{ width:'100%',border:'1px solid #3b82f6',borderRadius:5,padding:'5px 8px',fontSize:13,fontFamily:'inherit',outline:'none',boxSizing:'border-box' }} />
                      : key
                    }
                  </td>
                  <td style={{ padding: '13px 20px', fontSize: 14, color: '#222', verticalAlign: 'middle' }}>
                    {editing
                      ? <input value={val} onChange={e => { const n=[...pts]; n[i]=key+'::'+e.target.value; onChange('points',n) }}
                          style={{ width:'100%',border:'1px solid #3b82f6',borderRadius:5,padding:'5px 8px',fontSize:13,fontFamily:'inherit',outline:'none',boxSizing:'border-box' }} />
                      : val ? <span style={{ whiteSpace:'pre-wrap' }}>{val}</span> : <span style={{ color:'#ccc' }}>—</span>
                    }
                  </td>
                  {editing && (
                    <td style={{ textAlign:'center',padding:'0 8px',verticalAlign:'middle' }}>
                      <button onClick={() => delRow(i)}
                        style={{ width:24,height:24,borderRadius:6,border:'1px solid #fca5a5',background:'#fef2f2',color:'#ef4444',fontSize:13,cursor:'pointer',fontWeight:700,lineHeight:1 }}>×</button>
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export const TPL = {
  fullHero:    TplFullHero,
  topBottom:   TplTopBottom,
  leftRight:   TplLeftRight,
  points3icon: TplPoints3Icon,
  story:       TplStory,
  howTo:       TplHowTo,
  compare:     TplCompare,
  specTable:   TplSpecTable,
}
