// src/components/SectionEditor.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react'
import { C, DS } from '../constants'
import { ImgBox, mkGrad } from './SectionTemplates'
import { capturePNG } from '../utils'

const CARD_W = 860
const CARD_H = 640

export const NAMED_BLOCKS = [
  { key: 'mainCopy', label: '메인', x: 60, y: 300, w: 740, fontSize: 72, color: '#ffffff', fontWeight: 900 },
  { key: 'subCopy',  label: '서브', x: 60, y: 410, w: 740, fontSize: 28, color: 'rgba(255,255,255,0.85)', fontWeight: 400 },
  { key: 'bodyText', label: '내용', x: 60, y: 470, w: 740, fontSize: 20, color: 'rgba(255,255,255,0.72)', fontWeight: 400 },
]

const RESIZE_HANDLES = [
  { dir: 'nw', style: { top: -4, left: -4,                                        cursor: 'nw-resize' } },
  { dir: 'n',  style: { top: -4, left: '50%', transform: 'translateX(-50%)',       cursor: 'n-resize'  } },
  { dir: 'ne', style: { top: -4, right: -4,                                        cursor: 'ne-resize' } },
  { dir: 'e',  style: { top: '50%', right: -4, transform: 'translateY(-50%)',      cursor: 'e-resize'  } },
  { dir: 'se', style: { bottom: -4, right: -4,                                     cursor: 'se-resize' } },
  { dir: 's',  style: { bottom: -4, left: '50%', transform: 'translateX(-50%)',    cursor: 's-resize'  } },
  { dir: 'sw', style: { bottom: -4, left: -4,                                      cursor: 'sw-resize' } },
  { dir: 'w',  style: { top: '50%', left: -4, transform: 'translateY(-50%)',       cursor: 'w-resize'  } },
]

