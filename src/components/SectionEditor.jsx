// src/components/SectionEditor.jsx
import React, { useState, useRef, useEffect } from 'react'
import { C, DS, DS_KEYS, TPL_LABELS } from '../constants'
import { TPL } from './SectionTemplates'
import { capturePNG, readFileAsDataURL } from '../utils'

function Spin() {
  return <span style={{ display: 'inline-block', width: 13, height: 13, borderRadius: '50%', border: '2px solid #ddd', borderTopColor: '#555', animation: 'sp .6s linear infinite', flexShrink: 0 }} />
}

function SectionCard({ sec }) {
  const t = DS[sec.designStyle] || DS['미니멀']
  const Tpl = TPL[sec.template] || TPL.material
  return (
    <div style={{ fontFamily: "'Noto Sans KR','Apple SD Gothic Neo',sans-serif", overflow: 'hidden' }}>
      <Tpl s={sec} img={sec.secImg || null} t={t} />
      <div style={{ padding: '6px 18px', textAlign: 'right', fontSize: 9, color: t.fg, opacity: 0.12, borderTop: `1px solid ${t.bd}`, background: t.bg }}>ContentOS</div>
    </div>
  )
}

export default function SectionEditor({ sec, idx, onUpdate }) {
  const [ed, setEd] = useState(false)
  const [dr, setDr] = useState(sec)
  const [dl, setDl] = useState(false)
  const ref = useRef(null)
  const imgRef = useRef(null)

  useEffect(() => {
    setDr(prev => ({ ...sec, secImg: prev.secImg ?? sec.secImg }))
  }, [sec])

  const t = DS[dr.designStyle] || DS['미니멀']
  const apply = () => { onUpdate(idx, dr); setEd(false) }

  const handleImg = async (e) => {
    const f = e.target.files[0]
    if (!f) return
    const dataUrl = await readFileAsDataURL(f)
    setDr(d => ({ ...d, secImg: dataUrl }))
    e.target.value = ''
  }

  const dlPNG = async () => {
    if (!ref.current) return
    setDl(true)
    try { await capturePNG(ref.current, `section_${idx + 1}_${sec.sectionType}.png`) }
    catch (e) { alert('저장 오류: ' + e.message) }
    finally { setDl(false) }
  }

  const inp = {
    width: '100%', padding: '7px 10px', fontSize: 13,
    border: `1px solid ${C.bd}`, borderRadius: 7,
    fontFamily: 'inherit', outline: 'none', color: C.tx, background: C.alt,
  }

  return (
    <div style={{ marginBottom: 16, border: `1.5px solid ${C.bd}`, borderRadius: 12, overflow: 'hidden' }}>
      {/* toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 14px', background: C.alt, borderBottom: `1px solid ${C.bd}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 9, height: 9, borderRadius: '50%', background: t.ac }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: C.tx }}>S{idx + 1}</span>
          <span style={{ fontSize: 11, color: C.mu }}>{sec.sectionType}</span>
          <span style={{ fontSize: 10, background: t.sub, color: t.ac, padding: '2px 7px', borderRadius: 20, border: `1px solid ${t.bd}` }}>{TPL_LABELS.find(x => x.k === dr.template)?.l || dr.template}</span>
          {dr.secImg && <span style={{ fontSize: 10, color: '#15803d', background: '#f0fdf4', padding: '2px 7px', borderRadius: 20 }}>📷 이미지 있음</span>}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => setEd(e => !e)} style={{ padding: '4px 10px', fontSize: 11, borderRadius: 6, border: `1px solid ${C.bd}`, background: ed ? '#EBF1FF' : C.sur, color: ed ? '#1A3FA3' : C.mu, cursor: 'pointer', fontWeight: 600 }}>{ed ? '닫기' : '✎ 수정'}</button>
          <button onClick={dlPNG} disabled={dl} style={{ padding: '4px 10px', fontSize: 11, borderRadius: 6, border: `1px solid ${C.bd}`, background: C.sur, color: dl ? C.fa : C.mu, cursor: dl ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>{dl ? <><Spin /> 변환</> : '↓ PNG'}</button>
        </div>
      </div>

      {/* 카드 미리보기 */}
      <div ref={ref}><SectionCard sec={dr} /></div>

      {/* 편집 패널 */}
      {ed && (
        <div style={{ borderTop: `1px solid ${C.bd}`, padding: 16, background: C.sur }}>

          {/* ① 섹션 이미지 업로드 */}
          <div style={{ marginBottom: 16, padding: 14, background: C.alt, borderRadius: 9, border: `1px solid ${C.bd}` }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: C.fa, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 8 }}>섹션 이미지</p>
            <input ref={imgRef} type="file" accept="image/*" onChange={handleImg} />
            <button onClick={() => imgRef.current?.click()} style={{ width: '100%', padding: '9px', fontSize: 12, borderRadius: 7, border: `1.5px dashed ${C.bdm}`, background: C.sur, color: C.mu, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              {dr.secImg ? '📷 이미지 교체' : '📷 이미지 업로드'}
            </button>
            {dr.secImg && (
              <div style={{ marginTop: 8, borderRadius: 7, overflow: 'hidden', border: `1px solid ${C.bd}`, position: 'relative' }}>
                <img src={dr.secImg} alt="" style={{ width: '100%', maxHeight: 160, objectFit: 'contain', display: 'block', background: C.alt }} />
                <button onClick={() => setDr(d => ({ ...d, secImg: null }))} style={{ position: 'absolute', top: 6, right: 6, width: 24, height: 24, borderRadius: '50%', background: '#ef4444', border: 'none', color: '#fff', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>×</button>
              </div>
            )}
          </div>

          {/* ② 레이아웃 / 디자인 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, color: C.fa, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 6 }}>레이아웃</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {TPL_LABELS.map(({ k, l }) => {
                  const on = dr.template === k
                  return <button key={k} onClick={() => setDr(d => ({ ...d, template: k }))} style={{ padding: '3px 8px', fontSize: 10, borderRadius: 16, border: `1px solid ${on ? t.ac : C.bd}`, background: on ? t.sub : C.sur, color: on ? t.ac : C.mu, cursor: 'pointer' }}>{l}</button>
                })}
              </div>
            </div>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, color: C.fa, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 6 }}>디자인</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {DS_KEYS.map(s => {
                  const on = dr.designStyle === s; const d = DS[s]
                  return <button key={s} onClick={() => setDr(x => ({ ...x, designStyle: s }))} style={{ padding: '3px 8px', fontSize: 10, borderRadius: 16, border: `1px solid ${on ? d.ac : C.bd}`, background: on ? d.sub : C.sur, color: on ? d.ac : C.mu, cursor: 'pointer' }}>{s}</button>
                })}
              </div>
            </div>
          </div>

          {/* ③ 텍스트 */}
          {[{ l: '메인 카피', k: 'mainCopy' }, { l: '서브 카피', k: 'subCopy' }, { l: 'CTA 문구', k: 'cta' }].map(({ l, k }) => (
            <div key={k} style={{ marginBottom: 9 }}>
              <label style={{ fontSize: 11, color: C.mu, fontWeight: 600, display: 'block', marginBottom: 3 }}>{l}</label>
              <input value={dr[k] || ''} onChange={e => setDr(d => ({ ...d, [k]: e.target.value }))} style={inp} />
            </div>
          ))}

          {/* ④ 포인트 */}
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11, color: C.mu, fontWeight: 600, display: 'block', marginBottom: 5 }}>포인트 (최대 3개)</label>
            {(dr.points || []).slice(0, 3).map((p, i) => (
              <div key={i} style={{ display: 'flex', gap: 5, marginBottom: 5 }}>
                <input value={p} onChange={e => { const n = [...(dr.points || [])]; n[i] = e.target.value; setDr(d => ({ ...d, points: n })) }} style={{ ...inp, flex: 1 }} />
                <button onClick={() => setDr(d => ({ ...d, points: d.points.filter((_, j) => j !== i) }))} style={{ padding: '0 8px', border: `1px solid ${C.bd}`, borderRadius: 6, background: C.sur, color: '#ef4444', cursor: 'pointer', fontSize: 14 }}>×</button>
              </div>
            ))}
            {(dr.points || []).length < 3 && <button onClick={() => setDr(d => ({ ...d, points: [...(d.points || []), ''] }))} style={{ width: '100%', padding: '5px', fontSize: 11, border: `1px dashed ${C.bdm}`, borderRadius: 6, background: 'none', color: C.mu, cursor: 'pointer' }}>+ 추가</button>}
          </div>

          {/* ⑤ 적용/취소 */}
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={apply} style={{ flex: 1, padding: '9px', fontSize: 12, fontWeight: 700, borderRadius: 7, border: 'none', background: C.tx, color: '#fff', cursor: 'pointer' }}>✓ 적용</button>
            <button onClick={() => { setDr(sec); setEd(false) }} style={{ padding: '9px 14px', fontSize: 12, borderRadius: 7, border: `1px solid ${C.bd}`, background: C.sur, color: C.mu, cursor: 'pointer' }}>취소</button>
          </div>
        </div>
      )}
    </div>
  )
}
