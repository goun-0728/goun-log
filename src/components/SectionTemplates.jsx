// src/components/SectionTemplates.jsx
import React, { useRef, useState, useEffect, useContext } from 'react'

const CARD_W = 860
const SERIF  = "'Noto Serif KR', 'Noto Serif', Georgia, serif"

export const TextSelectCtx = React.createContext(null)
export const selectionStore = { range: null, fieldKey: null }

export function mkGrad(dir, alpha) {
  const a = (alpha ?? 70) / 100
  if (!dir || dir === 'none') return null
  if (dir === 'bottom') return `linear-gradient(to top, rgba(0,0,0,${a}) 0%, transparent 60%)`
  if (dir === 'top')    return `linear-gradient(to bottom, rgba(0,0,0,${a}) 0%, transparent 60%)`
  if (dir === 'left')   return `linear-gradient(to right, rgba(0,0,0,${a}) 0%, transparent 60%)`
  if (dir === 'right')  return `linear-gradient(to left, rgba(0,0,0,${a}) 0%, transparent 60%)`
  if (dir === 'full')   return `rgba(0,0,0,${(a * 0.55).toFixed(2)})`
  return null
}

const ROMAN = ['Ⅰ','Ⅱ','Ⅲ','Ⅳ','Ⅴ','Ⅵ','Ⅶ','Ⅷ','Ⅸ','Ⅹ']
const ICON_FONTS = ["'Georgia', serif","'Palatino Linotype', serif","'Times New Roman', serif","'Garamond', serif"]
export const sectionRoman = i => ROMAN[i % ROMAN.length]
export const sectionFont  = i => ICON_FONTS[i % ICON_FONTS.length]

export const ICON_SETS = [
  { k: 'roman',    l: 'Ⅰ 로마자',     fn: i => ['Ⅰ','Ⅱ','Ⅲ','Ⅳ','Ⅴ','Ⅵ','Ⅶ','Ⅷ','Ⅸ','Ⅹ'][i%10] },
  { k: 'check',    l: '✓ 체크',        fn: _ => '✓' },
  { k: 'star',     l: '★ 별',          fn: _ => '★' },
  { k: 'circnum',  l: '① 원형숫자',    fn: i => ['①','②','③','④','⑤','⑥','⑦','⑧','⑨','⑩'][i%10] },
  { k: 'arrow',    l: '→ 화살표',      fn: _ => '→' },
  { k: 'diamond',  l: '◆ 다이아몬드',  fn: _ => '◆' },
  { k: 'crown',    l: '👑 왕관',        fn: _ => '👑' },
  { k: 'heart',    l: '♥ 하트',        fn: _ => '♥' },
  { k: 'bolt',     l: '⚡ 번개',        fn: _ => '⚡' },
  { k: 'fire',     l: '🔥 불꽃',        fn: _ => '🔥' },
  { k: 'leaf',     l: '🌿 리프',        fn: _ => '🌿' },
  { k: 'drop',     l: '💧 물방울',      fn: _ => '💧' },
  { k: 'sun',      l: '☀ 태양',         fn: _ => '☀' },
  { k: 'moon',     l: '◐ 달',           fn: i => ['◐','◑','◒','◓'][i%4] },
  { k: 'plus',     l: '✚ 플러스',       fn: _ => '✚' },
  { k: 'negnum',   l: '❶ 굵은숫자',     fn: i => ['❶','❷','❸','❹','❺','❻','❼','❽','❾','❿'][i%10] },
  { k: 'sqnum',    l: '⑴ 괄호숫자',     fn: i => ['⑴','⑵','⑶','⑷','⑸','⑹','⑺','⑻','⑼','⑽'][i%10] },
  { k: 'alpha',    l: 'Ⓐ 알파벳',       fn: i => ['Ⓐ','Ⓑ','Ⓒ','Ⓓ','Ⓔ','Ⓕ','Ⓖ','Ⓗ','Ⓘ','Ⓙ'][i%10] },
  { k: 'triangle', l: '▲ 삼각형',       fn: _ => '▲' },
  { k: 'square',   l: '■ 큐브',         fn: _ => '■' },
]
const _iconHash = s => { const str = String(s._id || s.sectionType || ''); return str.split('').reduce((n, c) => n + c.charCodeAt(0), 0) }
export const getSecIcon = (s, pointIdx) => { const set = s.iconSet ? ICON_SETS.find(x => x.k === s.iconSet) : ICON_SETS[_iconHash(s) % ICON_SETS.length]; return (set || ICON_SETS[0]).fn(pointIdx) }

export function CardWrapper({ children, bg = '#fff' }) {
  return (
    <div style={{ width: CARD_W, background: bg, overflow: 'hidden', position: 'relative' }}>
      {children}
    </div>
  )
}

