// src/components/SectionEditor.jsx
import React, { useState, useRef, useEffect } from 'react'
import { C, DS, DS_KEYS, TPL_LABELS, TPL_COMPAT } from '../constants'
import { TPL, FONT_OPTS, SHAPE_DEFS } from './SectionTemplates'
import { capturePNG } from '../utils'

const PRESET_COLORS = ['#ffffff','#111111','#ef4444','#f59e0b','#10b981','#3b82f6','#8b5cf6','#ec4899','#0f172a','#fafaf8']

const GRAD_DIRS = [
  { k: 'none',   l: '없음' },
  { k: 'top',    l: '위' },
  { k: 'bottom', l: '아래' },
  { k: 'left',   l: '좌' },
  { k: 'right',  l: '우' },
]

function getGradCSS(grad, t) {
  const alpha = (grad.alpha ?? 70) / 100
  const col   = grad.color || t.bg || '#000000'
  const m     = col.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i)
  const rgb   = m ? `${parseInt(m[1],16)},${parseInt(m[2],16)},${parseInt(m[3],16)}` : '0,0,0'
  const dirs  = { top: 'to bottom', bottom: 'to top', left: 'to right', right: 'to left' }
  return `linear-gradient(${dirs[grad.dir] || 'to bottom'}, rgba(${rgb},${alpha}) 0%, rgba(${rgb},0) 60%)`
}

/* ── 레이아웃 미니 아이콘 ── */
function TplIcon({ k }) {
  const d = '#9CA3AF', l = '#E5E7EB', a = '#6B7280'
  const base = { borderRadius:2, overflow:'hidden', width:'100%', height:32, position:'relative', flexShrink:0 }
  if (k === 'fullHero') return (
    <div style={{ ...base, background:d }}>
      <div style={{ position:'absolute',bottom:5,left:5,right:5,height:5,background:'rgba(255,255,255,0.35)',borderRadius:1 }} />
      <div style={{ position:'absolute',bottom:12,left:5,width:'55%',height:4,background:'rgba(255,255,255,0.6)',borderRadius:1 }} />
    </div>
  )
  if (k === 'topBottom') return (
    <div style={{ ...base, display:'flex',flexDirection:'column',gap:1 }}>
      <div style={{ flex:1,background:l,display:'flex',alignItems:'center',paddingLeft:4 }}>
        <div style={{ width:'55%',height:3,background:a,borderRadius:1,opacity:0.6 }} />
      </div>
      <div style={{ flex:1,background:d }} />
    </div>
  )
  if (k === 'leftRight') return (
    <div style={{ ...base, display:'flex',gap:1 }}>
      <div style={{ flex:1,background:d }} />
      <div style={{ flex:1,background:l,display:'flex',flexDirection:'column',justifyContent:'center',gap:2,padding:4 }}>
        <div style={{ height:3,background:a,borderRadius:1,opacity:0.7 }} />
        <div style={{ height:2,background:a,borderRadius:1,opacity:0.4 }} />
        <div style={{ height:2,background:a,borderRadius:1,opacity:0.4 }} />
      </div>
    </div>
  )
  if (k === 'points3icon') return (
    <div style={{ ...base, display:'flex',flexDirection:'column',gap:1 }}>
      <div style={{ flex:2,background:d }} />
      <div style={{ flex:1,display:'flex',gap:1 }}>
        <div style={{ flex:1,background:l }} />
        <div style={{ flex:1,background:l }} />
        <div style={{ flex:1,background:l }} />
      </div>
    </div>
  )
  if (k === 'story') return (
    <div style={{ ...base, background:l,display:'flex',flexDirection:'column',justifyContent:'center',gap:3,padding:'4px 6px' }}>
      <div style={{ height:5,background:d,borderRadius:1,width:'80%' }} />
      <div style={{ height:2,background:a,borderRadius:1,opacity:0.5,width:'95%' }} />
      <div style={{ height:2,background:a,borderRadius:1,opacity:0.5,width:'70%' }} />
    </div>
  )
  if (k === 'howTo') return (
    <div style={{ ...base, display:'flex',flexDirection:'column',gap:1 }}>
      <div style={{ height:10,background:d,display:'flex',alignItems:'center',justifyContent:'center' }}>
        <div style={{ height:3,width:'50%',background:'rgba(255,255,255,0.6)',borderRadius:1 }} />
      </div>
      <div style={{ flex:1,background:'#c5c9d0' }} />
      <div style={{ height:8,background:l,display:'flex',flexDirection:'column',justifyContent:'center',gap:1,padding:'0 4px' }}>
        <div style={{ height:2,background:a,borderRadius:1,opacity:0.5 }} />
      </div>
    </div>
  )
  if (k === 'compare') return (
    <div style={{ ...base, background:l,display:'flex',flexDirection:'column',gap:1,padding:3 }}>
      <div style={{ height:3,background:d,borderRadius:1,width:'55%',margin:'1px auto 3px' }} />
      <div style={{ flex:1,display:'flex',gap:1 }}>
        <div style={{ flex:1,background:'#d1d5db',borderRadius:1 }} />
        <div style={{ flex:1,background:d,borderRadius:1 }} />
      </div>
    </div>
  )
  if (k === 'specTable') return (
    <div style={{ ...base, background:'#FDFAF5',display:'flex',flexDirection:'column',gap:2,padding:3 }}>
      <div style={{ height:4,background:d,borderRadius:1,marginBottom:2 }} />
      {[1,2,3].map(i => (
        <div key={i} style={{ height:4,display:'flex',gap:1 }}>
          <div style={{ width:'30%',background:'#d0c8b8',borderRadius:1 }} />
          <div style={{ flex:1,background:l,borderRadius:1 }} />
        </div>
      ))}
    </div>
  )
  return <div style={{ ...base, background:l }} />
}

