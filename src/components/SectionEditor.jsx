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

/* ── 드래그 + 리사이즈 텍스트 블록 ── */
function DragBlock({ bKey, label, text, pos, style, editing, selected, onSelect, onTextChange, onPosChange, onRemove, scale }) {
  const [localEdit, setLocalEdit] = useState(false)
  const [dragState, setDragState] = useState(null)
  const [resizeDir, setResizeDir] = useState(null)
  const taRef = useRef(null)

  const { x = 60, y = 300, w = 740 } = pos

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
    setResizeDir({ dir, startMx: e.clientX / sc, startW: w, startX: x })
  }

  useEffect(() => {
    if (!resizeDir) return
    const sc = scale || 1
    const move = e => {
      const dx = e.clientX / sc - resizeDir.startMx
      if (resizeDir.dir === 'right') {
        const nw = Math.max(80, Math.min(CARD_W - resizeDir.startX, resizeDir.startW + dx))
        onPosChange({ ...pos, w: nw })
      } else {
        const rawX = resizeDir.startX + dx
        const nx = Math.max(0, Math.min(resizeDir.startX + resizeDir.startW - 80, rawX))
        const nw = resizeDir.startW + (resizeDir.startX - nx)
        onPosChange({ ...pos, x: nx, w: nw })
      }
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
  const txStyle = { fontSize: fs, fontFamily: ff, color: fc, fontWeight: fw, lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'keep-all' }

  if (!editing && !text) return null

  return (
    <div
      onMouseDown={handleMouseDown}
      onClick={e => { e.stopPropagation(); if (editing) onSelect() }}
      onDoubleClick={e => { e.stopPropagation(); if (editing) setLocalEdit(true) }}
      style={{ position: 'absolute', left: x, top: y, width: w, zIndex: 10, borderRadius: 4,
        cursor: editing ? (dragState ? 'grabbing' : 'grab') : 'default' }}
    >
      {/* 선택/편집 아웃라인 (캡처 시 editing=false → 사라짐) */}
      {editing && (
        <div style={{ position: 'absolute', inset: -3, borderRadius: 6, pointerEvents: 'none', zIndex: 5,
          border: selected ? '2px solid #3b82f6' : '1px dashed rgba(255,255,255,0.4)' }} />
      )}

      {/* 블록 레이블 */}
      {editing && selected && label && (
        <div style={{ position: 'absolute', top: -22, left: 0, fontSize: 10, fontWeight: 700,
          color: '#fff', background: '#3b82f6', padding: '1px 7px', borderRadius: 4, zIndex: 25, whiteSpace: 'nowrap' }}>
          {label}
        </div>
      )}

      {/* X 버튼 (캡처 시 숨김) */}
      {editing && (
        <button onMouseDown={e => e.stopPropagation()}
          onClick={e => { e.stopPropagation(); onRemove() }}
          style={{ position: 'absolute', top: -10, right: -10, zIndex: 20, width: 22, height: 22,
            borderRadius: '50%', border: 'none', background: '#ef4444', color: '#fff',
            fontSize: 14, cursor: 'pointer', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
      )}

      {/* 리사이즈 핸들 (캡처 시 숨김) */}
      {editing && selected && (
        <>
          <div data-resize-handle onMouseDown={e => handleResizeDown(e, 'left')}
            style={{ position: 'absolute', left: -6, top: '50%', transform: 'translateY(-50%)',
              width: 12, height: 40, background: '#3b82f6', borderRadius: 4, cursor: 'ew-resize', zIndex: 25 }} />
          <div data-resize-handle onMouseDown={e => handleResizeDown(e, 'right')}
            style={{ position: 'absolute', right: -6, top: '50%', transform: 'translateY(-50%)',
              width: 12, height: 40, background: '#3b82f6', borderRadius: 4, cursor: 'ew-resize', zIndex: 25 }} />
        </>
      )}

      {localEdit
        ? <textarea ref={taRef}
            value={text || ''}
            onChange={e => onTextChange(e.target.value)}
            onBlur={() => setLocalEdit(false)}
            onClick={e => e.stopPropagation()}
            onMouseDown={e => e.stopPropagation()}
            rows={Math.max(2, (text || '').split('\n').length + 1)}
            style={{ ...txStyle, width: '100%', background: 'rgba(0,0,0,0.6)', border: '2px solid #3b82f6',
              borderRadius: 6, padding: '10px 14px', outline: 'none', resize: 'both', boxSizing: 'border-box' }}
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

  // drRef은 항상 최신 dr 참조
  const drRef = useRef(dr)
  useEffect(() => { drRef.current = dr }, [dr])

  /* PNG 캡처 이벤트 */
  useEffect(() => {
    const start = () => setCapturing(true)
    const end   = () => setCapturing(false)
    document.addEventListener('png-capture-start', start)
    document.addEventListener('png-capture-end',   end)
    return () => { document.removeEventListener('png-capture-start', start); document.removeEventListener('png-capture-end', end) }
  }, [])

  /* 부모 → dr 동기화 */
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

  /* commit: dr + 부모 즉시 업데이트 (history tracking용) */
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

  /* Named block 헬퍼 */
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

            {/* 풀 배경 이미지 */}
            <div style={{ position:'relative', minHeight: CARD_H }}>
              <ImgBox url={img} t={t} label="배경 이미지" editing={editing}
                onImgChange={v => commit({ secImg: v })}
                imgMeta={secMeta?.img1} onMetaChange={m => setSecMeta(p=>({...p,img1:m}))}
                minH={CARD_H} fill />

              {/* 그라데이션 오버레이 */}
              {grad && <div style={{ position:'absolute',inset:0,background:grad,pointerEvents:'none' }} />}

              {/* Named 텍스트 블록 (메인/서브/내용) */}
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
                  scale={scale}
                />
              ))}

              {/* Free 텍스트 블록 (기존 사용자 추가 블록) */}
              {freeBlocks.map(b => (
                <DragBlock
                  key={b.id}
                  bKey={b.id}
                  label="추가"
                  text={b.content || ''}
                  pos={{ x: b.x ?? 230, y: b.y ?? 80, w: b.w ?? 400 }}
                  style={{ fontSize: b.fontSize || 28, color: b.color || '#ffffff', fontFamily: b.fontFamily || '', fontWeight: b.fontWeight || 700 }}
                  editing={editing}
                  selected={isSelected && activeBlockId === b.id}
                  onSelect={() => { onBlockSelect?.(b.id); onActiveFieldChange?.(null) }}
                  onTextChange={v => commit({ freeBlocks: drRef.current.freeBlocks.map(fb => fb.id === b.id ? {...fb, content: v} : fb) })}
                  onPosChange={p => commit({ freeBlocks: drRef.current.freeBlocks.map(fb => fb.id === b.id ? {...fb, x:p.x, y:p.y, w:p.w} : fb) })}
                  onRemove={() => { commit({ freeBlocks: drRef.current.freeBlocks.filter(fb => fb.id !== b.id) }); if (activeBlockId === b.id) onBlockSelect?.(null) }}
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
