// src/components/SectionEditor.jsx
import React, { useState, useRef, useEffect, useMemo } from 'react'
import { C, DS, DS_KEYS, TPL_LABELS } from '../constants'
import { TPL, ImageAdjust, ICON_SETS, TextSelectCtx } from './SectionTemplates'
import { capturePNG } from '../utils'

function Spin() {
  return <span style={{ display:'inline-block',width:13,height:13,borderRadius:'50%',border:'2px solid #ddd',borderTopColor:'#555',animation:'sp .6s linear infinite',flexShrink:0 }} />
}

const FONT_OPTIONS = [
  { k: "'Noto Sans KR','Apple SD Gothic Neo',sans-serif", l: 'Noto고딕' },
  { k: "'Noto Serif KR','Noto Serif',Georgia,serif",      l: 'Noto명조' },
  { k: "'Malgun Gothic','맑은 고딕',sans-serif",            l: '맑은고딕' },
  { k: "'Apple SD Gothic Neo',sans-serif",                  l: 'SD고딕' },
  { k: "Georgia,serif",                                     l: 'Georgia' },
  { k: "'Courier New',monospace",                           l: 'Mono' },
]
const SIZE_OPTIONS = [['작게',14],['보통',18],['크게',24],['아주크게',36]]

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
          + 블록 삽입
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

