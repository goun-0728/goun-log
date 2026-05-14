// src/components/SectionTemplates.jsx
import React, { useRef } from 'react'
import { AUTO_ICONS } from '../constants'

export const autoIcon = i => AUTO_ICONS[i % AUTO_ICONS.length]

/* ── 카드 기준 폭: 860px 고정, 높이: 콘텐츠에 맞게 자동
   최소 높이 1200px, 빈 공간 생기지 않도록 auto
─────────────────────────────────────────────────── */
const CARD_W = 860

export function CardWrapper({ children, bg = '#fff' }) {
  return (
    <div style={{
      width: CARD_W,
      minHeight: 1200,
      background: bg,
      overflow: 'hidden',
      position: 'relative',
    }}>
      {children}
    </div>
  )
}

/* ── 인라인 편집 텍스트 ──────────────────────────── */
export function EditText({ value, onChange, editing, style, placeholder = '클릭하여 수정' }) {
  if (!editing) return <div style={style}>{value || ''}</div>
  return (
    <div contentEditable suppressContentEditableWarning
      onBlur={e => onChange(e.currentTarget.innerText.trim())}
      style={{ ...style, outline: 'none', borderBottom: '2px solid #3b82f6', cursor: 'text', minWidth: 40 }}
      dangerouslySetInnerHTML={{ __html: value || '' }}
    />
  )
}