/* ── 드래그 + 리사이즈 텍스트 블록 ── */
function DragBlock({ bKey, label, text, pos, style, editing, selected, onSelect, onTextChange, onPosChange, onRemove, onFontResize, scale }) {
  const [localEdit, setLocalEdit] = useState(false)
  const [dragState, setDragState] = useState(null)
  const [resizeDir, setResizeDir] = useState(null)
  const taRef    = useRef(null)
  const blockRef = useRef(null)

  const { x = 60, y = 300, w = 740, h = null } = pos

  const handleMouseDown = e => {
    if (!editing) return
    if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'BUTTON') return
    if (e.target.hasAttribute('data-resize-handle')) return
    e.stopPropagation(); e.preventDefault()
    onSelect()
    const sc = scale || 1
    setDragState({ startMx: e.clientX / sc, startMy: e.clientY / sc, baseX: x, baseY: y })
  }

  useEffect(() => {
    if (!dragState) return
    const sc = scale || 1
    const move = e => {
      const nx = Math.max(0, Math.min(CARD_W - w, dragState.baseX + (e.clientX / sc - dragState.startMx)))
      const ny = Math.max(0, Math.min(CARD_H - 40, dragState.baseY + (e.clientY / sc - dragState.startMy)))
      onPosChange({ ...pos, x: nx, y: ny })
    }
    const up = () => setDragState(null)
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up) }
  }, [dragState]) // eslint-disable-line

  const handleResizeDown = (e, dir) => {
    e.stopPropagation(); e.preventDefault()
    const sc = scale || 1
    const curH = blockRef.current ? blockRef.current.offsetHeight : (h || 40)
    setResizeDir({
      dir,
      startMx: e.clientX / sc, startMy: e.clientY / sc,
      startW: w, startH: curH, startX: x, startY: y,
      startFontSize: style.fontSize || 28,
    })
  }

  useEffect(() => {
    if (!resizeDir) return
    const sc = scale || 1
    const move = e => {
      const dx = e.clientX / sc - resizeDir.startMx
      const dy = e.clientY / sc - resizeDir.startMy
      const { dir, startW, startH, startX, startY, startFontSize } = resizeDir
      const aspect = startW / (startH || 1)

      let newX = startX, newY = startY, newW = startW, newH = startH

      if (dir.includes('e')) newW = Math.max(50, Math.min(CARD_W - startX, startW + dx))
      if (dir.includes('w')) {
        const rawX = startX + dx
        newX = Math.max(0, Math.min(startX + startW - 50, rawX))
        newW = startW + (startX - newX)
      }
      if (dir.includes('s')) newH = Math.max(20, startH + dy)
      if (dir.includes('n')) {
        const rawY = startY + dy
        newY = Math.max(0, Math.min(startY + startH - 20, rawY))
        newH = startH + (startY - newY)
      }

      /* Shift 키: 모서리 드래그 시 비율 고정 */
      if (e.shiftKey && dir.length === 2) {
        if (dir.includes('e') || dir.includes('w')) {
          newH = newW / aspect
          if (dir.includes('n')) newY = startY + startH - newH
        } else {
          newW = newH * aspect
          if (dir.includes('w')) newX = startX + startW - newW
        }
      }

      newW = Math.max(50, newW)
      newH = Math.max(20, newH)

      /* 모서리 드래그 시 폰트 비례 변경 */
      if (dir.length === 2 && onFontResize) {
        const ratio = newW / startW
        const newFs = Math.min(200, Math.max(10, Math.round(startFontSize * ratio)))
        onFontResize(newFs)
      }

      onPosChange({ ...pos, x: newX, y: newY, w: newW, h: newH })
    }
    const up = () => setResizeDir(null)
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up) }
  }, [resizeDir]) // eslint-disable-line

  useEffect(() => { if (localEdit && taRef.current) taRef.current.focus() }, [localEdit])

  const fs = style.fontSize   || 28
  const ff = style.fontFamily || 'inherit'
  const fc = style.color      || '#ffffff'
  const fw = style.fontWeight || 700
  const ta = style.textAlign  || 'left'
  const txStyle = { fontSize: fs, fontFamily: ff, color: fc, fontWeight: fw, textAlign: ta, lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'keep-all' }

  if (!editing && !text) return null

  return (
    <div
      ref={blockRef}
      onMouseDown={handleMouseDown}
      onClick={e => { e.stopPropagation(); if (editing) onSelect() }}
      onDoubleClick={e => { e.stopPropagation(); if (editing) setLocalEdit(true) }}
      style={{ position: 'absolute', left: x, top: y, width: w, height: h || undefined, zIndex: 10, borderRadius: 4,
        cursor: editing ? (dragState ? 'grabbing' : 'grab') : 'default', boxSizing: 'border-box' }}
    >
      {editing && (
        <div style={{ position: 'absolute', inset: -3, borderRadius: 6, pointerEvents: 'none', zIndex: 5,
          border: selected ? '2px solid #3b82f6' : '1px dashed rgba(255,255,255,0.4)' }} />
      )}

      {editing && selected && label && (
        <div style={{ position: 'absolute', top: -22, left: 0, fontSize: 10, fontWeight: 700,
          color: '#fff', background: '#3b82f6', padding: '1px 7px', borderRadius: 4, zIndex: 25, whiteSpace: 'nowrap' }}>
          {label}
        </div>
      )}

      {editing && (
        <button onMouseDown={e => e.stopPropagation()}
          onClick={e => { e.stopPropagation(); onRemove() }}
          style={{ position: 'absolute', top: -10, right: -10, zIndex: 20, width: 22, height: 22,
            borderRadius: '50%', border: 'none', background: '#ef4444', color: '#fff',
            fontSize: 14, cursor: 'pointer', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
      )}

      {editing && selected && RESIZE_HANDLES.map(({ dir, style: hs }) => (
        <div key={dir} data-resize-handle
          onMouseDown={e => handleResizeDown(e, dir)}
          style={{ position: 'absolute', width: 8, height: 8, background: '#ffffff',
            border: '1.5px solid #3b82f6', borderRadius: 2, zIndex: 25, ...hs }} />
      ))}

      {localEdit
        ? <textarea ref={taRef}
            value={text || ''}
            onChange={e => onTextChange(e.target.value)}
            onBlur={() => setLocalEdit(false)}
            onClick={e => e.stopPropagation()}
            onMouseDown={e => e.stopPropagation()}
            rows={Math.max(2, (text || '').split('\n').length + 1)}
            style={{ ...txStyle, width: '100%', height: h ? '100%' : undefined,
              background: 'rgba(0,0,0,0.6)', border: '2px solid #3b82f6',
              borderRadius: 6, padding: '10px 14px', outline: 'none', resize: 'none', boxSizing: 'border-box' }}
          />
        : <p style={{ ...txStyle, margin: 0, padding: '8px 12px',
            opacity: text ? 1 : (editing ? 0.4 : 0),
            textShadow: '0 2px 8px rgba(0,0,0,0.7)' }}>
            {text || (editing ? `${label || '텍스트'} · 더블클릭 편집` : '')}
          </p>
      }
    </div>
  )
}

/* ── 오버레이 아이콘 ── */
function OverlayIcon({ icon, editing, selected, onSelect, onUpdate, onRemove, scale }) {
  const [dragState, setDragState] = useState(null)
  const { x = 100, y = 500, icon: ch = '★', fontSize = 40, color = '#ffffff' } = icon

  const handleMouseDown = e => {
    if (!editing) return
    if (e.target.tagName === 'BUTTON') return
    e.stopPropagation(); e.preventDefault()
    onSelect()
    const sc = scale || 1
    setDragState({ startMx: e.clientX / sc, startMy: e.clientY / sc, baseX: x, baseY: y })
  }

  useEffect(() => {
    if (!dragState) return
    const sc = scale || 1
    const move = e => {
      const nx = Math.max(0, Math.min(CARD_W - fontSize, dragState.baseX + (e.clientX / sc - dragState.startMx)))
      const ny = Math.max(0, Math.min(CARD_H - fontSize, dragState.baseY + (e.clientY / sc - dragState.startMy)))
      onUpdate({ x: nx, y: ny })
    }
    const up = () => setDragState(null)
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up) }
  }, [dragState]) // eslint-disable-line

  return (
    <div
      onMouseDown={handleMouseDown}
      onClick={e => { e.stopPropagation(); if (editing) onSelect() }}
      style={{ position: 'absolute', left: x, top: y, fontSize, color, lineHeight: 1,
        cursor: editing ? (dragState ? 'grabbing' : 'grab') : 'default',
        userSelect: 'none', zIndex: 12, padding: 4, borderRadius: 4,
        outline: selected && editing ? '2px solid #3b82f6' : 'none', boxSizing: 'content-box' }}
    >
      {ch}
      {editing && (
        <button onMouseDown={e => e.stopPropagation()}
          onClick={e => { e.stopPropagation(); onRemove() }}
          style={{ position: 'absolute', top: -8, right: -8, width: 18, height: 18,
            borderRadius: '50%', border: 'none', background: '#ef4444', color: '#fff',
            fontSize: 10, cursor: 'pointer', fontWeight: 800,
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20 }}>×</button>
      )}
    </div>
  )
}

