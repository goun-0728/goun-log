// src/components/SectionEditor.jsx
import React, { useState, useRef, useEffect } from 'react'
import { C, DS, DS_KEYS, TPL_LABELS, TPL_COMPAT } from '../constants'
import { TPL, FONT_OPTS, SHAPE_DEFS, ImageAdjust } from './SectionTemplates'
import { capturePNG } from '../utils'

const PRESET_COLORS = ['#ffffff','#111111','#ef4444','#f59e0b','#10b981','#3b82f6','#8b5cf6','#ec4899','#0f172a','#fafaf8']

const FIELD_LABELS = {
  mainCopy:     '메인 카피',
  subCopy:      '서브 카피',
  badge:        '뱃지 텍스트',
  description:  '설명 라벨',
  compareLeft:  '비교 왼쪽',
  compareRight: '비교 오른쪽',
  logoText:     '로고 텍스트',
}

function Spin() {
  return <span style={{ display:'inline-block',width:13,height:13,borderRadius:'50%',border:'2px solid #ddd',borderTopColor:'#555',animation:'sp .6s linear infinite',flexShrink:0 }} />
}

/* ── FreeBlock: 섹션 아래 자유 블록 ── */
function FreeBlock({ block, t, editing, onUpdate, onRemove, onMoveUp, onMoveDn, isFirst, isLast }) {
  const fileRef = useRef(null)
  const handleImg = e => {
    const f = e.target.files[0]; if (!f) return
    const fr = new FileReader()
    fr.onload = ev => onUpdate({ ...block, content: ev.target.result })
    fr.readAsDataURL(f); e.target.value = ''
  }

  if (block.type === 'text') {
    const fs    = block.fontSize  || 18
    const align = block.align     || 'left'
    const pad   = block.padding   || 40
    return (
      <div style={{ position:'relative', background: t.bg }}>
        {editing && (
          <div style={{ position:'absolute',top:8,right:8,zIndex:10,display:'flex',gap:4 }}>
            {['left','center','right'].map(a => (
              <button key={a} onClick={() => onUpdate({...block,align:a})}
                style={{ width:24,height:24,borderRadius:4,border:`1px solid ${align===a?'#3b82f6':C.bd}`,background:align===a?'#EFF6FF':C.sur,fontSize:10,cursor:'pointer',color:align===a?'#1d4ed8':C.mu }}>
                {a==='left'?'◀':a==='center'?'◆':'▶'}
              </button>
            ))}
            <select value={fs} onChange={e=>onUpdate({...block,fontSize:+e.target.value})}
              style={{ height:24,fontSize:10,border:`1px solid ${C.bd}`,borderRadius:4,padding:'0 2px',cursor:'pointer' }}>
              {[12,14,16,18,20,24,28,32,36,42].map(v=><option key={v} value={v}>{v}px</option>)}
            </select>
            <select value={pad} onChange={e=>onUpdate({...block,padding:+e.target.value})}
              style={{ height:24,fontSize:10,border:`1px solid ${C.bd}`,borderRadius:4,padding:'0 2px',cursor:'pointer' }}>
              {[0,16,24,32,40,56,64,80].map(v=><option key={v} value={v}>{v}px 여백</option>)}
            </select>
            {!isFirst && <button onClick={onMoveUp} style={{ width:24,height:24,borderRadius:4,border:`1px solid ${C.bd}`,background:C.sur,fontSize:10,cursor:'pointer' }}>↑</button>}
            {!isLast  && <button onClick={onMoveDn} style={{ width:24,height:24,borderRadius:4,border:`1px solid ${C.bd}`,background:C.sur,fontSize:10,cursor:'pointer' }}>↓</button>}
            <button onClick={onRemove} style={{ width:24,height:24,borderRadius:4,border:'1px solid #fca5a5',background:'#fef2f2',color:'#ef4444',fontSize:11,cursor:'pointer',fontWeight:700 }}>×</button>
          </div>
        )}
        <div style={{ padding:`28px ${pad}px` }}>
          {editing
            ? <textarea value={block.content||''} onChange={e=>onUpdate({...block,content:e.target.value})}
                placeholder="텍스트를 입력하세요"
                rows={Math.max(2,(block.content||'').split('\n').length+1)}
                style={{ width:'100%',fontSize:fs,lineHeight:1.8,border:'1px solid #3b82f6',borderRadius:8,padding:'12px 14px',outline:'none',resize:'vertical',fontFamily:'inherit',color:t.fg,background:t.sub,textAlign:align }} />
            : <p style={{ fontSize:fs,color:t.fg,lineHeight:1.85,margin:0,whiteSpace:'pre-wrap',opacity:0.88,textAlign:align }}>{block.content}</p>
          }
        </div>
        <div style={{ height:1,background:t.bd,opacity:0.4 }} />
      </div>
    )
  }

  if (block.type === 'img') {
    return (
      <div style={{ position:'relative',background:t.sub }}>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleImg} style={{ display:'none' }} />
        {block.content
          ? <>
              <ImageAdjust url={block.content} editing={editing}
                imgMeta={block.imgMeta}
                onMetaChange={m => onUpdate({ ...block, imgMeta: m })}
                t={t} />
              {editing && (
                <div style={{ position:'absolute',top:8,left:8,display:'flex',gap:4,zIndex:20 }}>
                  <button onClick={()=>fileRef.current?.click()}
                    style={{ padding:'8px 18px',fontSize:13,fontWeight:700,background:'rgba(0,0,0,0.65)',color:'#fff',border:'none',borderRadius:8,cursor:'pointer' }}>📷 교체</button>
                  {!isFirst && <button onClick={onMoveUp} style={{ width:28,height:28,borderRadius:4,border:'none',background:'rgba(0,0,0,0.5)',color:'#fff',fontSize:12,cursor:'pointer' }}>↑</button>}
                  {!isLast  && <button onClick={onMoveDn} style={{ width:28,height:28,borderRadius:4,border:'none',background:'rgba(0,0,0,0.5)',color:'#fff',fontSize:12,cursor:'pointer' }}>↓</button>}
                  <button onClick={onRemove} style={{ width:28,height:28,borderRadius:4,border:'none',background:'rgba(220,38,38,0.8)',color:'#fff',fontSize:14,cursor:'pointer',fontWeight:700 }}>×</button>
                </div>
              )}
            </>
          : <div onClick={()=>editing&&fileRef.current?.click()}
              style={{ minHeight:280,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:10,cursor:editing?'pointer':'default',border:`2px dashed ${t.bd}`,position:'relative' }}>
              {editing && (
                <div style={{ position:'absolute',top:8,right:8,display:'flex',gap:4 }}>
                  {!isFirst && <button onClick={onMoveUp} style={{ width:24,height:24,borderRadius:4,border:`1px solid ${C.bd}`,background:C.sur,fontSize:10,cursor:'pointer' }}>↑</button>}
                  {!isLast  && <button onClick={onMoveDn} style={{ width:24,height:24,borderRadius:4,border:`1px solid ${C.bd}`,background:C.sur,fontSize:10,cursor:'pointer' }}>↓</button>}
                  <button onClick={onRemove} style={{ width:24,height:24,borderRadius:4,border:'1px solid #fca5a5',background:'#fef2f2',color:'#ef4444',fontSize:11,cursor:'pointer',fontWeight:700 }}>×</button>
                </div>
              )}
              <span style={{ fontSize:32,opacity:0.3 }}>📷</span>
              <span style={{ fontSize:14,fontWeight:600,background:'#e0e0e0',color:'#222',padding:'6px 18px',borderRadius:24 }}>{editing?'클릭해서 사진 업로드':'이미지 블록'}</span>
            </div>
        }
      </div>
    )
  }
  return null
}

