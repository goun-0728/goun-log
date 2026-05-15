// src/components/SectionTemplates.jsx
import React, { useRef } from 'react'
import { AUTO_ICONS } from '../constants'

export const autoIcon = i => AUTO_ICONS[i % AUTO_ICONS.length]

const CARD_W = 860

/* ── CardWrapper: 860px 고정폭, 높이 콘텐츠에 맞게 auto ── */
export function CardWrapper({ children, bg = '#fff' }) {
  return (
    <div style={{ width: CARD_W, background: bg, overflow: 'hidden', position: 'relative' }}>
      {children}
    </div>
  )
}

/* ── EditText: 인라인 편집 ─────────────────────────── */
export function EditText({ value, onChange, editing, style }) {
  if (!editing) return <div style={style}>{value || ''}</div>
  return (
    <div contentEditable suppressContentEditableWarning
      onBlur={e => onChange(e.currentTarget.innerText.trim())}
      style={{ ...style, outline: 'none', borderBottom: '2px solid #3b82f6', cursor: 'text', minWidth: 40 }}
      dangerouslySetInnerHTML={{ __html: value || '' }}
    />
  )
}

/* ── ImgBox: 클릭 업로드, null=숨김, 'slot'=빈박스 ─── */
export function ImgBox({ url, t, label, editing = false, onImgChange, minH = 320 }) {
  const ref = useRef(null)
  const handleFile = e => {
    const f = e.target.files[0]; if (!f || !onImgChange) return
    const fr = new FileReader()
    fr.onload = ev => onImgChange(ev.target.result)
    fr.readAsDataURL(f); e.target.value = ''
  }
  if (!url) return null
  if (url === 'slot') {
    return (
      <div onClick={() => ref.current?.click()}
        style={{ minHeight: minH, background: t.sub, border: `2px dashed ${t.bd}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer' }}>
        <input ref={ref} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
        <span style={{ fontSize: 36, opacity: 0.2 }}>📷</span>
        <span style={{ fontSize: 15, color: t.fg, opacity: 0.45, fontWeight: 500 }}>클릭하여 사진 업로드</span>
        <span style={{ fontSize: 12, color: t.fg, opacity: 0.3 }}>{label}</span>
      </div>
    )
  }
  return (
    <div style={{ position: 'relative' }} onClick={() => editing && ref.current?.click()}>
      <input ref={ref} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
      <img src={url} alt="" style={{ width: '100%', height: 'auto', display: 'block' }} />
      {editing && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .2s', cursor: 'pointer' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.3)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0)'}>
          <span style={{ color: '#fff', fontSize: 14, fontWeight: 600, background: 'rgba(0,0,0,0.55)', padding: '8px 18px', borderRadius: 8, pointerEvents: 'none' }}>📷 사진 교체</span>
        </div>
      )}
    </div>
  )
}

/* ── PointInput: textarea로 줄바꿈 지원 ──────────────
   엔터 입력하면 줄바꿈, 실제 표시도 줄바꿈 유지
─────────────────────────────────────────────────── */
function PointInput({ value, onChange, placeholder }) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder || '텍스트 입력 (엔터로 줄바꿈)'}
      rows={Math.max(2, (value || '').split('\n').length)}
      style={{
        flex: 1, fontSize: 16, border: '1px solid #3b82f6', borderRadius: 6,
        padding: '8px 10px', outline: 'none', resize: 'vertical',
        fontFamily: 'inherit', lineHeight: 1.65, width: '100%',
      }}
    />
  )
}

/* ── PointList: 공통 포인트 리스트 ─────────────────── */
function PointList({ pts, t, editing, onChange, s, numbered = false }) {
  if (!pts.length && !editing) return null
  const items = pts.length ? pts : (editing ? [''] : [])
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 28 }}>
      {items.map((p, i) => (
        <div key={i} style={{ display: 'flex', gap: 16, padding: '16px 20px', background: t.sub, borderRadius: 10, border: `1px solid ${t.bd}`, alignItems: 'flex-start' }}>
          {numbered
            ? <span style={{ width: 28, height: 28, borderRadius: '50%', background: t.ac, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.bg, fontSize: 14, fontWeight: 800, flexShrink: 0, marginTop: 4 }}>{i + 1}</span>
            : <span style={{ color: t.ac, fontSize: 20, flexShrink: 0, marginTop: 2, fontWeight: 700 }}>{autoIcon(i)}</span>
          }
          {editing
            ? <PointInput value={p} onChange={v => { const n = [...(s.points || [])]; n[i] = v; onChange('points', n) }} />
            : <span style={{ fontSize: 18, color: t.fg, lineHeight: 1.65, opacity: 0.9, whiteSpace: 'pre-wrap' }}>{p}</span>
          }
        </div>
      ))}
    </div>
  )
}

/* ── ImgSlots: 이미지 슬롯 묶음 (추가/제거 포함) ─────
   슬롯 키 배열을 받아서 렌더링, 없으면 null
─────────────────────────────────────────────────── */
function ImgSlots({ s, t, editing, onChange, slotKeys, labels, gap = 0, padding }) {
  const hasAny = slotKeys.some(k => s[k] && s[k] !== null)
  const showAll = editing || hasAny
  if (!showAll) return null
  return (
    <div style={{ padding: padding || 0 }}>
      {slotKeys.map((k, i) => {
        const url = s[k] || (editing ? 'slot' : null)
        if (!url && !editing) return null
        return (
          <div key={k} style={{ marginTop: i > 0 && gap ? gap : 0 }}>
            <ImgBox url={url} t={t} label={labels[i]} editing={editing} onImgChange={v => onChange(k, v)} />
          </div>
        )
      })}
    </div>
  )
}

/* ════════════════════════════════════════════════════
   8가지 템플릿
════════════════════════════════════════════════════ */

/* ── 1. Hero ─────────────────────────────────────── */
export function TplHero({ s, img, t, editing, onChange }) {
  const pts = (s.points || []).slice(0, 3)
  return (
    <CardWrapper bg="#e1dee3">
      <div style={{ fontFamily: "'Noto Serif KR','Noto Sans KR',serif" }}>
        <div style={{ padding: '72px 80px 48px', textAlign: 'center' }}>
          <EditText editing={editing} value={s.mainCopy} onChange={v => onChange('mainCopy', v)}
            style={{ fontSize: 52, fontWeight: 800, color: '#231815', lineHeight: 1.25, letterSpacing: '-0.02em', marginBottom: 18, wordBreak: 'keep-all' }} />
          <EditText editing={editing} value={s.subCopy} onChange={v => onChange('subCopy', v)}
            style={{ fontSize: 26, fontWeight: 500, color: '#231815', opacity: 0.72, lineHeight: 1.5, wordBreak: 'keep-all' }} />
        </div>
        <div style={{ margin: '0 40px' }}>
          <ImgBox url={img} t={t} label="메인 제품 이미지" editing={editing} onImgChange={v => onChange('secImg', v)} />
        </div>
        {/* 이미지 2 */}
        {(s.secImg2) && (
          <div style={{ margin: '12px 40px 0' }}>
            <ImgBox url={s.secImg2} t={t} label="서브 이미지" editing={editing} onImgChange={v => onChange('secImg2', v)} />
          </div>
        )}
        <div style={{ position: 'relative', marginTop: 40 }}>
          <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '130%', height: '100%', background: '#fff', borderRadius: '50% 50% 0 0 / 12% 12% 0 0' }} />
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-around', padding: '72px 48px 72px' }}>
            {[0, 1, 2].map(i => {
              const raw = pts[i] || ''; const lines = raw.split('\n')
              const ptTitle = lines[0]?.trim() || `포인트 ${i + 1}`
              const ptDesc = lines.slice(1).join('\n').trim()
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', width: '28%', gap: 14 }}>
                  <div style={{ width: 100, height: 100, borderRadius: '50%', background: '#f8b62d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34, boxShadow: '0 6px 20px rgba(248,182,45,0.4)', flexShrink: 0 }}>{autoIcon(i)}</div>
                  {editing
                    ? <PointInput value={raw} onChange={v => { const n = [...(s.points || [])]; n[i] = v; onChange('points', n) }} placeholder="제목&#10;설명(엔터로 구분)" />
                    : <>
                        <p style={{ fontSize: 19, fontWeight: 700, color: '#231815', margin: 0, lineHeight: 1.3, wordBreak: 'keep-all' }}>{ptTitle}</p>
                        {ptDesc && <p style={{ fontSize: 15, fontWeight: 400, color: '#231815', opacity: 0.6, margin: 0, lineHeight: 1.4, wordBreak: 'keep-all', whiteSpace: 'pre-wrap' }}>{ptDesc}</p>}
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
      <ImgBox url={img} t={t} label="소재 이미지 1" editing={editing} onImgChange={v => onChange('secImg', v)} />
      {s.secImg2 && <ImgBox url={s.secImg2} t={t} label="소재 이미지 2" editing={editing} onImgChange={v => onChange('secImg2', v)} />}
      <div style={{ padding: '52px 64px' }}>
        <EditText editing={editing} value={s.mainCopy} onChange={v => onChange('mainCopy', v)}
          style={{ fontSize: 40, fontWeight: 800, color: t.fg, lineHeight: 1.35, letterSpacing: '-0.02em', marginBottom: 14, wordBreak: 'keep-all' }} />
        <EditText editing={editing} value={s.subCopy} onChange={v => onChange('subCopy', v)}
          style={{ fontSize: 22, color: t.fg, opacity: 0.68, lineHeight: 1.7 }} />
        <PointList pts={(s.points||[]).slice(0,4)} t={t} editing={editing} onChange={onChange} s={s} numbered />
      </div>
    </CardWrapper>
  )
}

/* ── 3. Detail 2col ──────────────────────────────── */
/* 이미지 최대 4장: 2열로 배치, 추가/제거 */
export function TplDetail2col({ s, img, t, editing, onChange }) {
  // 이미지 슬롯: secImg(1), secImg2(2), secImg3(3), secImg4(4)
  const slots = [
    { k: 'secImg',  url: img           },
    { k: 'secImg2', url: s.secImg2     },
    { k: 'secImg3', url: s.secImg3     },
    { k: 'secImg4', url: s.secImg4     },
  ]
  // 활성 슬롯 (이미지 있거나 editing)
  const active = slots.filter(sl => sl.url || editing)

  return (
    <CardWrapper bg={t.bg}>
      {/* 이미지 그리드 (2열) */}
      {active.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: active.length === 1 ? '1fr' : '1fr 1fr', gap: 4 }}>
          {active.map(({ k, url }, i) => (
            <div key={k} style={{ overflow: 'hidden', background: t.sub }}>
              <ImgBox url={url || (editing ? 'slot' : null)} t={t} label={`이미지 ${i+1}`} editing={editing} onImgChange={v => onChange(k, v)} minH={400} />
            </div>
          ))}
        </div>
      )}
      {/* 텍스트 & 포인트 */}
      <div style={{ padding: '52px 64px' }}>
        <EditText editing={editing} value={s.mainCopy} onChange={v => onChange('mainCopy', v)}
          style={{ fontSize: 36, fontWeight: 800, color: t.fg, lineHeight: 1.35, letterSpacing: '-0.02em', marginBottom: 14, wordBreak: 'keep-all' }} />
        <EditText editing={editing} value={s.subCopy} onChange={v => onChange('subCopy', v)}
          style={{ fontSize: 19, color: t.fg, opacity: 0.68, lineHeight: 1.65 }} />
        <PointList pts={(s.points||[]).slice(0,4)} t={t} editing={editing} onChange={onChange} s={s} />
      </div>
    </CardWrapper>
  )
}

/* ── 4. Scene (사용 장면) ────────────────────────── */
export function TplScene({ s, img, t, editing, onChange }) {
  return (
    <CardWrapper bg={t.bg}>
      <div style={{ position: 'relative' }}>
        <ImgBox url={img} t={t} label="라이프스타일 이미지 1" editing={editing} onImgChange={v => onChange('secImg', v)} />
        {(img && img !== 'slot') && (
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent,rgba(0,0,0,0.62))', padding: '60px 64px 48px', pointerEvents: 'none' }}>
            <div style={{ fontSize: 40, fontWeight: 800, color: '#fff', lineHeight: 1.3, wordBreak: 'keep-all' }}>{s.mainCopy}</div>
          </div>
        )}
      </div>
      {s.secImg2 && <ImgBox url={s.secImg2} t={t} label="이미지 2" editing={editing} onImgChange={v => onChange('secImg2', v)} />}
      <div style={{ padding: '48px 64px' }}>
        {editing && (
          <input value={s.mainCopy || ''} onChange={e => onChange('mainCopy', e.target.value)}
            placeholder="메인 카피 (이미지 위에 표시)" style={{ width: '100%', fontSize: 18, border: '1px solid #3b82f6', borderRadius: 7, padding: '10px 14px', outline: 'none', marginBottom: 12, fontFamily: 'inherit' }} />
        )}
        <EditText editing={editing} value={s.subCopy} onChange={v => onChange('subCopy', v)}
          style={{ fontSize: 22, color: t.fg, opacity: 0.72, lineHeight: 1.75 }} />
        <PointList pts={(s.points||[]).slice(0,4)} t={t} editing={editing} onChange={onChange} s={s} />
      </div>
    </CardWrapper>
  )
}

/* ── 5. Compare (비교) ───────────────────────────── */
export function TplCompare({ s, img, t, editing, onChange }) {
  const pts = (s.points || []).slice(0, 5)
  return (
    <CardWrapper bg={t.bg}>
      <div style={{ padding: '72px 64px 48px' }}>
        <EditText editing={editing} value={s.mainCopy} onChange={v => onChange('mainCopy', v)}
          style={{ fontSize: 42, fontWeight: 800, color: t.fg, lineHeight: 1.3, letterSpacing: '-0.02em', marginBottom: 14, wordBreak: 'keep-all' }} />
        <EditText editing={editing} value={s.subCopy} onChange={v => onChange('subCopy', v)}
          style={{ fontSize: 22, color: t.fg, opacity: 0.65, marginBottom: 40, lineHeight: 1.65 }} />
        <div style={{ border: `1.5px solid ${t.bd}`, borderRadius: 14, overflow: 'hidden', marginBottom: 0 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: t.sub }}>
            <div style={{ padding: '18px 24px', fontSize: 17, fontWeight: 700, color: '#888', textAlign: 'center', borderRight: `1px solid ${t.bd}`, borderBottom: `1px solid ${t.bd}` }}>일반 제품</div>
            <div style={{ padding: '18px 24px', fontSize: 17, fontWeight: 700, color: t.ac, textAlign: 'center', borderBottom: `1px solid ${t.bd}` }}>이 제품</div>
          </div>
          {pts.map((p, i) => {
            const [a, ...r] = p.split('/'); const b = r.join('/').trim()
            return editing ? (
              <div key={i} style={{ padding: '10px 14px', borderBottom: i < pts.length - 1 ? `1px solid ${t.bd}` : 'none' }}>
                <input value={p} onChange={e => { const n = [...(s.points || [])]; n[i] = e.target.value; onChange('points', n) }}
                  placeholder="일반제품 내용 / 이제품 내용" style={{ width: '100%', fontSize: 16, border: '1px solid #3b82f6', borderRadius: 6, padding: '7px 10px', outline: 'none', fontFamily: 'inherit' }} />
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
      <ImgBox url={img} t={t} label="비교 이미지 1" editing={editing} onImgChange={v => onChange('secImg', v)} />
      {s.secImg2 && <ImgBox url={s.secImg2} t={t} label="비교 이미지 2" editing={editing} onImgChange={v => onChange('secImg2', v)} />}
    </CardWrapper>
  )
}

/* ── 6. Points3 (포인트 3단) ─────────────────────── */
export function TplPoints3({ s, img, t, editing, onChange }) {
  const pts = (s.points || []).slice(0, 3)
  const hasImg = img && img !== 'slot'
  const hasImg2 = s.secImg2 && s.secImg2 !== 'slot'
  return (
    <CardWrapper bg={t.bg}>
      <div style={{ padding: '72px 64px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <EditText editing={editing} value={s.mainCopy} onChange={v => onChange('mainCopy', v)}
            style={{ fontSize: 42, fontWeight: 800, color: t.fg, lineHeight: 1.35, letterSpacing: '-0.02em', marginBottom: 14, wordBreak: 'keep-all' }} />
          <EditText editing={editing} value={s.subCopy} onChange={v => onChange('subCopy', v)}
            style={{ fontSize: 22, color: t.fg, opacity: 0.65, lineHeight: 1.7 }} />
        </div>

        {/* 3단 포인트 카드 — 이미지보다 위에 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, marginBottom: (hasImg || hasImg2 || editing) ? 48 : 0 }}>
          {(pts.length ? pts : (editing ? ['','',''] : [])).map((p, i) => {
            const lines = p.split('\n')
            const title = lines[0]?.trim() || `포인트 ${i+1}`
            const desc = lines.slice(1).join('\n').trim()
            return (
              <div key={i} style={{ background: t.sub, borderRadius: 14, padding: '36px 24px', textAlign: 'center', border: `1px solid ${t.bd}` }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: t.ac, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', color: t.bg, fontSize: 24, fontWeight: 800 }}>{autoIcon(i)}</div>
                {editing
                  ? <PointInput value={p} onChange={v => { const n = [...(s.points || [])]; n[i] = v; onChange('points', n) }} placeholder="제목&#10;설명(엔터로 줄바꿈)" />
                  : <>
                      <p style={{ fontSize: 18, fontWeight: 700, color: t.fg, lineHeight: 1.4, margin: '0 0 6px', opacity: 0.95, wordBreak: 'keep-all' }}>{title}</p>
                      {desc && <p style={{ fontSize: 15, color: t.fg, lineHeight: 1.6, margin: 0, opacity: 0.65, wordBreak: 'keep-all', whiteSpace: 'pre-wrap' }}>{desc}</p>}
                    </>
                }
              </div>
            )
          })}
        </div>

        {/* 이미지 — 포인트 카드 아래 */}
        <ImgBox url={img} t={t} label="이미지 1" editing={editing} onImgChange={v => onChange('secImg', v)} />
        {s.secImg2 && <div style={{ marginTop: 12 }}><ImgBox url={s.secImg2} t={t} label="이미지 2" editing={editing} onImgChange={v => onChange('secImg2', v)} /></div>}
      </div>
    </CardWrapper>
  )
}

/* ── 7. Target (추천 대상) ───────────────────────── */
export function TplTarget({ s, img, t, editing, onChange }) {
  const pts = (s.points || []).slice(0, 5)
  return (
    <CardWrapper bg={t.bg}>
      <ImgBox url={img} t={t} label="이미지 1" editing={editing} onImgChange={v => onChange('secImg', v)} />
      {s.secImg2 && <ImgBox url={s.secImg2} t={t} label="이미지 2" editing={editing} onImgChange={v => onChange('secImg2', v)} />}
      <div style={{ padding: '60px 64px' }}>
        <EditText editing={editing} value={s.mainCopy} onChange={v => onChange('mainCopy', v)}
          style={{ fontSize: 42, fontWeight: 800, color: t.fg, lineHeight: 1.35, letterSpacing: '-0.02em', marginBottom: 14, wordBreak: 'keep-all' }} />
        <EditText editing={editing} value={s.subCopy} onChange={v => onChange('subCopy', v)}
          style={{ fontSize: 22, color: t.fg, opacity: 0.65, marginBottom: 36, lineHeight: 1.65 }} />
        <div style={{ border: `1.5px solid ${t.bd}`, borderRadius: 14, overflow: 'hidden' }}>
          {(pts.length ? pts : (editing ? ['','',''] : [])).map((p, i, a) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 18, padding: '20px 26px', background: i % 2 === 0 ? t.bg : t.sub, borderBottom: i < a.length - 1 ? `1px solid ${t.bd}` : 'none' }}>
              <span style={{ width: 32, height: 32, borderRadius: '50%', background: t.ac, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.bg, fontSize: 15, fontWeight: 700, flexShrink: 0, marginTop: 2 }}>✓</span>
              {editing
                ? <PointInput value={p} onChange={v => { const n = [...(s.points || [])]; n[i] = v; onChange('points', n) }} />
                : <span style={{ fontSize: 20, color: t.fg, lineHeight: 1.65, opacity: 0.9, whiteSpace: 'pre-wrap' }}>{p.replace(/이런 분께 추천\d*:/i, '').trim()}</span>
              }
            </div>
          ))}
        </div>
      </div>
    </CardWrapper>
  )
}

/* ── 8. CTA ──────────────────────────────────────── */
export function TplCTA({ s, img, t, editing, onChange }) {
  return (
    <CardWrapper bg={t.bg}>
      <div style={{ position: 'relative' }}>
        <ImgBox url={img} t={t} label="CTA 이미지" editing={editing} onImgChange={v => onChange('secImg', v)} />
        {(img && img !== 'slot') && <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(transparent 40%,${t.bg})`, pointerEvents: 'none' }} />}
      </div>
      {s.secImg2 && <ImgBox url={s.secImg2} t={t} label="추가 이미지" editing={editing} onImgChange={v => onChange('secImg2', v)} />}
      <div style={{ padding: '56px 80px 72px', textAlign: 'center' }}>
        <EditText editing={editing} value={s.mainCopy} onChange={v => onChange('mainCopy', v)}
          style={{ fontSize: 44, fontWeight: 800, color: t.fg, lineHeight: 1.3, letterSpacing: '-0.025em', marginBottom: 18, wordBreak: 'keep-all' }} />
        <EditText editing={editing} value={s.subCopy} onChange={v => onChange('subCopy', v)}
          style={{ fontSize: 22, color: t.fg, opacity: 0.65, marginBottom: 48, lineHeight: 1.7 }} />
        {editing
          ? <input value={s.cta || ''} onChange={e => onChange('cta', e.target.value)} placeholder="버튼 문구"
              style={{ fontSize: 20, fontWeight: 700, padding: '18px 52px', border: '2px solid #3b82f6', borderRadius: 6, outline: 'none', background: t.ac, color: t.bg, textAlign: 'center', fontFamily: 'inherit' }} />
          : s.cta && <div style={{ display: 'inline-block', background: t.ac, color: t.bg, fontSize: 22, fontWeight: 700, padding: '22px 72px', borderRadius: 6 }}>{s.cta}</div>
        }
      </div>
    </CardWrapper>
  )
}

export const TPL = { hero: TplHero, material: TplMaterial, detail2col: TplDetail2col, scene: TplScene, compare: TplCompare, points3: TplPoints3, target: TplTarget, cta: TplCTA }