/* ── 하단 그라데이션 오버레이 ── */
function BottomOverlay({ bottomBox, editing, scale, activeBlockId, onBlockSelect, onUpdate }) {
  const { bgColor = '#000000', intensity = 50, textBlocks = [], icons = [] } = bottomBox || {}

  const gradBg = `linear-gradient(to top, ${bgColor}, transparent ${intensity}%)`

  const updateBlocks = newBlocks => onUpdate({ textBlocks: newBlocks })
  const updateIcons  = newIcons  => onUpdate({ icons: newIcons })

  return (
    <div
      style={{ position: 'absolute', inset: 0, zIndex: 8, background: gradBg,
        pointerEvents: editing ? 'auto' : 'none' }}
      onClick={e => { if (e.target === e.currentTarget && editing) { onBlockSelect?.(null); e.stopPropagation() } }}
    >
      {/* 오버레이 내 텍스트 블록 */}
      {textBlocks.map(b => (
        <DragBlock
          key={b.id}
          bKey={b.id}
          label="텍스트"
          text={b.content || ''}
          pos={{ x: b.x ?? 100, y: b.y ?? 400, w: b.w ?? 300, h: b.h }}
          style={{ fontSize: b.fontSize || 28, color: b.color || '#ffffff', fontFamily: b.fontFamily || '', fontWeight: b.fontWeight || 700, textAlign: b.align || 'left' }}
          editing={editing}
          selected={activeBlockId === b.id}
          onSelect={() => onBlockSelect?.(b.id)}
          onTextChange={v => updateBlocks(textBlocks.map(tb => tb.id === b.id ? { ...tb, content: v } : tb))}
          onPosChange={p => updateBlocks(textBlocks.map(tb => tb.id === b.id ? { ...tb, x: p.x, y: p.y, w: p.w, h: p.h } : tb))}
          onRemove={() => { updateBlocks(textBlocks.filter(tb => tb.id !== b.id)); if (activeBlockId === b.id) onBlockSelect?.(null) }}
          onFontResize={newFs => updateBlocks(textBlocks.map(tb => tb.id === b.id ? { ...tb, fontSize: newFs } : tb))}
          scale={scale}
        />
      ))}

      {/* 오버레이 내 아이콘 */}
      {icons.map(ic => (
        <OverlayIcon
          key={ic.id}
          icon={ic}
          editing={editing}
          selected={activeBlockId === ic.id}
          onSelect={() => onBlockSelect?.(ic.id)}
          onUpdate={patch => updateIcons(icons.map(i => i.id === ic.id ? { ...i, ...patch } : i))}
          onRemove={() => { updateIcons(icons.filter(i => i.id !== ic.id)); if (activeBlockId === ic.id) onBlockSelect?.(null) }}
          scale={scale}
        />
      ))}
    </div>
  )
}

