// src/components/SectionEditor.jsx
import React, { useState, useRef, useEffect } from 'react'
import { C, DS, TPL_LABELS } from '../constants'
import { TPL, ImageAdjust, ICON_SETS } from './SectionTemplates'
import { capturePNG } from '../utils'

function getGradCSS(grad, t) {
  const alpha = (grad.alpha ?? 70) / 100
  const col   = grad.color || t.bg || '#000000'
  const m     = col.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i)
  const rgb   = m ? `${parseInt(m[1],16)},${parseInt(m[2],16)},${parseInt(m[3],16)}` : '0,0,0'
  const dirs  = { top: 'to bottom', bottom: 'to top', left: 'to right', right: 'to left' }
  return `linear-gradient(${dirs[grad.dir] || 'to bottom'}, rgba(${rgb},${alpha}) 0%, rgba(${rgb},0) 60%)`
}

/* ── 자유 블록 렌더러 ─────────────────────────────────── */
function FreeBlock({ block, t, editing, selected, onSelect, onUpdate, onRemove, onMoveUp, onMoveDn, isFirst, isLast }) {
  const fileRef = useRef(null)

  const handleImg = e => {
    const f = e.target.files[0]; if (!f) return
    const fr = new FileReader()
    fr.onload = ev => onUpdate({ ...block, content: ev.target.result })
    fr.readAsDataURL(f); e.target.value = ''
  }

  if (block.type === 'text') {
    const fs    = block.fontSize   || 18
    const align = block.align      || 'left'
    const pad   = block.padding    || 40
    const ff    = block.fontFamily || 'inherit'
    const fc    = block.color      || t.fg
    const fw    = block.fontWeight || 400

    return (
      <div onClick={onSelect}
        style={{ position:'relative', background: t.bg, cursor:'pointer',
          boxShadow: selected ? 'inset 0 0 0 2px #3b82f6' : 'none' }}>

        {/* X 버튼 - 항상 표시 */}
        <button onClick={e => { e.stopPropagation(); onRemove() }}
          style={{ position:'absolute',top:6,right:6,zIndex:20,width:22,height:22,borderRadius:'50%',border:'none',background:'#ef4444',color:'#fff',fontSize:14,cursor:'pointer',fontWeight:800,lineHeight:1,display:'flex',alignItems:'center',justifyContent:'center' }}>
          ×
        </button>

        {editing && selected && (
          <div style={{ position:'absolute', top:6, right:34, zIndex:10, display:'flex', gap:3 }}>
            {['left','center','right'].map(a => (
              <button key={a} onClick={e => { e.stopPropagation(); onUpdate({...block, align:a}) }}
                style={{ width:22,height:22,borderRadius:4,border:`1px solid ${align===a?'#3b82f6':C.bd}`,background:align===a?'#EFF6FF':C.sur,fontSize:9,cursor:'pointer',color:align===a?'#1d4ed8':C.mu }}>
                {a==='left'?'◀':a==='center'?'◆':'▶'}
              </button>
            ))}
            <select value={pad} onChange={e => onUpdate({...block,padding:+e.target.value})}
              style={{ height:22,fontSize:9,border:`1px solid ${C.bd}`,borderRadius:4,padding:'0 2px',cursor:'pointer' }}>
              {[0,16,24,32,40,56,64,80].map(v=><option key={v} value={v}>{v}px</option>)}
            </select>
            {!isFirst && <button onClick={e=>{e.stopPropagation();onMoveUp()}} style={{ width:22,height:22,borderRadius:4,border:`1px solid ${C.bd}`,background:C.sur,fontSize:9,cursor:'pointer' }}>↑</button>}
            {!isLast  && <button onClick={e=>{e.stopPropagation();onMoveDn()}} style={{ width:22,height:22,borderRadius:4,border:`1px solid ${C.bd}`,background:C.sur,fontSize:9,cursor:'pointer' }}>↓</button>}
          </div>
        )}

        <div style={{ padding:`28px ${pad}px` }}>
          {editing && selected
            ? <textarea value={block.content||''} onChange={e => onUpdate({...block,content:e.target.value})}
                onClick={e => e.stopPropagation()}
                placeholder="텍스트를 입력하세요 (엔터로 줄바꿈)"
                rows={Math.max(2,(block.content||'').split('\n').length+1)}
                style={{ width:'100%',fontSize:fs,lineHeight:1.8,border:'1px solid #3b82f6',borderRadius:8,padding:'12px 14px',outline:'none',resize:'vertical',fontFamily:ff,color:fc,background:t.sub,textAlign:align,fontWeight:fw,boxSizing:'border-box' }} />
            : <p style={{ fontSize:fs,color:fc||t.fg,lineHeight:1.85,margin:0,whiteSpace:'pre-wrap',opacity:block.content?0.88:0.3,textAlign:align,fontFamily:ff,fontWeight:fw }}>
                {block.content || (editing ? '클릭해서 편집' : '')}
              </p>
          }
        </div>
        <div style={{ height:1, background:t.bd, opacity:0.4 }} />
      </div>
    )
  }

  if (block.type === 'img') {
    return (
      <div style={{ position:'relative', background:t.sub }}>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleImg} style={{ display:'none' }} />

        {/* X 버튼 항상 표시 */}
        <button onClick={e => { e.stopPropagation(); onRemove() }}
          style={{ position:'absolute',top:6,right:6,zIndex:20,width:22,height:22,borderRadius:'50%',border:'none',background:'#ef4444',color:'#fff',fontSize:14,cursor:'pointer',fontWeight:800,lineHeight:1,display:'flex',alignItems:'center',justifyContent:'center' }}>
          ×
        </button>

        {block.content
          ? <>
              <ImageAdjust url={block.content} editing={editing} imgMeta={block.imgMeta}
                onMetaChange={m => onUpdate({ ...block, imgMeta: m })} t={t} />
              {editing && <div style={{ position:'absolute', inset:0, border:`2px dashed ${t.bd}`, pointerEvents:'none', zIndex:5 }} />}
              {editing && (
                <div style={{ position:'absolute', top:8, left:8, display:'flex', gap:4, zIndex:20 }}>
                  <button onClick={() => fileRef.current?.click()}
                    style={{ padding:'8px 18px',fontSize:13,fontWeight:700,background:'rgba(0,0,0,0.65)',color:'#fff',border:'none',borderRadius:8,cursor:'pointer' }}>📷 교체</button>
                  {!isFirst && <button onClick={onMoveUp} style={{ width:28,height:28,borderRadius:4,border:'none',background:'rgba(0,0,0,0.5)',color:'#fff',fontSize:12,cursor:'pointer' }}>↑</button>}
                  {!isLast  && <button onClick={onMoveDn} style={{ width:28,height:28,borderRadius:4,border:'none',background:'rgba(0,0,0,0.5)',color:'#fff',fontSize:12,cursor:'pointer' }}>↓</button>}
                </div>
              )}
            </>
          : <div onClick={() => editing && fileRef.current?.click()}
              style={{ minHeight:280,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:10,cursor:editing?'pointer':'default',border:editing?`2px dashed ${t.bd}`:'none', position:'relative' }}>
              {editing && (
                <div style={{ position:'absolute',top:8,left:8,display:'flex',gap:4 }}>
                  {!isFirst && <button onClick={onMoveUp} style={{ width:24,height:24,borderRadius:4,border:`1px solid ${C.bd}`,background:C.sur,fontSize:10,cursor:'pointer' }}>↑</button>}
                  {!isLast  && <button onClick={onMoveDn} style={{ width:24,height:24,borderRadius:4,border:`1px solid ${C.bd}`,background:C.sur,fontSize:10,cursor:'pointer' }}>↓</button>}
                </div>
              )}
              <span style={{ fontSize:32,opacity:0.3 }}>📷</span>
              <span style={{ fontSize:14,fontWeight:600,background:'#e0e0e0',color:'#222222',padding:'6px 18px',borderRadius:24 }}>{editing?'클릭해서 사진 업로드':'이미지 블록'}</span>
            </div>
        }
      </div>
    )
  }
  return null
}

