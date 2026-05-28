// src/App.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react'
import { C, DS, DS_KEYS, TPL_LABELS, TPL_COMPAT, TASKS, getSys, EXTRA_SECTIONS, getExtraSectSys, mkSec } from './constants'
import { parseBlocks, parseSections, capturePNG, downloadURL } from './utils'
import { generateContent } from './api/generate'
import SectionEditor, { NAMED_BLOCKS, activeTextareaInfo } from './components/SectionEditor'
import { FONT_OPTS, selectionStore } from './components/SectionTemplates'

/* ── 입력폼 옵션 ── */
const FORM_CATEGORIES = ['식품', '농산물', '뷰티', '생활용품', '패션', '디지털', '기타']
const FORM_GENDERS    = ['남성', '여성', '성별무관']
const FORM_AGES       = ['10대', '20대', '30대', '40대', '50대', '60대 이상']
const FORM_LIFESTYLE  = ['주부', '직장인', '자취생', '부모(육아중)', '건강관리중', '반려동물보호자', '시니어']
const FORM_PRICES     = ['가성비', '중간', '프리미엄']
const FORM_MOODS      = ['공감형', '감성형', '정보형', '전문가형']

const EMPTY_FORM = {
  productName: '', features: '',
  category: '',
  targetGender: '', targetAges: [], targetLifestyle: [],
  pricePosition: '', mood: '',
}

const GRAD_DIRS = [
  { k: 'none',   l: '없음' },
  { k: 'top',    l: '위' },
  { k: 'bottom', l: '아래' },
  { k: 'left',   l: '좌' },
  { k: 'right',  l: '우' },
]
const PRESET_COLORS = ['#ffffff','#111111','#ef4444','#f59e0b','#10b981','#3b82f6','#8b5cf6','#ec4899','#0f172a','#fafaf8']
const sLabel = { fontSize:14, fontWeight:700, color:'#B0ADA5', letterSpacing:'0.06em', textTransform:'uppercase', marginBottom:6, marginTop:0 }

const ICON_LIST = [
  { k: '♥', l: '하트' }, { k: '★', l: '별' }, { k: '✓', l: '체크' },
  { k: '→', l: '→' }, { k: '↓', l: '↓' }, { k: '🌿', l: '리프' },
  { k: '🔥', l: '불꽃' }, { k: '👑', l: '왕관' }, { k: '💎', l: '다이아' }, { k: '🎀', l: '리본' },
]

/* ── 선택 버튼 (단일선택) ── */
function SelBtn({ options, value, onChange }) {
  return (
    <div style={{ display:'flex', flexWrap:'wrap', gap:7 }}>
      {options.map(opt => {
        const sel = value === opt
        return (
          <button key={opt} onClick={() => onChange(value === opt ? '' : opt)}
            style={{ padding:'8px 16px', borderRadius:9, border: sel ? '2px solid #1D6B45' : `1.5px solid ${C.bd}`, background: sel ? '#E9F7F0' : C.sur, color: sel ? '#1D6B45' : C.tx, fontSize:14, fontWeight: sel ? 700 : 400, cursor:'pointer', transition:'all .12s' }}>
            {opt}
          </button>
        )
      })}
    </div>
  )
}

/* ── 선택 버튼 (복수선택) ── */
function MultiBtn({ options, values, onToggle }) {
  return (
    <div style={{ display:'flex', flexWrap:'wrap', gap:7 }}>
      {options.map(opt => {
        const sel = values.includes(opt)
        return (
          <button key={opt} onClick={() => onToggle(opt)}
            style={{ padding:'8px 16px', borderRadius:9, border: sel ? '2px solid #1D6B45' : `1.5px solid ${C.bd}`, background: sel ? '#E9F7F0' : C.sur, color: sel ? '#1D6B45' : C.tx, fontSize:14, fontWeight: sel ? 700 : 400, cursor:'pointer', transition:'all .12s' }}>
            {opt}
          </button>
        )
      })}
    </div>
  )
}

/* ── 미니 컴포넌트 ─────────────────────────────────── */
function Spin() {
  return <span style={{ display: 'inline-block', width: 14, height: 14, borderRadius: '50%', border: '2px solid #ddd', borderTopColor: '#555', animation: 'sp .6s linear infinite', flexShrink: 0 }} />
}

function CopyBtn({ text, label = '⎘ 복사' }) {
  const [ok, set] = useState(false)
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); set(true); setTimeout(() => set(false), 2000) }} style={{ padding: '4px 10px', fontSize: 11, borderRadius: 6, border: `1px solid ${C.bd}`, background: ok ? '#f0fdf4' : C.sur, color: ok ? '#15803d' : C.mu, cursor: 'pointer' }}>
      {ok ? '✓ 복사됨' : label}
    </button>
  )
}

function Blk({ title, lines }) {
  const tx = lines.join('\n').trim()
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: C.fa, textTransform: 'uppercase' }}>{title}</span>
        <CopyBtn text={tx} />
      </div>
      <div style={{ background: C.alt, borderRadius: 10, border: `1px solid ${C.bd}`, padding: '14px 16px' }}>
        <pre style={{ margin: 0, fontFamily: 'inherit', fontSize: 13.5, lineHeight: 1.9, color: C.tx, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{tx}</pre>
      </div>
    </div>
  )
}

/* ── 섹션 사이 호버 추가 버튼 ────────────────────────── */
function AddBetweenHover({ onClick, loading }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      style={{ height: hov ? 44 : 10, transition:'height .15s', overflow:'hidden', display:'flex', alignItems:'center' }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <button onClick={onClick} disabled={loading}
        style={{ width:'100%', height:34, fontSize:12, borderRadius:8, border:'1.5px dashed #3B82F6', background:'rgba(239,246,255,0.95)', color:'#3B82F6', cursor:loading?'not-allowed':'pointer', fontWeight:600 }}>
        {loading ? '생성 중…' : '+ 섹션 추가'}
      </button>
    </div>
  )
}

/* ── Canva 우측 편집 패널 ────────────────────────────── */
const NAMED_KEYS = new Set(['mainCopy', 'subCopy', 'bodyText', 'cta', 'description'])