/* ── EditText: contentEditable with X button + selection save ── */
export function EditText({ value, onChange, editing, style, fieldKey, extraStyle }) {
  const ctx    = useContext(TextSelectCtx)
  const merged = extraStyle ? { ...style, ...extraStyle } : style
  if (!editing) return <div style={merged}>{value || ''}</div>
  return (
    <div style={{ position: 'relative' }}>
      <div contentEditable suppressContentEditableWarning
        onFocus={() => fieldKey && ctx?.setField(fieldKey)}
        onBlur={e => onChange(e.currentTarget.innerText)}
        onMouseUp={() => {
          const sel = window.getSelection()
          if (sel?.rangeCount > 0 && !sel.isCollapsed) {
            selectionStore.range = sel.getRangeAt(0).cloneRange()
            selectionStore.fieldKey = fieldKey
          } else { selectionStore.range = null }
        }}
        style={{ ...merged, outline: 'none', borderBottom: '2px solid #3b82f6', cursor: 'text', minWidth: 40 }}
        dangerouslySetInnerHTML={{ __html: value || '' }}
      />
      <button
        onMouseDown={e => e.preventDefault()}
        onClick={e => { e.stopPropagation(); onChange('') }}
        style={{ position: 'absolute', top: -8, right: -8, zIndex: 30, width: 20, height: 20, borderRadius: '50%', border: 'none', background: '#ef4444', color: '#fff', fontSize: 12, cursor: 'pointer', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>
        ×
      </button>
    </div>
  )
}

export function ImageAdjust({ url, editing, imgMeta, onMetaChange, fixedH, fitMode = 'cover', onError, isActive = false }) {
  const [dragging, setDragging] = useState(false)
  const [start, setStart]       = useState({ x: 0, y: 0 })
  const meta    = imgMeta || { scale: 1, x: 0, y: 0 }
  const divRef  = useRef(null)
  const snapRef = useRef(null)
  snapRef.current = { editing, meta, onMetaChange, isActive }

  const handleMouseDown = e => {
    if (!editing) return
    setDragging(true)
    setStart({ x: e.clientX - meta.x, y: e.clientY - meta.y })
    e.preventDefault()
  }
  const handleMouseMove = e => { if (!dragging) return; onMetaChange({ ...meta, x: e.clientX - start.x, y: e.clientY - start.y }) }
  const handleMouseUp   = () => setDragging(false)

  useEffect(() => {
    const el = divRef.current
    if (!el) return
    const handler = e => {
      const { editing, meta, onMetaChange, isActive } = snapRef.current
      if (!editing || !isActive) return
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
        onMouseDown={handleMouseDown}
        onError={onError} />
    </div>
  )
}

export function ImgBox({ url, t, label, editing = false, onImgChange, minH = 320, imgMeta, onMetaChange, fixedH, fitMode, fill, isActive = false }) {
  const ref = useRef(null)
  const [imgError, setImgError] = useState(false)

  useEffect(() => { setImgError(false) }, [url])

  const handleFile = e => {
    const f = e.target.files[0]; if (!f || !onImgChange) return
    const fr = new FileReader()
    fr.onload = ev => onImgChange(ev.target.result)
    fr.readAsDataURL(f); e.target.value = ''
  }

  const slotStyle = { ...(fill ? { height: '100%' } : fixedH ? { height: fixedH } : { minHeight: minH }), background: t.sub, border: `2px dashed ${t.bd}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, cursor: editing ? 'pointer' : 'default' }

  if (!url) return null
  if (url === 'slot' || imgError) return (
    <div onClick={() => editing && ref.current?.click()} style={slotStyle}>
      <input ref={ref} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
      <span style={{ fontSize: 40, opacity: 0.3 }}>📷</span>
      <span style={{ fontSize: 14, color: '#222222', fontWeight: 600, background: '#e0e0e0', padding: '6px 18px', borderRadius: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        {editing ? '클릭해서 사진 업로드' : label || '이미지'}
      </span>
    </div>
  )
  return (
    <div style={{ position: 'relative', ...(fill ? { height: '100%' } : {}) }}>
      <input ref={ref} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
      {editing && (
        <button onClick={() => ref.current?.click()}
          style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 10, padding: '12px 28px', fontSize: 15, fontWeight: 700, background: '#333333', color: '#ffffff', border: 'none', borderRadius: 10, cursor: 'pointer', whiteSpace: 'nowrap' }}>
          📷 사진 교체
        </button>
      )}
      <ImageAdjust url={url} editing={editing} imgMeta={imgMeta} onMetaChange={onMetaChange || (() => {})} fixedH={fill ? '100%' : fixedH} fitMode={fitMode} onError={() => setImgError(true)} isActive={isActive} />
      {editing && <div style={{ position: 'absolute', inset: 0, border: `2px dashed ${t?.bd || '#ccc'}`, pointerEvents: 'none', zIndex: 5 }} />}
    </div>
  )
}

function PointInput({ value, onChange, placeholder }) {
  return (
    <textarea value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder || '텍스트 입력 (엔터로 줄바꿈)'}
      rows={Math.max(2, (value || '').split('\n').length)}
      style={{ flex: 1, fontSize: 21, border: '1px solid #3b82f6', borderRadius: 6, padding: '8px 10px', outline: 'none', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.65, width: '100%' }}
    />
  )
}

function NoBg({ t, minH = 400, children }) {
  return (
    <div style={{ minHeight: minH, background: `linear-gradient(135deg, ${t.ac}28 0%, ${t.bg} 60%, ${t.ac}14 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `radial-gradient(circle, ${t.ac}18 1px, transparent 1px)`, backgroundSize: '32px 32px' }} />
      {children || <span style={{ fontSize: 72, opacity: 0.1 }}>🛍</span>}
    </div>
  )
}

function BodyText({ s, t, editing, onChange, fieldStyles = {}, light = false }) {
  if (!s.bodyText && !editing) return null
  const fs = fieldStyles.bodyText
  return (
    <EditText fieldKey="bodyText" editing={editing} value={s.bodyText} onChange={v => onChange('bodyText', v)}
      style={{ fontSize: 22, color: light ? 'rgba(255,255,255,0.82)' : t.fg, opacity: light ? 1 : 0.72,
        lineHeight: 1.85, wordBreak: 'keep-all', whiteSpace: 'pre-wrap', marginBottom: 24 }}
      extraStyle={fs} />
  )
}

/* ── 텍스트 오버레이 드래그 훅 ── */
function useOverlayDrag(editing, secMeta, onSecMeta) {
  const [dragState, setDragState] = useState(null)
  const textPos = secMeta?.textPos || { x: 0, y: 0 }

  const handleMouseDown = e => {
    if (!editing || e.target.closest('[contenteditable]') || e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON') return
    setDragState({ startMx: e.clientX, startMy: e.clientY, baseX: textPos.x, baseY: textPos.y })
    e.preventDefault()
  }

  useEffect(() => {
    if (!dragState) return
    const onMove = e => onSecMeta?.('textPos', {
      x: dragState.baseX + (e.clientX - dragState.startMx),
      y: dragState.baseY + (e.clientY - dragState.startMy),
    })
    const onUp = () => setDragState(null)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [dragState]) // eslint-disable-line

  return { textPos, dragState, handleMouseDown }
}

/* ── Hero: 전체 배경 이미지 + 텍스트 오버레이 ── */
export function TplHero({ s, img, t, editing, onChange, secMeta, onSecMeta, fieldStyles = {} }) {
  const logoRef = useRef(null)
  const { textPos, dragState, handleMouseDown } = useOverlayDrag(editing, secMeta, onSecMeta)
  const pts        = s.points || []
  const displayPts = editing ? (pts.length ? pts : ['', '', '']) : pts.filter(p => p && p.trim())
  const cols       = Math.max(1, Math.min(displayPts.length, 3))
  const delPt      = i => onChange('points', pts.filter((_, j) => j !== i))

  const handleLogoImg = e => {
    const f = e.target.files[0]; if (!f) return
    const fr = new FileReader()
    fr.onload = ev => onChange('logoImg', ev.target.result)
    fr.readAsDataURL(f); e.target.value = ''
  }

  const gradStyle = s.gradDir
    ? mkGrad(s.gradDir, s.gradAlpha)
    : 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 55%, transparent 80%)'

  return (
    <CardWrapper bg={t.bg}>
      <input ref={logoRef} type="file" accept="image/*" onChange={handleLogoImg} style={{ display: 'none' }} />

      {/* 전체 배경 이미지 영역 */}
      <div style={{ position: 'relative', minHeight: 680 }}>
        {img
          ? <ImgBox url={img} t={t} label="메인 이미지" editing={editing}
              onImgChange={v => onChange('secImg', v)}
              imgMeta={secMeta?.img1} onMetaChange={m => onSecMeta?.('img1', m)}
              minH={680} fill />
          : <div style={{ height: 680, background: `linear-gradient(135deg, ${t.ac}55 0%, ${t.bg} 60%, ${t.ac}22 100%)` }} />
        }

        {/* 그라데이션 오버레이 */}
        <div style={{ position: 'absolute', inset: 0, background: gradStyle, pointerEvents: 'none' }} />

        {/* 로고 (이미지 위 상단) */}
        <div style={{ position: 'absolute', top: 36, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 5 }}>
          {s.logoImg
            ? <div style={{ position: 'relative', display: 'inline-block' }}>
                <img src={s.logoImg} alt="" style={{ maxHeight: 72, maxWidth: 280, objectFit: 'contain', display: 'block', filter: 'brightness(0) invert(1)' }} />
                {editing && (
                  <div style={{ position: 'absolute', top: -10, right: -10, display: 'flex', gap: 4 }}>
                    <button onClick={() => logoRef.current?.click()} style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, border: '1px solid rgba(255,255,255,0.5)', background: 'rgba(0,0,0,0.55)', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>교체</button>
                    <button onClick={() => onChange('logoImg', null)} style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, border: 'none', background: 'rgba(220,38,38,0.7)', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>제거</button>
                  </div>
                )}
              </div>
            : editing
              ? <button onClick={() => logoRef.current?.click()} style={{ padding: '6px 18px', fontSize: 12, borderRadius: 7, border: '1.5px dashed rgba(255,255,255,0.45)', background: 'rgba(0,0,0,0.25)', color: 'rgba(255,255,255,0.75)', cursor: 'pointer', fontWeight: 600 }}>+ 로고 업로드</button>
              : s.logoText
                ? <div style={{ fontSize: 16, fontWeight: 700, color: 'rgba(255,255,255,0.9)', letterSpacing: '0.28em', textTransform: 'uppercase' }}>{s.logoText}</div>
                : null
          }
        </div>

        {/* 텍스트 오버레이 (드래그 가능) */}
        <div
          onMouseDown={handleMouseDown}
          style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            padding: '0 72px 60px', textAlign: 'center',
            transform: `translate(${textPos.x}px, ${textPos.y}px)`,
            cursor: editing ? (dragState ? 'grabbing' : 'grab') : 'default',
            userSelect: dragState ? 'none' : 'auto',
            pointerEvents: editing ? 'auto' : 'none',
            zIndex: 4,
          }}
        >
          {(s.description || editing) && (
            <div style={{ marginBottom: 22 }}>
              <EditText fieldKey="description" editing={editing} value={s.description} onChange={v => onChange('description', v)}
                style={{ display: 'inline-block', fontSize: 14, fontWeight: 800, color: 'rgba(255,255,255,0.9)', letterSpacing: '0.32em', textTransform: 'uppercase', border: '1.5px solid rgba(255,255,255,0.55)', padding: '6px 24px', borderRadius: 40 }} extraStyle={fieldStyles.description} />
            </div>
          )}
          <EditText fieldKey="mainCopy" editing={editing} value={s.mainCopy} onChange={v => onChange('mainCopy', v)}
            style={{ fontSize: 88, fontWeight: 900, color: '#fff', lineHeight: 1.18, letterSpacing: '-0.03em', marginBottom: 20, wordBreak: 'keep-all', fontFamily: SERIF, textShadow: '0 4px 28px rgba(0,0,0,0.45)' }} extraStyle={fieldStyles.mainCopy} />
          <EditText fieldKey="subCopy" editing={editing} value={s.subCopy} onChange={v => onChange('subCopy', v)}
            style={{ fontSize: 30, color: 'rgba(255,255,255,0.85)', lineHeight: 1.82, wordBreak: 'keep-all', maxWidth: 540, textShadow: '0 2px 12px rgba(0,0,0,0.3)' }} extraStyle={fieldStyles.subCopy} />
          {(s.bodyText || editing) && (
            <EditText fieldKey="bodyText" editing={editing} value={s.bodyText} onChange={v => onChange('bodyText', v)}
              style={{ fontSize: 22, color: 'rgba(255,255,255,0.72)', lineHeight: 1.85, marginTop: 14, whiteSpace: 'pre-wrap' }} extraStyle={fieldStyles.bodyText} />
          )}
        </div>
      </div>

      {/* KEY POINT 섹션 */}
      <div style={{ position: 'relative', background: '#fff', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%) translateY(-50%)', width: '130%', height: 130, background: t.bg, borderRadius: '0 0 50% 50%' }} />
        <div style={{ position: 'relative', padding: '80px 60px 88px' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <span style={{ fontSize: 19, fontWeight: 800, letterSpacing: '0.32em', color: t.ac, textTransform: 'uppercase', borderBottom: `3px solid ${t.ac}`, paddingBottom: 7 }}>KEY POINT</span>
            <div style={{ marginTop: 18, fontSize: 40, fontWeight: 900, color: '#111', fontFamily: SERIF, letterSpacing: '-0.02em' }}>이 제품이 특별한 이유</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 36 }}>
            {displayPts.map((raw, i) => {
              const lines = raw.split('\n'); const title = lines[0]?.trim() || `포인트 ${i + 1}`; const desc = lines.slice(1).join('\n').trim()
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 18, position: 'relative' }}>
                  {editing && <button onClick={() => delPt(i)} style={delBtnAbsolute}>×</button>}
                  <div style={{ width: 92, height: 92, borderRadius: '50%', background: t.ac, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 14px 36px ${t.ac}44`, flexShrink: 0 }}>
                    <span style={{ fontSize: 36, fontWeight: 700, color: '#fff', fontFamily: SERIF, lineHeight: 1 }}>{getSecIcon(s, i)}</span>
                  </div>
                  {editing
                    ? <PointInput value={raw} onChange={v => { const n=[...pts]; n[i]=v; onChange('points',n) }} placeholder={'제목\n설명(엔터로 구분)'} />
                    : <>
                        <p style={{ fontSize: 30, fontWeight: 800, color: '#111', margin: 0, lineHeight: 1.3, wordBreak: 'keep-all', fontFamily: SERIF }}>{title}</p>
                        {desc && <p style={{ fontSize: 22, color: '#777', margin: 0, lineHeight: 1.72, wordBreak: 'keep-all', whiteSpace: 'pre-wrap' }}>{desc}</p>}
                      </>
                  }
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </CardWrapper>
  )
}

export function TplMaterial({ s, img, t, editing, onChange, secMeta, onSecMeta, fieldStyles = {} }) {
  const pts        = s.points || []
  const displayPts = editing ? (pts.length ? pts : ['']) : pts.filter(p => p && p.trim())
  const delPt      = i => onChange('points', pts.filter((_, j) => j !== i))
  const { textPos, dragState, handleMouseDown } = useOverlayDrag(editing, secMeta, onSecMeta)

  return (
    <CardWrapper bg={t.bg}>
      <div style={{ position: 'relative', minHeight: 480 }}>
        {img ? <ImgBox url={img} t={t} label="소재 이미지" editing={editing} onImgChange={v => onChange('secImg', v)} imgMeta={secMeta?.img1} onMetaChange={m => onSecMeta?.('img1', m)} minH={480} /> : <NoBg t={t} minH={480} />}
        {(() => { const g = s.gradDir ? mkGrad(s.gradDir, s.gradAlpha) : 'linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.32) 52%, transparent 100%)'; return g && <div style={{ position: 'absolute', inset: 0, background: g, pointerEvents: 'none' }} /> })()}
        <div
          onMouseDown={handleMouseDown}
          style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, padding: '36px 60px 52px',
            transform: `translate(${textPos.x}px, ${textPos.y}px)`,
            cursor: editing ? (dragState ? 'grabbing' : 'grab') : 'default',
            userSelect: dragState ? 'none' : 'auto',
            pointerEvents: editing ? 'auto' : 'none',
          }}
        >
          <EditText fieldKey="mainCopy" editing={editing} value={s.mainCopy} onChange={v => onChange('mainCopy', v)}
            style={{ fontSize: 62, fontWeight: 900, color: '#fff', lineHeight: 1.24, wordBreak: 'keep-all', fontFamily: SERIF, textShadow: '0 3px 18px rgba(0,0,0,0.55)', marginBottom: 10 }} extraStyle={fieldStyles.mainCopy} />
          <EditText fieldKey="subCopy" editing={editing} value={s.subCopy} onChange={v => onChange('subCopy', v)}
            style={{ fontSize: 26, color: 'rgba(255,255,255,0.86)', lineHeight: 1.68, wordBreak: 'keep-all' }} extraStyle={fieldStyles.subCopy} />
          {(s.bodyText || editing) && (
            <EditText fieldKey="bodyText" editing={editing} value={s.bodyText} onChange={v => onChange('bodyText', v)}
              style={{ fontSize: 20, color: 'rgba(255,255,255,0.75)', lineHeight: 1.75, marginTop: 8, whiteSpace: 'pre-wrap' }} extraStyle={fieldStyles.bodyText} />
          )}
        </div>
      </div>
      <div style={{ padding: '60px 60px 72px', background: '#fff' }}>
        <div style={{ fontSize: 19, fontWeight: 800, letterSpacing: '0.3em', color: t.ac, textTransform: 'uppercase', marginBottom: 32 }}>MATERIAL DETAIL</div>
        {s.secImg2 && <div style={{ marginBottom: 40, borderRadius: 12, overflow: 'hidden' }}><ImgBox url={s.secImg2} t={t} label="소재 클로즈업" editing={editing} onImgChange={v => onChange('secImg2', v)} imgMeta={secMeta?.img2} onMetaChange={m => onSecMeta?.('img2', m)} minH={240} /></div>}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {displayPts.map((p, i) => {
            const lines = p.split('\n')
            return (
              <div key={i} style={{ display: 'flex', gap: 22, alignItems: 'flex-start', padding: '24px 0', borderBottom: `1px solid ${t.bd}` }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: t.ac, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 22, fontWeight: 700, color: '#fff', fontFamily: SERIF, lineHeight: 1 }}>{getSecIcon(s, i)}</span>
                </div>
                <div style={{ flex: 1 }}>
                  {editing
                    ? <PointInput value={p} onChange={v => { const n=[...pts]; n[i]=v; onChange('points',n) }} placeholder={'특징 제목\n상세 설명'} />
                    : <>
                        <div style={{ fontSize: 26, fontWeight: 700, color: t.fg, lineHeight: 1.4, marginBottom: 5, fontFamily: SERIF }}>{lines[0]}</div>
                        {lines.slice(1).join('\n') && <div style={{ fontSize: 24, color: t.fg, opacity: 0.62, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{lines.slice(1).join('\n')}</div>}
                      </>
                  }
                </div>
                {editing && <button onClick={() => delPt(i)} style={delBtnInline}>×</button>}
              </div>
            )
          })}
        </div>
      </div>
    </CardWrapper>
  )
}

export function TplDetail2col({ s, img, t, editing, onChange, secMeta, onSecMeta, fieldStyles = {} }) {
  const pts = s.points || []; const displayPts = editing ? (pts.length ? pts : ['']) : pts.filter(p => p && p.trim())
  const delPt = i => onChange('points', pts.filter((_, j) => j !== i))
  const img2 = s.secImg2; const img3 = s.secImg3; const img4 = s.secImg4; const imgH = s.detailImgH || 320

  return (
    <CardWrapper bg={t.bg}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
        <div style={{ display: 'flex', flexDirection: 'column', background: t.ac }}>
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden', minHeight: 200 }}>
            {img ? <><ImgBox url={img} t={t} label="이미지 1" editing={editing} onImgChange={v => onChange('secImg', v)} imgMeta={secMeta?.img1} onMetaChange={m => onSecMeta?.('img1', m)} minH={imgH} fitMode='contain' fill /><div style={{ position: 'absolute', inset: 0, background: `${t.ac}22`, pointerEvents: 'none' }} /></>
              : editing ? <ImgBox url="slot" t={t} label="이미지 1 업로드" editing={editing} onImgChange={v => onChange('secImg', v)} imgMeta={secMeta?.img1} onMetaChange={m => onSecMeta?.('img1', m)} minH={imgH} fitMode='contain' fill />
              : <div style={{ height: '100%', minHeight: 200, background: `linear-gradient(160deg, ${t.ac} 0%, ${t.ac}cc 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: 60, opacity: 0.15 }}>📷</span></div>}
          </div>
          <div style={{ height: 20, background: `${t.bg}55`, flexShrink: 0 }} />
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden', minHeight: 200 }}>
            {img2 ? <><ImgBox url={img2} t={t} label="이미지 2" editing={editing} onImgChange={v => onChange('secImg2', v)} imgMeta={secMeta?.img2} onMetaChange={m => onSecMeta?.('img2', m)} minH={imgH} fitMode='contain' fill /><div style={{ position: 'absolute', inset: 0, background: `${t.ac}22`, pointerEvents: 'none' }} /></>
              : editing ? <ImgBox url="slot" t={t} label="이미지 2 업로드" editing={editing} onImgChange={v => onChange('secImg2', v)} imgMeta={secMeta?.img2} onMetaChange={m => onSecMeta?.('img2', m)} minH={imgH} fitMode='contain' fill />
              : <div style={{ height: '100%', minHeight: 200, background: `linear-gradient(160deg, ${t.ac}cc 0%, ${t.ac}88 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: 60, opacity: 0.10 }}>📷</span></div>}
          </div>
        </div>
        <div style={{ padding: '68px 52px', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: '#fff' }}>
          {(s.description || editing) && <EditText fieldKey="description" editing={editing} value={s.description} onChange={v => onChange('description', v)} style={{ fontSize: 14, fontWeight: 800, color: t.ac, letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 20 }} extraStyle={fieldStyles.description} />}
          <EditText fieldKey="mainCopy" editing={editing} value={s.mainCopy} onChange={v => onChange('mainCopy', v)} style={{ fontSize: 52, fontWeight: 900, color: '#111', lineHeight: 1.3, letterSpacing: '-0.02em', marginBottom: 16, wordBreak: 'keep-all', fontFamily: SERIF }} extraStyle={fieldStyles.mainCopy} />
          <EditText fieldKey="subCopy" editing={editing} value={s.subCopy} onChange={v => onChange('subCopy', v)} style={{ fontSize: 24, color: '#666', lineHeight: 1.82, marginBottom: 16, wordBreak: 'keep-all' }} extraStyle={fieldStyles.subCopy} />
          <BodyText s={s} t={t} editing={editing} onChange={onChange} fieldStyles={fieldStyles} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {displayPts.map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: '16px 0', borderBottom: `1px solid ${t.bd}` }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: t.ac, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}><span style={{ fontSize: 15, color: '#fff', fontWeight: 800 }}>✓</span></div>
                {editing ? <PointInput value={p} onChange={v => { const n=[...pts]; n[i]=v; onChange('points',n) }} /> : <span style={{ fontSize: 25, color: '#333', lineHeight: 1.74, whiteSpace: 'pre-wrap' }}>{p}</span>}
                {editing && <button onClick={() => delPt(i)} style={delBtnInline}>×</button>}
              </div>
            ))}
          </div>
        </div>
      </div>
      {(img3 || img4) && (
        <div style={{ display: 'grid', gridTemplateColumns: (img3 && img4) ? '1fr 1fr' : '1fr' }}>
          {img3 && <ImgBox url={img3} t={t} label="이미지 3" editing={editing} onImgChange={v => onChange('secImg3', v)} imgMeta={secMeta?.img3} onMetaChange={m => onSecMeta?.('img3', m)} />}
          {img4 && <ImgBox url={img4} t={t} label="이미지 4" editing={editing} onImgChange={v => onChange('secImg4', v)} imgMeta={secMeta?.img4} onMetaChange={m => onSecMeta?.('img4', m)} />}
        </div>
      )}
    </CardWrapper>
  )
}

export function TplScene({ s, img, t, editing, onChange, secMeta, onSecMeta, fieldStyles = {} }) {
  const { textPos, dragState, handleMouseDown } = useOverlayDrag(editing, secMeta, onSecMeta)

  return (
    <CardWrapper bg={t.bg}>
      <div style={{ position: 'relative', minHeight: 640 }}>
        {img ? <ImgBox url={img} t={t} label="라이프스타일 이미지" editing={editing} onImgChange={v => onChange('secImg', v)} imgMeta={secMeta?.img1} onMetaChange={m => onSecMeta?.('img1', m)} minH={640} /> : <NoBg t={t} minH={640} />}
        {(() => { const g = s.gradDir ? mkGrad(s.gradDir, s.gradAlpha) : 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.5) 35%, rgba(0,0,0,0.1) 65%, transparent 100%)'; return g && <div style={{ position: 'absolute', inset: 0, background: g, pointerEvents: 'none' }} /> })()}
        <div
          onMouseDown={handleMouseDown}
          style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, padding: '36px 60px 56px',
            transform: `translate(${textPos.x}px, ${textPos.y}px)`,
            cursor: editing ? (dragState ? 'grabbing' : 'grab') : 'default',
            userSelect: dragState ? 'none' : 'auto',
            pointerEvents: editing ? 'auto' : 'none',
          }}
        >
          <EditText fieldKey="mainCopy" editing={editing} value={s.mainCopy} onChange={v => onChange('mainCopy', v)}
            style={{ fontSize: 60, fontWeight: 900, color: '#fff', lineHeight: 1.26, wordBreak: 'keep-all', fontFamily: SERIF, textShadow: '0 4px 24px rgba(0,0,0,0.65)', marginBottom: 10 }} extraStyle={fieldStyles.mainCopy} />
          <EditText fieldKey="subCopy" editing={editing} value={s.subCopy} onChange={v => onChange('subCopy', v)}
            style={{ fontSize: 26, color: 'rgba(255,255,255,0.84)', lineHeight: 1.68, wordBreak: 'keep-all' }} extraStyle={fieldStyles.subCopy} />
          {(s.bodyText || editing) && (
            <EditText fieldKey="bodyText" editing={editing} value={s.bodyText} onChange={v => onChange('bodyText', v)}
              style={{ fontSize: 19, color: 'rgba(255,255,255,0.72)', lineHeight: 1.75, marginTop: 8, whiteSpace: 'pre-wrap' }} extraStyle={fieldStyles.bodyText} />
          )}
        </div>
      </div>
      {s.secImg2 && <ImgBox url={s.secImg2} t={t} label="이미지 2" editing={editing} onImgChange={v => onChange('secImg2', v)} imgMeta={secMeta?.img2} onMetaChange={m => onSecMeta?.('img2', m)} />}
    </CardWrapper>
  )
}

export function TplCompare({ s, img, t, editing, onChange, secMeta, onSecMeta, fieldStyles = {} }) {
  const pts = s.points || []; const displayPts = pts.length ? pts : (editing ? ['', '', ''] : [])
  const addPt = () => onChange('points', [...pts, '']); const delPt = i => onChange('points', pts.filter((_, j) => j !== i))

  return (
    <CardWrapper bg={t.bg}>
      <div style={{ background: t.ac, padding: '64px 64px 60px', textAlign: 'center' }}>
        <EditText fieldKey="mainCopy" editing={editing} value={s.mainCopy} onChange={v => onChange('mainCopy', v)} style={{ fontSize: 75, fontWeight: 900, color: '#fff', lineHeight: 1.24, letterSpacing: '-0.028em', marginBottom: 14, wordBreak: 'keep-all', fontFamily: SERIF }} extraStyle={fieldStyles.mainCopy} />
        <EditText fieldKey="subCopy" editing={editing} value={s.subCopy} onChange={v => onChange('subCopy', v)} style={{ fontSize: 30, color: 'rgba(255,255,255,0.8)', lineHeight: 1.68, marginBottom: 10 }} extraStyle={fieldStyles.subCopy} />
        <BodyText s={s} t={t} editing={editing} onChange={onChange} fieldStyles={fieldStyles} light />
      </div>
      <div style={{ padding: '52px 48px 68px', background: '#fff' }}>
        <div style={{ border: `2.5px solid ${t.ac}`, borderRadius: 18, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
            <div style={{ padding: '22px 28px', borderRight: `2.5px solid ${t.ac}`, background: '#f5f5f7', textAlign: 'center' }}>
              <EditText fieldKey="compareLeft" editing={editing} value={s.compareLeft || '일반 제품'} onChange={v => onChange('compareLeft', v)} style={{ fontSize: 25, fontWeight: 700, color: '#999' }} extraStyle={fieldStyles.compareLeft} />
            </div>
            <div style={{ padding: '22px 28px', background: t.ac, textAlign: 'center' }}>
              <EditText fieldKey="compareRight" editing={editing} value={s.compareRight || ''} onChange={v => onChange('compareRight', v)} style={{ fontSize: 25, fontWeight: 800, color: '#fff' }} extraStyle={fieldStyles.compareRight} />
            </div>
          </div>
          {displayPts.map((p, i) => {
            const [a, ...r] = p.split('/'); const b = r.join('/').trim()
            return editing ? (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', borderTop: `1px solid ${t.bd}` }}>
                <div style={{ padding: '12px 14px', borderRight: `2.5px solid ${t.ac}` }}><input value={a.replace(/일반제품:/i,'').trim()} onChange={e=>{const n=[...pts];n[i]=e.target.value+' / '+r.join('/').trim();onChange('points',n)}} placeholder="일반 제품" style={cmpInput} /></div>
                <div style={{ padding: '12px 14px' }}><input value={b} onChange={e=>{const n=[...pts];n[i]=a.replace(/일반제품:/i,'').trim()+' / '+e.target.value;onChange('points',n)}} placeholder="이 제품" style={cmpInput} /></div>
                <div style={{ display:'flex',alignItems:'center',padding:'0 10px' }}><button onClick={()=>delPt(i)} style={delBtnInline}>×</button></div>
              </div>
            ) : (
              <div key={i} style={{ display:'grid',gridTemplateColumns:'1fr 1fr',borderTop:`1px solid ${t.bd}`,background:i%2===0?'#fafafa':'#fff' }}>
                <div style={{ padding:'22px 28px',fontSize:25,color:'#bbb',textAlign:'center',borderRight:`2.5px solid ${t.ac}`,textDecoration:'line-through' }}>{a.replace(/일반제품:/i,'').trim()}</div>
                <div style={{ padding:'22px 28px',fontSize:25,color:t.ac,fontWeight:700,textAlign:'center' }}>{b||'—'}</div>
              </div>
            )
          })}
          {editing && <button onClick={addPt} style={{ width:'100%',padding:'16px 0',fontSize:13,fontWeight:600,border:'none',borderTop:`1px dashed ${t.bd}`,background:'#fafafa',color:t.ac,cursor:'pointer' }}>+ 행 추가</button>}
        </div>
        {img && <div style={{ marginTop:44 }}><ImgBox url={img} t={t} label="비교 이미지" editing={editing} onImgChange={v=>onChange('secImg',v)} imgMeta={secMeta?.img1} onMetaChange={m=>onSecMeta?.('img1',m)} /></div>}
      </div>
    </CardWrapper>
  )
}

export function TplPoints3({ s, img, t, editing, onChange, secMeta, onSecMeta, fieldStyles = {} }) {
  const pts = s.points || []; const displayPts = pts.length ? pts : (editing ? ['','',''] : [])
  const cols = Math.max(1, Math.min(displayPts.length || 1, 3))
  const addPt = () => onChange('points', [...pts, '']); const delPt = i => onChange('points', pts.filter((_,j) => j !== i))

  return (
    <CardWrapper bg={t.bg}>
      {img ? <ImgBox url={img} t={t} label="이미지" editing={editing} onImgChange={v=>onChange('secImg',v)} imgMeta={secMeta?.img1} onMetaChange={m=>onSecMeta?.('img1',m)} minH={420} /> : <NoBg t={t} minH={320} />}
      <div style={{ padding: '68px 64px 0', textAlign: 'center' }}>
        <EditText fieldKey="mainCopy" editing={editing} value={s.mainCopy} onChange={v=>onChange('mainCopy',v)} style={{ fontSize:68,fontWeight:900,color:t.fg,lineHeight:1.28,letterSpacing:'-0.025em',marginBottom:14,wordBreak:'keep-all',fontFamily:SERIF }} extraStyle={fieldStyles.mainCopy} />
        <EditText fieldKey="subCopy" editing={editing} value={s.subCopy} onChange={v=>onChange('subCopy',v)} style={{ fontSize:30,color:t.fg,opacity:0.62,lineHeight:1.75,marginBottom:10 }} extraStyle={fieldStyles.subCopy} />
        <BodyText s={s} t={t} editing={editing} onChange={onChange} fieldStyles={fieldStyles} />
      </div>
      <div style={{ padding: '52px 40px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 20 }}>
          {displayPts.map((p, i) => {
            const lines = p.split('\n'); const title = lines[0]?.trim()||`포인트 ${i+1}`; const desc = lines.slice(1).join('\n').trim()
            const isDark = i % 2 === 0
            return (
              <div key={i} style={{ position:'relative',background:isDark?t.ac:t.sub,borderRadius:22,padding:'48px 28px 44px',textAlign:'center',boxShadow:isDark?`0 10px 36px ${t.ac}40`:'0 2px 10px rgba(0,0,0,0.06)' }}>
                {editing && <button onClick={()=>delPt(i)} style={delBtnAbsolute}>×</button>}
                <div style={{ width:76,height:76,borderRadius:'50%',background:isDark?'rgba(255,255,255,0.2)':t.ac,border:isDark?'2px solid rgba(255,255,255,0.45)':'none',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 26px',boxShadow:isDark?'none':`0 6px 20px ${t.ac}44` }}>
                  <span style={{ fontSize:30,fontWeight:800,color:'#fff',fontFamily:SERIF,lineHeight:1 }}>{getSecIcon(s,i)}</span>
                </div>
                {editing ? <PointInput value={p} onChange={v=>{const n=[...pts];n[i]=v;onChange('points',n)}} placeholder={'제목\n설명'} />
                  : <><p style={{ fontSize:30,fontWeight:800,color:isDark?'#fff':t.fg,margin:'0 0 10px',lineHeight:1.3,fontFamily:SERIF }}>{title}</p>{desc&&<p style={{ fontSize:22,color:isDark?'rgba(255,255,255,0.78)':t.fg,margin:0,lineHeight:1.68,opacity:isDark?1:0.65,whiteSpace:'pre-wrap' }}>{desc}</p>}</>}
              </div>
            )
          })}
        </div>
        {s.secImg2 && <div style={{ marginTop:44 }}><ImgBox url={s.secImg2} t={t} label="이미지 2" editing={editing} onImgChange={v=>onChange('secImg2',v)} imgMeta={secMeta?.img2} onMetaChange={m=>onSecMeta?.('img2',m)} /></div>}
      </div>
    </CardWrapper>
  )
}

export function TplTarget({ s, img, t, editing, onChange, secMeta, onSecMeta, fieldStyles = {} }) {
  const pts = s.points || []; const displayPts = pts.length ? pts : (editing ? ['','',''] : [])
  const delPt = i => onChange('points', pts.filter((_,j) => j !== i))

  return (
    <CardWrapper bg={'#fff'}>
      <div style={{ background: t.ac, padding: '64px 64px 60px', textAlign: 'center' }}>
        <div style={{ fontSize:20,fontWeight:800,letterSpacing:'0.3em',color:'rgba(255,255,255,0.65)',textTransform:'uppercase',marginBottom:18 }}>RECOMMENDED FOR</div>
        <EditText fieldKey="mainCopy" editing={editing} value={s.mainCopy} onChange={v=>onChange('mainCopy',v)} style={{ fontSize:68,fontWeight:900,color:'#fff',lineHeight:1.28,letterSpacing:'-0.025em',marginBottom:14,wordBreak:'keep-all',fontFamily:SERIF }} extraStyle={fieldStyles.mainCopy} />
        <EditText fieldKey="subCopy" editing={editing} value={s.subCopy} onChange={v=>onChange('subCopy',v)} style={{ fontSize:30,color:'rgba(255,255,255,0.78)',lineHeight:1.65,marginBottom:10 }} extraStyle={fieldStyles.subCopy} />
        <BodyText s={s} t={t} editing={editing} onChange={onChange} fieldStyles={fieldStyles} light />
      </div>
      <div style={{ paddingBottom: 56 }}>
        {displayPts.map((p, i) => (
          <div key={i} style={{ display:'flex',alignItems:'center',gap:24,padding:'30px 64px',background:i%2===0?'#fff':`${t.ac}0E` }}>
            <div style={{ width:46,height:46,borderRadius:'50%',background:t.ac,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,boxShadow:`0 4px 14px ${t.ac}44` }}><span style={{ fontSize:22,color:'#fff',fontWeight:800 }}>✓</span></div>
            {editing ? <PointInput value={p} onChange={v=>{const n=[...pts];n[i]=v;onChange('points',n)}} /> : <span style={{ fontSize:31,color:'#1a1a1a',lineHeight:1.68,fontWeight:500,whiteSpace:'pre-wrap' }}>{p.replace(/이런 분께 추천\d*:/i,'').trim()}</span>}
            {editing && <button onClick={()=>delPt(i)} style={delBtnInline}>×</button>}
          </div>
        ))}
      </div>
      {img && <ImgBox url={img} t={t} label="이미지" editing={editing} onImgChange={v=>onChange('secImg',v)} imgMeta={secMeta?.img1} onMetaChange={m=>onSecMeta?.('img1',m)} />}
    </CardWrapper>
  )
}

export function TplCTA({ s, img, t, editing, onChange, secMeta, onSecMeta, fieldStyles = {} }) {
  return (
    <CardWrapper bg={t.ac}>
      {img && <div style={{ position:'relative' }}>
        <ImgBox url={img} t={t} label="CTA 이미지" editing={editing} onImgChange={v=>onChange('secImg',v)} imgMeta={secMeta?.img1} onMetaChange={m=>onSecMeta?.('img1',m)} minH={440} />
        {(() => { const g=s.gradDir?mkGrad(s.gradDir,s.gradAlpha):`linear-gradient(to bottom, transparent 60%, ${t.ac} 100%)`; return g&&<div style={{ position:'absolute',inset:0,background:g,pointerEvents:'none' }} /> })()}
      </div>}
      {!img && <div style={{ minHeight:160,background:`linear-gradient(135deg, ${t.ac} 0%, ${t.ac}cc 100%)` }} />}
      <div style={{ padding:'76px 80px 96px',textAlign:'center',background:t.ac }}>
        <EditText fieldKey="mainCopy" editing={editing} value={s.mainCopy} onChange={v=>onChange('mainCopy',v)} style={{ fontSize:80,fontWeight:900,color:'#fff',lineHeight:1.24,letterSpacing:'-0.03em',marginBottom:24,wordBreak:'keep-all',fontFamily:SERIF }} extraStyle={fieldStyles.mainCopy} />
        <EditText fieldKey="subCopy" editing={editing} value={s.subCopy} onChange={v=>onChange('subCopy',v)} style={{ fontSize:32,color:'rgba(255,255,255,0.8)',lineHeight:1.78,wordBreak:'keep-all',marginBottom:10 }} extraStyle={fieldStyles.subCopy} />
        <BodyText s={s} t={t} editing={editing} onChange={onChange} fieldStyles={fieldStyles} light />
      </div>
    </CardWrapper>
  )
}

const DEFAULT_SPEC_ROWS = ['제품명::','식품유형::','업소명::','소재지::','유통기한::','중량::','원재료::','보관방법::','주의사항::']

export function TplSpecTable({ s, img, t, editing, onChange, fieldStyles = {} }) {
  const pts = s.points || []; const displayPts = editing ? (pts.length ? pts : [...DEFAULT_SPEC_ROWS]) : pts.filter(p => p && p.trim())
  const addRow = () => onChange('points', [...pts, '항목::']); const delRow = i => onChange('points', pts.filter((_,j) => j !== i))

  return (
    <CardWrapper bg="#fff">
      <div style={{ padding:'52px 64px 36px',textAlign:'center',borderBottom:'2.5px solid #111' }}>
        <EditText fieldKey="mainCopy" editing={editing} value={s.mainCopy||'제품 상세 정보'} onChange={v=>onChange('mainCopy',v)} style={{ fontSize:50,fontWeight:900,color:'#111',letterSpacing:'-0.025em',marginBottom:10,fontFamily:SERIF }} extraStyle={fieldStyles.mainCopy} />
        {(s.subCopy||editing) && <EditText fieldKey="subCopy" editing={editing} value={s.subCopy} onChange={v=>onChange('subCopy',v)} style={{ fontSize:24,color:'#888',lineHeight:1.65 }} extraStyle={fieldStyles.subCopy} />}
      </div>
      <div style={{ padding:'0 64px 72px' }}>
        <table style={{ width:'100%',borderCollapse:'collapse',marginTop:36 }}>
          <thead><tr style={{ background:'#f5f4f0',borderBottom:'2px solid #333' }}>
            <th style={{ padding:'14px 20px',fontSize:16,fontWeight:700,color:'#333',textAlign:'left',width:'28%',borderRight:'1px solid #e4e2dc' }}>항목</th>
            <th style={{ padding:'14px 20px',fontSize:16,fontWeight:700,color:'#333',textAlign:'left' }}>내용</th>
            {editing && <th style={{ width:44 }} />}
          </tr></thead>
          <tbody>
            {displayPts.map((p, i) => {
              const sep=p.indexOf('::'); const key=sep>=0?p.slice(0,sep):p; const val=sep>=0?p.slice(sep+2):''
              return (
                <tr key={i} style={{ borderBottom:'1px solid #e4e2dc',background:i%2===0?'#fff':'#fafaf8' }}>
                  <td style={{ padding:'14px 20px',fontSize:17,fontWeight:600,color:'#555',borderRight:'1px solid #e4e2dc',verticalAlign:'middle' }}>
                    {editing ? <input value={key} onChange={e=>{const n=[...pts];n[i]=e.target.value+'::'+val;onChange('points',n)}} style={{ width:'100%',border:'1px solid #3b82f6',borderRadius:5,padding:'5px 8px',fontSize:13,fontFamily:'inherit',outline:'none',boxSizing:'border-box' }} /> : key}
                  </td>
                  <td style={{ padding:'14px 20px',fontSize:17,color:'#222',verticalAlign:'middle' }}>
                    {editing ? <input value={val} onChange={e=>{const n=[...pts];n[i]=key+'::'+e.target.value;onChange('points',n)}} style={{ width:'100%',border:'1px solid #3b82f6',borderRadius:5,padding:'5px 8px',fontSize:13,fontFamily:'inherit',outline:'none',boxSizing:'border-box' }} /> : val?<span style={{ whiteSpace:'pre-wrap' }}>{val}</span>:<span style={{ color:'#ccc' }}>—</span>}
                  </td>
                  {editing && <td style={{ textAlign:'center',padding:'0 8px',verticalAlign:'middle' }}><button onClick={()=>delRow(i)} style={{ width:24,height:24,borderRadius:6,border:'1px solid #fca5a5',background:'#fef2f2',color:'#ef4444',fontSize:13,cursor:'pointer',fontWeight:700,lineHeight:1 }}>×</button></td>}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </CardWrapper>
  )
}

const delBtnAbsolute = { position:'absolute',top:8,right:8,width:32,height:32,borderRadius:8,border:'1px solid #fca5a5',background:'#fef2f2',color:'#ef4444',fontSize:18,cursor:'pointer',fontWeight:800,lineHeight:1,zIndex:2,display:'flex',alignItems:'center',justifyContent:'center' }
const delBtnInline   = { width:32,height:32,borderRadius:8,border:'1px solid #fca5a5',background:'#fef2f2',color:'#ef4444',fontSize:18,cursor:'pointer',flexShrink:0,fontWeight:800,lineHeight:1,display:'flex',alignItems:'center',justifyContent:'center' }
const cmpInput       = { width:'100%',fontSize:24,border:'1px solid #3b82f6',borderRadius:6,padding:'7px 10px',outline:'none',fontFamily:'inherit',boxSizing:'border-box' }

export const TPL = {
  hero: TplHero, material: TplMaterial, detail2col: TplDetail2col, scene: TplScene,
  compare: TplCompare, points3: TplPoints3, target: TplTarget, cta: TplCTA, specTable: TplSpecTable,
  fullHero: TplHero, topBottom: TplMaterial, leftRight: TplDetail2col,
  points3icon: TplPoints3, story: TplMaterial, howTo: TplTarget,
}

export const FONT_OPTS = [
  { v: 'Noto Sans KR', l: '기본체' },
  { v: 'Black Han Sans', l: '블랙한산스' },
  { v: 'Nanum Myeongjo', l: '나눔명조' },
  { v: 'Nanum Gothic', l: '나눔고딕' },
  { v: 'Gaegu', l: '가에구' },
  { v: 'Jua', l: '주아체' },
]

export const SHAPE_DEFS = [
  { k: 'circle',  l: '● 원형' },
  { k: 'square',  l: '■ 사각' },
  { k: 'diamond', l: '◆ 다이아' },
  { k: 'star',    l: '★ 별' },
  { k: 'check',   l: '✓ 체크' },
]