/* ── + 추가 버튼 (블록 사이에 삽입) ─────────────── */
function AddBlockBtn({ onAddText, onAddImg, editing }) {
  const [open, setOpen] = useState(false)
  if (!editing) return null
  return (
    <div style={{ position:'relative', padding:'4px 0' }}>
      <div style={{ display:'flex', alignItems:'center' }}>
        <div style={{ flex:1, height:2, background: open ? '#3b82f6' : '#C7CBD3' }} />
        <button onClick={() => setOpen(o=>!o)}
          style={{ padding:'16px 40px', fontSize:17, fontWeight:700, border:`2.5px solid ${open?'#3b82f6':'#C7CBD3'}`, borderRadius:32, background: open?'#EFF6FF':'#F3F4F6', color: open?'#1d4ed8':'#4B5563', cursor:'pointer', whiteSpace:'nowrap', transition:'all .15s', margin:'0 8px' }}>
          {open ? '닫기' : '+ 블록 삽입'}
        </button>
        <div style={{ flex:1, height:2, background: open ? '#3b82f6' : '#C7CBD3' }} />
      </div>
      {open && (
        <div style={{ position:'absolute', bottom:'calc(100% + 6px)', left:'50%', transform:'translateX(-50%)', zIndex:30, display:'flex', gap:8, background:C.sur, border:`1px solid ${C.bd}`, borderRadius:12, padding:'12px 16px', boxShadow:'0 -4px 20px rgba(0,0,0,0.13)' }}>
          <button onClick={() => { onAddText(); setOpen(false) }}
            style={{ padding:'10px 22px', fontSize:14, fontWeight:600, borderRadius:9, border:`1px solid ${C.bd}`, background:C.sur, cursor:'pointer', color:C.tx }}>✎ 텍스트</button>
          <button onClick={() => { onAddImg(); setOpen(false) }}
            style={{ padding:'10px 22px', fontSize:14, fontWeight:600, borderRadius:9, border:`1px solid ${C.bd}`, background:C.sur, cursor:'pointer', color:C.tx }}>📷 이미지</button>
        </div>
      )}
    </div>
  )
}

