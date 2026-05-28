// src/components/SectionEditor.jsx
import React, { useState, useRef, useEffect, useMemo } from 'react'
import { C, DS, TPL_LABELS } from '../constants'
import { TPL, TextSelectCtx } from './SectionTemplates'
import { capturePNG } from '../utils'

const DESIGN_FIELDS = ['template','designStyle','gradient','textStyles','customColors','iconSet','flipped','secImg2','secImg3','secImg4']

/* ── 드래그 + 리사이즈 가능 자유 텍스트 블록 ── */
function FreeBlock({ block, t, editing, selected, onSelect, onUpdate, onRemove, scale }) {
  const [localEdit, setLocalEdit] = useState(false)
  const [dragState, setDragState]   = useState(null)
  const [resizeDir, setResizeDir]   = useState(null)
  const taRef = useRef(null)

  const x  = block.x ?? 230
  const y  = block.y ?? 80
  const w  = block.w ?? 400
  const fs = block.fontSize   || 24
  const ff = block.fontFamily || 'inherit'
  const fc = block.color      || '#ffffff'
  const fw = block.fontWeight || 700
  const align = block.align   || 'center'

  /* ── 드래그 ── */
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
    const onMove = e => {
      const newX = Math.max(0, Math.min(860 - w, dragState.baseX + (e.clientX / sc - dragState.startMx)))
      const newY = Math.max(0, dragState.baseY + (e.clientY / sc - dragState.startMy))
      onUpdate({ ...block, x: newX, y: newY })
    }
    const onUp = () => setDragState(null)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup',   onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [dragState]) // eslint-disable-line

  /* ── 리사이즈 ── */
  const handleResizeDown = (e, dir) => {
    e.stopPropagation(); e.preventDefault()
    const sc = scale || 1
    setResizeDir({ dir, startMx: e.clientX / sc, startW: w, startX: x })
  }

  useEffect(() => {
    if (!resizeDir) return
    const sc = scale || 1
    const onMove = e => {
      const dx = e.clientX / sc - resizeDir.startMx
      if (resizeDir.dir === 'right') {
        const newW = Math.max(80, Math.min(860 - resizeDir.startX, resizeDir.startW + dx))
        onUpdate({ ...block, w: newW })
      } else {
        const rawX = resizeDir.startX + dx
        const newX = Math.max(0, Math.min(resizeDir.startX + resizeDir.startW - 80, rawX))
        const newW = resizeDir.startW + (resizeDir.startX - newX)
        onUpdate({ ...block, x: newX, w: newW })
      }
    }
    const onUp = () => setResizeDir(null)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup',   onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [resizeDir]) // eslint-disable-line

  useEffect(() => { if (localEdit && taRef.current) taRef.current.focus() }, [localEdit])

  const textStyle = { fontSize: fs, fontFamily: ff, color: fc, fontWeight: fw, textAlign: align, lineHeight: 1.7, whiteSpace: 'pre-wrap', wordBreak: 'keep-all' }

  return (
    <div
      onMouseDown={handleMouseDown}
      onClick={e => { e.stopPropagation(); if (editing) onSelect() }}
      onDoubleClick={e => { e.stopPropagation(); if (editing) setLocalEdit(true) }}
      style={{ position: 'absolute', left: x, top: y, width: w, zIndex: 10, borderRadius: 4,
        cursor: editing ? (dragState ? 'grabbing' : 'grab') : 'default' }}
    >
      {/* 선택/편집 아웃라인 (캡처 시 editing=false → 숨김) */}
      {editing && (
        <div style={{ position: 'absolute', inset: -3, borderRadius: 6, pointerEvents: 'none', zIndex: 5,
          border: selected ? '2px solid #3b82f6' : '1px dashed rgba(255,255,255,0.35)' }} />
      )}

      {/* X 버튼 (캡처 시 숨김) */}
      {editing && (
        <button onMouseDown={e => e.stopPropagation()}
          onClick={e => { e.stopPropagation(); onRemove() }}
          style={{ position: 'absolute', top: -10, right: -10, zIndex: 20, width: 22, height: 22,
            borderRadius: '50%', border: 'none', background: '#ef4444', color: '#fff',
            fontSize: 14, cursor: 'pointer', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          ×
        </button>
      )}

      {/* 리사이즈 핸들 (선택 시에만, 캡처 시 숨김) */}
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
            value={block.content || ''}
            onChange={e => onUpdate({ ...block, content: e.target.value })}
            onBlur={() => setLocalEdit(false)}
            onClick={e => e.stopPropagation()}
            onMouseDown={e => e.stopPropagation()}
            rows={Math.max(2, (block.content || '').split('\n').length + 1)}
            style={{ ...textStyle, width: '100%', background: 'rgba(0,0,0,0.55)', border: '2px solid #3b82f6',
              borderRadius: 6, padding: '10px 14px', outline: 'none', resize: 'both', boxSizing: 'border-box' }}
          />
        : <p style={{ ...textStyle, margin: 0, padding: '8px 12px',
            opacity: block.content ? 1 : (editing ? 0.45 : 0),
            textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>
            {block.content || (editing ? '더블클릭해서 편집' : '')}
          </p>
      }
    </div>
  )
}

function Spin() {
  return <span style={{ display:'inline-block',width:10,height:10,border:'2px solid #ccc',borderTopColor:'#3b82f6',borderRadius:'50%',animation:'spin 0.7s linear infinite',marginRight:3 }} />
}

/* ══════════════════════════════════════════════════
   SectionEditor 메인
══════════════════════════════════════════════════ */
export default function SectionEditor({
  sec, idx, onUpdate, onDelete, onSavedChange,
  isSelected, onSelect,
  onActiveFieldChange,
  activeBlockId, onBlockSelect,
}) {
  const [editing,    setEditing]    = useState(true)
  const [capturing,  setCapturing]  = useState(false)
  const [dr,         setDr]         = useState(sec)
  const [saved,      setSaved]      = useState(true)
  const [dl,         setDl]         = useState(false)
  const [scale,      setScale]      = useState(1)
  const [secMeta,    setSecMeta]    = useState({})
  const [hovered,    setHovered]    = useState(false)

  /* png-capture-start / end 이벤트 수신 */
  useEffect(() => {
    const onStart = () => setCapturing(true)
    const onEnd   = () => setCapturing(false)
    document.addEventListener('png-capture-start', onStart)
    document.addEventListener('png-capture-end',   onEnd)
    return () => {
      document.removeEventListener('png-capture-start', onStart)
      document.removeEventListener('png-capture-end',   onEnd)
    }
  }, [])

  useEffect(() => { onSavedChange?.(idx, saved) }, [idx, saved])

  /* 부모(CanvaPanel)가 변경한 디자인 필드 자동 동기화 */
  useEffect(() => {
    const patch = {}
    for (const f of DESIGN_FIELDS) {
      if (sec[f] !== undefined) patch[f] = sec[f]
    }
    setDr(prev => ({ ...prev, ...patch }))
  }, [sec]) // eslint-disable-line

  const ref     = useRef(null)
  const wrapRef = useRef(null)

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const obs = new ResizeObserver(() => { setScale(Math.min(1, el.offsetWidth / 860)) })
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

  const t      = DS[dr.designStyle] || Object.values(DS)[0]
  const change = (key, val) => { setDr(d => ({ ...d, [key]: val })); setSaved(false) }
  const save   = () => { onUpdate(idx, dr); setSaved(true); setEditing(false) }
  const cancel = () => { setDr(sec); setSaved(true); setEditing(false) }

  const dlPNG = async () => {
    if (!ref.current) return
    setDl(true)
    setCapturing(true)
    await new Promise(r => setTimeout(r, 80))
    try { await capturePNG(ref.current, `section_${idx+1}_${sec.sectionType}.png`) }
    catch(e) { alert('저장 오류: '+e.message) }
    finally { setDl(false); setCapturing(false) }
  }

  const freeBlocks  = dr.freeBlocks || []
  const activeEditing = editing && !capturing

  const updBlock = (id, data) => {
    const nb = freeBlocks.map(b => b.id === id ? data : b)
    const nd = { ...dr, freeBlocks: nb }
    setDr(nd)
    onUpdate(idx, nd)
  }

  const rmBlock = id => {
    const nb = freeBlocks.filter(b => b.id !== id)
    const nd = { ...dr, freeBlocks: nb }
    setDr(nd)
    onUpdate(idx, nd)
    if (activeBlockId === id) onBlockSelect?.(null)
  }

  const textSelectCtxValue = useMemo(() => ({
    setField: k => {
      onActiveFieldChange?.(k)
      onBlockSelect?.(null)
    }
  }), [onActiveFieldChange, onBlockSelect])

  const Tpl            = TPL[dr.template] || TPL.topBottom
  const placeholderImg = `https://picsum.photos/seed/${idx + 1}/860/500`
  const img            = dr.secImg || placeholderImg
  const dlLabel        = dl ? '변환 중' : '↓ PNG'

  const mergedFieldStyles = useMemo(
    () => ({ ...(dr.textStyles || {}), ...(dr.fieldStyles || {}) }),
    [dr.textStyles, dr.fieldStyles]
  )

  return (
    <div
      onClick={e => { onSelect?.(idx); e.stopPropagation() }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ position: 'relative', cursor: 'default' }}
    >
      {/* 선택/호버 테두리 (캡처 대상 밖) */}
      {(isSelected || hovered) && (
        <div style={{ position:'absolute', inset:0, zIndex:20, pointerEvents:'none',
          border: isSelected ? '3px solid #2563EB' : '2px solid #93C5FD' }} />
      )}

      {/* 툴바 */}
      <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'8px 14px',background:editing?'#EFF6FF':C.alt,borderBottom:`1px solid ${editing?'#BFDBFE':C.bd}`,flexWrap:'wrap',gap:6 }}>
        <div style={{ display:'flex',alignItems:'center',gap:8,flexWrap:'wrap' }}>
          <div style={{ width:8,height:8,borderRadius:'50%',background:t.ac }} />
          <span style={{ fontSize:12,fontWeight:700,color:C.tx }}>S{idx+1}</span>
          <span style={{ fontSize:11,color:C.mu }}>{sec.sectionType}</span>
          <span style={{ padding:'3px 9px',fontSize:10,borderRadius:16,border:`1px solid ${t.bd}`,background:t.sub,color:t.ac,fontWeight:600 }}>
            {TPL_LABELS.find(x=>x.k===dr.template)?.l||dr.template} · {dr.designStyle}
          </span>
          {!saved && <span style={{ fontSize:10,color:'#d97706',background:'#fffbeb',padding:'2px 7px',borderRadius:10,border:'1px solid #fcd34d' }}>● 미저장</span>}
        </div>
        <div style={{ display:'flex',gap:6,alignItems:'center' }}>
          {editing
            ? <>
                <button onClick={save}   style={{ padding:'5px 14px',fontSize:11,borderRadius:7,border:'none',background:'#3b82f6',color:'#fff',cursor:'pointer',fontWeight:700 }}>✓ 저장</button>
                <button onClick={cancel} style={{ padding:'5px 10px',fontSize:11,borderRadius:7,border:`1px solid ${C.bd}`,background:C.sur,color:C.mu,cursor:'pointer' }}>취소</button>
              </>
            : <button onClick={() => setEditing(true)} style={{ padding:'6px 14px',fontSize:12,borderRadius:7,border:'none',background:'#3b82f6',color:'#fff',cursor:'pointer',fontWeight:700 }}>✎ 수정</button>
          }
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

      {/* 카드 미리보기 */}
      <div ref={wrapRef} style={{ position:'relative', background:'#e8e6e0', overflow:'hidden' }}>
        <div style={{ width:860, transformOrigin:'top left', transform:`scale(${scale})` }}>
          <div ref={ref} data-sect-card style={{ fontFamily:"'Noto Sans KR','Apple SD Gothic Neo',sans-serif", width:860, position:'relative' }}>
            <TextSelectCtx.Provider value={textSelectCtxValue}>
              <Tpl
                s={dr} img={img} t={t} editing={activeEditing} onChange={change}
                secMeta={secMeta}
                onSecMeta={(key,val) => { setSecMeta(p=>({...p,[key]:val})); setSaved(false) }}
                fieldStyles={mergedFieldStyles}
              />
            </TextSelectCtx.Provider>

            {/* 자유 텍스트 블록 */}
            {freeBlocks.map(b => (
              <FreeBlock
                key={b.id}
                block={b} t={t} editing={activeEditing} scale={scale}
                selected={isSelected && activeBlockId === b.id}
                onSelect={() => {
                  onBlockSelect?.(b.id)
                  onActiveFieldChange?.(null)
                }}
                onUpdate={data => updBlock(b.id, data)}
                onRemove={() => rmBlock(b.id)}
              />
            ))}

            <div style={{ padding:'6px 20px',textAlign:'right',fontSize:9,color:t.fg,opacity:0.1,background:t.bg }}>ContentOS</div>
          </div>
        </div>
      </div>
    </div>
  )
}
