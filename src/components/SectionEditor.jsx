// src/components/SectionEditor.jsx
import React, { useState, useRef, useEffect } from 'react'
import { C, DS, DS_KEYS, TPL_LABELS } from '../constants'
import { TPL, ImageAdjust } from './SectionTemplates'
import { capturePNG, readFileAsDataURL } from '../utils'

function Spin() {
  return <span style={{ display:'inline-block',width:13,height:13,borderRadius:'50%',border:'2px solid #ddd',borderTopColor:'#555',animation:'sp .6s linear infinite',flexShrink:0 }} />
}

/* ── 자유 블록 렌더러 ─────────────────────────────────
   blocks: [{ id, type:'img'|'text', content, fontSize, align, padding }]
   이미지 아래, 섹션 카드 아래 어디든 삽입 가능
─────────────────────────────────────────────────── */
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
        {/* 편집 컨트롤 */}
        {editing && (
          <div style={{ position:'absolute', top:8, right:8, zIndex:10, display:'flex', gap:4 }}>
            {/* 정렬 */}
            {['left','center','right'].map(a => (
              <button key={a} onClick={() => onUpdate({...block, align:a})}
                style={{ width:24,height:24,borderRadius:4,border:`1px solid ${align===a?'#3b82f6':C.bd}`,background:align===a?'#EFF6FF':C.sur,fontSize:10,cursor:'pointer',color:align===a?'#1d4ed8':C.mu }}>
                {a==='left'?'◀':a==='center'?'◆':'▶'}
              </button>
            ))}
            {/* 폰트 크기 */}
            <select value={fs} onChange={e=>onUpdate({...block,fontSize:+e.target.value})}
              style={{ height:24,fontSize:10,border:`1px solid ${C.bd}`,borderRadius:4,padding:'0 2px',cursor:'pointer' }}>
              {[12,14,16,18,20,24,28,32,36,42].map(v=><option key={v} value={v}>{v}px</option>)}
            </select>
            {/* 여백 */}
            <select value={pad} onChange={e=>onUpdate({...block,padding:+e.target.value})}
              style={{ height:24,fontSize:10,border:`1px solid ${C.bd}`,borderRadius:4,padding:'0 2px',cursor:'pointer' }}>
              {[0,16,24,32,40,56,64,80].map(v=><option key={v} value={v}>{v}px 여백</option>)}
            </select>
            {/* 이동/삭제 */}
            {!isFirst && <button onClick={onMoveUp} style={{ width:24,height:24,borderRadius:4,border:`1px solid ${C.bd}`,background:C.sur,fontSize:10,cursor:'pointer' }}>↑</button>}
            {!isLast  && <button onClick={onMoveDn} style={{ width:24,height:24,borderRadius:4,border:`1px solid ${C.bd}`,background:C.sur,fontSize:10,cursor:'pointer' }}>↓</button>}
            <button onClick={onRemove} style={{ width:24,height:24,borderRadius:4,border:'1px solid #fca5a5',background:'#fef2f2',color:'#ef4444',fontSize:11,cursor:'pointer',fontWeight:700 }}>×</button>
          </div>
        )}
        {/* 텍스트 내용 */}
        <div style={{ padding:`28px ${pad}px` }}>
          {editing
            ? <textarea value={block.content||''} onChange={e=>onUpdate({...block,content:e.target.value})}
                placeholder="텍스트를 입력하세요 (엔터로 줄바꿈)"
                rows={Math.max(2,(block.content||'').split('\n').length+1)}
                style={{ width:'100%',fontSize:fs,lineHeight:1.8,border:'1px solid #3b82f6',borderRadius:8,padding:'12px 14px',outline:'none',resize:'vertical',fontFamily:'inherit',color:t.fg,background:t.sub,textAlign:align }} />
            : <p style={{ fontSize:fs,color:t.fg,lineHeight:1.85,margin:0,whiteSpace:'pre-wrap',opacity:0.88,textAlign:align }}>
                {block.content}
              </p>
          }
        </div>
        {/* 하단 구분선 */}
        <div style={{ height:1, background:t.bd, opacity:0.4 }} />
      </div>
    )
  }

  if (block.type === 'img') {
    return (
      <div style={{ position:'relative', background:t.sub }}>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleImg} style={{ display:'none' }} />
        {block.content
          ? <>
              <ImageAdjust
                url={block.content}
                editing={editing}
                imgMeta={block.imgMeta}
                onMetaChange={m => onUpdate({ ...block, imgMeta: m })}
                t={t}
              />
              {editing && (
                <div style={{ position:'absolute', top:8, left:8, display:'flex', gap:4, zIndex:20 }}>
                  <button onClick={()=>fileRef.current?.click()}
                    style={{ padding:'4px 10px',fontSize:11,fontWeight:600,background:'rgba(0,0,0,0.6)',color:'#fff',border:'none',borderRadius:6,cursor:'pointer' }}>📷 교체</button>
                  {!isFirst && <button onClick={onMoveUp} style={{ width:28,height:28,borderRadius:4,border:'none',background:'rgba(0,0,0,0.5)',color:'#fff',fontSize:12,cursor:'pointer' }}>↑</button>}
                  {!isLast  && <button onClick={onMoveDn} style={{ width:28,height:28,borderRadius:4,border:'none',background:'rgba(0,0,0,0.5)',color:'#fff',fontSize:12,cursor:'pointer' }}>↓</button>}
                  <button onClick={onRemove} style={{ width:28,height:28,borderRadius:4,border:'none',background:'rgba(220,38,38,0.8)',color:'#fff',fontSize:14,cursor:'pointer',fontWeight:700 }}>×</button>
                </div>
              )}
            </>
          : <div onClick={()=>editing&&fileRef.current?.click()}
              style={{ minHeight:280,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:10,cursor:editing?'pointer':'default',border:`2px dashed ${t.bd}`, position:'relative' }}>
              {editing && (
                <div style={{ position:'absolute',top:8,right:8,display:'flex',gap:4 }}>
                  {!isFirst && <button onClick={onMoveUp} style={{ width:24,height:24,borderRadius:4,border:`1px solid ${C.bd}`,background:C.sur,fontSize:10,cursor:'pointer' }}>↑</button>}
                  {!isLast  && <button onClick={onMoveDn} style={{ width:24,height:24,borderRadius:4,border:`1px solid ${C.bd}`,background:C.sur,fontSize:10,cursor:'pointer' }}>↓</button>}
                  <button onClick={onRemove} style={{ width:24,height:24,borderRadius:4,border:'1px solid #fca5a5',background:'#fef2f2',color:'#ef4444',fontSize:11,cursor:'pointer',fontWeight:700 }}>×</button>
                </div>
              )}
              <span style={{ fontSize:32,opacity:0.2 }}>📷</span>
              <span style={{ fontSize:14,color:t.fg,opacity:0.4 }}>{editing?'클릭하여 사진 업로드':'이미지 블록'}</span>
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
        <button onClick={()=>setOpen(o=>!o)}
          style={{ padding:'13px 32px', fontSize:15, fontWeight:700, border:`2.5px solid ${open?'#3b82f6':'#C7CBD3'}`, borderRadius:32, background: open?'#EFF6FF':'#F3F4F6', color: open?'#1d4ed8':'#4B5563', cursor:'pointer', whiteSpace:'nowrap', transition:'all .15s', margin:'0 8px' }}>
          + 블록 삽입
        </button>
        <div style={{ flex:1, height:2, background: open ? '#3b82f6' : '#C7CBD3' }} />
      </div>
      {open && (
        <div style={{ position:'absolute', bottom:'calc(100% + 6px)', left:'50%', transform:'translateX(-50%)', zIndex:30, display:'flex', gap:8, background:C.sur, border:`1px solid ${C.bd}`, borderRadius:12, padding:'12px 16px', boxShadow:'0 -4px 20px rgba(0,0,0,0.13)' }}>
          <button onClick={()=>{onAddText();setOpen(false)}}
            style={{ padding:'10px 22px', fontSize:14, fontWeight:600, borderRadius:9, border:`1px solid ${C.bd}`, background:C.sur, cursor:'pointer', color:C.tx }}>✎ 텍스트</button>
          <button onClick={()=>{onAddImg();setOpen(false)}}
            style={{ padding:'10px 22px', fontSize:14, fontWeight:600, borderRadius:9, border:`1px solid ${C.bd}`, background:C.sur, cursor:'pointer', color:C.tx }}>📷 이미지</button>
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════
   SectionEditor 메인
══════════════════════════════════════════════════ */
export default function SectionEditor({ sec, idx, onUpdate }) {
  const [editing, setEditing] = useState(false)
  const [dr, setDr]           = useState(sec)
  const [saved, setSaved]     = useState(true)
  const [dl, setDl]           = useState(false)
  const [showTpl, setShowTpl] = useState(false)
  const [scale, setScale]     = useState(1)
  const [secMeta, setSecMeta] = useState({})
  // 자유 블록 배열: [{id, type:'text'|'img', content, ...}]
  const [blocks, setBlocks]   = useState([])

  const ref     = useRef(null)
  const wrapRef = useRef(null)

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const obs = new ResizeObserver(() => {
      setScale(Math.min(1, el.offsetWidth / 860))
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    setDr(prev => ({ ...sec, secImg: prev.secImg ?? sec.secImg }))
  }, [sec])

  const t = DS[dr.designStyle] || DS['미니멀']

  const change = (key, val) => { setDr(d => ({...d,[key]:val})); setSaved(false) }

  const startEdit = () => { setEditing(true); setShowTpl(true) }
  const save = () => { onUpdate(idx, dr); setEditing(false); setShowTpl(false); setSaved(true) }
  const cancel = () => { setDr(prev=>({...sec,secImg:prev.secImg})); setEditing(false); setShowTpl(false); setSaved(true) }

  const dlPNG = async () => {
    if (!ref.current || !saved) return
    setDl(true)
    try { await capturePNG(ref.current, `section_${idx+1}_${sec.sectionType}.png`) }
    catch(e) { alert('저장 오류: '+e.message) }
    finally { setDl(false) }
  }

  /* 블록 조작 */
  const mkId = () => Date.now()+Math.random()

  // 특정 위치(pos) 뒤에 삽입 (-1이면 맨 뒤)
  const addBlock = (type, afterIdx) => {
    const nb = { id: mkId(), type, content: type==='text'?'':'', fontSize:18, align:'left', padding:40 }
    setBlocks(bs => {
      const n = [...bs]
      n.splice(afterIdx+1, 0, nb)
      return n
    })
    setSaved(false)
  }

  const updBlock = (id, data) => { setBlocks(bs => bs.map(b => b.id===id ? data : b)); setSaved(false) }
  const rmBlock  = id => { setBlocks(bs => bs.filter(b => b.id!==id)); setSaved(false) }
  const mvBlock  = (id, dir) => {
    setBlocks(bs => {
      const i = bs.findIndex(b=>b.id===id); if(i<0)return bs
      const n=[...bs]; const j=i+dir
      if(j<0||j>=n.length)return bs
      ;[n[i],n[j]]=[n[j],n[i]]; return n
    })
    setSaved(false)
  }

  const Tpl = TPL[dr.template] || TPL.material
  const img = dr.secImg || (editing ? 'slot' : null)
  const dlDisabled = dl || !saved
  const dlLabel = dl ? '변환 중' : (!saved ? '저장 후 다운로드' : '↓ PNG')

  return (
    <div style={{ marginBottom:20,borderRadius:12,overflow:'hidden',border:`2px solid ${editing?'#3b82f6':C.bd}`,transition:'border-color .2s' }}>

      {/* ── 툴바 ── */}
      <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'8px 14px',background:editing?'#EFF6FF':C.alt,borderBottom:`1px solid ${editing?'#BFDBFE':C.bd}`,flexWrap:'wrap',gap:6 }}>
        <div style={{ display:'flex',alignItems:'center',gap:8,flexWrap:'wrap' }}>
          <div style={{ width:8,height:8,borderRadius:'50%',background:t.ac }} />
          <span style={{ fontSize:12,fontWeight:700,color:C.tx }}>S{idx+1}</span>
          <span style={{ fontSize:11,color:C.mu }}>{sec.sectionType}</span>
          <button onClick={()=>setShowTpl(v=>!v)}
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
          <button onClick={dlPNG} disabled={dlDisabled}
            title={!saved?'수정 후 저장해야 다운로드 가능합니다':'PNG 저장'}
            style={{ padding:'5px 10px',fontSize:11,borderRadius:7,border:`1px solid ${dlDisabled?C.bd:'#1d6b45'}`,background:dlDisabled?C.alt:'#f0fdf4',color:dlDisabled?C.fa:'#1d6b45',cursor:dlDisabled?'not-allowed':'pointer',display:'flex',alignItems:'center',gap:4,fontWeight:dlDisabled?400:600 }}>
            {dl?<><Spin/>{dlLabel}</>:dlLabel}
          </button>
        </div>
      </div>

      {/* ── 2단 레이아웃: 카드(좌) + 사이드 패널(우) ── */}
      <div style={{ display:'flex', alignItems:'stretch' }}>

        {/* LEFT: 카드 미리보기 (PNG 캡처 대상) */}
        <div ref={wrapRef} style={{ flex:1,minWidth:0,position:'relative',background:'#e8e6e0',overflow:'hidden' }}>
          <div style={{ width:860,transformOrigin:'top left',transform:`scale(${scale})` }}>
            <div ref={ref} style={{ fontFamily:"'Noto Sans KR','Apple SD Gothic Neo',sans-serif",width:860 }}>
              <Tpl s={dr} img={img} t={t} editing={editing} onChange={change}
                secMeta={secMeta}
                onSecMeta={(key,val)=>{setSecMeta(p=>({...p,[key]:val}));setSaved(false)}}
              />
              <div style={{ background:t.bg }}>
                <AddBlockBtn editing={editing}
                  onAddText={()=>addBlock('text',-1)}
                  onAddImg={()=>addBlock('img',-1)} />
                {blocks.map((b,i)=>(
                  <React.Fragment key={b.id}>
                    <FreeBlock
                      block={b} t={t} editing={editing}
                      onUpdate={data=>updBlock(b.id,data)}
                      onRemove={()=>rmBlock(b.id)}
                      onMoveUp={()=>mvBlock(b.id,-1)}
                      onMoveDn={()=>mvBlock(b.id,1)}
                      isFirst={i===0} isLast={i===blocks.length-1}
                    />
                    <AddBlockBtn editing={editing}
                      onAddText={()=>addBlock('text',i)}
                      onAddImg={()=>addBlock('img',i)} />
                  </React.Fragment>
                ))}
              </div>
              <div style={{ padding:'6px 20px',textAlign:'right',fontSize:9,color:t.fg,opacity:0.1,background:t.bg }}>ContentOS</div>
            </div>
          </div>
          {/* 높이 보정 */}
          <div style={{ height:0,visibility:'hidden' }} ref={el=>{
            if(el&&ref.current){const h=ref.current.offsetHeight*scale;if(el.parentElement)el.parentElement.style.height=h+'px'}
          }} />
        </div>

        {/* RIGHT: 사이드 패널 — 수정/레이아웃 컨트롤 */}
        {(editing||showTpl) && (
          <div style={{ width:296,minWidth:296,borderLeft:`1px solid ${C.bd}`,background:'#F8FAFF',overflowY:'auto',animation:'slideInRight .22s ease',display:'flex',flexDirection:'column' }}>
            <div style={{ padding:'16px 14px 24px',flex:1 }}>

              {/* 레이아웃 */}
              <p style={{ fontSize:10,fontWeight:700,color:C.fa,letterSpacing:'0.07em',textTransform:'uppercase',marginBottom:7 }}>레이아웃</p>
              <div style={{ display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:5,marginBottom:18 }}>
                {TPL_LABELS.map(({k,l})=>{const on=dr.template===k;return(
                  <button key={k} onClick={()=>{const nx={...dr,template:k};setDr(nx);onUpdate(idx,nx)}}
                    style={{ padding:'8px 6px',fontSize:11,borderRadius:8,border:`1.5px solid ${on?'#3b82f6':C.bd}`,background:on?'#EFF6FF':C.sur,color:on?'#1d4ed8':C.mu,cursor:'pointer',fontWeight:on?700:400,textAlign:'center' }}>{l}</button>
                );})}
              </div>

              {/* 디자인 / 색상 */}
              <p style={{ fontSize:10,fontWeight:700,color:C.fa,letterSpacing:'0.07em',textTransform:'uppercase',marginBottom:7 }}>디자인 / 색상</p>
              <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:5,marginBottom:18 }}>
                {DS_KEYS.map(s=>{const on=dr.designStyle===s;const d=DS[s];return(
                  <button key={s} onClick={()=>{const nx={...dr,designStyle:s};setDr(nx);onUpdate(idx,nx)}}
                    style={{ borderRadius:8,border:`2px solid ${on?'#3b82f6':'transparent'}`,cursor:'pointer',padding:0,overflow:'hidden',background:'none',outline:'none' }}>
                    <div style={{ height:34,background:d.bg,display:'flex',alignItems:'center',justifyContent:'center',gap:3 }}>
                      <div style={{ width:8,height:8,borderRadius:'50%',background:d.ac }} />
                      <div style={{ width:14,height:3,borderRadius:2,background:d.fg,opacity:0.4 }} />
                    </div>
                    <div style={{ padding:'4px 2px',background:on?'#EFF6FF':C.alt,fontSize:9,color:on?'#1d4ed8':C.mu,fontWeight:on?700:400,textAlign:'center' }}>{s}</div>
                  </button>
                );})}
              </div>

              {/* 사진 슬롯 */}
              {editing && (
                <>
                  <p style={{ fontSize:10,fontWeight:700,color:C.fa,letterSpacing:'0.07em',textTransform:'uppercase',marginBottom:7 }}>사진 슬롯</p>
                  <div style={{ display:'flex',gap:5,flexWrap:'wrap',marginBottom:18 }}>
                    <button onClick={()=>{setDr(d=>({...d,secImg2:d.secImg2?null:'slot'}));setSaved(false)}}
                      style={{ padding:'6px 10px',fontSize:11,borderRadius:7,border:`1px solid ${dr.secImg2?'#3b82f6':C.bd}`,background:dr.secImg2?'#EFF6FF':C.sur,color:dr.secImg2?'#1d4ed8':C.mu,cursor:'pointer',fontWeight:600 }}>
                      {dr.secImg2?'📷2 제거':'+ 사진2'}
                    </button>
                    {dr.template==='detail2col' && (
                      <button onClick={()=>{setDr(d=>({...d,secImg3:d.secImg3?null:'slot'}));setSaved(false)}}
                        style={{ padding:'6px 10px',fontSize:11,borderRadius:7,border:`1px solid ${dr.secImg3?'#3b82f6':C.bd}`,background:dr.secImg3?'#EFF6FF':C.sur,color:dr.secImg3?'#1d4ed8':C.mu,cursor:'pointer',fontWeight:600 }}>
                        {dr.secImg3?'📷3 제거':'+ 사진3'}
                      </button>
                    )}
                    {dr.template==='detail2col' && dr.secImg3 && (
                      <button onClick={()=>{setDr(d=>({...d,secImg4:d.secImg4?null:'slot'}));setSaved(false)}}
                        style={{ padding:'6px 10px',fontSize:11,borderRadius:7,border:`1px solid ${dr.secImg4?'#3b82f6':C.bd}`,background:dr.secImg4?'#EFF6FF':C.sur,color:dr.secImg4?'#1d4ed8':C.mu,cursor:'pointer',fontWeight:600 }}>
                        {dr.secImg4?'📷4 제거':'+ 사진4'}
                      </button>
                    )}
                  </div>

                  {/* 편집 힌트 */}
                  <div style={{ padding:'10px 12px',background:'#EFF6FF',borderRadius:9,border:'1px solid #BFDBFE',fontSize:11,color:'#1d4ed8',lineHeight:1.8 }}>
                    ✏️ 텍스트 클릭 → 수정<br/>
                    📷 이미지 클릭 → 업로드<br/>
                    <strong>+ 블록 삽입</strong> → 원하는 위치에 추가<br/>
                    저장 후 PNG 다운로드
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
