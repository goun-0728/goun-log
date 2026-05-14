// src/components/SectionEditor.jsx
import React, { useState, useRef, useEffect } from 'react'
import { C, DS, DS_KEYS, TPL_LABELS } from '../constants'
import { TPL } from './SectionTemplates'
import { capturePNG } from '../utils'

function Spin() {
  return <span style={{ display: 'inline-block', width: 13, height: 13, borderRadius: '50%', border: '2px solid #ddd', borderTopColor: '#555', animation: 'sp .6s linear infinite', flexShrink: 0 }} />
}

export default function SectionEditor({ sec, idx, onUpdate }) {
  const [editing, setEditing] = useState(false)
  const [dr, setDr] = useState(sec)
  const [dl, setDl] = useState(false)
  const [showTpl, setShowTpl] = useState(false)
  const [scale, setScale] = useState(1)
  const ref = useRef(null)          // PNG 캡처용 (860px 원본)
  const wrapRef = useRef(null)      // 화면 컨테이너 (폭 측정용)

  // 컨테이너 폭에 맞게 860px 카드 축소 비율 계산
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

  useEffect(() => {
    setDr(prev => ({ ...sec, secImg: prev.secImg ?? sec.secImg }))
  }, [sec])

  const t = DS[dr.designStyle] || DS['미니멀']

  // 인라인 편집에서 필드 변경
  const handleChange = (key, value) => {
    setDr(d => ({ ...d, [key]: value }))
  }

  // 편집 완료 → 부모에 저장
  // 수정 버튼 누르면 패널 자동 오픈
  const save = () => {
    onUpdate(idx, dr)
    setEditing(false)
    setShowTpl(false)
  }

  const cancel = () => {
    setDr(prev => ({ ...sec, secImg: prev.secImg }))
    setEditing(false)
    setShowTpl(false)
  }

  const startEdit = () => {
    setEditing(true)
    setShowTpl(true)  // 수정 시작하면 패널 자동 오픈
  }

  const dlPNG = async () => {
    if (!ref.current) return
    setDl(true)
    try {
      // ref는 860px 원본 div → 2x 해상도로 캡처 = 1720×3000px 출력
      await capturePNG(ref.current, `section_${idx + 1}_${sec.sectionType}.png`)
    }
    catch (e) { alert('저장 오류: ' + e.message) }
    finally { setDl(false) }
  }

  const Tpl = TPL[dr.template] || TPL.material
  const img = dr.secImg || null

  return (
    <div style={{ marginBottom: 20, borderRadius: 12, overflow: 'hidden', border: `2px solid ${editing ? '#3b82f6' : C.bd}`, transition: 'border-color .2s' }}>

      {/* ── 상단 툴바 ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', background: editing ? '#EFF6FF' : C.alt, borderBottom: `1px solid ${editing ? '#BFDBFE' : C.bd}`, flexWrap: 'wrap', gap: 6 }}>

        {/* 왼쪽: 섹션 정보 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: t.ac }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: C.tx }}>S{idx + 1}</span>
          <span style={{ fontSize: 11, color: C.mu }}>{sec.sectionType}</span>

          {/* 레이아웃/디자인 선택 버튼 */}
          <button onClick={() => setShowTpl(v => !v)} style={{ padding: '3px 9px', fontSize: 10, borderRadius: 16, border: `1px solid ${showTpl ? '#3b82f6' : t.bd}`, background: showTpl ? '#EFF6FF' : t.sub, color: showTpl ? '#1d4ed8' : t.ac, cursor: 'pointer', fontWeight: 600 }}>
            {TPL_LABELS.find(x => x.k === dr.template)?.l || dr.template} · {dr.designStyle}
          </button>
        </div>

        {/* 오른쪽: 액션 버튼 */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {editing ? (
            <>
              <button onClick={save} style={{ padding: '5px 14px', fontSize: 11, borderRadius: 7, border: 'none', background: '#3b82f6', color: '#fff', cursor: 'pointer', fontWeight: 700 }}>✓ 저장</button>
              <button onClick={cancel} style={{ padding: '5px 10px', fontSize: 11, borderRadius: 7, border: `1px solid ${C.bd}`, background: C.sur, color: C.mu, cursor: 'pointer' }}>취소</button>
            </>
          ) : (
            <button onClick={startEdit} style={{ padding: '5px 12px', fontSize: 11, borderRadius: 7, border: `1px solid ${C.bd}`, background: C.sur, color: C.mu, cursor: 'pointer', fontWeight: 600 }}>✎ 수정</button>
          )}
          <button onClick={dlPNG} disabled={dl} style={{ padding: '5px 10px', fontSize: 11, borderRadius: 7, border: `1px solid ${C.bd}`, background: C.sur, color: dl ? C.fa : C.mu, cursor: dl ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
            {dl ? <><Spin />변환</> : '↓ PNG'}
          </button>
        </div>
      </div>

      {/* ── 레이아웃/디자인 선택 패널 — 수정 모드에서 항상 표시 ── */}
      {(editing || showTpl) && (
        <div style={{ padding: '16px 18px', background: '#F8FAFF', borderBottom: `1px solid ${C.bd}` }}>

          {/* 레이아웃 선택 */}
          <p style={{ fontSize: 10, fontWeight: 700, color: C.fa, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 8 }}>레이아웃</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 5, marginBottom: 16 }}>
            {TPL_LABELS.map(({ k, l }) => {
              const on = dr.template === k
              return (
                <button key={k} onClick={() => { const next = { ...dr, template: k }; setDr(next); onUpdate(idx, next) }}
                  style={{ padding: '7px 6px', fontSize: 11, borderRadius: 8, border: `1.5px solid ${on ? '#3b82f6' : C.bd}`, background: on ? '#EFF6FF' : C.sur, color: on ? '#1d4ed8' : C.mu, cursor: 'pointer', fontWeight: on ? 700 : 400, textAlign: 'center' }}>
                  {l}
                </button>
              )
            })}
          </div>

          {/* 디자인(색상) 선택 — 스와치 */}
          <p style={{ fontSize: 10, fontWeight: 700, color: C.fa, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 8 }}>디자인 / 색상</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 6 }}>
            {DS_KEYS.map(s => {
              const on = dr.designStyle === s
              const d = DS[s]
              return (
                <button key={s} onClick={() => { const next = { ...dr, designStyle: s }; setDr(next); onUpdate(idx, next) }}
                  style={{ borderRadius: 8, border: `2px solid ${on ? '#3b82f6' : 'transparent'}`, cursor: 'pointer', padding: 0, overflow: 'hidden', background: 'none', outline: 'none' }}>
                  {/* 색상 미리보기 */}
                  <div style={{ height: 36, background: d.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.ac }} />
                    <div style={{ width: 16, height: 3, borderRadius: 2, background: d.fg, opacity: 0.4 }} />
                  </div>
                  <div style={{ padding: '4px 2px', background: on ? '#EFF6FF' : C.alt, fontSize: 9.5, color: on ? '#1d4ed8' : C.mu, fontWeight: on ? 700 : 400, textAlign: 'center', lineHeight: 1.2 }}>
                    {s}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* ── 카드 미리보기 — 860px 고정, 화면에 맞게 축소 ── */}
      <div ref={wrapRef} style={{ position: 'relative', background: '#e8e6e0', overflow: 'hidden' }}>
        <div style={{ width: 860, transformOrigin: 'top left', transform: `scale(${scale})` }}>
          <div ref={ref} style={{ fontFamily: "'Noto Sans KR','Apple SD Gothic Neo',sans-serif", width: 860 }}>
            <Tpl s={dr} img={img} t={t} editing={editing} onChange={handleChange} />
            <div style={{ padding: '8px 24px', textAlign: 'right', fontSize: 11, color: t.fg, opacity: 0.12, borderTop: `1px solid ${t.bd}`, background: t.bg }}>ContentOS</div>
          </div>
        </div>
        {/* scale 후 빈 공간 메우기 */}
        <div style={{ height: 0, visibility: 'hidden' }} ref={el => {
          if (el && ref.current) {
            const h = ref.current.offsetHeight * scale
            if (el.parentElement) el.parentElement.style.height = h + 'px'
          }
        }} />
      </div>

      {/* 편집 중 안내 */}
      {editing && (
        <div style={{ padding: '8px 14px', background: '#EFF6FF', borderTop: `1px solid #BFDBFE`, fontSize: 11, color: '#1d4ed8', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>✏️</span>
          <span>텍스트를 클릭해서 바로 수정하세요 · 이미지 영역을 클릭하면 사진을 업로드할 수 있습니다</span>
        </div>
      )}
    </div>
  )
}