function Spin() { return <span style={{ display:'inline-block',width:10,height:10,border:'2px solid #ccc',borderTopColor:'#3b82f6',borderRadius:'50%',animation:'spin 0.7s linear infinite',marginRight:3 }} /> }

/* ══════════════════════════════════════════════════
   SectionEditor 메인
══════════════════════════════════════════════════ */
export default function SectionEditor({ sec, idx, onUpdate, onDelete, onSavedChange, isSelected, onSelect }) {
  const [editing, setEditing] = useState(true)
  const [dr, setDr]           = useState(sec)
  const [saved, setSaved]     = useState(true)
  const [dl, setDl]           = useState(false)
  const [scale, setScale]     = useState(1)
  const [secMeta, setSecMeta] = useState({})
  const [blocks, setBlocks]   = useState([])
  const [selectedBlockId, setSelectedBlockId] = useState(null)
  const [hovered, setHovered] = useState(false)

  useEffect(() => { onSavedChange?.(idx, saved) }, [idx, saved])

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
  const change = (key, val) => { setDr(d => ({...d,[key]:val})); setSaved(false) }
  const save   = () => { onUpdate(idx, dr); setSaved(true); setEditing(false) }
  const cancel = () => { setDr(prev=>({...sec, secImg:prev.secImg})); setSaved(true); setEditing(false) }

  const dlPNG = async () => {
    if (!ref.current) return
    if (!saved) { alert('먼저 저장 후 다운로드해주세요.'); return }
    setDl(true)
    try { await capturePNG(ref.current, `section_${idx+1}_${sec.sectionType}.png`) }
    catch(e) { alert('저장 오류: '+e.message) }
    finally { setDl(false) }
  }

  const mkId     = () => Date.now() + Math.random()
  const addBlock = (type, afterIdx) => {
    const nb = { id: mkId(), type, content: type==='text'?'':'', fontSize:18, align:'left', padding:40, color:'', fontFamily:'', fontWeight:400 }
    setBlocks(bs => { const n=[...bs]; n.splice(afterIdx+1, 0, nb); return n })
    setSaved(false)
  }
  const updBlock = (id, data) => { setBlocks(bs => bs.map(b => b.id===id ? data : b)); setSaved(false) }
  const rmBlock  = id => { setBlocks(bs => bs.filter(b => b.id!==id)); if (selectedBlockId===id) setSelectedBlockId(null); setSaved(false) }
  const mvBlock  = (id, dir) => {
    setBlocks(bs => {
      const i = bs.findIndex(b => b.id===id); if(i<0) return bs
      const n=[...bs]; const j=i+dir
      if(j<0||j>=n.length) return bs
      ;[n[i],n[j]]=[n[j],n[i]]; return n
    })
    setSaved(false)
  }

  const Tpl      = TPL[dr.template] || TPL.material
  // picsum.photos를 기본 플레이스홀더로 사용 (onError로 fallback 처리)
  const placeholderImg = `https://picsum.photos/seed/${idx + 1}/860/500`
  const img      = dr.secImg || placeholderImg
  const dlLabel  = dl ? '변환 중' : '↓ PNG'

  return (
    <div
      onClick={e => { onSelect?.(idx); e.stopPropagation() }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ position: 'relative', cursor: 'default' }}
    >
      {/* 선택/호버 테두리 오버레이 */}
      {(isSelected || hovered) && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 20, pointerEvents: 'none',
          border: isSelected ? '3px solid #2563EB' : '2px solid #93C5FD',
        }} />
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
            title={!saved?'수정 후 저장해야 다운로드 가능합니다':'PNG 저장'}
            style={{ padding:'5px 10px',fontSize:11,borderRadius:7,border:`1px solid ${dl?C.bd:'#1d6b45'}`,background:dl?C.alt:'#f0fdf4',color:dl?C.fa:'#1d6b45',cursor:dl?'not-allowed':'pointer',display:'flex',alignItems:'center',gap:4,fontWeight:dl?400:600 }}>
            {dl?<><Spin/>{dlLabel}</>:dlLabel}
          </button>
          {onDelete && (
            <button onClick={onDelete} title="이 섹션 삭제"
              style={{ padding:'5px 10px',fontSize:11,borderRadius:7,border:'1px solid #fca5a5',background:'#fef2f2',color:'#ef4444',cursor:'pointer',fontWeight:700 }}>
              × 삭제
            </button>
          )}
        </div>
      </div>

      {/* ── 카드 미리보기 (full width) ── */}
      <div ref={wrapRef} style={{ position:'relative', background:'#e8e6e0', overflow:'hidden' }}>
        <div style={{ width:860, transformOrigin:'top left', transform:`scale(${scale})` }}>
          <div ref={ref} data-sect-card style={{ fontFamily:"'Noto Sans KR','Apple SD Gothic Neo',sans-serif", width:860 }}>
            <Tpl s={dr} img={img} t={t} editing={editing} onChange={change}
              secMeta={secMeta}
              onSecMeta={(key,val) => { setSecMeta(p=>({...p,[key]:val})); setSaved(false) }}
              fieldStyles={dr.fieldStyles || {}}
            />
            {(editing || blocks.length > 0) && (
              <div style={{ background:t.bg }}>
                <AddBlockBtn editing={editing} onAddText={() => addBlock('text',-1)} onAddImg={() => addBlock('img',-1)} />
                {blocks.map((b,i) => (
                  <React.Fragment key={b.id}>
                    <FreeBlock
                      block={b} t={t} editing={editing}
                      selected={selectedBlockId === b.id}
                      onSelect={() => setSelectedBlockId(b.id)}
                      onUpdate={data => updBlock(b.id,data)}
                      onRemove={() => rmBlock(b.id)}
                      onMoveUp={() => mvBlock(b.id,-1)}
                      onMoveDn={() => mvBlock(b.id,1)}
                      isFirst={i===0} isLast={i===blocks.length-1}
                    />
                    <AddBlockBtn editing={editing} onAddText={() => addBlock('text',i)} onAddImg={() => addBlock('img',i)} />
                  </React.Fragment>
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
