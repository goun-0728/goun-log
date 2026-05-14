// src/components/SectionTemplates.jsx
import React from 'react'
import { AUTO_ICONS } from '../constants'

export const autoIcon = i => AUTO_ICONS[i % AUTO_ICONS.length]

// ── 공통 컴포넌트 ─────────────────────────────────
export function ImgBox({ url, h = 300, t, label, autoH = false }) {
  if (url) {
    if (autoH) return (
      <div style={{ overflow: 'hidden', background: t.sub }}>
        <img src={url} alt="" style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'contain' }} />
      </div>
    )
    return (
      <div style={{ height: h, overflow: 'hidden', background: t.sub }}>
        <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </div>
    )
  }
  return (
    <div style={{ height: h, background: t.sub, border: `1.5px dashed ${t.bd}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
      <span style={{ fontSize: 32, opacity: 0.2 }}>📷</span>
      <span style={{ fontSize: 13, color: t.fg, opacity: 0.35 }}>{label || '이미지 영역'}</span>
    </div>
  )
}

export function SLabel({ title, t }) {
  const clean = title?.replace(/^SECTION\s*\d+\s*[-–—]\s*/i, '').trim() || ''
  if (!clean) return null
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
      <div style={{ width: 4, height: 18, background: t.ac, borderRadius: 2 }} />
      <span style={{ fontSize: 13, fontWeight: 700, color: t.ac, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{clean}</span>
    </div>
  )
}

// ── 1. Hero ───────────────────────────────────────
export function TplHero({ s, img, t }) {
  const pts = (s.points || []).slice(0, 3)
  return (
    <div style={{ background: '#e1dee3', overflow: 'hidden', fontFamily: "'Noto Serif KR','Noto Sans KR',serif" }}>
      <div style={{ padding: '52px 64px 36px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 42, fontWeight: 800, color: '#231815', lineHeight: 1.25, letterSpacing: '-0.02em', margin: '0 0 14px', wordBreak: 'keep-all' }}>{s.mainCopy || '메인 카피'}</h2>
        <p style={{ fontSize: 22, fontWeight: 500, color: '#231815', opacity: 0.75, lineHeight: 1.5, margin: 0, wordBreak: 'keep-all' }}>{s.subCopy || '서브 카피'}</p>
      </div>
      <div style={{ margin: '0 32px', borderRadius: 16, overflow: 'hidden', background: 'rgba(0,0,0,0.06)', minHeight: 200 }}>
        {img
          ? <img src={img} alt="제품" style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'contain' }} />
          : <div style={{ height: 320, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, opacity: 0.3 }}>
              <span style={{ fontSize: 48 }}>📷</span>
              <span style={{ fontSize: 15, color: '#231815' }}>제품 이미지를 업로드하세요</span>
            </div>
        }
      </div>
      <div style={{ position: 'relative', marginTop: -60, paddingTop: 60, paddingBottom: 52 }}>
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '130%', height: '100%', background: '#fff', borderRadius: '50% 50% 0 0 / 30% 30% 0 0' }} />
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-around', padding: '0 32px' }}>
          {[0, 1, 2].map(i => {
            const raw = pts[i] || ''
            const parts = raw.split(':')
            const ptTitle = parts[0]?.trim() || `포인트 ${i + 1}`
            const ptDesc = parts.slice(1).join(':').trim() || ''
            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', width: '28%', gap: 10 }}>
                <div style={{ width: 88, height: 88, borderRadius: '50%', background: '#f8b62d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, boxShadow: '0 4px 16px rgba(248,182,45,0.35)' }}>
                  {autoIcon(i)}
                </div>
                <p style={{ fontSize: 16, fontWeight: 700, color: '#231815', margin: 0, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>{ptTitle}</p>
                {ptDesc && <p style={{ fontSize: 13, fontWeight: 400, color: '#231815', opacity: 0.6, margin: 0, lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>{ptDesc}</p>}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── 2. Material ───────────────────────────────────
export function TplMaterial({ s, img, t }) {
  const pts = (s.points || []).slice(0, 3)
  return (
    <div style={{ background: t.bg, paddingBottom: 52 }}>
      <ImgBox url={img} h={340} t={t} label="소재 클로즈업" autoH={!!img} />
      <div style={{ padding: '40px 52px 0' }}>
        <SLabel title={s.title} t={t} />
        <h2 style={{ fontSize: 32, fontWeight: 800, color: t.fg, lineHeight: 1.35, letterSpacing: '-0.02em', margin: '0 0 12px', wordBreak: 'keep-all' }}>{s.mainCopy || '소재 특징'}</h2>
        {s.subCopy && <p style={{ fontSize: 18, color: t.fg, opacity: 0.68, lineHeight: 1.7, margin: '0 0 28px' }}>{s.subCopy}</p>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {pts.map((p, i) => (
            <div key={i} style={{ display: 'flex', gap: 14, padding: '14px 18px', background: t.sub, borderRadius: 8, border: `1px solid ${t.bd}`, alignItems: 'flex-start' }}>
              <span style={{ width: 26, height: 26, borderRadius: '50%', background: t.ac, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.bg, fontSize: 13, fontWeight: 800, flexShrink: 0, marginTop: 1 }}>{i + 1}</span>
              <span style={{ fontSize: 16, color: t.fg, lineHeight: 1.65, opacity: 0.9 }}>{p}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── 3. Detail 2col ────────────────────────────────
export function TplDetail2col({ s, img, t }) {
  const pts = (s.points || []).slice(0, 3)
  return (
    <div style={{ background: t.bg, display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 400 }}>
      <div style={{ overflow: 'hidden', background: t.sub }}><ImgBox url={img} h={400} t={t} label="디테일 클로즈업" autoH={!!img} /></div>
      <div style={{ padding: '44px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <SLabel title={s.title} t={t} />
        <h2 style={{ fontSize: 28, fontWeight: 800, color: t.fg, lineHeight: 1.35, letterSpacing: '-0.02em', margin: '0 0 12px', wordBreak: 'keep-all' }}>{s.mainCopy || '특징'}</h2>
        {s.subCopy && <p style={{ fontSize: 16, color: t.fg, opacity: 0.68, lineHeight: 1.65, margin: '0 0 20px' }}>{s.subCopy}</p>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {pts.map((p, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ color: t.ac, fontSize: 16, flexShrink: 0, marginTop: 2, fontWeight: 700 }}>{autoIcon(i)}</span>
              <span style={{ fontSize: 15, color: t.fg, lineHeight: 1.65, opacity: 0.87 }}>{p}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── 4. Scene ──────────────────────────────────────
export function TplScene({ s, img, t }) {
  return (
    <div style={{ background: t.bg, paddingBottom: 44 }}>
      <div style={{ position: 'relative' }}>
        <ImgBox url={img} h={440} t={t} label="라이프스타일 장면" autoH={!!img} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent,rgba(0,0,0,0.58))', padding: '36px 48px 32px' }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.75)', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 10px' }}>{s.title}</p>
          <h2 style={{ fontSize: 30, fontWeight: 800, color: '#fff', lineHeight: 1.3, margin: 0, wordBreak: 'keep-all' }}>{s.mainCopy || '사용 장면'}</h2>
        </div>
      </div>
      {s.subCopy && <div style={{ padding: '28px 52px 0' }}><p style={{ fontSize: 18, color: t.fg, opacity: 0.72, lineHeight: 1.75, margin: 0 }}>{s.subCopy}</p></div>}
    </div>
  )
}

// ── 5. Compare ────────────────────────────────────
export function TplCompare({ s, img, t }) {
  const pts = (s.points || []).slice(0, 4)
  return (
    <div style={{ background: t.bg, padding: '52px 52px 56px' }}>
      <SLabel title={s.title} t={t} />
      <h2 style={{ fontSize: 30, fontWeight: 800, color: t.fg, lineHeight: 1.3, letterSpacing: '-0.02em', margin: '0 0 10px', wordBreak: 'keep-all' }}>{s.mainCopy || '비교'}</h2>
      {s.subCopy && <p style={{ fontSize: 17, color: t.fg, opacity: 0.65, margin: '0 0 28px', lineHeight: 1.65 }}>{s.subCopy}</p>}
      <div style={{ border: `1.5px solid ${t.bd}`, borderRadius: 10, overflow: 'hidden', marginBottom: img ? 28 : 0 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: t.sub }}>
          <div style={{ padding: '14px 20px', fontSize: 14, fontWeight: 700, color: '#888', textAlign: 'center', borderRight: `1px solid ${t.bd}`, borderBottom: `1px solid ${t.bd}` }}>일반 제품</div>
          <div style={{ padding: '14px 20px', fontSize: 14, fontWeight: 700, color: t.ac, textAlign: 'center', borderBottom: `1px solid ${t.bd}` }}>이 제품</div>
        </div>
        {pts.map((p, i) => {
          const [a, ...r] = p.split('/'); const b = r.join('/').trim()
          return (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: i % 2 === 0 ? t.bg : t.sub }}>
              <div style={{ padding: '14px 20px', fontSize: 15, color: '#888', textAlign: 'center', borderRight: `1px solid ${t.bd}`, borderBottom: i < pts.length - 1 ? `1px solid ${t.bd}` : 'none', textDecoration: 'line-through', opacity: 0.7 }}>{a.replace(/일반제품:/i, '').trim()}</div>
              <div style={{ padding: '14px 20px', fontSize: 15, color: t.ac, fontWeight: 600, textAlign: 'center', borderBottom: i < pts.length - 1 ? `1px solid ${t.bd}` : 'none' }}>{b || '—'}</div>
            </div>
          )
        })}
      </div>
      {img && <div style={{ height: 220, borderRadius: 8, overflow: 'hidden', border: `1px solid ${t.bd}` }}><img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>}
    </div>
  )
}

// ── 6. Points3 ────────────────────────────────────
export function TplPoints3({ s, img, t }) {
  const pts = (s.points || []).slice(0, 3)
  return (
    <div style={{ background: t.bg, padding: '52px 44px 56px' }}>
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <SLabel title={s.title} t={t} />
        <h2 style={{ fontSize: 30, fontWeight: 800, color: t.fg, lineHeight: 1.35, letterSpacing: '-0.02em', margin: '0 0 10px', wordBreak: 'keep-all' }}>{s.mainCopy || '핵심 포인트'}</h2>
        {s.subCopy && <p style={{ fontSize: 17, color: t.fg, opacity: 0.65, lineHeight: 1.7, margin: 0 }}>{s.subCopy}</p>}
      </div>
      {img && <div style={{ borderRadius: 10, overflow: 'hidden', marginBottom: 32, border: `1px solid ${t.bd}` }}><img src={img} alt="" style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'contain' }} /></div>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
        {(pts.length ? pts : ['포인트 1', '포인트 2', '포인트 3']).map((p, i) => (
          <div key={i} style={{ background: t.sub, borderRadius: 10, padding: '28px 20px', textAlign: 'center', border: `1px solid ${t.bd}` }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: t.ac, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: t.bg, fontSize: 20, fontWeight: 800 }}>{autoIcon(i)}</div>
            <p style={{ fontSize: 15, color: t.fg, lineHeight: 1.65, margin: 0, opacity: 0.9, wordBreak: 'keep-all' }}>{p}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── 7. Target ─────────────────────────────────────
export function TplTarget({ s, img, t }) {
  const pts = (s.points || []).slice(0, 4)
  return (
    <div style={{ background: t.bg, padding: '52px 52px 56px' }}>
      <SLabel title={s.title} t={t} />
      <h2 style={{ fontSize: 30, fontWeight: 800, color: t.fg, lineHeight: 1.35, letterSpacing: '-0.02em', margin: '0 0 10px', wordBreak: 'keep-all' }}>{s.mainCopy || '이런 분께 추천'}</h2>
      {s.subCopy && <p style={{ fontSize: 17, color: t.fg, opacity: 0.65, margin: '0 0 28px', lineHeight: 1.65 }}>{s.subCopy}</p>}
      <div style={{ border: `1.5px solid ${t.bd}`, borderRadius: 10, overflow: 'hidden', marginBottom: img ? 28 : 0 }}>
        {(pts.length ? pts : ['추천 대상 1', '추천 대상 2', '추천 대상 3']).map((p, i, a) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 22px', background: i % 2 === 0 ? t.bg : t.sub, borderBottom: i < a.length - 1 ? `1px solid ${t.bd}` : 'none' }}>
            <span style={{ width: 26, height: 26, borderRadius: '50%', background: t.ac, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.bg, fontSize: 13, fontWeight: 700, flexShrink: 0 }}>✓</span>
            <span style={{ fontSize: 16, color: t.fg, lineHeight: 1.6, opacity: 0.9 }}>{p.replace(/이런 분께 추천\d*:/i, '').trim()}</span>
          </div>
        ))}
      </div>
      {img && <div style={{ borderRadius: 8, overflow: 'hidden', border: `1px solid ${t.bd}` }}><img src={img} alt="" style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'contain' }} /></div>}
    </div>
  )
}

// ── 8. CTA ────────────────────────────────────────
export function TplCTA({ s, img, t }) {
  return (
    <div style={{ background: t.bg }}>
      {img && (
        <div style={{ overflow: 'hidden', position: 'relative' }}>
          <img src={img} alt="" style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'contain' }} />
          <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(transparent 50%,${t.bg})` }} />
        </div>
      )}
      <div style={{ padding: '52px 52px 64px', textAlign: 'center' }}>
        <SLabel title={s.title} t={t} />
        <h2 style={{ fontSize: 32, fontWeight: 800, color: t.fg, lineHeight: 1.3, letterSpacing: '-0.025em', margin: '0 0 14px', wordBreak: 'keep-all' }}>{s.mainCopy || '지금 시작하세요'}</h2>
        {s.subCopy && <p style={{ fontSize: 18, color: t.fg, opacity: 0.65, margin: '0 0 36px', lineHeight: 1.7 }}>{s.subCopy}</p>}
        {s.cta && <div style={{ display: 'inline-block', background: t.ac, color: t.bg, fontSize: 18, fontWeight: 700, padding: '18px 56px', borderRadius: 4 }}>{s.cta}</div>}
      </div>
    </div>
  )
}

// ── 템플릿 맵 ─────────────────────────────────────
export const TPL = {
  hero: TplHero, material: TplMaterial, detail2col: TplDetail2col,
  scene: TplScene, compare: TplCompare, points3: TplPoints3,
  target: TplTarget, cta: TplCTA,
}
