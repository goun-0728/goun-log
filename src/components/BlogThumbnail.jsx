// src/components/BlogThumbnail.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react'
import { C } from '../constants'
import { capturePNG, readFileAsDataURL } from '../utils'

const THUMB_W = 800
const THUMB_H = 800
const PAD     = 72

const LAYOUTS = [
  { k: 'gradient', l: '그라데이션형' },
  { k: 'overlay',  l: '오버레이형'  },
  { k: 'simple',   l: '심플형'      },
  { k: 'split',    l: '좌우분할형'  },
]

const FONT_SIZES = {
  sm: { title: 52, sub: 26 },
  md: { title: 68, sub: 32 },
  lg: { title: 88, sub: 40 },
}

function getTextY(textPosition) {
  if (textPosition === 'top')    return 72
  if (textPosition === 'center') return 310
  return 560  // bottom
}

/* ── 공통 이미지 스타일 (drag + zoom 반영) ──────────────── */
function imgStyle(t) {
  return {
    position: 'absolute', inset: 0,
    width: '100%', height: '100%',
    objectFit: 'cover', display: 'block',
    objectPosition: `${t.imgX ?? 50}% ${t.imgY ?? 50}%`,
    transform: `scale(${t.imgScale ?? 1})`,
    transformOrigin: `${t.imgX ?? 50}% ${t.imgY ?? 50}%`,
  }
}

