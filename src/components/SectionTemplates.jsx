// src/components/SectionTemplates.jsx
import React, { useRef } from 'react'
import { AUTO_ICONS } from '../constants'

export const autoIcon = i => AUTO_ICONS[i % AUTO_ICONS.length]

/* ── 인라인 편집 텍스트 ──────────────────────────── */
export function EditText({ value, onChange, editing, style, placeholder = '클릭하여 수정' }) {
  if (!editing) {
    return <div style={style}>{value || ''}</div>
  }
  return (
    <div
      contentEditable
      suppressContentEditableWarning
      onBlur={e => onChange(e.currentTarget.innerText.trim())}
      style={{ ...style, outline: 'none', borderBottom: '2px solid #3b82f6', cursor: 'text', minWidth: 40 }}
      dangerouslySetInnerHTML={{ __html: value || '' }}
    />
  )
}

/* ── 클릭하면 이미지 업로드 ──────────────────────── */
export function ImgBox({ url, h = 300, t, label, autoH = false, editing = false, onImgChange }) {
  const ref = useRef(null)
  const handleFile = e => {
    const f = e.target.files[0]; if (!f || !onImgChange) return
    const fr = new FileReader()
    fr.onload = ev => onImgChange(ev.target.result)
    fr.readAsDataURL(f); e.target.value = ''
  }
  const wrap = { overflow: 'hidden', background: t.sub, position: 'relative', cursor: editing ? 'pointer' : 'default', ...(autoH ? {} : { height: h }) }
  return (
    <div style={wrap} onClick={() => editing && ref.current?.click()}>
      <input ref={ref} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
      {url ? (
        <>
          <img src={url} alt="" style={{ width: '100%', height: autoH ? 'auto' : '100%', display: 'block', objectFit: autoH ? 'contain' : 'cover' }} />
          {editing && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .2s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.35)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0)'}>
              <span style={{ color: '#fff', fontSize: 13, fontWeight: 600, background: 'rgba(0,0,0,0.5)', padding: '7px 14px', borderRadius: 8, opacity: 0, transition: 'opacity .2s' }}
                onMouseEnter={e => e.currentTarget.style.opacity = 1}
                onMouseLeave={e => e.currentTarget.style.opacity = 0}>📷 사진 교체</span>
            </div>
          )}
        </>
      ) : (
        <div style={{ minHeight: h, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <span style={{ fontSize: 32, opacity: 0.2 }}>📷</span>
          <span style={{ fontSize: 13, color: t.fg, opacity: editing ? 0.65 : 0.3, fontWeight: editing ? 600 : 400 }}>
            {editing ? '클릭하여 사진 업로드' : label || '이미지 영역'}
          </span>
        </div>
      )}
    </div>
  )
}

