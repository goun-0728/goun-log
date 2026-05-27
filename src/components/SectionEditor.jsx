// src/components/SectionEditor.jsx
import React, { useState, useRef, useEffect, useMemo } from 'react'
import { C, DS, TPL_LABELS } from '../constants'
import { TPL, ImageAdjust, TextSelectCtx } from './SectionTemplates'
import { capturePNG } from '../utils'

// Design/layout fields managed by CanvaPanel (parent) — synced from sec prop
const DESIGN_FIELDS = ['template','designStyle','gradient','textStyles','customColors','iconSet','flipped','secImg2','secImg3','secImg4']

/* ── 자유 텍스트 블록 ─────────────────────────────────── */
function FreeBlock({ block, t, editing, selected, onSelect, onUpdate, onRemove }) {
  const fs   = block.fontSize   || 22
  const ff   = block.fontFamily || 'inherit'
  const fc   = block.color      || t.fg
  const fw   = block.fontWeight || 400
  const align = block.align     || 'center'
  const pad   = block.padding   !== undefined ? block.padding : 32

  return (
    <div
      onClick={e => { e.stopPropagation(); onSelect() }}
      style={{ position:'relative', background: t.bg, cursor:'pointer',
        outline: selected ? '2px solid #3b82f6' : 'none',
        outlineOffset: -2 }}
    >
      {/* X 버튼 - 항상 표시 */}
      <button
        onClick={e => { e.stopPropagation(); onRemove() }}
        style={{ position:'absolute',top:8,right:8,zIndex:20,width:24,height:24,borderRadius:'50%',border:'none',background:'#ef4444',color:'#fff',fontSize:15,cursor:'pointer',fontWeight:800,lineHeight:'24px',textAlign:'center',display:'flex',alignItems:'center',justifyContent:'center' }}
      >×</button>

      <div style={{ padding:`${pad}px 60px` }}>
        {editing && selected
          ? <textarea
              value={block.content || ''}
              onChange={e => onUpdate({ ...block, content: e.target.value })}
              onClick={e => e.stopPropagation()}
              rows={Math.max(2, (block.content||'').split('\n').length + 1)}
              style={{ width:'100%', fontSize:fs, lineHeight:1.8, border:'1px solid #3b82f6', borderRadius:8, padding:'10px 14px', outline:'none', resize:'vertical', fontFamily:ff, color:fc, fontWeight:fw, textAlign:align, background:t.sub, boxSizing:'border-box' }}
            />
          : <p style={{ fontSize:fs, color:fc, lineHeight:1.85, margin:0, whiteSpace:'pre-wrap', textAlign:align, fontFamily:ff, fontWeight:fw, opacity: block.content ? 0.9 : 0.35 }}>
              {block.content || (editing ? '클릭해서 편집' : '')}
            </p>
        }
      </div>
      <div style={{ height:1, background:t.bd, opacity:0.35 }} />
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
  const [editing, setEditing] = useState(true)
  const [dr, setDr]           = useState(sec)
  const [saved, setSaved]     = useState(true)
  const [dl, setDl]           = useState(false)
  const [scale, setScale]     = useState(1)
  const [secMeta, setSecMeta] = useState({})
  const [hovered, setHovered] = useState(false)

  useEffect(() => { onSavedChange?.(idx, saved) }, [idx, saved])

  // ── 부모(CanvaPanel)가 변경한 디자인 필드 자동 동기화 ──
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

  // ── section data helpers ──
  const t      = DS[dr.designStyle] || Object.values(DS)[0]
  const change = (key, val) => { setDr(d => ({ ...d, [key]: val })); setSaved(false) }
  const save   = () => { onUpdate(idx, dr); setSaved(true); setEditing(false) }
  const cancel = () => { setDr(sec); setSaved(true); setEditing(false) }

  const dlPNG = async () => {
    if (!ref.current) return
    setDl(true)
    try { await capturePNG(ref.current, `section_${idx+1}_${sec.sectionType}.png`) }
    catch(e) { alert('저장 오류: '+e.message) }
    finally { setDl(false) }
  }

  // ── free blocks (dr.freeBlocks 에서 직접 관리, 즉시 onUpdate) ──
  const freeBlocks = dr.freeBlocks || []

  const mkId = () => Date.now().toString(36) + Math.random().toString(36).slice(2)

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

  // ── TextSelectCtx: EditText 포커스 → CanvaPanel activeField ──
  const textSelectCtxValue = useMemo(() => ({
    setField: k => {
      onActiveFieldChange?.(k)
      onBlockSelect?.(null)
    }
  }), [onActiveFieldChange, onBlockSelect])

  const Tpl     = TPL[dr.template] || TPL.topBottom
  const placeholderImg = `https://picsum.photos/seed/${idx + 1}/860/500`
  const img     = dr.secImg || placeholderImg
  const dlLabel = dl ? '변환 중' : '↓ PNG'

  // fieldStyles = textStyles(CanvaPanel) + fieldStyles(local) merged
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
      {/* 선택/호버 테두리 */}
      {(isSelected || hovered) && (
        <div style={{ position:'absolute', inset:0, zIndex:20, pointerEvents:'none',
          border: isSelected ? '3px solid #2563EB' : '2px solid #93C5FD' }} />
      )}

      {/* ── 툴바 ── */}
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

      {/* ── 카드 미리보기 ── */}
      <div ref={wrapRef} style={{ position:'relative', background:'#e8e6e0', overflow:'hidden' }}>
        <div style={{ width:860, transformOrigin:'top left', transform:`scale(${scale})` }}>
          <div ref={ref} data-sect-card style={{ fontFamily:"'Noto Sans KR','Apple SD Gothic Neo',sans-serif", width:860 }}>
            <TextSelectCtx.Provider value={textSelectCtxValue}>
              <Tpl
                s={dr} img={img} t={t} editing={editing} onChange={change}
                secMeta={secMeta}
                onSecMeta={(key,val) => { setSecMeta(p=>({...p,[key]:val})); setSaved(false) }}
                fieldStyles={mergedFieldStyles}
              />
            </TextSelectCtx.Provider>

            {/* 자유 텍스트 블록 */}
            {freeBlocks.length > 0 && (
              <div style={{ background:t.bg }}>
                {freeBlocks.map(b => (
                  <FreeBlock
                    key={b.id}
                    block={b} t={t} editing={editing}
                    selected={isSelected && activeBlockId === b.id}
                    onSelect={() => {
                      onBlockSelect?.(b.id)
                      onActiveFieldChange?.(null)
                    }}
                    onUpdate={data => updBlock(b.id, data)}
                    onRemove={() => rmBlock(b.id)}
                  />
                ))}
              </div>
            )}

            <div style={{ padding:'6px 20px',textAlign:'right',fontSize:9,color:t.fg,opacity:0.1,background:t.bg }}>ContentOS</div>
          </div>
        </div>
      </div>
    </div>
  )
}