function Spin() {
  return <span style={{ display:'inline-block',width:10,height:10,border:'2px solid #ccc',borderTopColor:'#3b82f6',borderRadius:'50%',animation:'spin 0.7s linear infinite',marginRight:3 }} />
}

/* ═══════════════════════════════════════
   SectionEditor
═══════════════════════════════════════ */
export default function SectionEditor({
  sec, idx, onUpdate, onDelete,
  isSelected, onSelect,
  onActiveFieldChange,
  activeBlockId, onBlockSelect,
}) {
  const [capturing, setCapturing] = useState(false)
  const [dr, setDr]   = useState(sec)
  const [dl, setDl]   = useState(false)
  const [scale, setScale] = useState(1)
  const [secMeta, setSecMeta] = useState({})
  const [hovered, setHovered] = useState(false)

  const drRef = useRef(dr)
  useEffect(() => { drRef.current = dr }, [dr])

  useEffect(() => {
    const start = () => setCapturing(true)
    const end   = () => setCapturing(false)
    document.addEventListener('png-capture-start', start)
    document.addEventListener('png-capture-end',   end)
    return () => { document.removeEventListener('png-capture-start', start); document.removeEventListener('png-capture-end', end) }
  }, [])

  useEffect(() => {
    const nd = { ...drRef.current, ...sec }
    drRef.current = nd
    setDr(nd)
  }, [sec]) // eslint-disable-line

  const ref     = useRef(null)
  const wrapRef = useRef(null)

  useEffect(() => {
    const el = wrapRef.current; if (!el) return
    const obs = new ResizeObserver(() => setScale(Math.min(1, el.offsetWidth / CARD_W)))
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    const inner = ref.current; if (!inner || !wrapRef.current) return
    const update = () => { if (wrapRef.current && ref.current) wrapRef.current.style.height = ref.current.offsetHeight * scale + 'px' }
    update()
    const obs = new ResizeObserver(update)
    obs.observe(inner)
    return () => obs.disconnect()
  }, [scale])

  const t = DS[dr.designStyle] || Object.values(DS)[0]

  const commit = useCallback((patch) => {
    const nd = { ...drRef.current, ...patch }
    drRef.current = nd
    setDr(nd)
    onUpdate(idx, nd)
  }, [idx, onUpdate]) // eslint-disable-line

  const dlPNG = async () => {
    if (!ref.current) return
    setDl(true); setCapturing(true)
    await new Promise(r => setTimeout(r, 80))
    try { await capturePNG(ref.current, `section_${idx+1}_${sec.sectionType}.png`) }
    catch(e) { alert('저장 오류: '+e.message) }
    finally { setDl(false); setCapturing(false) }
  }

  const editing = !capturing

  const getNamedStyle = key => {
    const def = NAMED_BLOCKS.find(b => b.key === key) || {}
    return { fontSize: def.fontSize || 28, color: def.color || '#ffffff', fontWeight: def.fontWeight || 700, fontFamily: '', ...(dr.textStyles?.[key] || {}) }
  }
  const getNamedPos = key => {
    const def = NAMED_BLOCKS.find(b => b.key === key) || {}
    return { x: def.x || 60, y: def.y || 300, w: def.w || 740, ...(dr.blockPositions?.[key] || {}) }
  }

  const freeBlocks = dr.freeBlocks || []

  const grad = dr.gradient?.dir && dr.gradient.dir !== 'none'
    ? mkGrad(dr.gradient.dir, dr.gradient.alpha ?? 70)
    : null

  const placeholderImg = `https://picsum.photos/seed/${idx + 1}/860/640`
  const img = dr.secImg || placeholderImg
  const dlLabel = dl ? '변환 중' : '↓ PNG'

  return (
    <div
      onClick={e => { onSelect?.(idx); e.stopPropagation() }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ position: 'relative', cursor: 'default' }}
    >
      {(isSelected || hovered) && (
        <div style={{ position:'absolute',inset:0,zIndex:20,pointerEvents:'none',
          border: isSelected ? '3px solid #2563EB' : '2px solid #93C5FD' }} />
      )}

      {/* 툴바 */}
      <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'8px 14px',background:'#EFF6FF',borderBottom:'1px solid #BFDBFE',flexWrap:'wrap',gap:6 }}>
        <div style={{ display:'flex',alignItems:'center',gap:8,flexWrap:'wrap' }}>
          <div style={{ width:8,height:8,borderRadius:'50%',background:t.ac }} />
          <span style={{ fontSize:12,fontWeight:700,color:C.tx }}>S{idx+1}</span>
          <span style={{ fontSize:11,color:C.mu }}>{sec.sectionType}</span>
          <span style={{ padding:'3px 9px',fontSize:10,borderRadius:16,border:`1px solid ${t.bd}`,background:t.sub,color:t.ac,fontWeight:600 }}>{dr.designStyle}</span>
        </div>
        <div style={{ display:'flex',gap:6,alignItems:'center' }}>
          <button onClick={dlPNG} disabled={dl}
            style={{ padding:'5px 10px',fontSize:11,borderRadius:7,border:`1px solid ${dl?C.bd:'#1d6b45'}`,background:dl?C.alt:'#f0fdf4',color:dl?C.fa:'#1d6b45',cursor:dl?'not-allowed':'pointer',display:'flex',alignItems:'center',gap:4,fontWeight:dl?400:600 }}>
            {dl?<><Spin/>{dlLabel}</>:dlLabel}
          </button>
          {onDelete && (
            <button onClick={onDelete}
              style={{ padding:'5px 10px',fontSize:11,borderRadius:7,border:'1px solid #fca5a5',background:'#fef2f2',color:'#ef4444',cursor:'pointer',fontWeight:700 }}>
              × 삭제
            </button>
          )}
        </div>
      </div>

      {/* 카드 */}
      <div ref={wrapRef} style={{ position:'relative',background:'#e8e6e0',overflow:'hidden' }}>
        <div style={{ width:CARD_W,transformOrigin:'top left',transform:`scale(${scale})` }}>
          <div ref={ref} data-sect-card style={{ fontFamily:"'Noto Sans KR','Apple SD Gothic Neo',sans-serif",width:CARD_W,position:'relative' }}>

            <div style={{ position:'relative', minHeight: CARD_H }}>
              <ImgBox url={img} t={t} label="배경 이미지" editing={editing}
                onImgChange={v => commit({ secImg: v })}
                imgMeta={secMeta?.img1} onMetaChange={m => setSecMeta(p=>({...p,img1:m}))}
                minH={CARD_H} fill />

              {/* 그라데이션 오버레이 (섹션 설정) */}
              {grad && <div style={{ position:'absolute',inset:0,background:grad,pointerEvents:'none' }} />}

              {/* 하단 그라데이션 오버레이 (bottomBox) */}
              {dr.bottomBox && (
                <BottomOverlay
                  bottomBox={dr.bottomBox}
                  editing={editing}
                  scale={scale}
                  activeBlockId={activeBlockId}
                  onBlockSelect={onBlockSelect}
                  onUpdate={patch => {
                    if (patch === null) {
                      commit({ bottomBox: null })
                    } else {
                      commit({ bottomBox: { ...(drRef.current.bottomBox || { bgColor: '#000000', intensity: 50, textBlocks: [], icons: [] }), ...patch } })
                    }
                  }}
                />
              )}

              {/* Named 텍스트 블록 (메인/서브/내용) — bottomBox 위로 */}
              {NAMED_BLOCKS.map(({ key, label }) => (
                <DragBlock
                  key={key}
                  bKey={key}
                  label={label}
                  text={dr[key] || ''}
                  pos={getNamedPos(key)}
                  style={getNamedStyle(key)}
                  editing={editing}
                  selected={isSelected && activeBlockId === key}
                  onSelect={() => { onBlockSelect?.(key); onActiveFieldChange?.(null) }}
                  onTextChange={v => commit({ [key]: v })}
                  onPosChange={p => commit({ blockPositions: { ...(drRef.current.blockPositions || {}), [key]: p } })}
                  onRemove={() => { commit({ [key]: '' }); if (activeBlockId === key) onBlockSelect?.(null) }}
                  onFontResize={newFs => {
                    const cur = drRef.current.textStyles || {}
                    commit({ textStyles: { ...cur, [key]: { ...(cur[key] || {}), fontSize: newFs } } })
                  }}
                  scale={scale}
                />
              ))}

              {/* Free 텍스트 블록 */}
              {freeBlocks.map(b => (
                <DragBlock
                  key={b.id}
                  bKey={b.id}
                  label="추가"
                  text={b.content || ''}
                  pos={{ x: b.x ?? 230, y: b.y ?? 80, w: b.w ?? 400, h: b.h }}
                  style={{ fontSize: b.fontSize || 28, color: b.color || '#ffffff', fontFamily: b.fontFamily || '', fontWeight: b.fontWeight || 700 }}
                  editing={editing}
                  selected={isSelected && activeBlockId === b.id}
                  onSelect={() => { onBlockSelect?.(b.id); onActiveFieldChange?.(null) }}
                  onTextChange={v => commit({ freeBlocks: drRef.current.freeBlocks.map(fb => fb.id === b.id ? {...fb, content: v} : fb) })}
                  onPosChange={p => commit({ freeBlocks: drRef.current.freeBlocks.map(fb => fb.id === b.id ? {...fb, x:p.x, y:p.y, w:p.w, h:p.h} : fb) })}
                  onRemove={() => { commit({ freeBlocks: drRef.current.freeBlocks.filter(fb => fb.id !== b.id) }); if (activeBlockId === b.id) onBlockSelect?.(null) }}
                  onFontResize={newFs => commit({ freeBlocks: drRef.current.freeBlocks.map(fb => fb.id === b.id ? {...fb, fontSize: newFs} : fb) })}
                  scale={scale}
                />
              ))}
            </div>

            <div style={{ padding:'6px 20px',textAlign:'right',fontSize:9,color:t.fg,opacity:0.1,background:t.bg }}>ContentOS</div>
          </div>
        </div>
      </div>
    </div>
  )
}