/* ── AddBlockBtn ── */
function AddBlockBtn({ onAddText, onAddImg, editing }) {
  const [open, setOpen] = useState(false)
  if (!editing) return null
  return (
    <div style={{ position:'relative',padding:'4px 0' }}>
      <div style={{ display:'flex',alignItems:'center' }}>
        <div style={{ flex:1,height:2,background:open?'#3b82f6':'#C7CBD3' }} />
        <button onClick={()=>setOpen(o=>!o)}
          style={{ padding:'16px 40px',fontSize:17,fontWeight:700,border:`2.5px solid ${open?'#3b82f6':'#C7CBD3'}`,borderRadius:32,background:open?'#EFF6FF':'#F3F4F6',color:open?'#1d4ed8':'#4B5563',cursor:'pointer',whiteSpace:'nowrap',transition:'all .15s',margin:'0 8px' }}>
          + 블록 삽입
        </button>
        <div style={{ flex:1,height:2,background:open?'#3b82f6':'#C7CBD3' }} />
      </div>
      {open && (
        <div style={{ position:'absolute',bottom:'calc(100% + 6px)',left:'50%',transform:'translateX(-50%)',zIndex:30,display:'flex',gap:8,background:C.sur,border:`1px solid ${C.bd}`,borderRadius:12,padding:'12px 16px',boxShadow:'0 -4px 20px rgba(0,0,0,0.13)' }}>
          <button onClick={()=>{onAddText();setOpen(false)}}
            style={{ padding:'10px 22px',fontSize:14,fontWeight:600,borderRadius:9,border:`1px solid ${C.bd}`,background:C.sur,cursor:'pointer',color:C.tx }}>✎ 텍스트</button>
          <button onClick={()=>{onAddImg();setOpen(false)}}
            style={{ padding:'10px 22px',fontSize:14,fontWeight:600,borderRadius:9,border:`1px solid ${C.bd}`,background:C.sur,cursor:'pointer',color:C.tx }}>📷 이미지</button>
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════
   SectionEditor 메인
══════════════════════════════════════════════════ */
export default function SectionEditor({ sec, idx, onUpdate, onDelete }) {
  const [editing, setEditing]     = useState(true)
  const [dr, setDr]               = useState(sec)
  const [saved, setSaved]         = useState(true)
  const [dl, setDl]               = useState(false)
  const [showTpl, setShowTpl]     = useState(true)
  const [scale, setScale]         = useState(1)
  const [secMeta, setSecMeta]     = useState({})
  const [blocks, setBlocks]       = useState([])
  const [activeField, setActiveField] = useState(null)

  const ref     = useRef(null)
  const wrapRef = useRef(null)

  /* 컨테이너 너비 → scale 계산 */
  useEffect(() => {
    const el = wrapRef.current; if (!el) return
    const obs = new ResizeObserver(() => setScale(Math.min(1, el.offsetWidth / 860)))
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  /* 카드 높이 → wrapper 높이 동기 */
  useEffect(() => {
    const inner = ref.current; if (!inner || !wrapRef.current) return
    const update = () => { if (wrapRef.current && ref.current) wrapRef.current.style.height = ref.current.offsetHeight * scale + 'px' }
    update()
    const obs = new ResizeObserver(update)
    obs.observe(inner)
    return () => obs.disconnect()
  }, [scale])

  /* sec prop 동기 (외부에서 변경될 때) */
  useEffect(() => {
    setDr(prev => ({ ...sec, secImg: prev.secImg ?? sec.secImg }))
  }, [sec])

  /* 실제 적용되는 테마: designStyle 기본 + customColors 오버라이드 */
  const baseT = DS[dr.designStyle] || Object.values(DS)[0]
  const t     = { ...baseT, ...(dr.customColors || {}) }

  const change = (key, val) => { setDr(d => ({...d,[key]:val})); setSaved(false) }

  /* textStyle 헬퍼 */
  const activeTS    = dr.textStyles?.[activeField] || {}
  const updateTS    = (key, val) => {
    if (!activeField) return
    change('textStyles', {
      ...(dr.textStyles || {}),
      [activeField]: { ...(dr.textStyles?.[activeField] || {}), [key]: val }
    })
  }

  const startEdit = () => setEditing(true)
  const save      = () => { onUpdate(idx, dr); setSaved(true); setEditing(false); setActiveField(null) }
  const cancel    = () => { setDr(prev=>({...sec,secImg:prev.secImg})); setSaved(true); setEditing(false); setActiveField(null) }

  const dlPNG = async () => {
    if (!ref.current || !saved) return
    setDl(true)
    try { await capturePNG(ref.current, `section_${idx+1}_${sec.sectionType}.png`) }
    catch(e) { alert('저장 오류: '+e.message) }
    finally { setDl(false) }
  }

  /* 자유 블록 */
  const mkId    = () => Date.now() + Math.random()
  const addBlock = (type, afterIdx) => {
    const nb = { id: mkId(), type, content: type==='text'?'':'', fontSize:18, align:'left', padding:40 }
    setBlocks(bs => { const n=[...bs]; n.splice(afterIdx+1,0,nb); return n })
    setSaved(false)
  }
  const updBlock = (id, data) => { setBlocks(bs => bs.map(b => b.id===id ? data : b)); setSaved(false) }
  const rmBlock  = id => { setBlocks(bs => bs.filter(b => b.id!==id)); setSaved(false) }
  const mvBlock  = (id, dir) => {
    setBlocks(bs => {
      const i = bs.findIndex(b=>b.id===id); if(i<0) return bs
      const n=[...bs]; const j=i+dir
      if(j<0||j>=n.length) return bs
      ;[n[i],n[j]]=[n[j],n[i]]; return n
    })
    setSaved(false)
  }

  /* 구버전 template key 호환 */
  const tplKey  = TPL[dr.template] ? dr.template : (TPL_COMPAT[dr.template] || 'topBottom')
  const Tpl     = TPL[tplKey] || TPL.topBottom
  const img     = dr.secImg || (editing ? 'slot' : null)
  const dlDisabled = dl || !saved

  return (
    <div style={{ display:'flex',alignItems:'flex-start',marginBottom:20 }}>
    <div style={{ flex:1,minWidth:0,borderRadius:12,overflow:'clip',border:`2px solid ${editing?'#3b82f6':C.bd}`,transition:'border-color .2s' }}>

      {/* ── 툴바 ── */}
      <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'8px 14px',background:editing?'#EFF6FF':C.alt,borderBottom:`1px solid ${editing?'#BFDBFE':C.bd}`,flexWrap:'wrap',gap:6 }}>
        <div style={{ display:'flex',alignItems:'center',gap:8,flexWrap:'wrap' }}>
          <div style={{ width:8,height:8,borderRadius:'50%',background:t.ac }} />
          <span style={{ fontSize:12,fontWeight:700,color:C.tx }}>S{idx+1}</span>
          <span style={{ fontSize:11,color:C.mu }}>{sec.sectionType}</span>
          <button onClick={()=>setShowTpl(v=>!v)}
            style={{ padding:'3px 9px',fontSize:10,borderRadius:16,border:`1px solid ${showTpl?'#3b82f6':t.bd}`,background:showTpl?'#EFF6FF':t.sub,color:showTpl?'#1d4ed8':t.ac,cursor:'pointer',fontWeight:600 }}>
            {TPL_LABELS.find(x=>x.k===tplKey)?.l||tplKey} · {dr.designStyle}
          </button>
          {!saved && <span style={{ fontSize:10,color:'#d97706',background:'#fffbeb',padding:'2px 7px',borderRadius:10,border:'1px solid #fcd34d' }}>● 미저장</span>}
        </div>
        <div style={{ display:'flex',gap:6,alignItems:'center' }}>
          {editing
            ? <>
                <button onClick={save}
                  style={{ padding:'5px 14px',fontSize:11,borderRadius:7,border:'none',background:'#3b82f6',color:'#fff',cursor:'pointer',fontWeight:700 }}>✓ 저장</button>
                <button onClick={cancel}
                  style={{ padding:'5px 10px',fontSize:11,borderRadius:7,border:`1px solid ${C.bd}`,background:C.sur,color:C.mu,cursor:'pointer' }}>취소</button>
              </>
            : <button onClick={startEdit}
                style={{ padding:'6px 14px',fontSize:12,borderRadius:7,border:'none',background:'#3b82f6',color:'#fff',cursor:'pointer',fontWeight:700 }}>✎ 수정</button>
          }
          <button onClick={dlPNG} disabled={dlDisabled}
            title={!saved?'저장 후 다운로드 가능':'PNG 저장'}
            style={{ padding:'5px 10px',fontSize:11,borderRadius:7,border:`1px solid ${dlDisabled?C.bd:'#1d6b45'}`,background:dlDisabled?C.alt:'#f0fdf4',color:dlDisabled?C.fa:'#1d6b45',cursor:dlDisabled?'not-allowed':'pointer',display:'flex',alignItems:'center',gap:4,fontWeight:dlDisabled?400:600 }}>
            {dl?<><Spin/>변환 중</>:(dlDisabled?'저장 후 ↓ PNG':'↓ PNG')}
          </button>
          {onDelete && (
            <button onClick={onDelete}
              style={{ padding:'5px 10px',fontSize:11,borderRadius:7,border:'1px solid #fca5a5',background:'#fef2f2',color:'#ef4444',cursor:'pointer',fontWeight:700 }}>
              × 삭제
            </button>
          )}
        </div>
      </div>

      {/* ── 2단 레이아웃: 카드(좌) + 사이드 패널(우) ── */}
      <div style={{ display:'flex',alignItems:'flex-start' }}>

        {/* LEFT: 카드 미리보기 */}
        <div ref={wrapRef} style={{ flex:1,minWidth:0,position:'relative',background:'#e8e6e0',overflow:'hidden' }}>
          <div style={{ width:860,transformOrigin:'top left',transform:`scale(${scale})` }}>
            <div ref={ref} data-sect-card style={{ fontFamily:"'Nanum Gothic','Apple SD Gothic Neo',sans-serif",width:860 }}>
              <Tpl s={dr} img={img} t={t} editing={editing} onChange={change}
                secMeta={secMeta}
                onSecMeta={(key,val)=>{setSecMeta(p=>({...p,[key]:val}));setSaved(false)}}
                onFieldFocus={setActiveField}
              />
              {(editing || blocks.length > 0) && (
                <div style={{ background:t.bg }}>
                  <AddBlockBtn editing={editing}
                    onAddText={()=>addBlock('text',-1)}
                    onAddImg={()=>addBlock('img',-1)} />
                  {blocks.map((b,i)=>(
                    <React.Fragment key={b.id}>
                      <FreeBlock block={b} t={t} editing={editing}
                        onUpdate={data=>updBlock(b.id,data)}
                        onRemove={()=>rmBlock(b.id)}
                        onMoveUp={()=>mvBlock(b.id,-1)}
                        onMoveDn={()=>mvBlock(b.id,1)}
                        isFirst={i===0} isLast={i===blocks.length-1} />
                      <AddBlockBtn editing={editing}
                        onAddText={()=>addBlock('text',i)}
                        onAddImg={()=>addBlock('img',i)} />
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
          <div style={{ width:224,minWidth:224,borderLeft:`1px solid ${C.bd}`,background:'#F8FAFF',position:'sticky',top:60,maxHeight:'calc(100vh - 60px)',overflowY:'auto',animation:'slideInRight .22s ease',display:'flex',flexDirection:'column' }}>
            <div style={{ padding:'14px 12px 28px',flex:1,display:'flex',flexDirection:'column',gap:0 }}>

              {/* ── 레이아웃 ── */}
              <p style={sLabel}>레이아웃</p>
              <div style={{ display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:3,marginBottom:16 }}>
                {TPL_LABELS.map(({k,l})=>{
                  const on = tplKey===k
                  return (
                    <button key={k} onClick={()=>{const nx={...dr,template:k};setDr(nx);onUpdate(idx,nx)}}
                      style={{ padding:'5px 3px',fontSize:10,borderRadius:6,border:`1.5px solid ${on?'#3b82f6':C.bd}`,background:on?'#EFF6FF':C.sur,color:on?'#1d4ed8':C.mu,cursor:'pointer',fontWeight:on?700:400,textAlign:'center' }}>
                      {l}
                    </button>
                  )
                })}
              </div>

              {/* ── 디자인 / 색상 테마 ── */}
              <p style={sLabel}>색상 테마</p>
              <div style={{ display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:4,marginBottom:10 }}>
                {DS_KEYS.map(s=>{
                  const on=dr.designStyle===s; const d=DS[s]
                  return (
                    <button key={s} onClick={()=>{const nx={...dr,designStyle:s};setDr(nx);onUpdate(idx,nx)}}
                      style={{ borderRadius:7,border:`2px solid ${on?'#3b82f6':'transparent'}`,cursor:'pointer',padding:0,overflow:'hidden',background:'none',outline:'none' }}>
                      <div style={{ height:28,background:d.bg,display:'flex',alignItems:'center',justifyContent:'center',gap:4 }}>
                        <div style={{ width:10,height:10,borderRadius:'50%',background:d.ac }} />
                        <div style={{ width:14,height:3,borderRadius:2,background:d.fg,opacity:0.4 }} />
                      </div>
                      <div style={{ padding:'2px',background:on?'#EFF6FF':C.alt,fontSize:9,color:on?'#1d4ed8':C.mu,fontWeight:on?700:400,textAlign:'center' }}>{s}</div>
                    </button>
                  )
                })}
              </div>

              {/* ── 커스텀 배경색 / 강조색 ── */}
              {editing && (
                <>
                  <p style={{ ...sLabel, marginTop:8 }}>커스텀 색상</p>
                  <div style={{ display:'flex',flexDirection:'column',gap:5,marginBottom:16 }}>
                    {[
                      { label:'배경색', key:'bg' },
                      { label:'강조색', key:'ac' },
                      { label:'글자색', key:'fg' },
                    ].map(({ label, key }) => (
                      <div key={key} style={{ display:'flex',alignItems:'center',gap:8 }}>
                        <span style={{ fontSize:10,color:C.mu,minWidth:36 }}>{label}</span>
                        <input type="color" value={(dr.customColors?.[key]) || t[key] || '#ffffff'}
                          onChange={e => change('customColors', { ...(dr.customColors||{}), [key]: e.target.value })}
                          style={{ width:32,height:24,border:'none',padding:0,cursor:'pointer',borderRadius:4,flex:'none' }} />
                        {dr.customColors?.[key] && (
                          <button onClick={() => { const cc={...(dr.customColors||{})}; delete cc[key]; change('customColors',cc) }}
                            style={{ fontSize:9,color:'#ef4444',border:'none',background:'none',cursor:'pointer',padding:'0 2px' }}>초기화</button>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* ── 텍스트 스타일 ── */}
              {editing && activeField && (
                <>
                  <div style={{ borderTop:`1px solid ${C.bd}`,margin:'4px 0 12px' }} />
                  <p style={sLabel}>텍스트 — {FIELD_LABELS[activeField] || activeField}</p>

                  {/* 글자 크기 슬라이더 */}
                  <div style={{ marginBottom:12 }}>
                    <div style={{ display:'flex',justifyContent:'space-between',marginBottom:4 }}>
                      <span style={{ fontSize:10,color:C.mu }}>크기</span>
                      <span style={{ fontSize:10,fontWeight:700,color:C.tx }}>{activeTS.fontSize || 24}px</span>
                    </div>
                    <input type="range" min={12} max={80} step={1}
                      value={activeTS.fontSize || 24}
                      onChange={e => updateTS('fontSize', +e.target.value)}
                      style={{ width:'100%',accentColor:'#3b82f6' }} />
                    <div style={{ display:'flex',justifyContent:'space-between',fontSize:9,color:C.fa,marginTop:1 }}>
                      <span>12</span><span>80</span>
                    </div>
                  </div>

                  {/* 글자색 */}
                  <div style={{ marginBottom:12 }}>
                    <span style={{ fontSize:10,color:C.mu,display:'block',marginBottom:5 }}>글자색</span>
                    <div style={{ display:'flex',gap:4,flexWrap:'wrap',alignItems:'center' }}>
                      {PRESET_COLORS.map(c => (
                        <button key={c} onClick={() => updateTS('color', c)}
                          style={{ width:22,height:22,borderRadius:4,background:c,
                            border: activeTS.color===c ? '2px solid #3b82f6' : '1px solid #ccc',
                            cursor:'pointer',flexShrink:0 }} />
                      ))}
                      <input type="color" value={activeTS.color || '#111111'}
                        onChange={e => updateTS('color', e.target.value)}
                        style={{ width:28,height:22,border:'1px solid #ccc',padding:0,cursor:'pointer',borderRadius:4,flexShrink:0 }} />
                    </div>
                  </div>

                  {/* 폰트 */}
                  <div style={{ marginBottom:14 }}>
                    <span style={{ fontSize:10,color:C.mu,display:'block',marginBottom:5 }}>폰트</span>
                    <div style={{ display:'flex',flexDirection:'column',gap:3 }}>
                      {FONT_OPTS.map(f => {
                        const on = activeTS.fontFamily === f.v
                        return (
                          <button key={f.v} onClick={() => updateTS('fontFamily', f.v)}
                            style={{ padding:'5px 10px',fontSize:11,borderRadius:6,border:`1.5px solid ${on?'#3b82f6':C.bd}`,background:on?'#EFF6FF':C.sur,color:on?'#1d4ed8':C.mu,cursor:'pointer',fontWeight:on?700:400,textAlign:'left',fontFamily:f.v }}>
                            {f.l}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* ── 아이콘 모양 (points3icon 전용) ── */}
              {editing && tplKey === 'points3icon' && (
                <>
                  <div style={{ borderTop:`1px solid ${C.bd}`,margin:'4px 0 12px' }} />
                  <p style={sLabel}>아이콘 모양</p>
                  <div style={{ display:'flex',gap:4,flexWrap:'wrap',marginBottom:14 }}>
                    {SHAPE_DEFS.map(({ k, l }) => {
                      const on = (dr.pointShape || 'circle') === k
                      return (
                        <button key={k} onClick={() => { const nx={...dr,pointShape:k}; setDr(nx); onUpdate(idx,nx) }}
                          style={{ padding:'5px 10px',fontSize:10,borderRadius:6,border:`1.5px solid ${on?'#3b82f6':C.bd}`,background:on?'#EFF6FF':C.sur,color:on?'#1d4ed8':C.mu,cursor:'pointer',fontWeight:on?700:400 }}>
                          {l}
                        </button>
                      )
                    })}
                  </div>
                </>
              )}

              {/* ── 도움말 ── */}
              {editing && (
                <div style={{ padding:'10px 12px',background:'#EFF6FF',borderRadius:9,border:'1px solid #BFDBFE',fontSize:10,color:'#1d4ed8',lineHeight:1.85,marginTop:'auto' }}>
                  ✎ 텍스트 클릭 → 수정<br/>
                  🔡 텍스트 선택 후 우측 스타일 조절<br/>
                  📷 이미지 클릭 → 업로드<br/>
                  🖱 이미지 드래그 → 위치<br/>
                  ⚙ 휠 → 이미지 확대·축소<br/>
                  <strong>+ 블록 삽입</strong> → 섹션 아래 추가
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
    </div>
  )
}

const sLabel = { fontSize:10,fontWeight:700,color:'#B0ADA5',letterSpacing:'0.07em',textTransform:'uppercase',marginBottom:7,marginTop:0 }