function CanvaPanel({ sec, idx, onUpdate, onDelete, activeBlockId, onAddSection, dlAll, onDlAll, onDlSection }) {
  const panelStyle = { width:'100%', height:'calc(100vh - 52px)', background:'#fff', boxShadow:'-4px 0 24px rgba(0,0,0,0.1)', display:'flex', flexDirection:'column', overflow:'hidden' }

  /* 기본 텍스트 스타일 (선택된 박스 없을 때 사용/편집) */
  const [defStyle, setDefStyle] = useState({ fontSize:28, fontFamily:'', color:'#ffffff', fontWeight:400, align:'left' })

  if (sec === null || idx === null) {
    return (
      <div style={{ ...panelStyle, alignItems:'center', justifyContent:'center', gap:12 }}>
        <p style={{ fontSize:15, color:C.mu, textAlign:'center', lineHeight:1.8, margin:0, padding:'0 24px' }}>섹션을 클릭해서<br/>편집하세요</p>
      </div>
    )
  }

  const grad = sec.gradient || {}
  const bb   = sec.bottomBox || null

  const change  = (key, val) => onUpdate(idx, { ...sec, [key]: val })
  const setGrad = (key, val) => change('gradient', { ...grad, [key]: val })
  const setBB   = patch => change('bottomBox', patch === null ? null : { ...(bb || { bgColor:'#000000', intensity:80, overlayY:440, overlayH:200, textBlocks:[] }), ...patch })

  /* 메인 블록 선택 */
  const isNamed    = activeBlockId && NAMED_KEYS.has(activeBlockId)
  const isFree     = activeBlockId && !NAMED_KEYS.has(activeBlockId)
  const namedDef   = NAMED_BLOCKS.find(b => b.key === activeBlockId) || {}
  const namedStyle = isNamed ? (sec.textStyles?.[activeBlockId] || {}) : {}
  const freeBlock  = isFree  ? (sec.freeBlocks || []).find(b => b.id === activeBlockId) : null

  /* 오버레이 텍스트 선택 */
  const overlayTxt = bb?.textBlocks?.find(b => b.id === activeBlockId) || null

  /* 표시할 현재 스타일 값 (우선순위: named > free > overlayTxt > defStyle) */
  const anyActive = isNamed || freeBlock || overlayTxt
  const dispFS    = isNamed ? (namedStyle.fontSize ?? namedDef.fontSize ?? 28)
                  : freeBlock ? (freeBlock.fontSize || 28)
                  : overlayTxt ? (overlayTxt.fontSize || 28)
                  : defStyle.fontSize
  const dispFF    = isNamed ? (namedStyle.fontFamily || '')
                  : freeBlock ? (freeBlock.fontFamily || '')
                  : overlayTxt ? (overlayTxt.fontFamily || '')
                  : defStyle.fontFamily
  const dispColor = isNamed ? (namedStyle.color ?? namedDef.color ?? '#ffffff')
                  : freeBlock ? (freeBlock.color || '#ffffff')
                  : overlayTxt ? (overlayTxt.color || '#ffffff')
                  : defStyle.color
  const dispBold  = isNamed ? ((namedStyle.fontWeight ?? namedDef.fontWeight ?? 400) >= 700)
                  : freeBlock ? ((freeBlock.fontWeight || 400) >= 700)
                  : overlayTxt ? ((overlayTxt.fontWeight || 400) >= 700)
                  : defStyle.fontWeight >= 700
  const dispAlign = isNamed ? (namedStyle.textAlign || 'left')
                  : freeBlock ? (freeBlock.textAlign || 'left')
                  : overlayTxt ? (overlayTxt.align || 'left')
                  : defStyle.align

  const panelLabel = isNamed ? `텍스트 — ${namedDef.label || activeBlockId}`
                   : freeBlock ? '추가 텍스트'
                   : overlayTxt ? '오버레이 텍스트'
                   : '기본값 (선택 없음)'

  /* 통합 스타일 적용 함수 */
  const applyStyle = (key, val) => {
    if (isNamed) {
      const mk = key === 'bold' ? 'fontWeight' : key === 'align' ? 'textAlign' : key
      const mv = key === 'bold' ? (val ? 700 : 400) : val
      change('textStyles', { ...(sec.textStyles||{}), [activeBlockId]: { ...(sec.textStyles?.[activeBlockId]||{}), [mk]: mv } })
    } else if (freeBlock) {
      const mk = key === 'bold' ? 'fontWeight' : key === 'align' ? 'textAlign' : key
      const mv = key === 'bold' ? (val ? 700 : 400) : val
      change('freeBlocks', (sec.freeBlocks||[]).map(b => b.id === activeBlockId ? { ...b, [mk]: mv } : b))
    } else if (overlayTxt) {
      const mk = key === 'bold' ? 'fontWeight' : key
      const mv = key === 'bold' ? (val ? 700 : 400) : val
      setBB({ textBlocks: bb.textBlocks.map(b => b.id === activeBlockId ? { ...b, [mk]: mv } : b) })
    } else {
      /* 선택 없음 → defStyle 업데이트 */
      const dk = key === 'bold' ? 'fontWeight' : key
      const dv = key === 'bold' ? (val ? 700 : 400) : val
      setDefStyle(d => ({ ...d, [dk]: dv }))
    }
    if (selectionStore.range) {
      try {
        const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(selectionStore.range)
        if (key==='bold') document.execCommand('bold',false,null)
        else if (key==='color') document.execCommand('foreColor',false,val)
        else if (key==='fontFamily') document.execCommand('fontName',false,val)
      } catch(e) {}
      selectionStore.range = null
    }
  }

  /* 아이콘을 활성 textarea 커서 위치에 삽입 */
  const insertIcon = iconChar => {
    const ta = activeTextareaInfo.ref
    if (ta) {
      ta.focus()
      document.execCommand('insertText', false, iconChar)
    }
  }

  return (
    <div style={panelStyle}>

      {/* 헤더 */}
      <div style={{ padding:'12px 16px', borderBottom:`1px solid ${C.bd}`, background:'#F8FAFF', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:9, height:9, borderRadius:'50%', background:'#3b82f6', flexShrink:0 }} />
          <span style={{ fontSize:15, fontWeight:700, color:'#1E40AF' }}>S{idx+1} · {sec.sectionType}</span>
        </div>
      </div>

      {/* 스크롤 컨트롤 영역 */}
      <div style={{ flex:1, overflowY:'auto', padding:'12px 14px 12px' }}>

        {/* 그라데이션 */}
        <p style={sLabel}>그라데이션</p>
        <div style={{ marginBottom:10 }}>
          <div style={{ display:'flex', gap:4, flexWrap:'wrap', marginBottom:8 }}>
            {GRAD_DIRS.map(({k,l}) => {
              const on = (grad.dir || 'none') === k
              return (
                <button key={k} onClick={() => setGrad('dir', k)}
                  style={{ padding:'6px 12px', fontSize:14, borderRadius:6, border:`1.5px solid ${on?'#3b82f6':C.bd}`, background:on?'#EFF6FF':C.sur, color:on?'#1d4ed8':C.mu, cursor:'pointer', fontWeight:on?700:400 }}>
                  {l}
                </button>
              )
            })}
          </div>
          {grad.dir && grad.dir !== 'none' && (
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              <div>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                  <span style={{ fontSize:14, color:C.mu }}>강도</span>
                  <span style={{ fontSize:14, fontWeight:700, color:C.tx }}>{grad.alpha ?? 70}%</span>
                </div>
                <input type="range" min={0} max={100} step={5}
                  value={grad.alpha ?? 70}
                  onChange={e => setGrad('alpha', +e.target.value)}
                  style={{ width:'100%', accentColor:'#3b82f6' }} />
              </div>
              <label style={{ fontSize:13, color:C.mu, display:'flex', alignItems:'center', gap:8, cursor:'pointer' }}>
                <span>색상</span>
                <input type="color" value={grad.color || '#000000'}
                  onChange={e => setGrad('color', e.target.value)}
                  style={{ width:30, height:22, border:'1px solid #ccc', padding:0, cursor:'pointer', borderRadius:4 }} />
                {grad.color && (
                  <button onClick={() => { const g2={...grad}; delete g2.color; change('gradient',g2) }}
                    style={{ fontSize:12, color:'#ef4444', border:'none', background:'none', cursor:'pointer' }}>초기화</button>
                )}
              </label>
            </div>
          )}
        </div>

        {/* ── 텍스트 편집 도구 (항상 표시) ── */}
        <div style={{ borderTop:`1px solid ${C.bd}`, margin:'6px 0 10px' }} />
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
          <p style={{ ...sLabel, margin:0 }}>텍스트 편집</p>
          <span style={{ fontSize:11, color: anyActive ? '#3b82f6' : C.fa, fontWeight: anyActive ? 700 : 400 }}>
            {panelLabel}
          </span>
        </div>

        {/* 정렬 */}
        <div style={{ display:'flex', gap:4, marginBottom:10 }}>
          {[['left','좌'],['center','중'],['right','우']].map(([a,l]) => (
            <button key={a}
              onMouseDown={e => e.preventDefault()}
              onClick={() => applyStyle('align', a)}
              style={{ flex:1, padding:'6px 0', fontSize:14, borderRadius:6, border:`1.5px solid ${dispAlign===a?'#3b82f6':C.bd}`, background:dispAlign===a?'#EFF6FF':C.sur, color:dispAlign===a?'#1d4ed8':C.mu, cursor:'pointer', fontWeight:dispAlign===a?700:400 }}>
              {l}
            </button>
          ))}
        </div>

        {/* 폰트 크기 */}
        <div style={{ marginBottom:10 }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
            <span style={{ fontSize:14, color:C.mu }}>글자 크기</span>
            <span style={{ fontSize:14, fontWeight:700, color:C.tx }}>{dispFS}px</span>
          </div>
          <input type="range" min={10} max={200}
            value={dispFS}
            onChange={e => applyStyle('fontSize', +e.target.value)}
            style={{ width:'100%', accentColor:'#3b82f6' }} />
        </div>

        {/* 폰트 선택 */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:4, marginBottom:4 }}>
          {FONT_OPTS.map(f => {
            const on = dispFF === f.v
            return (
              <button key={f.v}
                onMouseDown={e => e.preventDefault()}
                onClick={() => applyStyle('fontFamily', f.v)}
                style={{ padding:'7px 8px', fontSize:14, borderRadius:6, border:`1.5px solid ${on?'#3b82f6':C.bd}`, background:on?'#EFF6FF':C.sur, color:on?'#1d4ed8':C.mu, cursor:'pointer', fontWeight:on?700:400, textAlign:'left', fontFamily:f.v, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {f.l}
              </button>
            )
          })}
        </div>
        <button
          onMouseDown={e => e.preventDefault()}
          onClick={() => applyStyle('bold', !dispBold)}
          style={{ width:'100%', padding:'7px 0', fontSize:14, borderRadius:6, border:`1.5px solid ${dispBold?'#3b82f6':C.bd}`, background:dispBold?'#EFF6FF':C.sur, color:dispBold?'#1d4ed8':C.mu, cursor:'pointer', fontWeight:dispBold?700:400, marginBottom:10 }}>
          <strong>B</strong> 굵게
        </button>

        {/* 글자색 */}
        <span style={{ fontSize:14, color:C.mu, display:'block', marginBottom:6 }}>글자색</span>
        <div style={{ display:'flex', gap:5, flexWrap:'wrap', alignItems:'center', marginBottom:10 }}>
          {PRESET_COLORS.map(c => (
            <button key={c}
              onMouseDown={e => e.preventDefault()}
              onClick={() => applyStyle('color', c)}
              style={{ width:24, height:24, borderRadius:5, background:c,
                border: dispColor===c ? '2px solid #3b82f6' : '1px solid #ccc',
                cursor:'pointer', flexShrink:0 }} />
          ))}
          <input type="color" value={dispColor}
            onMouseDown={e => e.preventDefault()}
            onChange={e => applyStyle('color', e.target.value)}
            style={{ width:30, height:24, border:'1px solid #ccc', padding:0, cursor:'pointer', borderRadius:5, flexShrink:0 }} />
        </div>

        {/* 인라인 아이콘 삽입 팔레트 */}
        <span style={{ fontSize:13, color:C.fa, display:'block', marginBottom:5 }}>아이콘 (편집 중 클릭 시 삽입)</span>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:4, marginBottom:12 }}>
          {ICON_LIST.map(({ k, l }) => (
            <button key={k}
              onMouseDown={e => e.preventDefault()}
              onClick={() => insertIcon(k)}
              title={l}
              style={{ padding:'5px 0', fontSize:18, borderRadius:6, border:`1px solid ${C.bd}`, background:C.sur, cursor:'pointer', textAlign:'center' }}>
              {k}
            </button>
          ))}
        </div>

        {/* ── 하단 오버레이 ── */}
        <div style={{ borderTop:`1px solid ${C.bd}`, margin:'6px 0 10px' }} />
        <p style={sLabel}>하단 오버레이</p>
        {bb ? (
          <>
            <label style={{ fontSize:14, color:C.mu, display:'flex', alignItems:'center', gap:8, cursor:'pointer', marginBottom:10 }}>
              <span>배경색</span>
              <input type="color" value={bb.bgColor||'#000000'}
                onChange={e => setBB({ bgColor: e.target.value })}
                style={{ width:34, height:22, border:'1px solid #ccc', padding:0, cursor:'pointer', borderRadius:4 }} />
              <span style={{ fontSize:12, color:C.fa }}>{bb.bgColor||'#000000'}</span>
            </label>
            <div style={{ marginBottom:10 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                <span style={{ fontSize:14, color:C.mu }}>그라데이션 강도</span>
                <span style={{ fontSize:14, fontWeight:700, color:C.tx }}>{bb.intensity??80}%</span>
              </div>
              <input type="range" min={0} max={100} step={1}
                value={bb.intensity??80}
                onChange={e => setBB({ intensity: +e.target.value })}
                style={{ width:'100%', accentColor:'#3b82f6' }} />
            </div>
            <button
              onClick={() => {
                const d = defStyle
                const newTxt = { id:`txt_${Date.now()}`, x:80, y:660, w:340, h:null, content:'텍스트', fontSize:d.fontSize, fontFamily:d.fontFamily, color:d.color, fontWeight:d.fontWeight, align:d.align }
                setBB({ textBlocks: [...(bb.textBlocks||[]), newTxt] })
              }}
              style={{ width:'100%', padding:'8px 0', fontSize:14, fontWeight:700, borderRadius:7, border:'1.5px dashed #3b82f6', background:'#eff6ff', color:'#1d4ed8', cursor:'pointer', marginBottom:8 }}>
              + 텍스트 추가
            </button>
            <button
              onClick={() => setBB(null)}
              style={{ width:'100%', padding:'7px 0', fontSize:14, fontWeight:700, borderRadius:7, border:'1px solid #fca5a5', background:'#fef2f2', color:'#ef4444', cursor:'pointer' }}>
              × 오버레이 삭제
            </button>
          </>
        ) : (
          <button
            onClick={() => change('bottomBox', { bgColor:'#000000', intensity:80, overlayY:440, overlayH:200, textBlocks:[] })}
            style={{ width:'100%', padding:'8px 0', fontSize:14, fontWeight:700, borderRadius:7, border:'1.5px dashed #3b82f6', background:'#eff6ff', color:'#1d4ed8', cursor:'pointer', marginBottom:8 }}>
            + 하단 오버레이 추가
          </button>
        )}
      </div>

      {/* 하단 PNG 버튼 */}
      <div style={{ borderTop:`1px solid ${C.bd}`, padding:'12px 14px', background:'#F8FAFF', flexShrink:0, display:'flex', gap:6, flexDirection:'column' }}>
        <button onClick={onDlSection}
          style={{ width:'100%', padding:'10px 0', fontSize:14, fontWeight:700, borderRadius:7, border:'1px solid #1d6b45', background:'#f0fdf4', color:'#1d6b45', cursor:'pointer' }}>
          ↓ 선택 PNG
        </button>
        <button onClick={onDlAll} disabled={dlAll}
          style={{ width:'100%', padding:'10px 0', fontSize:14, fontWeight:700, borderRadius:7, border:`1px solid ${dlAll?C.bd:C.bdm}`, background:dlAll?C.alt:C.tx, color:dlAll?C.fa:'#fff', cursor:dlAll?'not-allowed':'pointer' }}>
          {dlAll ? '저장 중…' : '↓ 전체 PNG'}
        </button>
      </div>
    </div>
  )
}

/* ── 선택 버튼 그룹 ─────────────────────────────────── */
function OptionBtns({ options, value, onChange, multi = false, maxSelect = null }) {
  const isSel = opt => multi ? value.includes(opt) : value === opt
  const toggle = opt => {
    if (multi) {
      if (value.includes(opt)) onChange(value.filter(o => o !== opt))
      else if (!maxSelect || value.length < maxSelect) onChange([...value, opt])
    } else {
      onChange(value === opt ? '' : opt)
    }
  }
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {options.map(opt => {
        const sel = isSel(opt)
        const maxed = multi && maxSelect && !sel && value.length >= maxSelect
        return (
          <button key={opt} onClick={() => !maxed && toggle(opt)}
            style={{ padding: '7px 13px', borderRadius: 9, border: sel ? '2px solid #1D6B45' : `1.5px solid ${C.bd}`, background: sel ? '#E9F7F0' : C.sur, color: sel ? '#1D6B45' : C.tx, fontSize: 12.5, fontWeight: sel ? 700 : 400, cursor: maxed ? 'not-allowed' : 'pointer', opacity: maxed ? 0.45 : 1, transition: 'all .12s' }}>
            {opt}
          </button>
        )
      })}
    </div>
  )
}

/* ── 스텝 카드 ──────────────────────────────────────── */
function StepCard({ stepNum, label, done, children }) {
  return (
    <div style={{ background: C.sur, borderRadius: 14, border: done ? `1.5px solid ${C.bd}` : '1.5px solid #FECACA', marginBottom: 10, overflow: 'hidden' }}>
      <div style={{ padding: '10px 16px', background: done ? C.alt : '#FFF5F5', borderBottom: `1px solid ${done ? C.bd : '#FECACA'}`, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 22, height: 22, borderRadius: '50%', background: done ? '#1D6B45' : '#EF4444', color: '#fff', fontSize: 11, fontWeight: 800, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {done ? '✓' : stepNum}
        </span>
        <span style={{ fontSize: 13, fontWeight: 700, color: C.tx }}>STEP {stepNum} — {label}</span>
        <span style={{ fontSize: 10, color: done ? '#1D6B45' : '#EF4444', marginLeft: 'auto', fontWeight: 600 }}>{done ? '완료' : '필수'}</span>
      </div>
      <div style={{ padding: '14px 16px 6px' }}>{children}</div>
    </div>
  )
}

/* ── 서브 질문 ──────────────────────────────────────── */
function SubQ({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: C.mu, marginBottom: 7, margin: '0 0 7px' }}>{label}</p>
      {children}
    </div>
  )
}

/* ── 추가 섹션 AI 출력 파서 ─────────────────────────── */
function parseExtraSection(text, typeInfo) {
  const gf = (k, t) => { const rx = new RegExp(k + ':\\s*([^\\n]+)'); const f = t.match(rx); return f ? f[1].trim() : '' }
  const gb = (k, t) => {
    const rx = new RegExp(k + ':\\s*\\n([\\s\\S]*?)(?=\\n[가-힣A-Za-z]+:|$)')
    const f = t.match(rx); if (!f) return []
    return f[1].split('\n').map(l => l.replace(/^[\s•\-\d\.]+/, '').trim()).filter(l => l.length > 1)
  }
  return mkSec({
    sectionType: typeInfo.label,
    template: typeInfo.template,
    designStyle: typeInfo.designStyle || '크림',
    mainCopy: gf('메인카피', text),
    subCopy:  gf('서브카피', text),
    points:   gb('포인트', text),
  })
}

/* ── 상세페이지 결과 뷰 ─────────────────────────────── */
function DetailView({ result, savedSects, onSectsChange, productInput, quiz }) {
  const top    = parseBlocks(result)
  const rep    = top.find(b => b.title === '기획 보고서')
  const ptMeta = top.find(b => b.title.includes('Page Title'))
  const seo    = top.find(b => b.title.includes('SEO'))

  const ptText   = ptMeta?.lines.join('\n') || ''
  const pageTitle = ptText.match(/Page Title:\s*(.+)/)?.[1]?.trim() || ''
  const metaDesc  = ptText.match(/Meta Description:\s*(.+)/)?.[1]?.trim() || ''
  const [sects,    setSects]    = useState(() => savedSects ?? parseSections(result))
  const [planOpen, setPlanOpen] = useState({})
  const [dlAll,      setDlAll]      = useState(false)
  const [addLoading, setAddLoading] = useState(null)
  const [addModal,   setAddModal]   = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [selectedIdx,  setSelectedIdx]  = useState(() => {
    const s = savedSects ?? parseSections(result)
    return s.length > 0 ? 0 : null
  })
  const [activeBlockId,  setActiveBlockId]  = useState(null)
  const sectsInit      = useRef(false)
  const sectsRef       = useRef(sects)
  const historyRef     = useRef({})          // { sectionIdx: [...prevStates] }
  const selectedIdxRef = useRef(selectedIdx)
  const activeBlockIdRef = useRef(activeBlockId)
  const MAX_HISTORY    = 20

  useEffect(() => { selectedIdxRef.current  = selectedIdx  }, [selectedIdx])
  useEffect(() => { activeBlockIdRef.current = activeBlockId }, [activeBlockId])
  useEffect(() => { sectsRef.current = sects }, [sects])

  useEffect(() => {
    if (!sectsInit.current) { sectsInit.current = true; return }
    onSectsChange?.(sects)
  }, [sects])

  const upd = useCallback((i, v) => {
    const curr = sectsRef.current[i]
    if (curr) historyRef.current[i] = [...(historyRef.current[i] || []).slice(-(MAX_HISTORY - 1)), curr]
    setSects(p => p.map((s, j) => j === i ? v : s))
  }, [])

  /* Ctrl+Z 실행취소 / Delete 키 텍스트 박스 삭제 */
  useEffect(() => {
    const handler = e => {
      const tag = e.target.tagName
      const inInput = tag === 'TEXTAREA' || tag === 'INPUT' || e.target.closest('[contenteditable]')

      /* Ctrl+Z */
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        if (inInput) return
        e.preventDefault()
        const si = selectedIdxRef.current
        if (si === null) return
        const hist = historyRef.current[si]
        if (!hist?.length) return
        const prev = hist[hist.length - 1]
        historyRef.current[si] = hist.slice(0, -1)
        setSects(p => p.map((s, j) => j === si ? prev : s))
        return
      }
      /* Delete → 선택된 블록 삭제 */
      if (e.key === 'Delete') {
        if (inInput) return
        const si  = selectedIdxRef.current
        const bid = activeBlockIdRef.current
        if (si === null || !bid) return
        e.preventDefault()
        if (NAMED_KEYS.has(bid)) {
          // named block → 내용만 비움
          setSects(p => p.map((s, j) => j !== si ? s : { ...s, [bid]: '' }))
        } else {
          // free block → 제거
          setSects(p => p.map((s, j) => j !== si ? s : { ...s, freeBlocks: (s.freeBlocks || []).filter(b => b.id !== bid) }))
        }
        setActiveBlockId(null)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const selectSection = useCallback((idx) => {
    setSelectedIdx(idx)
    setActiveBlockId(null)
  }, [])

  const deleteSection = useCallback(i => {
    setSects(p => p.filter((_, j) => j !== i))
    setPlanOpen({})
    setSelectedIdx(prev => {
      if (prev === null) return null
      if (prev === i) { setActiveBlockId(null); return null }
      return prev > i ? prev - 1 : prev
    })
  }, [])

  const addSection = useCallback(async (typeInfo, insertAfterIdx) => {
    setAddModal(null)
    setAddLoading(typeInfo.type)
    try {
      const text = await generateContent({
        systemPrompt: getExtraSectSys(typeInfo.type),
        userPrompt: productInput?.trim()
          ? `다음 제품 정보를 참고해서 "${typeInfo.label}" 섹션을 만들어줘:\n${productInput}`
          : `"${typeInfo.label}" 섹션 내용을 작성해줘.`,
        model: 'gpt-4o',
        maxTokens: 700,
      })
      const ns = { ...parseExtraSection(text, typeInfo), _userAdded: true }
      setSects(p => { const n = [...p]; n.splice(insertAfterIdx + 1, 0, ns); return n })
    } catch {
      const ns = mkSec({ sectionType: typeInfo.label, template: typeInfo.template, designStyle: typeInfo.designStyle || '크림', _userAdded: true })
      setSects(p => { const n = [...p]; n.splice(insertAfterIdx + 1, 0, ns); return n })
    } finally {
      setAddLoading(null)
    }
  }, [productInput])

  const dlAllPNG = async () => {
    setDlAll(true)
    document.dispatchEvent(new CustomEvent('png-capture-start'))
    await new Promise(r => setTimeout(r, 100))
    const els = document.querySelectorAll('[data-sect-card]')
    for (let i = 0; i < els.length; i++) {
      try { await capturePNG(els[i], `section_${i + 1}.png`); await new Promise(r => setTimeout(r, 600)) }
      catch (e) { console.error(e) }
    }
    document.dispatchEvent(new CustomEvent('png-capture-end'))
    setDlAll(false)
  }

  const dlSectionPNG = async () => {
    if (selectedIdx === null) return
    const els = document.querySelectorAll('[data-sect-card]')
    const el  = els[selectedIdx]
    if (!el) return
    setDlAll(true)
    document.dispatchEvent(new CustomEvent('png-capture-start'))
    await new Promise(r => setTimeout(r, 100))
    try { await capturePNG(el, `section_${selectedIdx + 1}.png`) }
    catch (e) { console.error(e) }
    finally {
      document.dispatchEvent(new CustomEvent('png-capture-end'))
      setDlAll(false)
    }
  }

  return (
    <div>
      {rep && (
        <div style={{ background: '#FFFFFF', padding: '20px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: C.tx, letterSpacing: '-0.02em' }}>📋 기획 보고서</span>
            <CopyBtn text={rep.lines.join('\n').trim()} />
          </div>
          <div style={{ background: C.alt, borderRadius: 10, border: `1px solid ${C.bd}`, padding: '14px 16px' }}>
            <pre style={{ margin: 0, fontFamily: 'inherit', fontSize: 13.5, lineHeight: 1.9, color: C.tx, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{rep.lines.join('\n').trim()}</pre>
          </div>
        </div>
      )}

      {(pageTitle || metaDesc) && (
        <div style={{ background: '#EFF6FF', padding: '20px 0', borderTop: '1px solid #BFDBFE', borderBottom: '1px solid #BFDBFE' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: '#1E40AF', letterSpacing: '-0.02em' }}>🔍 Page Title & Meta Description</span>
            <span style={{ fontSize: 11, color: '#3B82F6' }}>— SEO 최적화</span>
          </div>
          {pageTitle && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#1E40AF' }}>Page Title</span>
                <CopyBtn text={pageTitle} />
              </div>
              <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #BFDBFE', padding: '10px 14px', fontSize: 13.5, color: C.tx, lineHeight: 1.7 }}>{pageTitle}</div>
            </div>
          )}
          {metaDesc && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#1E40AF' }}>Meta Description</span>
                <CopyBtn text={metaDesc} />
              </div>
              <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #BFDBFE', padding: '10px 14px', fontSize: 13.5, color: C.tx, lineHeight: 1.7 }}>{metaDesc}</div>
            </div>
          )}
        </div>
      )}

      {sects.length > 0 && (
        <div style={{ background: '#FEFCE8', padding: '20px 0 24px', borderTop: '1px solid #FEF08A', borderBottom: '1px solid #FEF08A' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: '#713F12', letterSpacing: '-0.02em' }}>📐 섹션별 기획안</span>
            <span style={{ fontSize: 11, color: '#A16207' }}>— 촬영 가이드</span>
          </div>
          {sects.map((s, i) => {
            let sp = {}
            try { sp = JSON.parse(s.photoDir || '{}') } catch {}
            return (
              <div key={s._id || i} style={{ marginBottom: 6, border: `1px solid ${C.bd}`, borderRadius: 8, overflow: 'hidden' }}>
                <button onClick={() => setPlanOpen(o => ({ ...o, [i]: !o[i] }))} style={{ width: '100%', padding: '9px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: 'none', background: planOpen[i] ? '#ECEAE5' : C.sur, cursor: 'pointer', textAlign: 'left' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: C.mu, background: C.alt, padding: '1px 7px', borderRadius: 4, border: `1px solid ${C.bd}` }}>S{i + 1}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: C.tx }}>{s.sectionType}</span>
                    {s.mainCopy && <span style={{ fontSize: 11, color: C.mu }}>— {s.mainCopy}</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 11, color: '#3b82f6', fontWeight: 700 }}>{planOpen[i] ? '접기' : '열어보기'}</span>
                    {s._userAdded && (
                      <span onClick={e => { e.stopPropagation(); deleteSection(i) }}
                        style={{ fontSize: 12, color: '#ef4444', fontWeight: 700, cursor: 'pointer', padding: '2px 7px', borderRadius: 4, background: '#fef2f2', border: '1px solid #fca5a5', lineHeight: 1 }}>×</span>
                    )}
                  </div>
                </button>
                {planOpen[i] && (
                  <div style={{ padding: '14px 16px', borderTop: `1px solid ${C.bd}` }}>
                    <pre style={{ margin: '0 0 12px', fontFamily: 'inherit', fontSize: 12.5, lineHeight: 1.85, color: C.tx, whiteSpace: 'pre-wrap' }}>
                      {[
                        s.mainCopy && `메인: ${s.mainCopy}`,
                        s.subCopy && `서브: ${s.subCopy}`,
                        s.points?.length && `\n포인트:\n${s.points.map((p, j) => `  ${j + 1}. ${p}`).join('\n')}`,
                      ].filter(Boolean).join('\n')}
                    </pre>
                    {Object.keys(sp).length > 0 && (
                      <div style={{ background: C.alt, borderRadius: 7, padding: '10px 13px', border: `1px solid ${C.bd}`, marginBottom: 10 }}>
                        <p style={{ fontSize: 10, fontWeight: 700, color: C.fa, marginBottom: 6 }}>📷 촬영 기획</p>
                        {Object.entries(sp).map(([k, v], j) => <div key={j} style={{ fontSize: 12, color: C.tx, marginBottom: 3 }}><span style={{ color: C.mu, fontWeight: 600 }}>{k}:</span> {v}</div>)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {sects.length > 0 && (
        <div style={{ background:'#F5F2ED', paddingTop:32, paddingBottom:60 }}>
          <div style={{ display:'flex', alignItems:'flex-start' }}>
            {/* 캔버스 */}
            <div style={{ flex:1, minWidth:0 }}
              onClick={() => setSelectedIdx(null)}
            >
              <div
                style={{ boxShadow:'0 8px 48px rgba(0,0,0,0.15)' }}
                onClick={e => e.stopPropagation()}
              >
                {sects.map((s, i) => (
                  <SectionEditor
                    key={s._id || i}
                    sec={s} idx={i} onUpdate={upd}
                    isSelected={selectedIdx === i}
                    onSelect={selectSection}
                    activeBlockId={selectedIdx === i ? activeBlockId : null}
                    onBlockSelect={id => { setActiveBlockId(id) }}
                  />
                ))}
              </div>
            </div>
            {/* 스티키 편집 패널 */}
            <div style={{ width:340, flexShrink:0, position:'sticky', top:52, alignSelf:'flex-start' }}>
              <CanvaPanel
                sec={selectedIdx !== null ? sects[selectedIdx] : null}
                idx={selectedIdx}
                onUpdate={upd}
                onDelete={() => selectedIdx !== null && setDeleteConfirm(selectedIdx)}
                onAddSection={() => setAddModal(selectedIdx ?? sects.length - 1)}
                activeBlockId={activeBlockId}
                dlAll={dlAll}
                onDlAll={dlAllPNG}
                onDlSection={dlSectionPNG}
              />
            </div>
          </div>
        </div>
      )}

      {seo && (
        <div style={{ marginTop: 20 }}>
          <Blk title={seo.title} lines={seo.lines} />
        </div>
      )}

      {addModal !== null && (
        <div onClick={() => setAddModal(null)}
          style={{ position:'fixed', inset:0, zIndex:200, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div onClick={e => e.stopPropagation()}
            style={{ background:'#fff', borderRadius:16, padding:'24px', maxWidth:480, width:'90%', maxHeight:'80vh', overflowY:'auto', boxShadow:'0 20px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
              <span style={{ fontSize:14, fontWeight:700, color:C.tx }}>추가할 섹션 선택</span>
              <button onClick={() => setAddModal(null)}
                style={{ width:28, height:28, borderRadius:'50%', border:'none', background:C.alt, cursor:'pointer', fontSize:18, color:C.mu, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700 }}>×</button>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:8 }}>
              {EXTRA_SECTIONS.map(sec => (
                <button key={sec.type} onClick={() => addSection(sec, addModal)}
                  style={{ padding:'12px 14px', borderRadius:10, border:`1px solid ${C.bd}`, background:C.sur, cursor:'pointer', textAlign:'left', transition:'border-color .12s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor='#3b82f6'}
                  onMouseLeave={e => e.currentTarget.style.borderColor=C.bd}>
                  <div style={{ fontSize:13, fontWeight:700, color:C.tx }}>{sec.label}</div>
                  <div style={{ fontSize:11, color:C.fa, marginTop:3 }}>{sec.sub}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {deleteConfirm !== null && (
        <div style={{ position:'fixed', inset:0, zIndex:200, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ background:'#fff', borderRadius:14, padding:'28px 32px', maxWidth:320, width:'90%', boxShadow:'0 20px 60px rgba(0,0,0,0.3)', textAlign:'center' }}>
            <p style={{ fontSize:15, fontWeight:600, color:C.tx, margin:'0 0 6px' }}>섹션을 삭제하시겠습니까?</p>
            <p style={{ fontSize:12, color:C.fa, margin:'0 0 24px' }}>이 작업은 되돌릴 수 없습니다.</p>
            <div style={{ display:'flex', gap:10, justifyContent:'center' }}>
              <button onClick={() => setDeleteConfirm(null)}
                style={{ padding:'9px 24px', borderRadius:8, border:`1px solid ${C.bd}`, background:C.sur, color:C.mu, cursor:'pointer', fontWeight:600, fontSize:13 }}>취소</button>
              <button onClick={() => { deleteSection(deleteConfirm); setDeleteConfirm(null) }}
                style={{ padding:'9px 24px', borderRadius:8, border:'none', background:'#ef4444', color:'#fff', cursor:'pointer', fontWeight:700, fontSize:13 }}>삭제</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── 메인 앱 ───────────────────────────────────────── */
export default function App() {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  // 새로고침 시 전체 초기화
  useEffect(() => {
    ;['cos_input','cos_quiz','cos_result_detail','cos_card_data','cos_detail_data','cos_history'].forEach(k => {
      try { localStorage.removeItem(k) } catch {}
    })
  }, [])

  // 입력 폼
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const updForm     = useCallback((k, v) => setForm(f => ({ ...f, [k]: v })), [])
  const toggleArr   = useCallback((k, v) => setForm(f => ({
    ...f,
    [k]: f[k].includes(v) ? f[k].filter(x => x !== v) : [...f[k], v],
  })), [])

  const allDone = !!(form.productName.trim() && form.features.trim())

  // 상세페이지 결과
  const [result,       setResult]       = useState('')
  const [detailData,   setDetailData]   = useState(null)
  const [detailGenKey, setDetailGenKey] = useState(0)

  const saveDetailData = useCallback((sects) => {
    setDetailData(sects)
    try { localStorage.setItem('cos_detail_data', JSON.stringify(sects.map(s => ({ ...s, secImg: null, secImg2: null, secImg3: null, secImg4: null })))) } catch {}
  }, [])

  const [history, setHistory] = useState([])
  const [histOpen, setHistOpen] = useState(false)
  const [titleHover, setTitleHover] = useState(false)

  const taRef       = useRef(null)
  const featuresRef = useRef(null)
  const resRef      = useRef(null)
  const imgUploadRef = useRef(null)

  // 제품 사진 업로드
  const [productImgs, setProductImgs] = useState([])
  const handleProductImgs = e => {
    const files = Array.from(e.target.files)
    const remaining = 5 - productImgs.length
    files.slice(0, remaining).forEach(f => {
      const fr = new FileReader()
      fr.onload = ev => setProductImgs(prev => prev.length < 5 ? [...prev, ev.target.result] : prev)
      fr.readAsDataURL(f)
    })
    e.target.value = ''
  }

  useEffect(() => {
    try { localStorage.setItem('cos_history', JSON.stringify(history.slice(0, 20))) } catch {}
  }, [history])

  /* 핵심 특징 textarea 자동 높이 조절 */
  useEffect(() => {
    const el = featuresRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.max(100, el.scrollHeight) + 'px'
  }, [form.features])

  const sw = t => {
    setTask(t)
    setError('')
  }

  const resetAll = () => {
    setForm({ ...EMPTY_FORM })
    setProductImgs([])
    setResult('')
    setDetailData(null); try { localStorage.removeItem('cos_detail_data') } catch {}
    setError('')
  }

  const run = async () => {
    if (!allDone || loading) return
    setLoading(true)
    setResult('')
    setError('')
    try {
      const tParts = []
      if (form.targetGender && form.targetGender !== '성별무관') tParts.push(form.targetGender)
      if (form.targetAges.length)      tParts.push(form.targetAges.join('·'))
      if (form.targetLifestyle.length) tParts.push(form.targetLifestyle.join('·'))
      const targetStr = tParts.join(', ')

      const baseText = `상품명: ${form.productName}\n핵심 특징: ${form.features}`
      const hasImgs = productImgs.length > 0
      const sysBase = getSys('detail', '', {
        features: form.features,
        category: form.category,
        target: targetStr,
        pricePosition: form.pricePosition,
        mood: form.mood,
      })
      const systemPrompt = hasImgs
        ? sysBase + '\n\n업로드된 제품 사진을 분석해서 제품의 외형·색상·패키지 디자인을 파악하고, 각 섹션 AI프롬프트에 실제 제품의 시각적 특성(색상, 형태, 질감, 소재감)을 구체적으로 반영해줘.'
        : sysBase
      const text = await generateContent({ systemPrompt, userPrompt: baseText, images: hasImgs ? productImgs : [], model: 'gpt-4o', maxTokens: 4000 })
      setResult(text)
      setDetailData(null); try { localStorage.removeItem('cos_detail_data') } catch {}
      setDetailGenKey(k => k + 1)
      const preview = `${form.productName}: ${form.features}`.slice(0, 60)
      setHistory(p => [{ id: Date.now(), preview, result: text, ts: new Date().toISOString() }, ...p].slice(0, 20))
      setTimeout(() => resRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
    } catch (e) {
      setError('오류: ' + (e.message || JSON.stringify(e) || '알 수 없는 오류가 발생했습니다. 다시 시도해주세요.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* ── 고정 네비게이션 ── */}
      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 60, background: 'rgba(245,244,240,0.97)', backdropFilter: 'blur(18px)', borderBottom: `1px solid ${C.bd}`, height: 52, display: 'flex', alignItems: 'center', padding: '0 16px', gap: 8 }}>
        <button onClick={() => setHistOpen(o => !o)}
          style={{ width: 32, height: 32, borderRadius: 7, border: 'none', background: histOpen ? C.alt : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.mu, fontSize: 18, flexShrink: 0 }}>
          {histOpen ? '‹' : '≡'}
        </button>
        <div style={{ width: 26, height: 26, borderRadius: 7, background: C.tx, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 13 }}>C</div>
        <span style={{ fontWeight: 800, fontSize: 15, letterSpacing: '-0.04em' }}>ContentOS</span>
        <span style={{ fontSize: 10, color: C.fa, background: '#ECEAE5', padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>BETA</span>
      </header>

      {/* ── 사이드바 (히스토리) ── */}
      <aside style={{ position: 'fixed', top: 52, left: 0, bottom: 0, zIndex: 50, width: histOpen ? 260 : 0, transition: 'width .22s ease', background: C.sur, borderRight: histOpen ? `1px solid ${C.bd}` : 'none', overflow: 'hidden' }}>
        <div style={{ width: 260, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '12px 14px 10px', borderBottom: `1px solid ${C.bd}`, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontWeight: 700, fontSize: 13, color: C.tx }}>히스토리</span>
            {history.length > 0 && <span style={{ fontSize: 10, background: C.alt, color: C.mu, borderRadius: 20, padding: '1px 7px', fontWeight: 600 }}>{history.length}</span>}
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 10px 20px' }}>
            {history.length === 0
              ? <p style={{ fontSize: 12, color: C.fa, textAlign: 'center', marginTop: 32 }}>아직 기록 없음</p>
              : history.map(h => (
                  <button key={h.id} onClick={() => {
                    setResult(h.result)
                    setDetailData(null); try { localStorage.removeItem('cos_detail_data') } catch {}
                    setDetailGenKey(k => k + 1)
                    setTimeout(() => resRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
                  }} style={{ width: '100%', textAlign: 'left', padding: '9px 10px', borderRadius: 8, border: `1px solid ${C.bd}`, background: C.sur, cursor: 'pointer', marginBottom: 5, display: 'block' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: C.mu }}>상세페이지</span>
                      <span style={{ fontSize: 10, color: C.fa }}>{new Date(h.ts).toLocaleString('ko', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div style={{ fontSize: 11, color: C.mu, lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{h.preview}</div>
                  </button>
                ))}
          </div>
        </div>
      </aside>

      {/* ── 메인 콘텐츠 ── */}
      <div style={{ marginLeft: histOpen ? 260 : 0, transition: 'margin-left .22s ease', paddingTop: 52, minHeight: '100vh', background: C.bg, color: C.tx }}>
        <main style={{ maxWidth: 1200, margin: '0 auto', padding: '36px 8px 100px' }}>

          {/* 타이틀 */}
          <div onClick={resetAll} onMouseEnter={() => setTitleHover(true)} onMouseLeave={() => setTitleHover(false)}
            style={{ textAlign: 'center', marginBottom: 28, cursor: 'pointer', opacity: titleHover ? 0.6 : 1, transition: 'opacity .15s' }}>
            <h1 style={{ fontSize: 'clamp(22px,4vw,28px)', fontWeight: 800, letterSpacing: '-0.05em', lineHeight: 1.2, margin: '0 0 6px' }}>제품 정보로 상세페이지 자동 생성</h1>
            <p style={{ fontSize: 13, color: C.mu, lineHeight: 1.7, margin: 0 }}>기획안 · 섹션 카드 · PNG 다운로드</p>
          </div>

          {/* ── 입력폼 ── */}
          <div style={{ background: C.sur, borderRadius: 16, border: `1px solid ${C.bd}`, padding: '24px 20px', marginBottom: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>

            {/* 상품명 */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: C.tx, marginBottom: 7 }}>
                상품명 <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                value={form.productName}
                onChange={e => updForm('productName', e.target.value)}
                placeholder="예) 제주 무농약 단호박"
                style={{ width: '100%', padding: '11px 14px', border: `1.5px solid ${form.productName.trim() ? C.bd : '#FECACA'}`, borderRadius: 10, outline: 'none', fontSize: 15, color: C.tx, background: C.alt, fontFamily: 'inherit', boxSizing: 'border-box' }}
              />
            </div>

            {/* 핵심 특징 (auto-resize) */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: C.tx, marginBottom: 7 }}>
                핵심 특징 <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <textarea
                ref={featuresRef}
                value={form.features}
                onChange={e => updForm('features', e.target.value)}
                placeholder="예) 직접 큐어링, 무농약 재배, 제주산, 당도 높음, 300g 낱개 포장&#10;특징을 자세히 쓸수록 더 좋은 콘텐츠가 생성됩니다"
                style={{ width: '100%', minHeight: 100, padding: '11px 14px',
                  border: `1.5px solid ${form.features.trim() ? C.bd : '#FECACA'}`,
                  borderRadius: 10, outline: 'none', resize: 'none', overflow: 'hidden',
                  fontSize: 14, lineHeight: 1.8, color: C.tx, background: C.alt,
                  fontFamily: 'inherit', boxSizing: 'border-box' }}
              />
            </div>

            {/* 카테고리 */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.mu, marginBottom: 8 }}>카테고리</label>
              <SelBtn options={FORM_CATEGORIES} value={form.category} onChange={v => updForm('category', v)} />
            </div>

            {/* 타겟 고객 (복수 선택) */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.mu, marginBottom: 10 }}>타겟 고객 <span style={{ fontWeight:400, fontSize:12 }}>(복수 선택 가능)</span></label>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                <div>
                  <span style={{ fontSize:12, color:C.fa, display:'block', marginBottom:5 }}>성별</span>
                  <SelBtn options={FORM_GENDERS} value={form.targetGender} onChange={v => updForm('targetGender', v)} />
                </div>
                <div>
                  <span style={{ fontSize:12, color:C.fa, display:'block', marginBottom:5 }}>연령대</span>
                  <MultiBtn options={FORM_AGES} values={form.targetAges} onToggle={v => toggleArr('targetAges', v)} />
                </div>
                <div>
                  <span style={{ fontSize:12, color:C.fa, display:'block', marginBottom:5 }}>라이프스타일</span>
                  <MultiBtn options={FORM_LIFESTYLE} values={form.targetLifestyle} onToggle={v => toggleArr('targetLifestyle', v)} />
                </div>
              </div>
            </div>

            {/* 가격포지션 */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.mu, marginBottom: 8 }}>가격 포지션</label>
              <SelBtn options={FORM_PRICES} value={form.pricePosition} onChange={v => updForm('pricePosition', v)} />
            </div>

            {/* 분위기 */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.mu, marginBottom: 8 }}>콘텐츠 분위기</label>
              <SelBtn options={FORM_MOODS} value={form.mood} onChange={v => updForm('mood', v)} />
            </div>

            {/* 제품 사진 업로드 */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.mu, marginBottom: 8 }}>제품 사진 <span style={{ fontWeight: 400 }}>(선택, 최대 5장 — AI 이미지 프롬프트 정확도 향상)</span></label>
              <input ref={imgUploadRef} type="file" accept="image/*" multiple onChange={handleProductImgs} style={{ display: 'none' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <button onClick={() => imgUploadRef.current?.click()} disabled={productImgs.length >= 5}
                  style={{ padding: '6px 14px', fontSize: 12, borderRadius: 7, border: `1px solid ${C.bd}`, background: C.alt, color: productImgs.length >= 5 ? C.fa : C.mu, cursor: productImgs.length >= 5 ? 'not-allowed' : 'pointer', fontWeight: 600 }}>
                  📷 사진 추가 ({productImgs.length}/5)
                </button>
                {productImgs.map((img, i) => (
                  <div key={i} style={{ position: 'relative', width: 56, height: 56, flexShrink: 0 }}>
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 7, border: `1px solid ${C.bd}`, display: 'block' }} />
                    <button onClick={() => setProductImgs(p => p.filter((_, j) => j !== i))}
                      style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: '50%', background: '#ef4444', color: '#fff', border: '2px solid #fff', fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, padding: 0 }}>×</button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 생성 버튼 */}
          <div style={{ marginBottom: 12 }}>
            <button onClick={run} disabled={!allDone || loading}
              style={{ width: '100%', padding: '15px 0', borderRadius: 12, border: 'none', background: (!allDone || loading) ? '#ECEAE5' : C.tx, color: (!allDone || loading) ? C.fa : '#fff', fontSize: 16, fontWeight: 800, cursor: (!allDone || loading) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'background .12s' }}>
              {loading ? <><Spin />상세페이지 생성 중…</> : '✦ 상세페이지 생성하기'}
            </button>
            {!allDone && <p style={{ fontSize: 12, color: '#ef4444', textAlign: 'center', margin: '8px 0 0' }}>상품명과 핵심 특징을 입력해주세요</p>}
          </div>

          {/* 에러 */}
          {error && <div style={{ padding: '12px 15px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 9, fontSize: 13, color: '#b91c1c', marginBottom: 14 }}>{error}</div>}

          {/* 로딩 */}
          {loading && (
            <div style={{ background: C.sur, borderRadius: 14, border: `1.5px solid ${C.bd}`, padding: '28px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 22, color: C.mu, fontSize: 13 }}>
                <Spin />상세페이지 섹션 생성 중…
              </div>
              {[95, 75, 85, 60, 90, 50].map((w, i) => <div key={i} style={{ height: 10, background: C.alt, borderRadius: 5, width: `${w}%`, marginBottom: 9, animation: `pl 1.5s ease ${i * .12}s infinite` }} />)}
            </div>
          )}

          {/* 결과 */}
          {result && !loading && (
            <div ref={resRef}>
              <DetailView key={detailGenKey} result={result} savedSects={detailData} onSectsChange={saveDetailData} productInput={`${form.productName}: ${form.features}`} quiz={{}} />
            </div>
          )}

        </main>
      </div>
    </>
  )
}
