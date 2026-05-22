// src/components/SectionEditor.jsx
import React, { useState, useRef, useEffect } from 'react'
import { C, DS, TPL_COMPAT } from '../constants'
import { TPL } from './SectionTemplates'

function getGradCSS(grad, t) {
  const alpha = (grad.alpha ?? 70) / 100
  const col   = grad.color || t.bg || '#000000'
  const m     = col.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i)
  const rgb   = m ? `${parseInt(m[1],16)},${parseInt(m[2],16)},${parseInt(m[3],16)}` : '0,0,0'
  const dirs  = { top: 'to bottom', bottom: 'to top', left: 'to right', right: 'to left' }
  return `linear-gradient(${dirs[grad.dir] || 'to bottom'}, rgba(${rgb},${alpha}) 0%, rgba(${rgb},0) 60%)`
}

/* ── 오버레이 텍스트 블록 ── */
function OverlayTextBlock({ ot, containerRef, onUpdate, onRemove, isActive, onSelect }) {
  const [dragging, setDragging] = useState(false)
  const startRef = useRef(null)

  useEffect(() => {
    if (!dragging) return
    const onMove = e => {
      const container = containerRef.current
      if (!container || !startRef.current) return
      const rect = container.getBoundingClientRect()
      const { mx, my, ox, oy } = startRef.current
      const nx = Math.max(0, Math.min(90, ox + (e.clientX - mx) / rect.width * 100))
      const ny = Math.max(0, Math.min(95, oy + (e.clientY - my) / rect.height * 100))
      onUpdate({ ...ot, x: nx, y: ny })
    }
    const onUp = () => setDragging(false)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [dragging, ot, onUpdate, containerRef])

  const handleMD = e => {
    if (e.target.getAttribute('contenteditable') === 'true') return
    const container = containerRef.current
    if (!container) return
    startRef.current = { mx: e.clientX, my: e.clientY, ox: ot.x ?? 10, oy: ot.y ?? 10 }
    setDragging(true)
    onSelect(ot.id)
    e.preventDefault()
    e.stopPropagation()
  }

  const st = {
    fontSize:   ot.style?.fontSize   ?? 24,
    color:      ot.style?.color      ?? '#ffffff',
    fontFamily: ot.style?.fontFamily ?? "'Nanum Gothic', sans-serif",
    fontWeight: ot.style?.bold ? 700 : 400,
    lineHeight: 1.4,
    whiteSpace: 'pre-wrap',
    wordBreak:  'keep-all',
    textShadow: '0 2px 10px rgba(0,0,0,0.7)',
  }

  return (
    <div
      style={{
        position:'absolute', left:`${ot.x ?? 10}%`, top:`${ot.y ?? 10}%`, zIndex:15,
        cursor: dragging ? 'grabbing' : 'grab',
        outline: isActive ? '2px solid #3b82f6' : 'none',
        borderRadius:4, padding: '3px 6px',
      }}
      onMouseDown={handleMD}
      onClick={e => { onSelect(ot.id); e.stopPropagation() }}
    >
      <div
        contentEditable suppressContentEditableWarning
        style={{ ...st, outline:'none', cursor:'text', minWidth:20 }}
        onFocus={e => { onSelect(ot.id); e.stopPropagation() }}
        onBlur={e => onUpdate({ ...ot, text: e.currentTarget.innerText })}
        dangerouslySetInnerHTML={{ __html: ot.text || '텍스트' }}
      />
      {isActive && (
        <button
          onClick={e => { e.stopPropagation(); onRemove(ot.id) }}
          style={{
            position:'absolute', top:-10, right:-10, width:20, height:20,
            borderRadius:'50%', background:'#ef4444', border:'none', color:'#fff',
            fontSize:13, fontWeight:700, cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center', zIndex:20,
          }}
        >×</button>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════
   SectionEditor — Canva-style: 클릭 선택, 인라인 편집
   우측 패널은 DetailView(App.jsx)의 CanvaPanel이 담당
══════════════════════════════════════════════════ */
export default function SectionEditor({
  sec, idx, onUpdate,
  isSelected, onSelect,
  activeField, onActiveFieldChange,
  activeOverlay, onActiveOverlayChange,
}) {
  const [scale,   setScale]   = useState(1)
  const [secMeta, setSecMeta] = useState({})
  const ref     = useRef(null)
  const wrapRef = useRef(null)

  useEffect(() => {
    const el = wrapRef.current; if (!el) return
    const obs = new ResizeObserver(() => setScale(Math.min(1, el.offsetWidth / 860)))
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    const inner = ref.current; if (!inner || !wrapRef.current) return
    const update = () => {
      if (wrapRef.current && ref.current)
        wrapRef.current.style.height = ref.current.offsetHeight * scale + 'px'
    }
    update()
    const obs = new ResizeObserver(update)
    obs.observe(inner)
    return () => obs.disconnect()
  }, [scale])

  const baseT = DS[sec.designStyle] || Object.values(DS)[0]
  const t     = { ...baseT, ...(sec.customColors || {}) }

  const change     = (key, val) => onUpdate(idx, { ...sec, [key]: val })
  const updOverlay = updated   => onUpdate(idx, {
    ...sec,
    overlayTexts: (sec.overlayTexts || []).map(ot => ot.id === updated.id ? updated : ot),
  })
  const rmOverlay = id => {
    onUpdate(idx, { ...sec, overlayTexts: (sec.overlayTexts || []).filter(ot => ot.id !== id) })
    if (activeOverlay === id) onActiveOverlayChange?.(null)
  }

  const grad   = sec.gradient || {}
  const tplKey = TPL[sec.template] ? sec.template : (TPL_COMPAT[sec.template] || 'topBottom')
  const Tpl    = TPL[tplKey] || TPL.topBottom
  const img    = sec.secImg || 'slot'

  return (
    <div
      onClick={() => onSelect?.(idx)}
      style={{
        marginBottom: 10,
        borderRadius: 10,
        overflow: 'clip',
        border: `2.5px solid ${isSelected ? '#3b82f6' : 'transparent'}`,
        transition: 'border-color .15s',
        position: 'relative',
        cursor: 'default',
        boxShadow: isSelected
          ? '0 0 0 4px rgba(59,130,246,0.12)'
          : '0 1px 5px rgba(0,0,0,0.08)',
      }}
    >
      {/* 섹션 배지 */}
      <div style={{
        position:'absolute', top:8, left:8, zIndex:20, pointerEvents:'none',
        background: isSelected ? '#3b82f6' : 'rgba(0,0,0,0.45)',
        color:'#fff', fontSize:10, fontWeight:700,
        padding:'2px 8px', borderRadius:4,
      }}>
        S{idx+1} · {sec.sectionType}
      </div>

      {/* 카드 미리보기 */}
      <div ref={wrapRef} style={{ position:'relative', background:'#e8e6e0', overflow:'hidden' }}>
        <div style={{ width:860, transformOrigin:'top left', transform:`scale(${scale})` }}>
          <div
            ref={ref}
            data-sect-card
            style={{ fontFamily:"'Nanum Gothic','Apple SD Gothic Neo',sans-serif", width:860, position:'relative' }}
          >
            <Tpl
              s={sec} img={img} t={t} editing={true} onChange={change}
              secMeta={secMeta}
              onSecMeta={(key,val) => setSecMeta(p => ({...p,[key]:val}))}
              onFieldFocus={f => { onActiveFieldChange?.(f); onActiveOverlayChange?.(null) }}
            />
            {grad.dir && grad.dir !== 'none' && (
              <div style={{
                position:'absolute', inset:0, pointerEvents:'none', zIndex:8,
                background: getGradCSS(grad, t),
              }} />
            )}
            {(sec.overlayTexts || []).map(ot => (
              <OverlayTextBlock
                key={ot.id} ot={ot}
                containerRef={ref}
                isActive={activeOverlay === ot.id}
                onSelect={id => { onActiveOverlayChange?.(id); onActiveFieldChange?.(null) }}
                onUpdate={updOverlay}
                onRemove={rmOverlay}
              />
            ))}
            <div style={{ padding:'6px 20px', textAlign:'right', fontSize:9, color:t.fg, opacity:0.1, background:t.bg }}>
              ContentOS
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