function Spin() {
  return <span style={{ display:'inline-block',width:13,height:13,borderRadius:'50%',border:'2px solid #ddd',borderTopColor:'#555',animation:'sp .6s linear infinite',flexShrink:0 }} />
}

/* ── 오버레이 텍스트 블록 (카드 위 자유 드래그) ── */
function OverlayTextBlock({ ot, editing, containerRef, onUpdate, onRemove, isActive, onSelect }) {
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
    if (!editing) return
    if (e.target.getAttribute('contenteditable') === 'true') return
    const container = containerRef.current
    if (!container) return
    startRef.current = { mx: e.clientX, my: e.clientY, ox: ot.x ?? 10, oy: ot.y ?? 10 }
    setDragging(true)
    onSelect(ot.id)
    e.preventDefault()
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
    <div style={{ position:'absolute', left:`${ot.x ?? 10}%`, top:`${ot.y ?? 10}%`, zIndex:15,
        cursor: editing ? (dragging ? 'grabbing' : 'grab') : 'default',
        outline: isActive && editing ? '2px solid #3b82f6' : 'none',
        borderRadius:4, padding: editing ? '3px 6px' : 0 }}
      onMouseDown={handleMD}
      onClick={() => editing && onSelect(ot.id)}
    >
      {editing
        ? <div contentEditable suppressContentEditableWarning
            style={{ ...st, outline:'none', cursor:'text', minWidth:20 }}
            onFocus={() => onSelect(ot.id)}
            onBlur={e => onUpdate({ ...ot, text: e.currentTarget.innerText })}
            dangerouslySetInnerHTML={{ __html: ot.text || '텍스트' }}
          />
        : <div style={st}>{ot.text || ''}</div>
      }
      {isActive && editing && (
        <button onClick={e => { e.stopPropagation(); onRemove(ot.id) }}
          style={{ position:'absolute',top:-10,right:-10,width:20,height:20,borderRadius:'50%',
            background:'#ef4444',border:'none',color:'#fff',fontSize:13,fontWeight:700,cursor:'pointer',
            display:'flex',alignItems:'center',justifyContent:'center',zIndex:20 }}>×</button>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════
   SectionEditor 메인
══════════════════════════════════════════════════ */
export default function SectionEditor({ sec, idx, onUpdate, onDelete }) {
  const [editing, setEditing]           = useState(true)
  const [dr, setDr]                     = useState(sec)
  const [saved, setSaved]               = useState(true)
  const [dl, setDl]                     = useState(false)
  const [showTpl, setShowTpl]           = useState(true)
  const [scale, setScale]               = useState(1)
  const [secMeta, setSecMeta]           = useState({})
  const [activeField, setActiveField]   = useState(null)
  const [activeOverlay, setActiveOverlay] = useState(null)

  const ref     = useRef(null)
  const wrapRef = useRef(null)

  /* 컨테이너 너비 → scale */
  useEffect(() => {
    const el = wrapRef.current; if (!el) return
    const obs = new ResizeObserver(() => setScale(Math.min(1, el.offsetWidth / 860)))
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  /* 카드 높이 → wrapper 높이 */
  useEffect(() => {
    const inner = ref.current; if (!inner || !wrapRef.current) return
    const update = () => { if (wrapRef.current && ref.current) wrapRef.current.style.height = ref.current.offsetHeight * scale + 'px' }
    update()
    const obs = new ResizeObserver(update)
    obs.observe(inner)
    return () => obs.disconnect()
  }, [scale])

  /* sec prop 동기 */
  useEffect(() => {
    setDr(prev => ({ ...sec, secImg: prev.secImg ?? sec.secImg }))
  }, [sec])

  const baseT = DS[dr.designStyle] || Object.values(DS)[0]
  const t     = { ...baseT, ...(dr.customColors || {}) }

  const change = (key, val) => { setDr(d => ({ ...d, [key]: val })); setSaved(false) }

  /* 현재 활성 스타일 */
  const hasActive    = activeField || activeOverlay
  const currentStyle = activeField
    ? (dr.textStyles?.[activeField] || {})
    : activeOverlay
      ? ((dr.overlayTexts || []).find(o => o.id === activeOverlay)?.style || {})
      : {}

  const updateTS = (key, val) => {
    if (activeField) {
      change('textStyles', {
        ...(dr.textStyles || {}),
        [activeField]: { ...(dr.textStyles?.[activeField] || {}), [key]: val }
      })
    } else if (activeOverlay) {
      setDr(prev => ({
        ...prev,
        overlayTexts: (prev.overlayTexts || []).map(ot =>
          ot.id === activeOverlay ? { ...ot, style: { ...(ot.style || {}), [key]: val } } : ot
        )
      }))
      setSaved(false)
    }
  }

  const startEdit = () => setEditing(true)
  const save      = () => { onUpdate(idx, dr); setSaved(true); setEditing(false); setActiveField(null); setActiveOverlay(null) }
  const cancel    = () => { setDr(prev => ({ ...sec, secImg: prev.secImg })); setSaved(true); setEditing(false); setActiveField(null); setActiveOverlay(null) }

  const dlPNG = async () => {
    if (!ref.current) return
    if (!saved) { alert('먼저 저장 후 다운로드해주세요.'); return }
    setDl(true)
    try { await capturePNG(ref.current, `section_${idx+1}_${sec.sectionType}.png`) }
    catch(e) { alert('저장 오류: '+e.message) }
    finally { setDl(false) }
  }

  /* 오버레이 텍스트 관리 */
  const addOverlay = () => {
    const id  = Math.random().toString(36).slice(2, 9)
    const newOt = { id, text: '텍스트', x: 10, y: 20, style: { fontSize: 28, color: '#ffffff', fontFamily: "'Nanum Gothic', sans-serif" } }
    setDr(prev => ({ ...prev, overlayTexts: [...(prev.overlayTexts || []), newOt] }))
    setSaved(false)
    setActiveOverlay(id)
    setActiveField(null)
  }
  const updOverlay = (updated) => {
    setDr(prev => ({ ...prev, overlayTexts: (prev.overlayTexts || []).map(ot => ot.id === updated.id ? updated : ot) }))
    setSaved(false)
  }
  const rmOverlay = (id) => {
    setDr(prev => ({ ...prev, overlayTexts: (prev.overlayTexts || []).filter(ot => ot.id !== id) }))
    setSaved(false)
    if (activeOverlay === id) setActiveOverlay(null)
  }

  /* 그라데이션 */
  const grad    = dr.gradient || {}
  const setGrad = (key, val) => change('gradient', { ...grad, [key]: val })

  const tplKey    = TPL[dr.template] ? dr.template : (TPL_COMPAT[dr.template] || 'topBottom')
  const Tpl       = TPL[tplKey] || TPL.topBottom
  const img       = dr.secImg || (editing ? 'slot' : null)
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
          <button onClick={() => setShowTpl(v => !v)}
            style={{ padding:'3px 9px',fontSize:10,borderRadius:16,border:`1px solid ${showTpl?'#3b82f6':t.bd}`,background:showTpl?'#EFF6FF':t.sub,color:showTpl?'#1d4ed8':t.ac,cursor:'pointer',fontWeight:600 }}>
            {TPL_LABELS.find(x => x.k === tplKey)?.l || tplKey} · {dr.designStyle}
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
            title={!saved ? '저장 후 다운로드 가능' : 'PNG 저장'}
            style={{ padding:'5px 10px',fontSize:11,borderRadius:7,border:`1px solid ${dlDisabled?C.bd:'#1d6b45'}`,background:dlDisabled?C.alt:'#f0fdf4',color:dlDisabled?C.fa:'#1d6b45',cursor:dlDisabled?'not-allowed':'pointer',display:'flex',alignItems:'center',gap:4,fontWeight:dlDisabled?400:600 }}>
            {dl ? <><Spin/>변환 중</> : (dlDisabled ? '저장 후 ↓ PNG' : '↓ PNG')}
          </button>
          {onDelete && (
            <button onClick={onDelete}
              style={{ padding:'5px 10px',fontSize:11,borderRadius:7,border:'1px solid #fca5a5',background:'#fef2f2',color:'#ef4444',cursor:'pointer',fontWeight:700 }}>
              × 삭제
            </button>
          )}
        </div>
      </div>

      {/* ── 2단 레이아웃 ── */}
      <div style={{ display:'flex',alignItems:'flex-start' }}>

        {/* LEFT: 카드 미리보기 (축소) */}
        <div ref={wrapRef} style={{ flex:1,minWidth:0,position:'relative',background:'#e8e6e0',overflow:'hidden' }}>
          <div style={{ width:860,transformOrigin:'top left',transform:`scale(${scale})` }}>
            <div ref={ref} data-sect-card style={{ fontFamily:"'Nanum Gothic','Apple SD Gothic Neo',sans-serif",width:860,position:'relative' }}>
              <Tpl s={dr} img={img} t={t} editing={editing} onChange={change}
                secMeta={secMeta}
                onSecMeta={(key,val) => { setSecMeta(p => ({...p,[key]:val})); setSaved(false) }}
                onFieldFocus={f => { setActiveField(f); setActiveOverlay(null) }}
              />
              {/* 그라데이션 오버레이 */}
              {grad.dir && grad.dir !== 'none' && (
                <div style={{ position:'absolute',inset:0,pointerEvents:'none',zIndex:8,
                  background: getGradCSS(grad, t) }} />
              )}
              {/* 오버레이 텍스트 블록 */}
              {(dr.overlayTexts || []).map(ot => (
                <OverlayTextBlock key={ot.id} ot={ot} editing={editing}
                  containerRef={ref}
                  isActive={activeOverlay === ot.id}
                  onSelect={id => { setActiveOverlay(id); setActiveField(null) }}
                  onUpdate={updOverlay}
                  onRemove={rmOverlay}
                />
              ))}
              <div style={{ padding:'6px 20px',textAlign:'right',fontSize:9,color:t.fg,opacity:0.1,background:t.bg }}>ContentOS</div>
            </div>
          </div>
        </div>

        {/* RIGHT: 편집 패널 (넓어진 버전) */}
        {showTpl && (
          <div style={{ width:310,minWidth:310,borderLeft:`1px solid ${C.bd}`,background:'#F8FAFF',position:'sticky',top:60,maxHeight:'calc(100vh - 60px)',overflowY:'auto',animation:'slideInRight .22s ease' }}>
            <div style={{ padding:'14px 14px 32px',display:'flex',flexDirection:'column',gap:0 }}>

              {/* ── 레이아웃 3×3 ── */}
              <p style={sLabel}>레이아웃</p>
              <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:4,marginBottom:16 }}>
                {TPL_LABELS.map(({k,l}) => {
                  const on = tplKey === k
                  return (
                    <button key={k} onClick={() => { const nx={...dr,template:k}; setDr(nx); onUpdate(idx,nx) }}
                      style={{ padding:'4px 4px 4px',fontSize:9,borderRadius:6,border:`1.5px solid ${on?'#3b82f6':C.bd}`,background:on?'#EFF6FF':C.sur,color:on?'#1d4ed8':C.mu,cursor:'pointer',fontWeight:on?700:400,textAlign:'center',display:'flex',flexDirection:'column',gap:3,alignItems:'stretch' }}>
                      <TplIcon k={k} />
                      <span style={{ lineHeight:1.2,marginTop:1 }}>{l}</span>
                    </button>
                  )
                })}
              </div>

              {/* ── 색상 테마 3×3 ── */}
              <p style={sLabel}>색상 테마</p>
              <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:4,marginBottom:14 }}>
                {DS_KEYS.map(s => {
                  const on = dr.designStyle === s; const d = DS[s]
                  return (
                    <button key={s} onClick={() => { const nx={...dr,designStyle:s}; setDr(nx); onUpdate(idx,nx) }}
                      style={{ borderRadius:7,border:`2px solid ${on?'#3b82f6':'transparent'}`,cursor:'pointer',padding:0,overflow:'hidden',background:'none',outline:'none' }}>
                      <div style={{ height:22,background:d.bg,display:'flex',alignItems:'center',justifyContent:'center',gap:3 }}>
                        <div style={{ width:7,height:7,borderRadius:'50%',background:d.ac }} />
                        <div style={{ width:10,height:2,borderRadius:2,background:d.fg,opacity:0.4 }} />
                      </div>
                      <div style={{ padding:'2px',background:on?'#EFF6FF':C.alt,fontSize:8,color:on?'#1d4ed8':C.mu,fontWeight:on?700:400,textAlign:'center',lineHeight:1.3 }}>{s}</div>
                    </button>
                  )
                })}
              </div>

              {/* ── 커스텀 색상 가로 3열 ── */}
              <p style={sLabel}>커스텀 색상</p>
              <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,marginBottom:14 }}>
                {[
                  { label:'배경색', key:'bg' },
                  { label:'강조색', key:'ac' },
                  { label:'글자색', key:'fg' },
                ].map(({ label, key }) => (
                  <div key={key} style={{ display:'flex',flexDirection:'column',gap:3,alignItems:'center' }}>
                    <span style={{ fontSize:9,color:C.mu }}>{label}</span>
                    <label style={{ cursor:'pointer',position:'relative' }}>
                      <div style={{ width:44,height:24,borderRadius:5,background:(dr.customColors?.[key]) || t[key],border:`1.5px solid ${C.bd}`,cursor:'pointer' }} />
                      <input type="color" value={(dr.customColors?.[key]) || t[key] || '#ffffff'}
                        onChange={e => change('customColors', { ...(dr.customColors||{}), [key]: e.target.value })}
                        style={{ position:'absolute',opacity:0,width:0,height:0,top:0,left:0 }} />
                    </label>
                    {dr.customColors?.[key] && (
                      <button onClick={() => { const cc={...(dr.customColors||{})}; delete cc[key]; change('customColors',cc) }}
                        style={{ fontSize:8,color:'#ef4444',border:'none',background:'none',cursor:'pointer',padding:0 }}>초기화</button>
                    )}
                  </div>
                ))}
              </div>

              {/* ── 그라데이션 ── */}
              <p style={sLabel}>그라데이션</p>
              <div style={{ marginBottom:14 }}>
                <div style={{ display:'flex',gap:4,flexWrap:'wrap',marginBottom:8 }}>
                  {GRAD_DIRS.map(({k,l}) => {
                    const on = (grad.dir || 'none') === k
                    return (
                      <button key={k} onClick={() => setGrad('dir', k)}
                        style={{ padding:'4px 10px',fontSize:10,borderRadius:5,border:`1.5px solid ${on?'#3b82f6':C.bd}`,background:on?'#EFF6FF':C.sur,color:on?'#1d4ed8':C.mu,cursor:'pointer',fontWeight:on?700:400 }}>
                        {l}
                      </button>
                    )
                  })}
                </div>
                {grad.dir && grad.dir !== 'none' && (
                  <div style={{ display:'flex',flexDirection:'column',gap:6 }}>
                    <div>
                      <div style={{ display:'flex',justifyContent:'space-between',marginBottom:3 }}>
                        <span style={{ fontSize:10,color:C.mu }}>강도</span>
                        <span style={{ fontSize:10,fontWeight:700,color:C.tx }}>{grad.alpha ?? 70}%</span>
                      </div>
                      <input type="range" min={0} max={100} step={5}
                        value={grad.alpha ?? 70}
                        onChange={e => setGrad('alpha', +e.target.value)}
                        style={{ width:'100%',accentColor:'#3b82f6' }} />
                    </div>
                    <label style={{ fontSize:9,color:C.mu,display:'flex',alignItems:'center',gap:6,cursor:'pointer' }}>
                      <span>색상</span>
                      <input type="color" value={grad.color || t.bg || '#000000'}
                        onChange={e => setGrad('color', e.target.value)}
                        style={{ width:26,height:18,border:'1px solid #ccc',padding:0,cursor:'pointer',borderRadius:3 }} />
                      {grad.color && (
                        <button onClick={() => { const g2={...grad}; delete g2.color; change('gradient',g2) }}
                          style={{ fontSize:8,color:'#ef4444',border:'none',background:'none',cursor:'pointer' }}>배경색으로</button>
                      )}
                    </label>
                  </div>
                )}
              </div>

              {/* ── 폰트 2×3 + Bold ── */}
              <p style={sLabel}>폰트</p>
              <div style={{ display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:3,marginBottom:5 }}>
                {FONT_OPTS.map(f => {
                  const on = currentStyle.fontFamily === f.v
                  return (
                    <button key={f.v} onClick={() => updateTS('fontFamily', f.v)}
                      style={{ padding:'6px 8px',fontSize:11,borderRadius:6,border:`1.5px solid ${on?'#3b82f6':C.bd}`,background:on?'#EFF6FF':C.sur,color:on?'#1d4ed8':C.mu,cursor:'pointer',fontWeight:on?700:400,textAlign:'left',fontFamily:f.v,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>
                      {f.l}
                    </button>
                  )
                })}
              </div>
              <button onClick={() => updateTS('bold', !currentStyle.bold)}
                style={{ width:'100%',padding:'6px 0',fontSize:11,borderRadius:6,border:`1.5px solid ${currentStyle.bold?'#3b82f6':C.bd}`,background:currentStyle.bold?'#EFF6FF':C.sur,color:currentStyle.bold?'#1d4ed8':C.mu,cursor:'pointer',fontWeight:currentStyle.bold?700:400,marginBottom:14 }}>
                <strong>B</strong> 굵게
              </button>

              {/* ── 텍스트 추가 ── */}
              {editing && (
                <button onClick={addOverlay}
                  style={{ width:'100%',padding:'10px 0',fontSize:13,fontWeight:700,borderRadius:8,border:'2px dashed #3b82f6',background:'#EFF6FF',color:'#1d4ed8',cursor:'pointer',marginBottom:14 }}>
                  + 텍스트 추가
                </button>
              )}

              {/* ── 선택된 텍스트 스타일 ── */}
              {editing && hasActive && (
                <>
                  <div style={{ borderTop:`1px solid ${C.bd}`,margin:'4px 0 12px' }} />
                  <p style={sLabel}>선택된 텍스트</p>

                  <div style={{ marginBottom:12 }}>
                    <div style={{ display:'flex',justifyContent:'space-between',marginBottom:4 }}>
                      <span style={{ fontSize:10,color:C.mu }}>크기</span>
                      <span style={{ fontSize:10,fontWeight:700,color:C.tx }}>{currentStyle.fontSize ?? 24}px</span>
                    </div>
                    <input type="range" min={12} max={80} step={1}
                      value={currentStyle.fontSize ?? 24}
                      onChange={e => updateTS('fontSize', +e.target.value)}
                      style={{ width:'100%',accentColor:'#3b82f6' }} />
                    <div style={{ display:'flex',justifyContent:'space-between',fontSize:9,color:C.fa,marginTop:1 }}>
                      <span>12</span><span>80</span>
                    </div>
                  </div>

                  <div style={{ marginBottom:12 }}>
                    <span style={{ fontSize:10,color:C.mu,display:'block',marginBottom:5 }}>글자색</span>
                    <div style={{ display:'flex',gap:4,flexWrap:'wrap',alignItems:'center' }}>
                      {PRESET_COLORS.map(c => (
                        <button key={c} onClick={() => updateTS('color', c)}
                          style={{ width:22,height:22,borderRadius:4,background:c,
                            border: currentStyle.color===c ? '2px solid #3b82f6' : '1px solid #ccc',
                            cursor:'pointer',flexShrink:0 }} />
                      ))}
                      <input type="color" value={currentStyle.color || '#111111'}
                        onChange={e => updateTS('color', e.target.value)}
                        style={{ width:28,height:22,border:'1px solid #ccc',padding:0,cursor:'pointer',borderRadius:4,flexShrink:0 }} />
                    </div>
                  </div>
                </>
              )}

              {/* ── 아이콘 모양 (points3icon) ── */}
              {editing && tplKey === 'points3icon' && (
                <>
                  <div style={{ borderTop:`1px solid ${C.bd}`,margin:'4px 0 12px' }} />
                  <p style={sLabel}>아이콘 모양</p>
                  <div style={{ display:'flex',gap:4,flexWrap:'wrap',marginBottom:10 }}>
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

              {/* ── 좌우반전 (leftRight) ── */}
              {editing && tplKey === 'leftRight' && (
                <>
                  <div style={{ borderTop:`1px solid ${C.bd}`,margin:'4px 0 12px' }} />
                  <button onClick={() => change('flipped', !dr.flipped)}
                    style={{ width:'100%',padding:'8px 0',fontSize:12,borderRadius:7,border:'1px solid #3b82f6',background:'#EFF6FF',color:'#1d4ed8',cursor:'pointer',fontWeight:700,marginBottom:10 }}>
                    ⇄ 좌우 반전
                  </button>
                </>
              )}

              {/* ── 도움말 ── */}
              {editing && (
                <div style={{ padding:'10px 12px',background:'#EFF6FF',borderRadius:9,border:'1px solid #BFDBFE',fontSize:10,color:'#1d4ed8',lineHeight:1.85,marginTop:8 }}>
                  ✎ 텍스트 클릭 → 수정<br/>
                  📷 이미지 클릭 → 업로드<br/>
                  🖱 이미지/텍스트 드래그 → 위치<br/>
                  ⚙ 휠 → 이미지 확대·축소
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
