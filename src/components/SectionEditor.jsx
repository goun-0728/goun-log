// src/components/SectionEditor.jsx
import React, { useState, useRef, useEffect } from 'react'
import { C, DS, DS_KEYS, TPL_LABELS } from '../constants'
import { TPL } from './SectionTemplates'
import { capturePNG } from '../utils'

function Spin() {
  return <span style={{ display: 'inline-block', width: 13, height: 13, borderRadius: '50%', border: '2px solid #ddd', borderTopColor: '#555', animation: 'sp .6s linear infinite', flexShrink: 0 }} />
}

export default function SectionEditor({ sec, idx, onUpdate }) {
  const [editing, setEditing]   = useState(false)
  const [dr, setDr]             = useState(sec)
  const [saved, setSaved]       = useState(true)   // 저장 상태: 저장 후에만 PNG 활성화
  const [dl, setDl]             = useState(false)
  const [showTpl, setShowTpl]   = useState(false)
  const [scale, setScale]       = useState(1)
  const [secMeta, setSecMeta]   = useState({})

  const ref     = useRef(null)   // PNG 캡처 대상 (툴바 제외)
  const wrapRef = useRef(null)

  // 컨테이너 폭에 맞게 축소 비율 계산
  useEffect(() => {
    const calc = () => {
      if (wrapRef.current) {
        const w = wrapRef.current.offsetWidth
        setScale(Math.min(1, w / 860))
      }
    }
    calc()
    window.addEventListener('resize', calc)
    return () => window.removeEventListener('resize', calc)
  }, [])

  // sec prop 변경 시 동기화 (secImg 유지)
  useEffect(() => {
    setDr(prev => ({ ...sec, secImg: prev.secImg ?? sec.secImg }))
  }, [sec])

  const t = DS[dr.designStyle] || DS['미니멀']

  // 필드 변경 → 미저장 상태
  const handleChange = (key, value) => {
    setDr(d => ({ ...d, [key]: value }))
    setSaved(false)
  }

  const startEdit = () => {
    setEditing(true)
    setShowTpl(true)
  }

  const save = () => {
    onUpdate(idx, dr)
    setEditing(false)
    setShowTpl(false)
    setSaved(true)
  }

  const cancel = () => {
    setDr(prev => ({ ...sec, secImg: prev.secImg }))
    setEditing(false)
    setShowTpl(false)
    setSaved(true)
  }

  // PNG 다운로드 — ref(카드 영역만) 캡처
  const dlPNG = async () => {
    if (!ref.current || !saved) return
    setDl(true)
    try { await capturePNG(ref.current, `section_${idx + 1}_${sec.sectionType}.png`) }
    catch (e) { alert('저장 오류: ' + e.message) }
    finally { setDl(false) }
  }

  const Tpl = TPL[dr.template] || TPL.material
  const img = dr.secImg || (editing ? 'slot' : null)

  // PNG 버튼 상태
  const dlDisabled = dl || !saved
  const dlLabel = dl ? '변환 중' : (!saved ? '저장 후 다운로드' : '↓ PNG')

  return (
    <div style={{ marginBottom: 20, borderRadius: 12, overflow: 'hidden', border: `2px solid ${editing ? '#3b82f6' : C.bd}`, transition: 'border-color .2s' }}>

      {/* ── 툴바 (캡처 범위 밖) ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', background: editing ? '#EFF6FF' : C.alt, borderBottom: `1px solid ${editing ? '#BFDBFE' : C.bd}`, flexWrap: 'wrap', gap: 6 }}>

        {/* 왼쪽 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: t.ac }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: C.tx }}>S{idx + 1}</span>
          <span style={{ fontSize: 11, color: C.mu }}>{sec.sectionType}</span>
          <button onClick={() => setShowTpl(v => !v)}
            style={{ padding: '3px 9px', fontSize: 10, borderRadius: 16, border: `1px solid ${showTpl ? '#3b82f6' : t.bd}`, background: showTpl ? '#EFF6FF' : t.sub, color: showTpl ? '#1d4ed8' : t.ac, cursor: 'pointer', fontWeight: 600 }}>
            {TPL_LABELS.find(x => x.k === dr.template)?.l || dr.template} · {dr.designStyle}
          </button>
          {/* 미저장 표시 */}
          {!saved && <span style={{ fontSize: 10, color: '#d97706', background: '#fffbeb', padding: '2px 7px', borderRadius: 10, border: '1px solid #fcd34d' }}>● 미저장</span>}
        </div>

        {/* 오른쪽 */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* 이미지 슬롯 토글 */}
          {editing && (
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              <button onClick={() => { setDr(d => ({ ...d, secImg2: d.secImg2 ? null : 'slot' })); setSaved(false) }}
                style={{ padding: '4px 9px', fontSize: 10, borderRadius: 6, border: `1px solid ${dr.secImg2 ? '#3b82f6' : C.bd}`, background: dr.secImg2 ? '#EFF6FF' : C.sur, color: dr.secImg2 ? '#1d4ed8' : C.mu, cursor: 'pointer' }}>
                {dr.secImg2 ? '📷2 제거' : '+ 사진2'}
              </button>
              {dr.template === 'detail2col' && (
                <button onClick={() => { setDr(d => ({ ...d, secImg3: d.secImg3 ? null : 'slot' })); setSaved(false) }}
                  style={{ padding: '4px 9px', fontSize: 10, borderRadius: 6, border: `1px solid ${dr.secImg3 ? '#3b82f6' : C.bd}`, background: dr.secImg3 ? '#EFF6FF' : C.sur, color: dr.secImg3 ? '#1d4ed8' : C.mu, cursor: 'pointer' }}>
                  {dr.secImg3 ? '📷3 제거' : '+ 사진3'}
                </button>
              )}
              {dr.template === 'detail2col' && dr.secImg3 && (
                <button onClick={() => { setDr(d => ({ ...d, secImg4: d.secImg4 ? null : 'slot' })); setSaved(false) }}
                  style={{ padding: '4px 9px', fontSize: 10, borderRadius: 6, border: `1px solid ${dr.secImg4 ? '#3b82f6' : C.bd}`, background: dr.secImg4 ? '#EFF6FF' : C.sur, color: dr.secImg4 ? '#1d4ed8' : C.mu, cursor: 'pointer' }}>
                  {dr.secImg4 ? '📷4 제거' : '+ 사진4'}
                </button>
              )}
              {/* 텍스트 블록 추가 */}
              <button onClick={() => { setDr(d => ({ ...d, extraText: d.extraText !== undefined ? undefined : '' })); setSaved(false) }}
                style={{ padding: '4px 9px', fontSize: 10, borderRadius: 6, border: `1px solid ${dr.extraText !== undefined ? '#3b82f6' : C.bd}`, background: dr.extraText !== undefined ? '#EFF6FF' : C.sur, color: dr.extraText !== undefined ? '#1d4ed8' : C.mu, cursor: 'pointer' }}>
                {dr.extraText !== undefined ? '✎ 텍스트 제거' : '+ 텍스트 추가'}
              </button>
            </div>
          )}

          {editing ? (
            <>
              <button onClick={save} style={{ padding: '5px 14px', fontSize: 11, borderRadius: 7, border: 'none', background: '#3b82f6', color: '#fff', cursor: 'pointer', fontWeight: 700 }}>✓ 저장</button>
              <button onClick={cancel} style={{ padding: '5px 10px', fontSize: 11, borderRadius: 7, border: `1px solid ${C.bd}`, background: C.sur, color: C.mu, cursor: 'pointer' }}>취소</button>
            </>
          ) : (
            <button onClick={startEdit} style={{ padding: '5px 12px', fontSize: 11, borderRadius: 7, border: `1px solid ${C.bd}`, background: C.sur, color: C.mu, cursor: 'pointer', fontWeight: 600 }}>✎ 수정</button>
          )}

          {/* PNG 버튼 — 저장 전 비활성화 */}
          <button onClick={dlPNG} disabled={dlDisabled}
            title={!saved ? '수정 후 저장해야 다운로드 가능합니다' : 'PNG 저장'}
            style={{ padding: '5px 10px', fontSize: 11, borderRadius: 7, border: `1px solid ${dlDisabled ? C.bd : '#1d6b45'}`, background: dlDisabled ? C.alt : '#f0fdf4', color: dlDisabled ? C.fa : '#1d6b45', cursor: dlDisabled ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontWeight: dlDisabled ? 400 : 600 }}>
            {dl ? <><Spin />{dlLabel}</> : dlLabel}
          </button>
        </div>
      </div>

      {/* ── 레이아웃/디자인 선택 패널 ── */}
      {(editing || showTpl) && (
        <div style={{ padding: '14px 16px', background: '#F8FAFF', borderBottom: `1px solid ${C.bd}` }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: C.fa, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 7 }}>레이아웃</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 5, marginBottom: 14 }}>
            {TPL_LABELS.map(({ k, l }) => {
              const on = dr.template === k
              return (
                <button key={k} onClick={() => { const next = { ...dr, template: k }; setDr(next); onUpdate(idx, next) }}
                  style={{ padding: '7px 6px', fontSize: 11, borderRadius: 8, border: `1.5px solid ${on ? '#3b82f6' : C.bd}`, background: on ? '#EFF6FF' : C.sur, color: on ? '#1d4ed8' : C.mu, cursor: 'pointer', fontWeight: on ? 700 : 400 }}>
                  {l}
                </button>
              )
            })}
          </div>
          <p style={{ fontSize: 10, fontWeight: 700, color: C.fa, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 7 }}>디자인 / 색상</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 6 }}>
            {DS_KEYS.map(s => {
              const on = dr.designStyle === s; const d = DS[s]
              return (
                <button key={s} onClick={() => { const next = { ...dr, designStyle: s }; setDr(next); onUpdate(idx, next) }}
                  style={{ borderRadius: 8, border: `2px solid ${on ? '#3b82f6' : 'transparent'}`, cursor: 'pointer', padding: 0, overflow: 'hidden', background: 'none', outline: 'none' }}>
                  <div style={{ height: 36, background: d.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.ac }} />
                    <div style={{ width: 16, height: 3, borderRadius: 2, background: d.fg, opacity: 0.4 }} />
                  </div>
                  <div style={{ padding: '4px 2px', background: on ? '#EFF6FF' : C.alt, fontSize: 9.5, color: on ? '#1d4ed8' : C.mu, fontWeight: on ? 700 : 400, textAlign: 'center' }}>{s}</div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* ── 카드 미리보기 (이 영역만 PNG 캡처) ── */}
      <div ref={wrapRef} style={{ position: 'relative', background: '#e8e6e0', overflow: 'hidden' }}>
        <div style={{ width: 860, transformOrigin: 'top left', transform: `scale(${scale})` }}>
          {/* ref: 툴바 제외, 카드 본체만 */}
          <div ref={ref} style={{ fontFamily: "'Noto Sans KR','Apple SD Gothic Neo',sans-serif", width: 860 }}>
            <Tpl s={dr} img={img} t={t} editing={editing} onChange={handleChange}
              secMeta={secMeta}
              onSecMeta={(key, val) => { setSecMeta(prev => ({ ...prev, [key]: val })); setSaved(false) }}
            />
            {/* 추가 텍스트 블록 */}
            {dr.extraText !== undefined && (
              <div style={{ background: t.bg, borderTop: `1px solid ${t.bd}`, padding: '32px 64px' }}>
                {editing
                  ? <textarea value={dr.extraText || ''} onChange={e => handleChange('extraText', e.target.value)}
                      placeholder="이미지 사이에 들어갈 텍스트를 입력하세요 (엔터로 줄바꿈)"
                      rows={Math.max(3, (dr.extraText || '').split('\n').length)}
                      style={{ width: '100%', fontSize: 18, lineHeight: 1.85, border: '1px solid #3b82f6', borderRadius: 8, padding: '14px 16px', outline: 'none', resize: 'vertical', fontFamily: 'inherit', color: t.fg, background: t.sub }} />
                  : dr.extraText && <p style={{ fontSize: 20, color: t.fg, lineHeight: 1.85, margin: 0, whiteSpace: 'pre-wrap', opacity: 0.85 }}>{dr.extraText}</p>
                }
              </div>
            )}
            <div style={{ padding: '6px 20px', textAlign: 'right', fontSize: 9, color: t.fg, opacity: 0.1, background: t.bg }}>ContentOS</div>
          </div>
        </div>
        {/* 높이 보정 */}
        <div style={{ height: 0, visibility: 'hidden' }} ref={el => {
          if (el && ref.current) {
            const h = ref.current.offsetHeight * scale
            if (el.parentElement) el.parentElement.style.height = h + 'px'
          }
        }} />
      </div>

      {editing && (
        <div style={{ padding: '7px 14px', background: '#EFF6FF', borderTop: `1px solid #BFDBFE`, fontSize: 11, color: '#1d4ed8' }}>
          ✏️ 텍스트 클릭 수정 · 이미지 클릭 업로드 · 수정 후 반드시 저장 버튼을 눌러야 PNG 다운로드 가능합니다
        </div>
      )}
    </div>
  )
}
