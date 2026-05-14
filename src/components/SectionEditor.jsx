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
  const [showTpl, setShowTpl] = useState(false)  // 레이아웃/디자인 선택 패널
  const ref = useRef(null)

  useEffect(() => {
    setDr(prev => ({ ...sec, secImg: prev.secImg ?? sec.secImg }))
  }, [sec])

  const t = DS[dr.designStyle] || DS['미니멀']

  // 인라인 편집에서 필드 변경
  const handleChange = (key, value) => {
    setDr(d => ({ ...d, [key]: value }))
  }

  // 편집 완료 → 부모에 저장
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

  const dlPNG = async () => {
    if (!ref.current) return
    setDl(true)
    try { await capturePNG(ref.current, `section_${idx + 1}_${sec.sectionType}.png`) }
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
            <button onClick={() => { setEditing(true); setShowTpl(false) }} style={{ padding: '5px 12px', fontSize: 11, borderRadius: 7, border: `1px solid ${C.bd}`, background: C.sur, color: C.mu, cursor: 'pointer', fontWeight: 600 }}>✎ 수정</button>
          )}
          <button onClick={dlPNG} disabled={dl} style={{ padding: '5px 10px', fontSize: 11, borderRadius: 7, border: `1px solid ${C.bd}`, background: C.sur, color: dl ? C.fa : C.mu, cursor: dl ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
            {dl ? <><Spin />변환</> : '↓ PNG'}
          </button>
        </div>
      </div>

      {/* ── 레이아웃/디자인 선택 패널 (토글) ── */}
      {showTpl && (
        <div style={{ padding: '12px 16px', background: '#F8FAFF', borderBottom: `1px solid ${C.bd}`, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, color: C.fa, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 6 }}>레이아웃</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {TPL_LABELS.map(({ k, l }) => {
                const on = dr.template === k
                return <button key={k} onClick={() => { setDr(d => ({ ...d, template: k })); onUpdate(idx, { ...dr, template: k }) }}
                  style={{ padding: '3px 9px', fontSize: 10, borderRadius: 16, border: `1px solid ${on ? t.ac : C.bd}`, background: on ? t.sub : C.sur, color: on ? t.ac : C.mu, cursor: 'pointer', fontWeight: on ? 700 : 400 }}>{l}</button>
              })}
            </div>
          </div>
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, color: C.fa, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 6 }}>디자인</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {DS_KEYS.map(s => {
                const on = dr.designStyle === s; const d = DS[s]
                return <button key={s} onClick={() => { setDr(x => ({ ...x, designStyle: s })); onUpdate(idx, { ...dr, designStyle: s }) }}
                  style={{ padding: '3px 9px', fontSize: 10, borderRadius: 16, border: `1px solid ${on ? d.ac : C.bd}`, background: on ? d.sub : C.sur, color: on ? d.ac : C.mu, cursor: 'pointer', fontWeight: on ? 700 : 400 }}>{s}</button>
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── 카드 미리보기 (편집 모드에서는 인라인 수정 활성화) ── */}
      <div ref={ref} style={{ fontFamily: "'Noto Sans KR','Apple SD Gothic Neo',sans-serif" }}>
        <Tpl s={dr} img={img} t={t} editing={editing} onChange={handleChange} />
        <div style={{ padding: '6px 18px', textAlign: 'right', fontSize: 9, color: t.fg, opacity: 0.12, borderTop: `1px solid ${t.bd}`, background: t.bg }}>ContentOS</div>
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