/* ── 1. Hero ─────────────────────────────────────── */
export function TplHero({ s, img, t, editing, onChange }) {
  const pts = (s.points || []).slice(0, 3)
  const onImgChange = v => onChange('secImg', v)
  return (
    <div style={{ background: '#e1dee3', overflow: 'hidden', fontFamily: "'Noto Serif KR','Noto Sans KR',serif" }}>
      <div style={{ padding: '52px 64px 36px', textAlign: 'center' }}>
        <EditText editing={editing} value={s.mainCopy} onChange={v => onChange('mainCopy', v)}
          style={{ fontSize: 42, fontWeight: 800, color: '#231815', lineHeight: 1.25, letterSpacing: '-0.02em', marginBottom: 14, wordBreak: 'keep-all' }} />
        <EditText editing={editing} value={s.subCopy} onChange={v => onChange('subCopy', v)}
          style={{ fontSize: 22, fontWeight: 500, color: '#231815', opacity: 0.75, lineHeight: 1.5, wordBreak: 'keep-all' }} />
      </div>
      <div style={{ margin: '0 32px', borderRadius: 16, overflow: 'hidden', minHeight: 200 }}>
        <ImgBox url={img} h={320} t={t} label="제품 대표 이미지" autoH={!!img} editing={editing} onImgChange={onImgChange} />
      </div>
      <div style={{ position: 'relative', marginTop: -60, paddingTop: 60, paddingBottom: 52 }}>
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '130%', height: '100%', background: '#fff', borderRadius: '50% 50% 0 0 / 30% 30% 0 0' }} />
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-around', padding: '0 32px' }}>
          {[0, 1, 2].map(i => {
            const raw = pts[i] || ''; const parts = raw.split(':')
            const ptTitle = parts[0]?.trim() || `포인트 ${i + 1}`
            const ptDesc = parts.slice(1).join(':').trim() || ''
            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', width: '28%', gap: 10 }}>
                <div style={{ width: 88, height: 88, borderRadius: '50%', background: '#f8b62d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, boxShadow: '0 4px 16px rgba(248,182,45,0.35)', flexShrink: 0 }}>{autoIcon(i)}</div>
                {editing
                  ? <input value={raw} onChange={e => { const n = [...(s.points || [])]; n[i] = e.target.value; onChange('points', n) }}
                      placeholder="제목: 설명" style={{ width: '100%', fontSize: 12, border: '1px solid #3b82f6', borderRadius: 6, padding: '4px 7px', textAlign: 'center', outline: 'none' }} />
                  : <>
                      <p style={{ fontSize: 16, fontWeight: 700, color: '#231815', margin: 0, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>{ptTitle}</p>
                      {ptDesc && <p style={{ fontSize: 13, fontWeight: 400, color: '#231815', opacity: 0.6, margin: 0, lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>{ptDesc}</p>}
                    </>
                }
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ── 2. Material ─────────────────────────────────── */
export function TplMaterial({ s, img, t, editing, onChange }) {
  const pts = (s.points || []).slice(0, 3)
  return (
    <div style={{ background: t.bg, paddingBottom: 52 }}>
      <ImgBox url={img} h={340} t={t} label="소재 클로즈업" autoH={!!img} editing={editing} onImgChange={v => onChange('secImg', v)} />
      <div style={{ padding: '40px 52px 0' }}>
        <EditText editing={editing} value={s.mainCopy} onChange={v => onChange('mainCopy', v)} style={{ fontSize: 32, fontWeight: 800, color: t.fg, lineHeight: 1.35, letterSpacing: '-0.02em', marginBottom: 12, wordBreak: 'keep-all' }} />
        <EditText editing={editing} value={s.subCopy} onChange={v => onChange('subCopy', v)} style={{ fontSize: 18, color: t.fg, opacity: 0.68, lineHeight: 1.7, marginBottom: 28 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {pts.map((p, i) => (
            <div key={i} style={{ display: 'flex', gap: 14, padding: '14px 18px', background: t.sub, borderRadius: 8, border: `1px solid ${t.bd}`, alignItems: 'flex-start' }}>
              <span style={{ width: 26, height: 26, borderRadius: '50%', background: t.ac, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.bg, fontSize: 13, fontWeight: 800, flexShrink: 0, marginTop: 1 }}>{i + 1}</span>
              {editing ? <input value={p} onChange={e => { const n = [...(s.points || [])]; n[i] = e.target.value; onChange('points', n) }} style={{ flex: 1, fontSize: 15, border: '1px solid #3b82f6', borderRadius: 6, padding: '5px 8px', outline: 'none' }} />
                : <span style={{ fontSize: 16, color: t.fg, lineHeight: 1.65, opacity: 0.9 }}>{p}</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── 3. Detail 2col ──────────────────────────────── */
export function TplDetail2col({ s, img, t, editing, onChange }) {
  const pts = (s.points || []).slice(0, 3)
  return (
    <div style={{ background: t.bg, display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 400 }}>
      <ImgBox url={img} h={400} t={t} label="디테일 클로즈업" autoH={!!img} editing={editing} onImgChange={v => onChange('secImg', v)} />
      <div style={{ padding: '44px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <EditText editing={editing} value={s.mainCopy} onChange={v => onChange('mainCopy', v)} style={{ fontSize: 28, fontWeight: 800, color: t.fg, lineHeight: 1.35, letterSpacing: '-0.02em', marginBottom: 12, wordBreak: 'keep-all' }} />
        <EditText editing={editing} value={s.subCopy} onChange={v => onChange('subCopy', v)} style={{ fontSize: 16, color: t.fg, opacity: 0.68, lineHeight: 1.65, marginBottom: 20 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {pts.map((p, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ color: t.ac, fontSize: 16, flexShrink: 0, marginTop: 2, fontWeight: 700 }}>{autoIcon(i)}</span>
              {editing ? <input value={p} onChange={e => { const n = [...(s.points || [])]; n[i] = e.target.value; onChange('points', n) }} style={{ flex: 1, fontSize: 14, border: '1px solid #3b82f6', borderRadius: 6, padding: '4px 8px', outline: 'none' }} />
                : <span style={{ fontSize: 15, color: t.fg, lineHeight: 1.65, opacity: 0.87 }}>{p}</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── 4. Scene ────────────────────────────────────── */
export function TplScene({ s, img, t, editing, onChange }) {
  return (
    <div style={{ background: t.bg, paddingBottom: 44 }}>
      <div style={{ position: 'relative' }}>
        <ImgBox url={img} h={440} t={t} label="라이프스타일 장면" autoH={!!img} editing={editing} onImgChange={v => onChange('secImg', v)} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent,rgba(0,0,0,0.58))', padding: '36px 48px 32px', pointerEvents: 'none' }}>
          <div style={{ fontSize: 30, fontWeight: 800, color: '#fff', lineHeight: 1.3, wordBreak: 'keep-all' }}>{s.mainCopy}</div>
        </div>
      </div>
      {editing ? (
        <div style={{ padding: '12px 52px' }}>
          <input value={s.mainCopy || ''} onChange={e => onChange('mainCopy', e.target.value)} placeholder="메인 카피 (이미지 위에 표시)" style={{ width: '100%', fontSize: 15, border: '1px solid #3b82f6', borderRadius: 7, padding: '7px 10px', outline: 'none', marginBottom: 6 }} />
          <input value={s.subCopy || ''} onChange={e => onChange('subCopy', e.target.value)} placeholder="서브 카피" style={{ width: '100%', fontSize: 14, border: '1px solid #3b82f6', borderRadius: 7, padding: '7px 10px', outline: 'none' }} />
        </div>
      ) : s.subCopy ? <div style={{ padding: '28px 52px 0' }}><p style={{ fontSize: 18, color: t.fg, opacity: 0.72, lineHeight: 1.75, margin: 0 }}>{s.subCopy}</p></div> : null}
    </div>
  )
}

/* ── 5. Compare ──────────────────────────────────── */
export function TplCompare({ s, img, t, editing, onChange }) {
  const pts = (s.points || []).slice(0, 4)
  return (
    <div style={{ background: t.bg, padding: '52px 52px 56px' }}>
      <EditText editing={editing} value={s.mainCopy} onChange={v => onChange('mainCopy', v)} style={{ fontSize: 30, fontWeight: 800, color: t.fg, lineHeight: 1.3, letterSpacing: '-0.02em', marginBottom: 10, wordBreak: 'keep-all' }} />
      <EditText editing={editing} value={s.subCopy} onChange={v => onChange('subCopy', v)} style={{ fontSize: 17, color: t.fg, opacity: 0.65, marginBottom: 28, lineHeight: 1.65 }} />
      <div style={{ border: `1.5px solid ${t.bd}`, borderRadius: 10, overflow: 'hidden', marginBottom: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: t.sub }}>
          <div style={{ padding: '14px 20px', fontSize: 14, fontWeight: 700, color: '#888', textAlign: 'center', borderRight: `1px solid ${t.bd}`, borderBottom: `1px solid ${t.bd}` }}>일반 제품</div>
          <div style={{ padding: '14px 20px', fontSize: 14, fontWeight: 700, color: t.ac, textAlign: 'center', borderBottom: `1px solid ${t.bd}` }}>이 제품</div>
        </div>
        {pts.map((p, i) => {
          const [a, ...r] = p.split('/'); const b = r.join('/').trim()
          return editing ? (
            <div key={i} style={{ padding: '8px 12px', borderBottom: i < pts.length - 1 ? `1px solid ${t.bd}` : 'none' }}>
              <input value={p} onChange={e => { const n = [...(s.points || [])]; n[i] = e.target.value; onChange('points', n) }}
                placeholder="일반제품 내용 / 이제품 내용" style={{ width: '100%', fontSize: 13, border: '1px solid #3b82f6', borderRadius: 6, padding: '5px 8px', outline: 'none' }} />
            </div>
          ) : (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: i % 2 === 0 ? t.bg : t.sub }}>
              <div style={{ padding: '14px 20px', fontSize: 15, color: '#888', textAlign: 'center', borderRight: `1px solid ${t.bd}`, borderBottom: i < pts.length - 1 ? `1px solid ${t.bd}` : 'none', textDecoration: 'line-through', opacity: 0.7 }}>{a.replace(/일반제품:/i, '').trim()}</div>
              <div style={{ padding: '14px 20px', fontSize: 15, color: t.ac, fontWeight: 600, textAlign: 'center', borderBottom: i < pts.length - 1 ? `1px solid ${t.bd}` : 'none' }}>{b || '—'}</div>
            </div>
          )
        })}
      </div>
      {(img || editing) && <ImgBox url={img} h={220} t={t} label="비교 이미지" autoH={!!img} editing={editing} onImgChange={v => onChange('secImg', v)} />}
    </div>
  )
}

/* ── 6. Points3 ──────────────────────────────────── */
export function TplPoints3({ s, img, t, editing, onChange }) {
  const pts = (s.points || []).slice(0, 3)
  return (
    <div style={{ background: t.bg, padding: '52px 44px 56px' }}>
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <EditText editing={editing} value={s.mainCopy} onChange={v => onChange('mainCopy', v)} style={{ fontSize: 30, fontWeight: 800, color: t.fg, lineHeight: 1.35, letterSpacing: '-0.02em', marginBottom: 10, wordBreak: 'keep-all' }} />
        <EditText editing={editing} value={s.subCopy} onChange={v => onChange('subCopy', v)} style={{ fontSize: 17, color: t.fg, opacity: 0.65, lineHeight: 1.7 }} />
      </div>
      {(img || editing) && <div style={{ borderRadius: 10, overflow: 'hidden', marginBottom: 32, border: `1px solid ${t.bd}` }}><ImgBox url={img} h={240} t={t} label="포인트 이미지" autoH={!!img} editing={editing} onImgChange={v => onChange('secImg', v)} /></div>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
        {(pts.length ? pts : ['포인트 1', '포인트 2', '포인트 3']).map((p, i) => (
          <div key={i} style={{ background: t.sub, borderRadius: 10, padding: '28px 20px', textAlign: 'center', border: `1px solid ${t.bd}` }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: t.ac, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: t.bg, fontSize: 20, fontWeight: 800 }}>{autoIcon(i)}</div>
            {editing ? <input value={p} onChange={e => { const n = [...(s.points || [])]; n[i] = e.target.value; onChange('points', n) }} style={{ width: '100%', fontSize: 13, border: '1px solid #3b82f6', borderRadius: 6, padding: '5px 8px', textAlign: 'center', outline: 'none' }} />
              : <p style={{ fontSize: 15, color: t.fg, lineHeight: 1.65, margin: 0, opacity: 0.9, wordBreak: 'keep-all' }}>{p}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── 7. Target ───────────────────────────────────── */
export function TplTarget({ s, img, t, editing, onChange }) {
  const pts = (s.points || []).slice(0, 4)
  return (
    <div style={{ background: t.bg, padding: '52px 52px 56px' }}>
      <EditText editing={editing} value={s.mainCopy} onChange={v => onChange('mainCopy', v)} style={{ fontSize: 30, fontWeight: 800, color: t.fg, lineHeight: 1.35, letterSpacing: '-0.02em', marginBottom: 10, wordBreak: 'keep-all' }} />
      <EditText editing={editing} value={s.subCopy} onChange={v => onChange('subCopy', v)} style={{ fontSize: 17, color: t.fg, opacity: 0.65, marginBottom: 28, lineHeight: 1.65 }} />
      <div style={{ border: `1.5px solid ${t.bd}`, borderRadius: 10, overflow: 'hidden', marginBottom: img ? 28 : 0 }}>
        {(pts.length ? pts : ['추천 대상 1', '추천 대상 2', '추천 대상 3']).map((p, i, a) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 22px', background: i % 2 === 0 ? t.bg : t.sub, borderBottom: i < a.length - 1 ? `1px solid ${t.bd}` : 'none' }}>
            <span style={{ width: 26, height: 26, borderRadius: '50%', background: t.ac, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.bg, fontSize: 13, fontWeight: 700, flexShrink: 0 }}>✓</span>
            {editing ? <input value={p} onChange={e => { const n = [...(s.points || [])]; n[i] = e.target.value; onChange('points', n) }} style={{ flex: 1, fontSize: 15, border: '1px solid #3b82f6', borderRadius: 6, padding: '5px 8px', outline: 'none' }} />
              : <span style={{ fontSize: 16, color: t.fg, lineHeight: 1.6, opacity: 0.9 }}>{p.replace(/이런 분께 추천\d*:/i, '').trim()}</span>}
          </div>
        ))}
      </div>
      {(img || editing) && <ImgBox url={img} h={220} t={t} label="추천 이미지" autoH={!!img} editing={editing} onImgChange={v => onChange('secImg', v)} />}
    </div>
  )
}

/* ── 8. CTA ──────────────────────────────────────── */
export function TplCTA({ s, img, t, editing, onChange }) {
  return (
    <div style={{ background: t.bg }}>
      <ImgBox url={img} h={280} t={t} label="배경 이미지 (선택)" autoH={!!img} editing={editing} onImgChange={v => onChange('secImg', v)} />
      <div style={{ padding: '52px 52px 64px', textAlign: 'center' }}>
        <EditText editing={editing} value={s.mainCopy} onChange={v => onChange('mainCopy', v)} style={{ fontSize: 32, fontWeight: 800, color: t.fg, lineHeight: 1.3, letterSpacing: '-0.025em', marginBottom: 14, wordBreak: 'keep-all' }} />
        <EditText editing={editing} value={s.subCopy} onChange={v => onChange('subCopy', v)} style={{ fontSize: 18, color: t.fg, opacity: 0.65, marginBottom: 36, lineHeight: 1.7 }} />
        {editing
          ? <input value={s.cta || ''} onChange={e => onChange('cta', e.target.value)} placeholder="버튼 문구" style={{ fontSize: 16, fontWeight: 700, padding: '14px 40px', border: '2px solid #3b82f6', borderRadius: 4, outline: 'none', background: t.ac, color: t.bg, textAlign: 'center' }} />
          : s.cta && <div style={{ display: 'inline-block', background: t.ac, color: t.bg, fontSize: 18, fontWeight: 700, padding: '18px 56px', borderRadius: 4 }}>{s.cta}</div>
        }
      </div>
    </div>
  )
}

export const TPL = { hero: TplHero, material: TplMaterial, detail2col: TplDetail2col, scene: TplScene, compare: TplCompare, points3: TplPoints3, target: TplTarget, cta: TplCTA }