/* ══════════════════════════════════════════════════
   SectionEditor 메인
══════════════════════════════════════════════════ */
export default function SectionEditor({ sec, idx, onUpdate, onDelete, onSavedChange }) {
  const [editing, setEditing]           = useState(true)
  const [dr, setDr]                     = useState(sec)
  const [saved, setSaved]               = useState(true)
  const [dl, setDl]                     = useState(false)
  const [showTpl, setShowTpl]           = useState(true)
  const [scale, setScale]               = useState(1)
  const [secMeta, setSecMeta]           = useState({})
  const [blocks, setBlocks]             = useState([])
  const [selectedBlockId, setSelectedBlockId] = useState(null)
  const [selectedField, setSelectedField]     = useState(null)

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
    setDr(prev => ({ ...sec, secImg: prev.secImg ?? sec.secImg }))
  }, [sec])

  useEffect(() => {
    const inner = ref.current
    if (!inner || !wrapRef.current) return
    const update = () => {
      if (wrapRef.current && ref.current) wrapRef.current.style.height = ref.current.offsetHeight * scale + 'px'
    }
    update()
    const obs = new ResizeObserver(update)
    obs.observe(inner)
    return () => obs.disconnect()
  }, [scale])

  const t = DS[dr.designStyle] || Object.values(DS)[0]
  const change = (key, val) => { setDr(d => ({...d,[key]:val})); setSaved(false) }
  const startEdit = () => setEditing(true)
  const save      = () => { onUpdate(idx, dr); setSaved(true); setEditing(false) }
  const cancel    = () => { setDr(prev=>({...sec, secImg:prev.secImg})); setSaved(true); setEditing(false) }

  const dlPNG = async () => {
    if (!ref.current) return
    if (!saved) { alert('먼저 저장 후 다운로드해주세요.'); return }
    setDl(true)
    try { await capturePNG(ref.current, `section_${idx+1}_${sec.sectionType}.png`) }
    catch(e) { alert('저장 오류: '+e.message) }
    finally { setDl(false) }
  }

  const mkId = () => Date.now() + Math.random()

  const addBlock = (type, afterIdx) => {
    const nb = { id: mkId(), type, content: type==='text'?'':'', fontSize:18, align:'left', padding:40, color:'', fontFamily:'', fontWeight:400 }
    setBlocks(bs => { const n=[...bs]; n.splice(afterIdx+1, 0, nb); return n })
    setSaved(false)
  }

  const updBlock = (id, data) => { setBlocks(bs => bs.map(b => b.id===id ? data : b)); setSaved(false) }
  const rmBlock  = id => { setBlocks(bs => bs.filter(b => b.id!==id)); if (selectedBlockId===id) setSelectedBlockId(null); setSaved(false) }
  const mvBlock  = (id, dir) => {
    setBlocks(bs => {
      const i = bs.findIndex(b => b.id===id); if(i<0)return bs
      const n=[...bs]; const j=i+dir
      if(j<0||j>=n.length)return bs
      ;[n[i],n[j]]=[n[j],n[i]]; return n
    })
    setSaved(false)
  }

  const selectedBlock = blocks.find(b => b.id === selectedBlockId) || null

  // 선택된 블록 또는 필드 값 가져오기
  const sfVal = key => {
    if (selectedBlockId && selectedBlock) return selectedBlock[key]
    if (selectedField) return dr.fieldStyles?.[selectedField]?.[key]
    return undefined
  }

  // 선택된 블록 또는 필드 업데이트
  const updateSF = patch => {
    if (selectedBlockId && selectedBlock) {
      updBlock(selectedBlockId, { ...selectedBlock, ...patch })
    } else if (selectedField) {
      setDr(d => ({
        ...d,
        fieldStyles: {
          ...(d.fieldStyles || {}),
          [selectedField]: { ...(d.fieldStyles?.[selectedField] || {}), ...patch }
        }
      }))
      setSaved(false)
    }
  }

  // 텍스트 선택 컨텍스트 - EditText가 포커스될 때 필드명 전달
  const textSelectCtxValue = useMemo(() => ({
    setField: k => { setSelectedField(k); setSelectedBlockId(null) }
  }), [])

  const Tpl     = TPL[dr.template] || TPL.material
  const img     = dr.secImg || (editing ? 'slot' : null)
  const dlLabel = dl ? '변환 중' : '↓ PNG'

  const hasSelection = !!(selectedBlockId || selectedField)

  return (
    <div style={{ display:'flex', alignItems:'flex-start', marginBottom:20 }}>
    <div style={{ flex:1, minWidth:0, borderRadius:12, overflow:'clip', border:`2px solid ${editing?'#3b82f6':C.bd}`, transition:'border-color .2s' }}>

      {/* ── 툴바 ── */}
      <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'8px 14px',background:editing?'#EFF6FF':C.alt,borderBottom:`1px solid ${editing?'#BFDBFE':C.bd}`,flexWrap:'wrap',gap:6 }}>
        <div style={{ display:'flex',alignItems:'center',gap:8,flexWrap:'wrap' }}>
          <div style={{ width:8,height:8,borderRadius:'50%',background:t.ac }} />
          <span style={{ fontSize:12,fontWeight:700,color:C.tx }}>S{idx+1}</span>
          <span style={{ fontSize:11,color:C.mu }}>{sec.sectionType}</span>
          <button onClick={() => setShowTpl(v=>!v)}
            style={{ padding:'3px 9px',fontSize:10,borderRadius:16,border:`1px solid ${showTpl?'#3b82f6':t.bd}`,background:showTpl?'#EFF6FF':t.sub,color:showTpl?'#1d4ed8':t.ac,cursor:'pointer',fontWeight:600 }}>
            {TPL_LABELS.find(x=>x.k===dr.template)?.l||dr.template} · {dr.designStyle}
          </button>
          {!saved && <span style={{ fontSize:10,color:'#d97706',background:'#fffbeb',padding:'2px 7px',borderRadius:10,border:'1px solid #fcd34d' }}>● 미저장</span>}
        </div>
        <div style={{ display:'flex',gap:6,alignItems:'center' }}>
          {editing
            ? <>
                <button onClick={save} style={{ padding:'5px 14px',fontSize:11,borderRadius:7,border:'none',background:'#3b82f6',color:'#fff',cursor:'pointer',fontWeight:700 }}>✓ 저장</button>
                <button onClick={cancel} style={{ padding:'5px 10px',fontSize:11,borderRadius:7,border:`1px solid ${C.bd}`,background:C.sur,color:C.mu,cursor:'pointer' }}>취소</button>
              </>
            : <button onClick={startEdit} style={{ padding:'6px 14px',fontSize:12,borderRadius:7,border:'none',background:'#3b82f6',color:'#fff',cursor:'pointer',fontWeight:700 }}>✎ 수정</button>
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

      {/* ── 2단 레이아웃 ── */}
      <div style={{ display:'flex', alignItems:'flex-start' }}>

        {/* LEFT: 카드 미리보기 */}
        <div ref={wrapRef} style={{ flex:1,minWidth:0,position:'relative',background:'#e8e6e0',overflow:'hidden' }}>
          <div style={{ width:860,transformOrigin:'top left',transform:`scale(${scale})` }}>
            <div ref={ref} data-sect-card style={{ fontFamily:"'Noto Sans KR','Apple SD Gothic Neo',sans-serif",width:860 }}>
              <TextSelectCtx.Provider value={textSelectCtxValue}>
                <Tpl s={dr} img={img} t={t} editing={editing} onChange={change}
                  secMeta={secMeta}
                  onSecMeta={(key,val) => { setSecMeta(p=>({...p,[key]:val})); setSaved(false) }}
                  fieldStyles={dr.fieldStyles || {}}
                />
              </TextSelectCtx.Provider>
              {(editing || blocks.length > 0) && (
                <div style={{ background:t.bg }}>
                  <AddBlockBtn editing={editing} onAddText={() => addBlock('text',-1)} onAddImg={() => addBlock('img',-1)} />
                  {blocks.map((b,i) => (
                    <React.Fragment key={b.id}>
                      <FreeBlock
                        block={b} t={t} editing={editing}
                        selected={selectedBlockId === b.id}
                        onSelect={() => { setSelectedBlockId(b.id); setSelectedField(null) }}
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

        {/* RIGHT: 사이드 패널 */}
        {showTpl && (
          <div style={{ width:220,minWidth:220,borderLeft:`1px solid ${C.bd}`,background:'#F8FAFF',position:'sticky',top:60,maxHeight:'calc(100vh - 60px)',overflowY:'auto',animation:'slideInRight .22s ease',display:'flex',flexDirection:'column' }}>
            <div style={{ padding:'16px 14px 24px',flex:1 }}>

              {/* ── 텍스트 편집 패널 (블록/필드 선택 시) ── */}
              {hasSelection && (
                <div style={{ marginBottom:14, padding:'10px 11px', background:'#EFF6FF', borderRadius:9, border:'1px solid #BFDBFE' }}>
                  <p style={{ fontSize:10,fontWeight:700,color:'#1d4ed8',letterSpacing:'0.06em',textTransform:'uppercase',marginBottom:9 }}>
                    ✏ {selectedBlockId ? '블록 편집' : `${selectedField} 편집`}
                  </p>

                  {/* 폰트 6개 */}
                  <p style={{ fontSize:9,color:'#4b5563',marginBottom:3,fontWeight:600 }}>폰트</p>
                  <div style={{ display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:2,marginBottom:8 }}>
                    {FONT_OPTIONS.map(({k,l}) => {
                      const cur = sfVal('fontFamily') || ''
                      const on  = cur === k
                      return (
                        <button key={k} onClick={() => updateSF({ fontFamily: k })}
                          style={{ padding:'4px 3px',fontSize:9,borderRadius:5,border:`1.5px solid ${on?'#3b82f6':'#ddd'}`,background:on?'#EFF6FF':'#fff',color:on?'#1d4ed8':'#555',cursor:'pointer',fontWeight:on?700:400,textAlign:'center',fontFamily:k,lineHeight:1.4 }}>
                          {l}
                        </button>
                      )
                    })}
                  </div>

                  {/* 글자색 */}
                  <p style={{ fontSize:9,color:'#4b5563',marginBottom:3,fontWeight:600 }}>글자색</p>
                  <div style={{ display:'flex',gap:4,alignItems:'center',marginBottom:8 }}>
                    <input type="color"
                      value={sfVal('color') || '#000000'}
                      onChange={e => updateSF({ color: e.target.value })}
                      style={{ width:26,height:26,borderRadius:4,border:`1px solid ${C.bd}`,cursor:'pointer',padding:1 }} />
                    <input type="text"
                      value={sfVal('color') || ''}
                      onChange={e => { if(/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) updateSF({ color: e.target.value }) }}
                      placeholder="#000000"
                      style={{ flex:1,fontSize:10,border:`1px solid ${C.bd}`,borderRadius:4,padding:'4px 6px',outline:'none',fontFamily:'monospace' }} />
                  </div>

                  {/* 글자크기 (자유 블록 전용) */}
                  {selectedBlockId && (
                    <>
                      <p style={{ fontSize:9,color:'#4b5563',marginBottom:3,fontWeight:600 }}>글자크기</p>
                      <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:2,marginBottom:8 }}>
                        {SIZE_OPTIONS.map(([l,v]) => {
                          const on = (sfVal('fontSize')||18) === v
                          return (
                            <button key={v} onClick={() => updateSF({ fontSize: v })}
                              style={{ padding:'3px 2px',fontSize:9,borderRadius:5,border:`1.5px solid ${on?'#3b82f6':'#ddd'}`,background:on?'#EFF6FF':'#fff',color:on?'#1d4ed8':'#555',cursor:'pointer',fontWeight:on?700:400,textAlign:'center' }}>
                              {l}
                            </button>
                          )
                        })}
                      </div>
                    </>
                  )}

                  {/* 굵게 */}
                  {(() => {
                    const isBold = (sfVal('fontWeight')||400) >= 700
                    return (
                      <button onClick={() => updateSF({ fontWeight: isBold ? 400 : 700 })}
                        style={{ width:'100%',padding:'5px',fontSize:10,borderRadius:6,border:`1.5px solid ${isBold?'#3b82f6':'#ddd'}`,background:isBold?'#EFF6FF':'#fff',color:isBold?'#1d4ed8':'#555',cursor:'pointer',fontWeight:isBold?700:400 }}>
                        굵게 (Bold)
                      </button>
                    )
                  })()}

                  <button onClick={() => { setSelectedBlockId(null); setSelectedField(null) }}
                    style={{ marginTop:7,width:'100%',padding:'4px',fontSize:9,borderRadius:5,border:'1px solid #ddd',background:'transparent',color:'#999',cursor:'pointer' }}>
                    선택 해제
                  </button>
                </div>
              )}

              {/* 레이아웃 */}
              <p style={{ fontSize:10,fontWeight:700,color:C.fa,letterSpacing:'0.07em',textTransform:'uppercase',marginBottom:7 }}>레이아웃</p>
              <div style={{ display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:3,marginBottom:14 }}>
                {TPL_LABELS.map(({k,l}) => { const on=dr.template===k; return(
                  <button key={k} onClick={() => { const nx={...dr,template:k}; setDr(nx); onUpdate(idx,nx) }}
                    style={{ padding:'5px 3px',fontSize:10,borderRadius:6,border:`1.5px solid ${on?'#3b82f6':C.bd}`,background:on?'#EFF6FF':C.sur,color:on?'#1d4ed8':C.mu,cursor:'pointer',fontWeight:on?700:400,textAlign:'center' }}>{l}</button>
                )})}
              </div>

              {/* 디자인 / 색상 */}
              <p style={{ fontSize:10,fontWeight:700,color:C.fa,letterSpacing:'0.07em',textTransform:'uppercase',marginBottom:7 }}>디자인 / 색상</p>
              <div style={{ display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:4,marginBottom:14 }}>
                {DS_KEYS.map(s => { const on=dr.designStyle===s; const d=DS[s]; return(
                  <button key={s} onClick={() => { const nx={...dr,designStyle:s}; setDr(nx); onUpdate(idx,nx) }}
                    style={{ borderRadius:7,border:`2px solid ${on?'#3b82f6':'transparent'}`,cursor:'pointer',padding:0,overflow:'hidden',background:'none',outline:'none' }}>
                    <div style={{ height:30,background:d.bg,display:'flex',alignItems:'center',justifyContent:'center',gap:4 }}>
                      <div style={{ width:10,height:10,borderRadius:'50%',background:d.ac }} />
                      <div style={{ width:16,height:3,borderRadius:2,background:d.fg,opacity:0.4 }} />
                    </div>
                    <div style={{ padding:'3px 2px',background:on?'#EFF6FF':C.alt,fontSize:9,color:on?'#1d4ed8':C.mu,fontWeight:on?700:400,textAlign:'center' }}>{s}</div>
                  </button>
                )})}
              </div>

              {/* 아이콘 세트 */}
              <p style={{ fontSize:10,fontWeight:700,color:C.fa,letterSpacing:'0.07em',textTransform:'uppercase',marginBottom:7 }}>아이콘 세트</p>
              <select value={dr.iconSet||''} onChange={e => { const nx={...dr,iconSet:e.target.value||undefined}; setDr(nx); onUpdate(idx,nx) }}
                style={{ width:'100%',fontSize:11,border:`1px solid ${C.bd}`,borderRadius:7,padding:'7px 9px',marginBottom:14,cursor:'pointer',background:C.sur,color:C.tx,outline:'none' }}>
                <option value="">자동 (섹션마다 다름)</option>
                {ICON_SETS.map(({k,l}) => <option key={k} value={k}>{l}</option>)}
              </select>

              {/* 그라데이션 */}
              <p style={{ fontSize:10,fontWeight:700,color:C.fa,letterSpacing:'0.07em',textTransform:'uppercase',marginBottom:7 }}>그라데이션</p>
              <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:2,marginBottom:6 }}>
                {[['none','없음'],['bottom','하단'],['top','상단'],['full','전체']].map(([v,l]) => {
                  const on = dr.gradDir === v
                  return (
                    <button key={v} onClick={() => { const nx={...dr,gradDir:v}; setDr(nx); onUpdate(idx,nx) }}
                      style={{ padding:'5px 2px',fontSize:10,borderRadius:6,border:`1.5px solid ${on?'#3b82f6':C.bd}`,background:on?'#EFF6FF':C.sur,color:on?'#1d4ed8':C.mu,cursor:'pointer',fontWeight:on?700:400,textAlign:'center' }}>{l}</button>
                  )
                })}
              </div>
              {dr.gradDir && dr.gradDir !== 'none' && (
                <div style={{ marginBottom:4 }}>
                  <div style={{ display:'flex',justifyContent:'space-between',marginBottom:2 }}>
                    <span style={{ fontSize:10,color:C.mu }}>강도</span>
                    <span style={{ fontSize:10,color:C.tx,fontWeight:600 }}>{dr.gradAlpha??70}%</span>
                  </div>
                  <input type="range" min={0} max={100} step={5} value={dr.gradAlpha??70}
                    onChange={e => { const nx={...dr,gradAlpha:+e.target.value}; setDr(nx); onUpdate(idx,nx) }}
                    style={{ width:'100%' }} />
                </div>
              )}
              {dr.gradDir != null && (
                <button onClick={() => { const nx={...dr}; delete nx.gradDir; delete nx.gradAlpha; setDr(nx); onUpdate(idx,nx) }}
                  style={{ fontSize:10,color:C.mu,background:'none',border:'none',cursor:'pointer',padding:'0 0 12px',textDecoration:'underline',display:'block' }}>
                  ↩ 초기화 (기본값)
                </button>
              )}

              {/* 사진 슬롯 */}
              {editing && (
                <>
                  <p style={{ fontSize:10,fontWeight:700,color:C.fa,letterSpacing:'0.07em',textTransform:'uppercase',marginBottom:7 }}>사진 슬롯</p>
                  <div style={{ display:'flex',gap:5,flexWrap:'wrap',marginBottom:18 }}>
                    {dr.template !== 'detail2col' && (
                      <button onClick={() => { setDr(d=>({...d,secImg2:d.secImg2?null:'slot'})); setSaved(false) }}
                        style={{ padding:'6px 10px',fontSize:11,borderRadius:7,border:`1px solid ${dr.secImg2?'#3b82f6':C.bd}`,background:dr.secImg2?'#EFF6FF':C.sur,color:dr.secImg2?'#1d4ed8':C.mu,cursor:'pointer',fontWeight:600 }}>
                        {dr.secImg2?'📷2 제거':'+ 사진2'}
                      </button>
                    )}
                    {dr.template==='detail2col' && (
                      <button onClick={() => { setDr(d=>({...d,secImg3:d.secImg3?null:'slot'})); setSaved(false) }}
                        style={{ padding:'6px 10px',fontSize:11,borderRadius:7,border:`1px solid ${dr.secImg3?'#3b82f6':C.bd}`,background:dr.secImg3?'#EFF6FF':C.sur,color:dr.secImg3?'#1d4ed8':C.mu,cursor:'pointer',fontWeight:600 }}>
                        {dr.secImg3?'📷3 제거':'+ 사진3'}
                      </button>
                    )}
                    {dr.template==='detail2col' && dr.secImg3 && (
                      <button onClick={() => { setDr(d=>({...d,secImg4:d.secImg4?null:'slot'})); setSaved(false) }}
                        style={{ padding:'6px 10px',fontSize:11,borderRadius:7,border:`1px solid ${dr.secImg4?'#3b82f6':C.bd}`,background:dr.secImg4?'#EFF6FF':C.sur,color:dr.secImg4?'#1d4ed8':C.mu,cursor:'pointer',fontWeight:600 }}>
                        {dr.secImg4?'📷4 제거':'+ 사진4'}
                      </button>
                    )}
                  </div>
                  {dr.template === 'detail2col' && (
                    <>
                      <p style={{ fontSize:10,fontWeight:700,color:C.fa,letterSpacing:'0.07em',textTransform:'uppercase',marginBottom:6 }}>사진 크기</p>
                      <div style={{ display:'flex',alignItems:'center',gap:6,marginBottom:14 }}>
                        <button onClick={() => change('detailImgH', Math.max(180,(dr.detailImgH||320)-20))}
                          style={{ width:26,height:26,borderRadius:6,border:`1px solid ${C.bd}`,background:C.sur,fontSize:15,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>−</button>
                        <input type="range" min={180} max={520} step={20} value={dr.detailImgH||320}
                          onChange={e => change('detailImgH',+e.target.value)} style={{ flex:1,minWidth:0 }} />
                        <button onClick={() => change('detailImgH', Math.min(520,(dr.detailImgH||320)+20))}
                          style={{ width:26,height:26,borderRadius:6,border:`1px solid ${C.bd}`,background:C.sur,fontSize:15,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>+</button>
                        <span style={{ fontSize:10,color:C.mu,minWidth:34,textAlign:'right',flexShrink:0 }}>{dr.detailImgH||320}px</span>
                      </div>
                    </>
                  )}
                  <div style={{ padding:'10px 12px',background:'#EFF6FF',borderRadius:9,border:'1px solid #BFDBFE',fontSize:11,color:'#1d4ed8',lineHeight:1.8 }}>
                    ✏️ 텍스트 클릭 → 수정 + 스타일 적용<br/>
                    📷 이미지 클릭 → 업로드<br/>
                    <strong>+ 블록 삽입</strong> → 원하는 위치에 추가
                  </div>
                </>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
    </div>
  )
}