/* ── 이미지 박스 (클릭하면 업로드) ─────────────────
   url 없고 editing 아니면 → 완전히 숨김 (공간 차지 안 함)
   url 없고 editing이면  → 점선 박스 표시
   url 있으면            → 이미지 표시 (높이 자동)
─────────────────────────────────────────────────── */
export function ImgBox({ url, t, label, editing = false, onImgChange, minH = 400 }) {
  const ref = useRef(null)
  const handleFile = e => {
    const f = e.target.files[0]; if (!f || !onImgChange) return
    const fr = new FileReader()
    fr.onload = ev => onImgChange(ev.target.result)
    fr.readAsDataURL(f); e.target.value = ''
  }

  // 이미지 없고 편집 모드도 아니면 → 공간 차지 안 함
  if (!url && !editing) return null

  // 이미지 없고 편집 모드 → 업로드 유도 박스
  if (!url && editing) {
    return (
      <div onClick={() => ref.current?.click()}
        style={{ minHeight: minH, background: t.sub, border: `2px dashed ${t.bd}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer', borderRadius: 8, margin: '0 0 16px' }}>
        <input ref={ref} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
        <span style={{ fontSize: 36, opacity: 0.25 }}>📷</span>
        <span style={{ fontSize: 15, color: t.fg, opacity: 0.5, fontWeight: 500 }}>클릭하여 사진 업로드</span>
        <span style={{ fontSize: 12, color: t.fg, opacity: 0.35 }}>{label}</span>
      </div>
    )
  }

  // 이미지 있음 → 높이 auto (비율 유지)
  return (
    <div style={{ position: 'relative', marginBottom: 0 }} onClick={() => editing && ref.current?.click()}>
      <input ref={ref} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
      <img src={url} alt="" style={{ width: '100%', height: 'auto', display: 'block' }} />
      {editing && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0)', transition: 'background .2s', cursor: 'pointer' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.3)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0)'}>
          <span style={{ color: '#fff', fontSize: 14, fontWeight: 600, background: 'rgba(0,0,0,0.55)', padding: '8px 18px', borderRadius: 8, pointerEvents: 'none' }}>📷 사진 교체</span>
        </div>
      )}
    </div>
  )
}

/* ── 공통: 포인트 리스트 ─────────────────────────── */
function PointList({ pts, t, editing, onChange, s, numbered = false }) {
  if (!pts.length && !editing) return null
  const items = pts.length ? pts : (editing ? [''] : [])
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 28 }}>
      {items.map((p, i) => (
        <div key={i} style={{ display: 'flex', gap: 16, padding: '16px 20px', background: t.sub, borderRadius: 10, border: `1px solid ${t.bd}`, alignItems: 'flex-start' }}>
          {numbered
            ? <span style={{ width: 28, height: 28, borderRadius: '50%', background: t.ac, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.bg, fontSize: 14, fontWeight: 800, flexShrink: 0, marginTop: 2 }}>{i + 1}</span>
            : <span style={{ color: t.ac, fontSize: 20, flexShrink: 0, marginTop: 1, fontWeight: 700 }}>{autoIcon(i)}</span>
          }
          {editing
            ? <input value={p} onChange={e => { const n = [...(s.points || [])]; n[i] = e.target.value; onChange('points', n) }}
                style={{ flex: 1, fontSize: 17, border: '1px solid #3b82f6', borderRadius: 6, padding: '6px 10px', outline: 'none' }} />
            : <span style={{ fontSize: 18, color: t.fg, lineHeight: 1.65, opacity: 0.9 }}>{p}</span>
          }
        </div>
      ))}
    </div>
  )
}

/* ════════════════════════════════════════════════════
   8가지 템플릿 — 모두 860px 고정폭, 높이 auto
════════════════════════════════════════════════════ */

/* ── 1. Hero ─────────────────────────────────────── */
export function TplHero({ s, img, t, editing, onChange }) {
  const pts = (s.points || []).slice(0, 3)
  return (
    <CardWrapper bg="#e1dee3">
      <div style={{ fontFamily: "'Noto Serif KR','Noto Sans KR',serif" }}>
        {/* 상단 텍스트 */}
        <div style={{ padding: '72px 80px 48px', textAlign: 'center' }}>
          <EditText editing={editing} value={s.mainCopy} onChange={v => onChange('mainCopy', v)}
            style={{ fontSize: 52, fontWeight: 800, color: '#231815', lineHeight: 1.25, letterSpacing: '-0.02em', marginBottom: 18, wordBreak: 'keep-all' }} />
          <EditText editing={editing} value={s.subCopy} onChange={v => onChange('subCopy', v)}
            style={{ fontSize: 26, fontWeight: 500, color: '#231815', opacity: 0.72, lineHeight: 1.5, wordBreak: 'keep-all' }} />
        </div>

        {/* 이미지 1 (메인) */}
        <div style={{ margin: '0 40px' }}>
          <ImgBox url={img} t={t} label="메인 제품 이미지" editing={editing} onImgChange={v => onChange('secImg', v)} minH={500} />
        </div>

        {/* 이미지 2 (서브 — 없으면 사라짐) */}
        {(s.secImg2 || editing) && (
          <div style={{ margin: '16px 40px 0' }}>
            <ImgBox url={s.secImg2} t={t} label="서브 이미지 (선택)" editing={editing} onImgChange={v => onChange('secImg2', v)} minH={300} />
          </div>
        )}

        {/* 하단 포인트 */}
        <div style={{ position: 'relative', marginTop: img ? -40 : 40 }}>
          <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '130%', height: '100%', background: '#fff', borderRadius: '50% 50% 0 0 / 12% 12% 0 0' }} />
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-around', padding: '72px 48px 72px' }}>
            {[0, 1, 2].map(i => {
              const raw = pts[i] || ''; const parts = raw.split(':')
              const ptTitle = parts[0]?.trim() || `포인트 ${i + 1}`
              const ptDesc = parts.slice(1).join(':').trim() || ''
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', width: '28%', gap: 14 }}>
                  <div style={{ width: 100, height: 100, borderRadius: '50%', background: '#f8b62d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34, boxShadow: '0 6px 20px rgba(248,182,45,0.4)', flexShrink: 0 }}>{autoIcon(i)}</div>
                  {editing
                    ? <input value={raw} onChange={e => { const n = [...(s.points || [])]; n[i] = e.target.value; onChange('points', n) }}
                        placeholder="제목: 설명" style={{ width: '100%', fontSize: 14, border: '1px solid #3b82f6', borderRadius: 6, padding: '6px 10px', textAlign: 'center', outline: 'none' }} />
                    : <>
                        <p style={{ fontSize: 19, fontWeight: 700, color: '#231815', margin: 0, lineHeight: 1.2, wordBreak: 'keep-all' }}>{ptTitle}</p>
                        {ptDesc && <p style={{ fontSize: 15, fontWeight: 400, color: '#231815', opacity: 0.6, margin: 0, lineHeight: 1.3, wordBreak: 'keep-all' }}>{ptDesc}</p>}
                      </>
                  }
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </CardWrapper>
  )
}

/* ── 2. Material (소재 설명) ──────────────────────── */
export function TplMaterial({ s, img, t, editing, onChange }) {
  return (
    <CardWrapper bg={t.bg}>
      {/* 이미지 1 */}
      <ImgBox url={img} t={t} label="소재 클로즈업" editing={editing} onImgChange={v => onChange('secImg', v)} minH={420} />
      <div style={{ padding: '52px 64px' }}>
        <EditText editing={editing} value={s.mainCopy} onChange={v => onChange('mainCopy', v)}
          style={{ fontSize: 40, fontWeight: 800, color: t.fg, lineHeight: 1.35, letterSpacing: '-0.02em', marginBottom: 14, wordBreak: 'keep-all' }} />
        <EditText editing={editing} value={s.subCopy} onChange={v => onChange('subCopy', v)}
          style={{ fontSize: 22, color: t.fg, opacity: 0.68, lineHeight: 1.7 }} />
        <PointList pts={(s.points||[]).slice(0,3)} t={t} editing={editing} onChange={onChange} s={s} numbered />
      </div>
      {/* 이미지 2 (없으면 사라짐) */}
      {(s.secImg2 || editing) && (
        <div style={{ padding: '0 64px 52px' }}>
          <ImgBox url={s.secImg2} t={t} label="추가 소재 이미지 (선택)" editing={editing} onImgChange={v => onChange('secImg2', v)} minH={280} />
        </div>
      )}
    </CardWrapper>
  )
}

/* ── 3. Detail 2col ──────────────────────────────── */
export function TplDetail2col({ s, img, t, editing, onChange }) {
  return (
    <CardWrapper bg={t.bg}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 600 }}>
        {/* 왼쪽 이미지 */}
        <div style={{ overflow: 'hidden', background: t.sub }}>
          {img
            ? <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            : editing
              ? <div onClick={() => {}} style={{ height: '100%', minHeight: 600, background: t.sub, border: `2px dashed ${t.bd}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer' }}>
                  <span style={{ fontSize: 36, opacity: 0.25 }}>📷</span>
                  <span style={{ fontSize: 14, color: t.fg, opacity: 0.45 }}>클릭하여 이미지 업로드</span>
                </div>
              : <div style={{ height: 600, background: t.sub }} />
          }
          {editing && (
            <input type="file" accept="image/*" onChange={e => {
              const f = e.target.files[0]; if (!f) return
              const fr = new FileReader(); fr.onload = ev => onChange('secImg', ev.target.result); fr.readAsDataURL(f); e.target.value = ''
            }} style={{ display: 'block', padding: '8px 12px', fontSize: 12, width: '100%', cursor: 'pointer', background: '#EFF6FF', border: 'none', borderTop: '1px solid #BFDBFE' }} />
          )}
        </div>
        {/* 오른쪽 텍스트 */}
        <div style={{ padding: '64px 52px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <EditText editing={editing} value={s.mainCopy} onChange={v => onChange('mainCopy', v)}
            style={{ fontSize: 36, fontWeight: 800, color: t.fg, lineHeight: 1.35, letterSpacing: '-0.02em', marginBottom: 14, wordBreak: 'keep-all' }} />
          <EditText editing={editing} value={s.subCopy} onChange={v => onChange('subCopy', v)}
            style={{ fontSize: 19, color: t.fg, opacity: 0.68, lineHeight: 1.65 }} />
          <PointList pts={(s.points||[]).slice(0,3)} t={t} editing={editing} onChange={onChange} s={s} />
        </div>
      </div>
      {/* 이미지 2 — 아래 추가 */}
      {(s.secImg2 || editing) && (
        <div style={{ padding: '0 0 0' }}>
          <ImgBox url={s.secImg2} t={t} label="추가 이미지 (선택)" editing={editing} onImgChange={v => onChange('secImg2', v)} minH={280} />
        </div>
      )}
    </CardWrapper>
  )
}

/* ── 4. Scene (사용 장면) ────────────────────────── */
export function TplScene({ s, img, t, editing, onChange }) {
  return (
    <CardWrapper bg={t.bg}>
      {/* 이미지 1 — 라이프스타일 */}
      <div style={{ position: 'relative' }}>
        <ImgBox url={img} t={t} label="라이프스타일 장면" editing={editing} onImgChange={v => onChange('secImg', v)} minH={500} />
        {img && (
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent,rgba(0,0,0,0.62))', padding: '60px 64px 48px', pointerEvents: 'none' }}>
            <div style={{ fontSize: 40, fontWeight: 800, color: '#fff', lineHeight: 1.3, wordBreak: 'keep-all' }}>{s.mainCopy}</div>
          </div>
        )}
      </div>
      <div style={{ padding: '48px 64px' }}>
        {editing && (
          <input value={s.mainCopy || ''} onChange={e => onChange('mainCopy', e.target.value)} placeholder="메인 카피 (이미지 위에 표시)" style={{ width: '100%', fontSize: 18, border: '1px solid #3b82f6', borderRadius: 7, padding: '10px 14px', outline: 'none', marginBottom: 12 }} />
        )}
        <EditText editing={editing} value={s.subCopy} onChange={v => onChange('subCopy', v)}
          style={{ fontSize: 22, color: t.fg, opacity: 0.72, lineHeight: 1.75 }} />
        <PointList pts={(s.points||[]).slice(0,3)} t={t} editing={editing} onChange={onChange} s={s} />
      </div>
      {/* 이미지 2 */}
      {(s.secImg2 || editing) && (
        <div style={{ padding: '0 64px 52px' }}>
          <ImgBox url={s.secImg2} t={t} label="추가 장면 이미지 (선택)" editing={editing} onImgChange={v => onChange('secImg2', v)} minH={280} />
        </div>
      )}
    </CardWrapper>
  )
}

/* ── 5. Compare (비교) ───────────────────────────── */
export function TplCompare({ s, img, t, editing, onChange }) {
  const pts = (s.points || []).slice(0, 4)
  return (
    <CardWrapper bg={t.bg}>
      <div style={{ padding: '72px 64px' }}>
        <EditText editing={editing} value={s.mainCopy} onChange={v => onChange('mainCopy', v)}
          style={{ fontSize: 42, fontWeight: 800, color: t.fg, lineHeight: 1.3, letterSpacing: '-0.02em', marginBottom: 14, wordBreak: 'keep-all' }} />
        <EditText editing={editing} value={s.subCopy} onChange={v => onChange('subCopy', v)}
          style={{ fontSize: 22, color: t.fg, opacity: 0.65, marginBottom: 48, lineHeight: 1.65 }} />
        <div style={{ border: `1.5px solid ${t.bd}`, borderRadius: 14, overflow: 'hidden', marginBottom: 40 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: t.sub }}>
            <div style={{ padding: '18px 24px', fontSize: 17, fontWeight: 700, color: '#888', textAlign: 'center', borderRight: `1px solid ${t.bd}`, borderBottom: `1px solid ${t.bd}` }}>일반 제품</div>
            <div style={{ padding: '18px 24px', fontSize: 17, fontWeight: 700, color: t.ac, textAlign: 'center', borderBottom: `1px solid ${t.bd}` }}>이 제품</div>
          </div>
          {pts.map((p, i) => {
            const [a, ...r] = p.split('/'); const b = r.join('/').trim()
            return editing ? (
              <div key={i} style={{ padding: '10px 14px', borderBottom: i < pts.length - 1 ? `1px solid ${t.bd}` : 'none' }}>
                <input value={p} onChange={e => { const n = [...(s.points || [])]; n[i] = e.target.value; onChange('points', n) }}
                  placeholder="일반제품 내용 / 이제품 내용" style={{ width: '100%', fontSize: 16, border: '1px solid #3b82f6', borderRadius: 6, padding: '7px 10px', outline: 'none' }} />
              </div>
            ) : (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: i % 2 === 0 ? t.bg : t.sub }}>
                <div style={{ padding: '18px 24px', fontSize: 17, color: '#888', textAlign: 'center', borderRight: `1px solid ${t.bd}`, borderBottom: i < pts.length - 1 ? `1px solid ${t.bd}` : 'none', textDecoration: 'line-through', opacity: 0.7 }}>{a.replace(/일반제품:/i, '').trim()}</div>
                <div style={{ padding: '18px 24px', fontSize: 17, color: t.ac, fontWeight: 600, textAlign: 'center', borderBottom: i < pts.length - 1 ? `1px solid ${t.bd}` : 'none' }}>{b || '—'}</div>
              </div>
            )
          })}
        </div>
      </div>
      {/* 이미지 1 */}
      <ImgBox url={img} t={t} label="비교 이미지 1" editing={editing} onImgChange={v => onChange('secImg', v)} minH={320} />
      {/* 이미지 2 */}
      {(s.secImg2 || editing) && (
        <ImgBox url={s.secImg2} t={t} label="비교 이미지 2 (선택)" editing={editing} onImgChange={v => onChange('secImg2', v)} minH={280} />
      )}
    </CardWrapper>
  )
}

/* ── 6. Points3 (포인트 3단) ─────────────────────── */
export function TplPoints3({ s, img, t, editing, onChange }) {
  const pts = (s.points || []).slice(0, 3)
  return (
    <CardWrapper bg={t.bg}>
      <div style={{ padding: '72px 64px' }}>
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <EditText editing={editing} value={s.mainCopy} onChange={v => onChange('mainCopy', v)}
            style={{ fontSize: 42, fontWeight: 800, color: t.fg, lineHeight: 1.35, letterSpacing: '-0.02em', marginBottom: 14, wordBreak: 'keep-all' }} />
          <EditText editing={editing} value={s.subCopy} onChange={v => onChange('subCopy', v)}
            style={{ fontSize: 22, color: t.fg, opacity: 0.65, lineHeight: 1.7 }} />
        </div>
        {/* 이미지 1 */}
        <ImgBox url={img} t={t} label="포인트 이미지 1" editing={editing} onImgChange={v => onChange('secImg', v)} minH={360} />
        {/* 이미지 2 */}
        {(s.secImg2 || editing) && (
          <div style={{ marginTop: 16 }}>
            <ImgBox url={s.secImg2} t={t} label="포인트 이미지 2 (선택)" editing={editing} onImgChange={v => onChange('secImg2', v)} minH={280} />
          </div>
        )}
        {/* 3단 카드 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, marginTop: 40 }}>
          {(pts.length ? pts : (editing ? ['','',''] : [])).map((p, i) => (
            <div key={i} style={{ background: t.sub, borderRadius: 14, padding: '36px 24px', textAlign: 'center', border: `1px solid ${t.bd}` }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: t.ac, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', color: t.bg, fontSize: 24, fontWeight: 800 }}>{autoIcon(i)}</div>
              {editing
                ? <input value={p} onChange={e => { const n = [...(s.points || [])]; n[i] = e.target.value; onChange('points', n) }} style={{ width: '100%', fontSize: 16, border: '1px solid #3b82f6', borderRadius: 6, padding: '6px 10px', textAlign: 'center', outline: 'none' }} />
                : <p style={{ fontSize: 18, color: t.fg, lineHeight: 1.65, margin: 0, opacity: 0.9, wordBreak: 'keep-all' }}>{p}</p>
              }
            </div>
          ))}
        </div>
      </div>
    </CardWrapper>
  )
}

/* ── 7. Target (추천 대상) ───────────────────────── */
export function TplTarget({ s, img, t, editing, onChange }) {
  const pts = (s.points || []).slice(0, 4)
  return (
    <CardWrapper bg={t.bg}>
      {/* 이미지 1 — 상단 */}
      <ImgBox url={img} t={t} label="추천 대상 이미지 1" editing={editing} onImgChange={v => onChange('secImg', v)} minH={380} />
      <div style={{ padding: '60px 64px' }}>
        <EditText editing={editing} value={s.mainCopy} onChange={v => onChange('mainCopy', v)}
          style={{ fontSize: 42, fontWeight: 800, color: t.fg, lineHeight: 1.35, letterSpacing: '-0.02em', marginBottom: 14, wordBreak: 'keep-all' }} />
        <EditText editing={editing} value={s.subCopy} onChange={v => onChange('subCopy', v)}
          style={{ fontSize: 22, color: t.fg, opacity: 0.65, marginBottom: 40, lineHeight: 1.65 }} />
        <div style={{ border: `1.5px solid ${t.bd}`, borderRadius: 14, overflow: 'hidden' }}>
          {(pts.length ? pts : (editing ? ['','',''] : [])).map((p, i, a) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '22px 26px', background: i % 2 === 0 ? t.bg : t.sub, borderBottom: i < a.length - 1 ? `1px solid ${t.bd}` : 'none' }}>
              <span style={{ width: 32, height: 32, borderRadius: '50%', background: t.ac, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.bg, fontSize: 15, fontWeight: 700, flexShrink: 0 }}>✓</span>
              {editing
                ? <input value={p} onChange={e => { const n = [...(s.points || [])]; n[i] = e.target.value; onChange('points', n) }} style={{ flex: 1, fontSize: 18, border: '1px solid #3b82f6', borderRadius: 6, padding: '7px 10px', outline: 'none' }} />
                : <span style={{ fontSize: 20, color: t.fg, lineHeight: 1.6, opacity: 0.9 }}>{p.replace(/이런 분께 추천\d*:/i, '').trim()}</span>
              }
            </div>
          ))}
        </div>
      </div>
      {/* 이미지 2 — 하단 */}
      {(s.secImg2 || editing) && (
        <div style={{ padding: '0 64px 60px' }}>
          <ImgBox url={s.secImg2} t={t} label="추가 이미지 2 (선택)" editing={editing} onImgChange={v => onChange('secImg2', v)} minH={280} />
        </div>
      )}
    </CardWrapper>
  )
}

/* ── 8. CTA ──────────────────────────────────────── */
export function TplCTA({ s, img, t, editing, onChange }) {
  return (
    <CardWrapper bg={t.bg}>
      {/* 이미지 1 — 상단 배경 */}
      <div style={{ position: 'relative' }}>
        <ImgBox url={img} t={t} label="CTA 배경 이미지" editing={editing} onImgChange={v => onChange('secImg', v)} minH={420} />
        {img && <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(transparent 40%,${t.bg})`, pointerEvents: 'none' }} />}
      </div>
      <div style={{ padding: '56px 80px 72px', textAlign: 'center' }}>
        <EditText editing={editing} value={s.mainCopy} onChange={v => onChange('mainCopy', v)}
          style={{ fontSize: 44, fontWeight: 800, color: t.fg, lineHeight: 1.3, letterSpacing: '-0.025em', marginBottom: 18, wordBreak: 'keep-all' }} />
        <EditText editing={editing} value={s.subCopy} onChange={v => onChange('subCopy', v)}
          style={{ fontSize: 22, color: t.fg, opacity: 0.65, marginBottom: 52, lineHeight: 1.7 }} />
        {editing
          ? <input value={s.cta || ''} onChange={e => onChange('cta', e.target.value)} placeholder="버튼 문구" style={{ fontSize: 20, fontWeight: 700, padding: '18px 52px', border: '2px solid #3b82f6', borderRadius: 6, outline: 'none', background: t.ac, color: t.bg, textAlign: 'center' }} />
          : s.cta && <div style={{ display: 'inline-block', background: t.ac, color: t.bg, fontSize: 22, fontWeight: 700, padding: '22px 72px', borderRadius: 6 }}>{s.cta}</div>
        }
      </div>
      {/* 이미지 2 — 하단 추가 */}
      {(s.secImg2 || editing) && (
        <ImgBox url={s.secImg2} t={t} label="추가 이미지 (선택)" editing={editing} onImgChange={v => onChange('secImg2', v)} minH={280} />
      )}
    </CardWrapper>
  )
}

export const TPL = { hero: TplHero, material: TplMaterial, detail2col: TplDetail2col, scene: TplScene, compare: TplCompare, points3: TplPoints3, target: TplTarget, cta: TplCTA }


export const autoIcon = i => AUTO_ICONS[i % AUTO_ICONS.length]

/* ── 860×1500 고정 래퍼 ──────────────────────────────
   모든 섹션 카드는 이 안에서 렌더링됨
   PNG 저장 시 860×1500px 고정 크기로 출력
─────────────────────────────────────────────────── */
const CARD_W = 860
const CARD_H = 1500

export function CardWrapper({ children, bg = '#fff' }) {
  return (
    <div style={{
      width: CARD_W,
      height: CARD_H,
      background: bg,
      overflow: 'hidden',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      // 화면에서는 컨테이너 폭에 맞게 비례 축소
      // (SectionEditor에서 scale 처리)
    }}>
      {children}
    </div>
  )
}

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
    <CardWrapper bg="#e1dee3">
      <div style={{ fontFamily: "'Noto Serif KR','Noto Sans KR',serif", display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* 상단 텍스트 */}
        <div style={{ padding: '72px 80px 44px', textAlign: 'center', flexShrink: 0 }}>
          <EditText editing={editing} value={s.mainCopy} onChange={v => onChange('mainCopy', v)}
            style={{ fontSize: 52, fontWeight: 800, color: '#231815', lineHeight: 1.25, letterSpacing: '-0.02em', marginBottom: 18, wordBreak: 'keep-all' }} />
          <EditText editing={editing} value={s.subCopy} onChange={v => onChange('subCopy', v)}
            style={{ fontSize: 28, fontWeight: 500, color: '#231815', opacity: 0.75, lineHeight: 1.5, wordBreak: 'keep-all' }} />
        </div>

        {/* 메인 이미지 — 남은 공간 채우기 */}
        <div style={{ flex: 1, margin: '0 40px', borderRadius: 20, overflow: 'hidden', minHeight: 0 }}>
          <ImgBox url={img} h={800} t={t} label="제품 대표 이미지" autoH={false} editing={editing} onImgChange={onImgChange} />
        </div>

        {/* 하단 포인트 3개 */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{ position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)', width: '130%', height: 'calc(100% + 80px)', background: '#fff', borderRadius: '50% 50% 0 0 / 15% 15% 0 0' }} />
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-around', padding: '72px 48px 72px' }}>
            {[0, 1, 2].map(i => {
              const raw = pts[i] || ''; const parts = raw.split(':')
              const ptTitle = parts[0]?.trim() || `포인트 ${i + 1}`
              const ptDesc = parts.slice(1).join(':').trim() || ''
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', width: '28%', gap: 14 }}>
                  <div style={{ width: 110, height: 110, borderRadius: '50%', background: '#f8b62d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, boxShadow: '0 6px 20px rgba(248,182,45,0.4)', flexShrink: 0 }}>{autoIcon(i)}</div>
                  {editing
                    ? <input value={raw} onChange={e => { const n = [...(s.points || [])]; n[i] = e.target.value; onChange('points', n) }}
                        placeholder="제목: 설명" style={{ width: '100%', fontSize: 15, border: '1px solid #3b82f6', borderRadius: 6, padding: '6px 10px', textAlign: 'center', outline: 'none' }} />
                    : <>
                        <p style={{ fontSize: 20, fontWeight: 700, color: '#231815', margin: 0, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>{ptTitle}</p>
                        {ptDesc && <p style={{ fontSize: 16, fontWeight: 400, color: '#231815', opacity: 0.6, margin: 0, lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>{ptDesc}</p>}
                      </>
                  }
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </CardWrapper>
  )
}

/* ── 2. Material ─────────────────────────────────── */
export function TplMaterial({ s, img, t, editing, onChange }) {
  const pts = (s.points || []).slice(0, 3)
  return (
    <CardWrapper bg={t.bg}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ flex: '0 0 55%', overflow: 'hidden' }}>
          <ImgBox url={img} h={825} t={t} label="소재 클로즈업" autoH={false} editing={editing} onImgChange={v => onChange('secImg', v)} />
        </div>
        <div style={{ flex: 1, padding: '52px 64px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <EditText editing={editing} value={s.mainCopy} onChange={v => onChange('mainCopy', v)}
            style={{ fontSize: 40, fontWeight: 800, color: t.fg, lineHeight: 1.35, letterSpacing: '-0.02em', marginBottom: 14, wordBreak: 'keep-all' }} />
          <EditText editing={editing} value={s.subCopy} onChange={v => onChange('subCopy', v)}
            style={{ fontSize: 22, color: t.fg, opacity: 0.68, lineHeight: 1.7, marginBottom: 36 }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {pts.map((p, i) => (
              <div key={i} style={{ display: 'flex', gap: 18, padding: '18px 22px', background: t.sub, borderRadius: 10, border: `1px solid ${t.bd}`, alignItems: 'flex-start' }}>
                <span style={{ width: 32, height: 32, borderRadius: '50%', background: t.ac, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.bg, fontSize: 15, fontWeight: 800, flexShrink: 0, marginTop: 2 }}>{i + 1}</span>
                {editing ? <input value={p} onChange={e => { const n = [...(s.points || [])]; n[i] = e.target.value; onChange('points', n) }} style={{ flex: 1, fontSize: 18, border: '1px solid #3b82f6', borderRadius: 6, padding: '6px 10px', outline: 'none' }} />
                  : <span style={{ fontSize: 20, color: t.fg, lineHeight: 1.65, opacity: 0.9 }}>{p}</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </CardWrapper>
  )
}

/* ── 3. Detail 2col ──────────────────────────────── */
export function TplDetail2col({ s, img, t, editing, onChange }) {
  const pts = (s.points || []).slice(0, 3)
  return (
    <CardWrapper bg={t.bg}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', height: '100%' }}>
        <div style={{ overflow: 'hidden' }}>
          <ImgBox url={img} h={1500} t={t} label="디테일 클로즈업" autoH={false} editing={editing} onImgChange={v => onChange('secImg', v)} />
        </div>
        <div style={{ padding: '80px 56px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <EditText editing={editing} value={s.mainCopy} onChange={v => onChange('mainCopy', v)}
            style={{ fontSize: 38, fontWeight: 800, color: t.fg, lineHeight: 1.35, letterSpacing: '-0.02em', marginBottom: 16, wordBreak: 'keep-all' }} />
          <EditText editing={editing} value={s.subCopy} onChange={v => onChange('subCopy', v)}
            style={{ fontSize: 20, color: t.fg, opacity: 0.68, lineHeight: 1.65, marginBottom: 40 }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {pts.map((p, i) => (
              <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <span style={{ color: t.ac, fontSize: 22, flexShrink: 0, marginTop: 2, fontWeight: 700 }}>{autoIcon(i)}</span>
                {editing ? <input value={p} onChange={e => { const n = [...(s.points || [])]; n[i] = e.target.value; onChange('points', n) }} style={{ flex: 1, fontSize: 17, border: '1px solid #3b82f6', borderRadius: 6, padding: '6px 10px', outline: 'none' }} />
                  : <span style={{ fontSize: 19, color: t.fg, lineHeight: 1.65, opacity: 0.87 }}>{p}</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </CardWrapper>
  )
}

/* ── 4. Scene ────────────────────────────────────── */
export function TplScene({ s, img, t, editing, onChange }) {
  return (
    <CardWrapper bg={t.bg}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ flex: '0 0 70%', position: 'relative', overflow: 'hidden' }}>
          <ImgBox url={img} h={1050} t={t} label="라이프스타일 장면" autoH={false} editing={editing} onImgChange={v => onChange('secImg', v)} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent,rgba(0,0,0,0.65))', padding: '60px 64px 48px', pointerEvents: 'none' }}>
            <div style={{ fontSize: 40, fontWeight: 800, color: '#fff', lineHeight: 1.3, wordBreak: 'keep-all' }}>{s.mainCopy}</div>
          </div>
        </div>
        <div style={{ flex: 1, padding: '52px 64px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {editing ? (
            <>
              <input value={s.mainCopy || ''} onChange={e => onChange('mainCopy', e.target.value)} placeholder="메인 카피 (이미지 위에 표시)" style={{ width: '100%', fontSize: 18, border: '1px solid #3b82f6', borderRadius: 7, padding: '10px 14px', outline: 'none', marginBottom: 10 }} />
              <input value={s.subCopy || ''} onChange={e => onChange('subCopy', e.target.value)} placeholder="서브 카피" style={{ width: '100%', fontSize: 17, border: '1px solid #3b82f6', borderRadius: 7, padding: '10px 14px', outline: 'none' }} />
            </>
          ) : s.subCopy ? <p style={{ fontSize: 22, color: t.fg, opacity: 0.72, lineHeight: 1.75, margin: 0 }}>{s.subCopy}</p> : null}
        </div>
      </div>
    </CardWrapper>
  )
}

/* ── 5. Compare ──────────────────────────────────── */
export function TplCompare({ s, img, t, editing, onChange }) {
  const pts = (s.points || []).slice(0, 4)
  return (
    <CardWrapper bg={t.bg}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '80px 64px' }}>
        <EditText editing={editing} value={s.mainCopy} onChange={v => onChange('mainCopy', v)}
          style={{ fontSize: 42, fontWeight: 800, color: t.fg, lineHeight: 1.3, letterSpacing: '-0.02em', marginBottom: 14, wordBreak: 'keep-all' }} />
        <EditText editing={editing} value={s.subCopy} onChange={v => onChange('subCopy', v)}
          style={{ fontSize: 22, color: t.fg, opacity: 0.65, marginBottom: 48, lineHeight: 1.65 }} />
        <div style={{ border: `1.5px solid ${t.bd}`, borderRadius: 14, overflow: 'hidden', marginBottom: 40 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: t.sub }}>
            <div style={{ padding: '20px 28px', fontSize: 18, fontWeight: 700, color: '#888', textAlign: 'center', borderRight: `1px solid ${t.bd}`, borderBottom: `1px solid ${t.bd}` }}>일반 제품</div>
            <div style={{ padding: '20px 28px', fontSize: 18, fontWeight: 700, color: t.ac, textAlign: 'center', borderBottom: `1px solid ${t.bd}` }}>이 제품</div>
          </div>
          {pts.map((p, i) => {
            const [a, ...r] = p.split('/'); const b = r.join('/').trim()
            return editing ? (
              <div key={i} style={{ padding: '12px 16px', borderBottom: i < pts.length - 1 ? `1px solid ${t.bd}` : 'none' }}>
                <input value={p} onChange={e => { const n = [...(s.points || [])]; n[i] = e.target.value; onChange('points', n) }}
                  placeholder="일반제품 내용 / 이제품 내용" style={{ width: '100%', fontSize: 16, border: '1px solid #3b82f6', borderRadius: 6, padding: '7px 10px', outline: 'none' }} />
              </div>
            ) : (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: i % 2 === 0 ? t.bg : t.sub }}>
                <div style={{ padding: '20px 28px', fontSize: 18, color: '#888', textAlign: 'center', borderRight: `1px solid ${t.bd}`, borderBottom: i < pts.length - 1 ? `1px solid ${t.bd}` : 'none', textDecoration: 'line-through', opacity: 0.7 }}>{a.replace(/일반제품:/i, '').trim()}</div>
                <div style={{ padding: '20px 28px', fontSize: 18, color: t.ac, fontWeight: 600, textAlign: 'center', borderBottom: i < pts.length - 1 ? `1px solid ${t.bd}` : 'none' }}>{b || '—'}</div>
              </div>
            )
          })}
        </div>
        {(img || editing) && <div style={{ flex: 1, borderRadius: 14, overflow: 'hidden', minHeight: 0 }}><ImgBox url={img} h={400} t={t} label="비교 이미지" autoH={false} editing={editing} onImgChange={v => onChange('secImg', v)} /></div>}
      </div>
    </CardWrapper>
  )
}

/* ── 6. Points3 ──────────────────────────────────── */
export function TplPoints3({ s, img, t, editing, onChange }) {
  const pts = (s.points || []).slice(0, 3)
  return (
    <CardWrapper bg={t.bg}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '80px 64px' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <EditText editing={editing} value={s.mainCopy} onChange={v => onChange('mainCopy', v)}
            style={{ fontSize: 42, fontWeight: 800, color: t.fg, lineHeight: 1.35, letterSpacing: '-0.02em', marginBottom: 14, wordBreak: 'keep-all' }} />
          <EditText editing={editing} value={s.subCopy} onChange={v => onChange('subCopy', v)}
            style={{ fontSize: 22, color: t.fg, opacity: 0.65, lineHeight: 1.7 }} />
        </div>
        {(img || editing) && (
          <div style={{ flex: '0 0 38%', borderRadius: 16, overflow: 'hidden', marginBottom: 48, border: `1px solid ${t.bd}` }}>
            <ImgBox url={img} h={450} t={t} label="포인트 이미지" autoH={false} editing={editing} onImgChange={v => onChange('secImg', v)} />
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24, flex: 1 }}>
          {(pts.length ? pts : ['포인트 1', '포인트 2', '포인트 3']).map((p, i) => (
            <div key={i} style={{ background: t.sub, borderRadius: 16, padding: '40px 28px', textAlign: 'center', border: `1px solid ${t.bd}`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: t.ac, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.bg, fontSize: 26, fontWeight: 800 }}>{autoIcon(i)}</div>
              {editing ? <input value={p} onChange={e => { const n = [...(s.points || [])]; n[i] = e.target.value; onChange('points', n) }} style={{ width: '100%', fontSize: 16, border: '1px solid #3b82f6', borderRadius: 6, padding: '7px 10px', textAlign: 'center', outline: 'none' }} />
                : <p style={{ fontSize: 19, color: t.fg, lineHeight: 1.65, margin: 0, opacity: 0.9, wordBreak: 'keep-all' }}>{p}</p>}
            </div>
          ))}
        </div>
      </div>
    </CardWrapper>
  )
}

/* ── 7. Target ───────────────────────────────────── */
export function TplTarget({ s, img, t, editing, onChange }) {
  const pts = (s.points || []).slice(0, 4)
  return (
    <CardWrapper bg={t.bg}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '80px 64px' }}>
        <EditText editing={editing} value={s.mainCopy} onChange={v => onChange('mainCopy', v)}
          style={{ fontSize: 42, fontWeight: 800, color: t.fg, lineHeight: 1.35, letterSpacing: '-0.02em', marginBottom: 14, wordBreak: 'keep-all' }} />
        <EditText editing={editing} value={s.subCopy} onChange={v => onChange('subCopy', v)}
          style={{ fontSize: 22, color: t.fg, opacity: 0.65, marginBottom: 48, lineHeight: 1.65 }} />
        <div style={{ border: `1.5px solid ${t.bd}`, borderRadius: 14, overflow: 'hidden', marginBottom: 48, flex: '0 0 auto' }}>
          {(pts.length ? pts : ['추천 대상 1', '추천 대상 2', '추천 대상 3']).map((p, i, a) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '24px 28px', background: i % 2 === 0 ? t.bg : t.sub, borderBottom: i < a.length - 1 ? `1px solid ${t.bd}` : 'none' }}>
              <span style={{ width: 36, height: 36, borderRadius: '50%', background: t.ac, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.bg, fontSize: 16, fontWeight: 700, flexShrink: 0 }}>✓</span>
              {editing ? <input value={p} onChange={e => { const n = [...(s.points || [])]; n[i] = e.target.value; onChange('points', n) }} style={{ flex: 1, fontSize: 18, border: '1px solid #3b82f6', borderRadius: 6, padding: '7px 10px', outline: 'none' }} />
                : <span style={{ fontSize: 20, color: t.fg, lineHeight: 1.6, opacity: 0.9 }}>{p.replace(/이런 분께 추천\d*:/i, '').trim()}</span>}
            </div>
          ))}
        </div>
        {(img || editing) && <div style={{ flex: 1, borderRadius: 14, overflow: 'hidden', minHeight: 0 }}><ImgBox url={img} h={400} t={t} label="추천 이미지" autoH={false} editing={editing} onImgChange={v => onChange('secImg', v)} /></div>}
      </div>
    </CardWrapper>
  )
}

/* ── 8. CTA ──────────────────────────────────────── */
export function TplCTA({ s, img, t, editing, onChange }) {
  return (
    <CardWrapper bg={t.bg}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ flex: '0 0 55%', overflow: 'hidden', position: 'relative' }}>
          <ImgBox url={img} h={825} t={t} label="배경 이미지 (선택)" autoH={false} editing={editing} onImgChange={v => onChange('secImg', v)} />
          {img && <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(transparent 50%,${t.bg})`, pointerEvents: 'none' }} />}
        </div>
        <div style={{ flex: 1, padding: '64px 80px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <EditText editing={editing} value={s.mainCopy} onChange={v => onChange('mainCopy', v)}
            style={{ fontSize: 44, fontWeight: 800, color: t.fg, lineHeight: 1.3, letterSpacing: '-0.025em', marginBottom: 18, wordBreak: 'keep-all' }} />
          <EditText editing={editing} value={s.subCopy} onChange={v => onChange('subCopy', v)}
            style={{ fontSize: 22, color: t.fg, opacity: 0.65, marginBottom: 52, lineHeight: 1.7 }} />
          {editing
            ? <input value={s.cta || ''} onChange={e => onChange('cta', e.target.value)} placeholder="버튼 문구" style={{ fontSize: 20, fontWeight: 700, padding: '18px 52px', border: '2px solid #3b82f6', borderRadius: 6, outline: 'none', background: t.ac, color: t.bg, textAlign: 'center' }} />
            : s.cta && <div style={{ display: 'inline-block', background: t.ac, color: t.bg, fontSize: 22, fontWeight: 700, padding: '22px 72px', borderRadius: 6 }}>{s.cta}</div>
          }
        </div>
      </div>
    </CardWrapper>
  )
}

export const TPL = { hero: TplHero, material: TplMaterial, detail2col: TplDetail2col, scene: TplScene, compare: TplCompare, points3: TplPoints3, target: TplTarget, cta: TplCTA }