/* ── 배경 레이어 ─────────────────────────────────────────── */
function ThumbBg({ t }) {
  const { layout, image, bgColor, accentColor } = t

  if (layout === 'gradient') return (
    <>
      <div style={{ position: 'absolute', inset: 0, background: bgColor }} />
      {image && <img src={image} alt="" style={imgStyle(t)} />}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.7) 30%, rgba(0,0,0,0.3) 60%, transparent 100%)' }} />
    </>
  )

  if (layout === 'overlay') return (
    <>
      <div style={{ position: 'absolute', inset: 0, background: bgColor }} />
      {image && <img src={image} alt="" style={imgStyle(t)} />}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} />
    </>
  )

  if (layout === 'simple') return (
    <div style={{ position: 'absolute', inset: 0, background: bgColor }} />
  )

  if (layout === 'split') return (
    <>
      <div style={{ position: 'absolute', top: 0, left: 0, width: '45%', height: '100%', background: bgColor }} />
      <div style={{ position: 'absolute', top: 0, left: '45%', width: 8, height: '100%', background: accentColor, zIndex: 2 }} />
      <div style={{ position: 'absolute', top: 0, right: 0, width: '55%', height: '100%', overflow: 'hidden' }}>
        {image
          ? <img src={image} alt="" style={imgStyle(t)} />
          : <div style={{ width: '100%', height: '100%', background: '#ccc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 48, opacity: 0.2 }}>📷</span>
            </div>
        }
      </div>
    </>
  )

  return <div style={{ position: 'absolute', inset: 0, background: bgColor }} />
}

/* ── 텍스트 레이어 ───────────────────────────────────────── */
function ThumbText({ t }) {
  const fs = FONT_SIZES[t.fontSize] || FONT_SIZES.md
  const tc = t.textColor || '#ffffff'
  const ts = (t.layout === 'gradient' || t.layout === 'overlay')
    ? '0 2px 18px rgba(0,0,0,0.85)'
    : 'none'
  const ty = getTextY(t.textPosition)
  const maxW = t.layout === 'split' ? THUMB_W * 0.45 - PAD * 2 : THUMB_W - PAD * 2

  return (
    <div style={{ position: 'absolute', left: PAD, top: ty, maxWidth: maxW, zIndex: 5, pointerEvents: 'none' }}>
      {t.accentLine && (
        <div style={{ width: 40, height: 4, background: t.accentColor, marginBottom: 28, borderRadius: 2 }} />
      )}
      <h1 style={{ fontSize: fs.title, fontWeight: 900, color: tc, lineHeight: 1.2, margin: '0 0 20px', whiteSpace: 'pre-wrap', textShadow: ts, wordBreak: 'keep-all', overflowWrap: 'break-word' }}>
        {t.mainTitle || '블로그 썸네일 제목'}
      </h1>
      {t.subTitle && (
        <p style={{ fontSize: fs.sub, color: tc, opacity: 0.85, lineHeight: 1.65, margin: 0, textShadow: ts, wordBreak: 'keep-all', overflowWrap: 'break-word' }}>
          {t.subTitle}
        </p>
      )}
    </div>
  )
}

/* ── 패널 레이블 ─────────────────────────────────────────── */
function PL({ children }) {
  return <p style={{ fontSize: 10, fontWeight: 700, color: C.fa, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 7 }}>{children}</p>
}

/* ── 기본 썸네일 상태 ────────────────────────────────────── */
const DEFAULTS = {
  layout: 'gradient', bgColor: '#1A3FA3', accentColor: '#60A5FA',
  textColor: '#ffffff', textPosition: 'bottom', fontSize: 'md',
  mainTitle: '', subTitle: '', image: null, accentLine: true,
  imgX: 50, imgY: 50, imgScale: 1,
}

/* ══════════════════════════════════════════════════════════
   메인 컴포넌트
══════════════════════════════════════════════════════════ */
export default function BlogThumbnail({ blogTitle }) {
  const [thumb, setThumb] = useState({ ...DEFAULTS, mainTitle: blogTitle || '' })
  const [editing, setEditing] = useState(false)
  const [dl, setDl] = useState(false)
  const [scale, setScale] = useState(0.5)
  const [isDraggingImg, setIsDraggingImg] = useState(false)

  const ref        = useRef(null)
  const wrapRef    = useRef(null)
  const fileRef    = useRef(null)
  const imgDragRef = useRef(null)

  // 캔버스 스케일 자동 계산
  useEffect(() => {
    const el = wrapRef.current; if (!el) return
    const obs = new ResizeObserver(() => setScale(el.offsetWidth / THUMB_W))
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  // 마우스 휠로 이미지 크기 조절 (non-passive)
  useEffect(() => {
    const el = wrapRef.current; if (!el) return
    const onWheel = (e) => {
      e.preventDefault()
      setThumb(t => {
        if (!t.image) return t
        const delta = e.deltaY > 0 ? -0.08 : 0.08
        return { ...t, imgScale: Math.max(0.5, Math.min(4, (t.imgScale ?? 1) + delta)) }
      })
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  // 블로그 결과에서 추출된 제목 반영
  useEffect(() => {
    if (blogTitle) setThumb(t => ({ ...t, mainTitle: t.mainTitle || blogTitle }))
  }, [blogTitle])

  const ch = (key, val) => setThumb(t => ({ ...t, [key]: val }))

  const handleImg = async e => {
    const f = e.target.files[0]; if (!f) return
    ch('image', await readFileAsDataURL(f))
    e.target.value = ''
  }

  /* ── 이미지 드래그로 위치 조절 ── */
  const handleImgMouseDown = useCallback((e) => {
    setThumb(cur => {
      if (!cur.image) return cur
      imgDragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        startImgX: cur.imgX ?? 50,
        startImgY: cur.imgY ?? 50,
      }
      return cur
    })

    const onMove = (ev) => {
      if (!imgDragRef.current) return
      const { startX, startY, startImgX, startImgY } = imgDragRef.current
      const dispW = wrapRef.current?.offsetWidth || THUMB_W
      const dispScale = dispW / THUMB_W
      const dx = (ev.clientX - startX) / dispScale / THUMB_W * 100
      const dy = (ev.clientY - startY) / dispScale / THUMB_H * 100
      setThumb(t => ({
        ...t,
        imgX: Math.max(0, Math.min(100, startImgX - dx)),
        imgY: Math.max(0, Math.min(100, startImgY - dy)),
      }))
    }

    const onUp = () => {
      imgDragRef.current = null
      setIsDraggingImg(false)
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup',   onUp)
    }

    setThumb(t => { if (!t.image) return t; setIsDraggingImg(true); return t })
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup',   onUp)
    e.preventDefault()
  }, [])

  const dlPNG = async () => {
    if (!ref.current) return
    setDl(true)
    const scaledEl = ref.current.parentElement
    const origTransform = scaledEl?.style.transform ?? ''
    try {
      if (scaledEl) scaledEl.style.transform = 'none'
      await capturePNG(ref.current, 'blog_thumbnail.png')
    } catch (e) { alert('저장 오류: ' + e.message) }
    finally {
      if (scaledEl) scaledEl.style.transform = origTransform
      setDl(false)
    }
  }

  const hasMovedImg = thumb.image && (thumb.imgX !== 50 || thumb.imgY !== 50 || thumb.imgScale !== 1)

  return (
    <div style={{ marginTop: 24, marginBottom: 4, borderRadius: 12, overflow: 'hidden', border: `2px solid ${editing ? '#1A3FA3' : C.bd}`, transition: 'border-color .2s' }}>

      {/* ── 툴바 ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', background: editing ? '#EBF1FF' : C.alt, borderBottom: `1px solid ${editing ? '#BFDBFE' : C.bd}`, flexWrap: 'wrap', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: thumb.accentColor }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: C.tx }}>블로그 썸네일</span>
          <span style={{ fontSize: 10, color: C.mu }}>800 × 800px</span>
          {thumb.image && <span style={{ fontSize: 10, color: '#3b82f6' }}>🖱 드래그: 위치 · 휠: 크기</span>}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={() => setEditing(v => !v)}
            style={{ padding: '5px 12px', fontSize: 11, borderRadius: 7, border: `1px solid ${editing ? 'none' : C.bd}`, background: editing ? '#1A3FA3' : C.sur, color: editing ? '#fff' : C.mu, cursor: 'pointer', fontWeight: 600 }}>
            {editing ? '✓ 완료' : '✎ 수정'}
          </button>
          <button onClick={dlPNG} disabled={dl}
            style={{ padding: '5px 10px', fontSize: 11, borderRadius: 7, border: `1px solid ${dl ? C.bd : '#1d6b45'}`, background: dl ? C.alt : '#f0fdf4', color: dl ? C.fa : '#1d6b45', cursor: dl ? 'not-allowed' : 'pointer', fontWeight: dl ? 400 : 600 }}>
            {dl ? '변환 중…' : '↓ PNG'}
          </button>
        </div>
      </div>

      {/* ── 2단: 캔버스 + 사이드패널 ── */}
      <div style={{ display: 'flex', alignItems: 'stretch' }}>

        {/* 캔버스 */}
        <div ref={wrapRef}
          onMouseDown={handleImgMouseDown}
          style={{ flex: 1, minWidth: 0, position: 'relative', background: '#e0ddd8', overflow: 'hidden', cursor: thumb.image ? (isDraggingImg ? 'grabbing' : 'grab') : 'default' }}>
          <div style={{ paddingTop: '100%', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' }}>
              <div style={{ width: THUMB_W, transformOrigin: 'top left', transform: `scale(${scale})` }}>
                <div ref={ref} style={{ width: THUMB_W, height: THUMB_H, position: 'relative', overflow: 'hidden', fontFamily: "'Noto Sans KR','Apple SD Gothic Neo',sans-serif" }}>
                  <ThumbBg t={thumb} />
                  <ThumbText t={thumb} />
                  <div style={{ position: 'absolute', bottom: 14, right: 22, fontSize: 13, color: thumb.textColor || '#fff', opacity: 0.08, zIndex: 3, pointerEvents: 'none' }}>ContentOS</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 사이드패널 */}
        {editing && (
          <div style={{ width: 268, minWidth: 268, borderLeft: `1px solid ${C.bd}`, background: '#F8FAFF', overflowY: 'auto', animation: 'slideInRight .22s ease' }}>
            <div style={{ padding: '14px 13px 28px' }}>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleImg} style={{ display: 'none' }} />

              {/* 사진 */}
              <PL>사진</PL>
              <div style={{ marginBottom: 6 }}>
                {thumb.image
                  ? <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => fileRef.current?.click()} style={{ flex: 1, padding: '7px', fontSize: 11, borderRadius: 7, border: `1px solid ${C.bd}`, background: C.sur, cursor: 'pointer', fontWeight: 600 }}>📷 교체</button>
                      <button onClick={() => ch('image', null)} style={{ padding: '7px 11px', fontSize: 11, borderRadius: 7, border: '1px solid #fca5a5', background: '#fef2f2', cursor: 'pointer', color: '#ef4444' }}>✕</button>
                    </div>
                  : <button onClick={() => fileRef.current?.click()} style={{ width: '100%', padding: '10px', fontSize: 11, borderRadius: 7, border: `2px dashed ${C.bd}`, background: C.sur, cursor: 'pointer', color: C.mu }}>📷 사진 업로드</button>
                }
              </div>
              {hasMovedImg && (
                <button
                  onClick={() => setThumb(t => ({ ...t, imgX: 50, imgY: 50, imgScale: 1 }))}
                  style={{ width: '100%', padding: '5px', fontSize: 10, borderRadius: 6, border: `1px solid ${C.bd}`, background: C.sur, color: '#3b82f6', cursor: 'pointer', marginBottom: 8, fontWeight: 600 }}>
                  ↺ 이미지 위치/크기 초기화
                </button>
              )}
              <div style={{ marginBottom: 8 }} />

              {/* 레이아웃 */}
              <PL>레이아웃</PL>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5, marginBottom: 14 }}>
                {LAYOUTS.map(({ k, l }) => {
                  const on = thumb.layout === k
                  return (
                    <button key={k} onClick={() => ch('layout', k)}
                      style={{ padding: '7px 4px', fontSize: 10, borderRadius: 7, border: `1.5px solid ${on ? '#1A3FA3' : C.bd}`, background: on ? '#EBF1FF' : C.sur, color: on ? '#1A3FA3' : C.mu, cursor: 'pointer', fontWeight: on ? 700 : 400, textAlign: 'center' }}>
                      {l}
                    </button>
                  )
                })}
              </div>

              {/* 텍스트 위치 */}
              <PL>텍스트 위치</PL>
              <div style={{ display: 'flex', gap: 5, marginBottom: 14 }}>
                {[['top', '위'], ['center', '중앙'], ['bottom', '아래']].map(([v, l]) => {
                  const on = thumb.textPosition === v
                  return (
                    <button key={v} onClick={() => ch('textPosition', v)}
                      style={{ flex: 1, padding: '6px', fontSize: 11, borderRadius: 7, border: `1.5px solid ${on ? '#1A3FA3' : C.bd}`, background: on ? '#EBF1FF' : C.sur, color: on ? '#1A3FA3' : C.mu, cursor: 'pointer', fontWeight: on ? 700 : 400 }}>
                      {l}
                    </button>
                  )
                })}
              </div>

              {/* 글자 크기 */}
              <PL>글자 크기</PL>
              <div style={{ display: 'flex', gap: 4, marginBottom: 14 }}>
                {[['sm', '작게'], ['md', '보통'], ['lg', '크게']].map(([v, l]) => {
                  const on = thumb.fontSize === v
                  return (
                    <button key={v} onClick={() => ch('fontSize', v)}
                      style={{ flex: 1, padding: '6px 2px', fontSize: 10, borderRadius: 6, border: `1.5px solid ${on ? '#1A3FA3' : C.bd}`, background: on ? '#EBF1FF' : C.sur, color: on ? '#1A3FA3' : C.mu, cursor: 'pointer', fontWeight: on ? 700 : 400 }}>
                      {l}
                    </button>
                  )
                })}
              </div>

              {/* 글자색 */}
              <PL>글자색</PL>
              <div style={{ display: 'flex', gap: 5, marginBottom: 14, alignItems: 'center', flexWrap: 'wrap' }}>
                {[['#ffffff', '흰색', '#ccc'], ['#1a1a1a', '검정', '#1a1a1a']].map(([v, l, border]) => {
                  const on = thumb.textColor === v
                  return (
                    <button key={v} onClick={() => ch('textColor', v)}
                      style={{ padding: '5px 10px', fontSize: 11, borderRadius: 6, border: `2px solid ${on ? '#1A3FA3' : border}`, background: v, color: v === '#ffffff' ? '#333' : '#fff', cursor: 'pointer', fontWeight: on ? 700 : 400 }}>
                      {l}
                    </button>
                  )
                })}
                <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                  <input type="color" value={thumb.textColor || '#ffffff'} onChange={e => ch('textColor', e.target.value)}
                    style={{ width: 28, height: 28, padding: 2, border: `1px solid ${C.bd}`, borderRadius: 5, cursor: 'pointer' }} />
                  <span style={{ fontSize: 10, color: C.fa }}>커스텀</span>
                </label>
              </div>

              {/* 배경 / 포인트색 */}
              <PL>배경 / 포인트색</PL>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                {[['bgColor', '배경색'], ['accentColor', '포인트색']].map(([key, label]) => (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input type="color" value={thumb[key]} onChange={e => ch(key, e.target.value)}
                      style={{ width: 32, height: 32, padding: 2, border: `1px solid ${C.bd}`, borderRadius: 6, cursor: 'pointer', flexShrink: 0 }} />
                    <span style={{ fontSize: 11, color: C.mu }}>{label}</span>
                    <span style={{ fontSize: 10, color: C.fa, fontFamily: 'monospace', marginLeft: 'auto' }}>{thumb[key]}</span>
                  </div>
                ))}
              </div>

              {/* 포인트 라인 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                <input type="checkbox" id="accentLine" checked={thumb.accentLine} onChange={e => ch('accentLine', e.target.checked)} style={{ cursor: 'pointer', accentColor: '#1A3FA3' }} />
                <label htmlFor="accentLine" style={{ fontSize: 11, color: C.mu, cursor: 'pointer' }}>포인트 라인 표시</label>
              </div>

              {/* 텍스트 편집 */}
              <PL>텍스트</PL>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div>
                  <label style={{ fontSize: 10, color: C.mu, display: 'block', marginBottom: 3 }}>메인 제목</label>
                  <textarea value={thumb.mainTitle} onChange={e => ch('mainTitle', e.target.value)} rows={2}
                    style={{ width: '100%', padding: '6px 8px', fontSize: 12, border: `1px solid ${C.bd}`, borderRadius: 6, fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ fontSize: 10, color: C.mu, display: 'block', marginBottom: 3 }}>서브 타이틀</label>
                  <input value={thumb.subTitle} onChange={e => ch('subTitle', e.target.value)}
                    style={{ width: '100%', padding: '6px 8px', fontSize: 12, border: `1px solid ${C.bd}`, borderRadius: 6, fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none' }} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
