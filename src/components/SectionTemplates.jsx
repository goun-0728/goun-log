// src/components/SectionTemplates.jsx
import React, { useRef, useState, useEffect } from 'react'

const CARD_W = 860
const SERIF  = "'Noto Serif KR', 'Noto Serif', Georgia, serif"

const ROMAN = ['Ⅰ','Ⅱ','Ⅲ','Ⅳ','Ⅴ','Ⅵ','Ⅶ','Ⅷ','Ⅸ','Ⅹ']
const ICON_FONTS = ["'Georgia', serif","'Palatino Linotype', serif","'Times New Roman', serif","'Garamond', serif"]
export const sectionRoman = i => ROMAN[i % ROMAN.length]
export const sectionFont  = i => ICON_FONTS[i % ICON_FONTS.length]

/* ── CardWrapper ── */
export function CardWrapper({ children, bg = '#fff' }) {
  return (
    <div style={{ width: CARD_W, background: bg, overflow: 'hidden', position: 'relative' }}>
      {children}
    </div>
  )
}

/* ── EditText ── */
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

/* ── ImageAdjust ── */
export function ImageAdjust({ url, editing, imgMeta, onMetaChange, fixedH, fitMode = 'cover' }) {
  const [dragging, setDragging] = useState(false)
  const [start, setStart]       = useState({ x: 0, y: 0 })
  const meta    = imgMeta || { scale: 1, x: 0, y: 0 }
  const divRef  = useRef(null)
  const snapRef = useRef(null)
  snapRef.current = { editing, meta, onMetaChange }

  const handleMouseDown = e => {
    if (!editing) return
    setDragging(true)
    setStart({ x: e.clientX - meta.x, y: e.clientY - meta.y })
    e.preventDefault()
  }
  const handleMouseMove = e => { if (!dragging) return; onMetaChange({ ...meta, x: e.clientX - start.x, y: e.clientY - start.y }) }
  const handleMouseUp   = () => setDragging(false)

  useEffect(() => {
    const el = divRef.current
    if (!el) return
    const handler = e => {
      const { editing, meta, onMetaChange } = snapRef.current
      if (!editing) return
      e.preventDefault()
      onMetaChange({ ...meta, scale: Math.max(0.5, Math.min(4, meta.scale + (e.deltaY > 0 ? -0.05 : 0.05))) })
    }
    el.addEventListener('wheel', handler, { passive: false })
    return () => el.removeEventListener('wheel', handler)
  }, [])

  return (
    <div ref={divRef} style={{ position: 'relative', overflow: 'hidden', ...(fixedH ? { height: fixedH } : {}) }}
      onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
      <img src={url} alt="" draggable={false}
        style={{ width: '100%', height: fixedH ? '100%' : 'auto', display: 'block', userSelect: 'none',
          objectFit: fixedH ? fitMode : 'initial',
          transform: `scale(${meta.scale}) translate(${meta.x / meta.scale}px, ${meta.y / meta.scale}px)`,
          transformOrigin: 'center center',
          cursor: editing ? (dragging ? 'grabbing' : 'grab') : 'default',
          transition: dragging ? 'none' : 'transform 0.1s' }}
        onMouseDown={handleMouseDown} />
    </div>
  )
}

/* ── ImgBox ── */
export function ImgBox({ url, t, label, editing = false, onImgChange, minH = 320, imgMeta, onMetaChange, fixedH, fitMode }) {
  const ref = useRef(null)
  const handleFile = e => {
    const f = e.target.files[0]; if (!f || !onImgChange) return
    const fr = new FileReader()
    fr.onload = ev => onImgChange(ev.target.result)
    fr.readAsDataURL(f); e.target.value = ''
  }
  if (!url) return null
  if (url === 'slot') return (
    <div onClick={() => ref.current?.click()}
      style={{ ...(fixedH ? { height: fixedH } : { minHeight: minH }), background: t.sub, border: `2px dashed ${t.bd}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer' }}>
      <input ref={ref} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
      <span style={{ fontSize: 36, opacity: 0.2 }}>📷</span>
      <span style={{ fontSize: 15, color: t.fg, opacity: 0.45, fontWeight: 500 }}>클릭하여 사진 업로드</span>
      <span style={{ fontSize: 12, color: t.fg, opacity: 0.3 }}>{label}</span>
    </div>
  )
  return (
    <div style={{ position: 'relative' }}>
      <input ref={ref} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
      {editing && (
        <button onClick={() => ref.current?.click()}
          style={{ position: 'absolute', top: 10, left: 10, zIndex: 10, padding: '8px 18px', fontSize: 13, fontWeight: 700, background: 'rgba(0,0,0,0.65)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
          📷 교체
        </button>
      )}
      <ImageAdjust url={url} editing={editing} imgMeta={imgMeta} onMetaChange={onMetaChange || (() => {})} fixedH={fixedH} fitMode={fitMode} />
    </div>
  )
}

/* ── PointInput ── */
function PointInput({ value, onChange, placeholder }) {
  return (
    <textarea value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder || '텍스트 입력 (엔터로 줄바꿈)'}
      rows={Math.max(2, (value || '').split('\n').length)}
      style={{ flex: 1, fontSize: 15, border: '1px solid #3b82f6', borderRadius: 6, padding: '8px 10px', outline: 'none', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.65, width: '100%' }}
    />
  )
}

/* ── 이미지 없을 때 패턴 배경 ── */
function NoBg({ t, minH = 400, children }) {
  return (
    <div style={{ minHeight: minH, background: `linear-gradient(135deg, ${t.ac}28 0%, ${t.bg} 60%, ${t.ac}14 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `radial-gradient(circle, ${t.ac}18 1px, transparent 1px)`, backgroundSize: '32px 32px' }} />
      {children || <span style={{ fontSize: 72, opacity: 0.1 }}>🛍</span>}
    </div>
  )
}

/* ════════════════════════════════════════════════
   8가지 템플릿 — 한국 스마트스토어 상세페이지 스타일
════════════════════════════════════════════════ */

/* ── 1. Hero ─────────────────────────────────────
   최소 900px / 풀블리드 이미지(55%) / 곡선 구분선
   하단 흰 배경 포인트 3열 카드
─────────────────────────────────────────────── */
export function TplHero({ s, img, t, editing, onChange, secMeta, onSecMeta }) {
  const logoRef    = useRef(null)
  const pts        = s.points || []
  const displayPts = editing ? (pts.length ? pts : ['', '', '']) : pts.filter(p => p && p.trim())
  const cols       = Math.max(1, Math.min(displayPts.length, 3))
  const addPt      = () => onChange('points', [...pts, ''])
  const delPt      = i  => onChange('points', pts.filter((_, j) => j !== i))

  const handleLogoImg = e => {
    const f = e.target.files[0]; if (!f) return
    const fr = new FileReader()
    fr.onload = ev => onChange('logoImg', ev.target.result)
    fr.readAsDataURL(f); e.target.value = ''
  }

  return (
    <CardWrapper bg={t.bg}>
      <input ref={logoRef} type="file" accept="image/*" onChange={handleLogoImg} style={{ display: 'none' }} />

      {/* 상단: 로고/텍스트 + 브랜드 태그 + 헤드라인 */}
      <div style={{ padding: '72px 72px 52px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

        {/* ── 로고 / 텍스트 삽입 영역 ── */}
        {(s.logoImg || s.logoText || editing) && (
          <div style={{ marginBottom: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            {s.logoImg
              ? <div style={{ position: 'relative', display: 'inline-block' }}>
                  <img src={s.logoImg} alt="" style={{ maxHeight: 80, maxWidth: 300, objectFit: 'contain', display: 'block' }} />
                  {editing && (
                    <div style={{ position: 'absolute', top: -10, right: -10, display: 'flex', gap: 4 }}>
                      <button onClick={() => logoRef.current?.click()}
                        style={{ fontSize: 10, padding: '3px 8px', borderRadius: 5, border: '1px solid #3b82f6', background: '#EFF6FF', color: '#1d4ed8', cursor: 'pointer', fontWeight: 600 }}>교체</button>
                      <button onClick={() => onChange('logoImg', null)}
                        style={{ fontSize: 10, padding: '3px 8px', borderRadius: 5, border: '1px solid #fca5a5', background: '#fef2f2', color: '#ef4444', cursor: 'pointer', fontWeight: 600 }}>제거</button>
                    </div>
                  )}
                </div>
              : editing
                ? <button onClick={() => logoRef.current?.click()}
                    style={{ padding: '9px 22px', fontSize: 13, borderRadius: 8, border: `2px dashed ${t.bd}`, background: 'rgba(255,255,255,0.55)', color: t.fg, opacity: 0.55, cursor: 'pointer', fontWeight: 600 }}>
                    + 로고 이미지 업로드
                  </button>
                : null
            }
            {!s.logoImg && (
              <EditText editing={editing} value={s.logoText || ''} onChange={v => onChange('logoText', v)}
                style={{ fontSize: 13, fontWeight: 700, color: t.ac, letterSpacing: '0.28em', textTransform: 'uppercase', minWidth: 60 }} />
            )}
          </div>
        )}

        {(s.description || editing) && (
          <div style={{ marginBottom: 26 }}>
            <EditText editing={editing} value={s.description} onChange={v => onChange('description', v)}
              style={{ display: 'inline-block', fontSize: 11, fontWeight: 800, color: t.ac,
                letterSpacing: '0.32em', textTransform: 'uppercase',
                border: `1.5px solid ${t.ac}`, padding: '6px 24px', borderRadius: 40 }} />
          </div>
        )}
        <EditText editing={editing} value={s.mainCopy} onChange={v => onChange('mainCopy', v)}
          style={{ fontSize: 58, fontWeight: 900, color: t.fg, lineHeight: 1.18,
            letterSpacing: '-0.03em', marginBottom: 20, wordBreak: 'keep-all', fontFamily: SERIF }} />
        <EditText editing={editing} value={s.subCopy} onChange={v => onChange('subCopy', v)}
          style={{ fontSize: 20, color: t.fg, opacity: 0.68, lineHeight: 1.82, wordBreak: 'keep-all', maxWidth: 540 }} />
      </div>

      {/* 풀블리드 제품 이미지 (최소 500px) */}
      {img
        ? <ImgBox url={img} t={t} label="메인 제품 이미지" editing={editing} onImgChange={v => onChange('secImg', v)}
            imgMeta={secMeta?.img1} onMetaChange={m => onSecMeta?.('img1', m)} minH={500} />
        : <NoBg t={t} minH={500} />
      }

      {/* 곡선 구분선 + KEY POINT 포인트 영역 (흰색 배경) */}
      <div style={{ position: 'relative', background: '#fff', overflow: 'hidden' }}>
        {/* 상단 곡선 — t.bg 색상 돌출 */}
        <div style={{ position: 'absolute', top: 0, left: '50%',
          transform: 'translateX(-50%) translateY(-50%)',
          width: '130%', height: 130, background: t.bg,
          borderRadius: '0 0 50% 50%' }} />

        <div style={{ position: 'relative', padding: '80px 60px 88px' }}>
          {/* 라벨 */}
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.32em', color: t.ac,
              textTransform: 'uppercase', borderBottom: `3px solid ${t.ac}`, paddingBottom: 7 }}>KEY POINT</span>
            <div style={{ marginTop: 18, fontSize: 26, fontWeight: 900, color: '#111', fontFamily: SERIF, letterSpacing: '-0.02em' }}>
              이 제품이 특별한 이유
            </div>
          </div>

          {/* 포인트 그리드 */}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 36 }}>
            {displayPts.map((raw, i) => {
              const lines = raw.split('\n')
              const title = lines[0]?.trim() || `포인트 ${i + 1}`
              const desc  = lines.slice(1).join('\n').trim()
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 18, position: 'relative' }}>
                  {editing && (
                    <button onClick={() => delPt(i)} style={delBtnAbsolute}>×</button>
                  )}
                  {/* 원형 아이콘 배지 */}
                  <div style={{ width: 92, height: 92, borderRadius: '50%', background: t.ac,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: `0 14px 36px ${t.ac}44`, flexShrink: 0 }}>
                    <span style={{ fontSize: 36, fontWeight: 700, color: '#fff', fontFamily: SERIF, lineHeight: 1 }}>{sectionRoman(i)}</span>
                  </div>
                  {editing
                    ? <PointInput value={raw} onChange={v => { const n = [...pts]; n[i] = v; onChange('points', n) }} placeholder={'제목\n설명(엔터로 구분)'} />
                    : <>
                        <p style={{ fontSize: 19, fontWeight: 800, color: '#111', margin: 0, lineHeight: 1.3, wordBreak: 'keep-all', fontFamily: SERIF }}>{title}</p>
                        {desc && <p style={{ fontSize: 14, color: '#777', margin: 0, lineHeight: 1.72, wordBreak: 'keep-all', whiteSpace: 'pre-wrap' }}>{desc}</p>}
                      </>
                  }
                </div>
              )
            })}
          </div>

          {editing && (
            <div style={{ textAlign: 'center', marginTop: 32 }}>
              <button onClick={addPt} style={addBtnStyle}>+ 포인트 추가</button>
            </div>
          )}
        </div>
      </div>

    </CardWrapper>
  )
}

/* ── 2. Material (소재설명형) ──────────────────────
   이미지 풀블리드 480px + 텍스트 오버레이(그라데이션)
   하단: 아이콘+텍스트 가로 배치 포인트 리스트
─────────────────────────────────────────────── */
export function TplMaterial({ s, img, t, editing, onChange, secMeta, onSecMeta }) {
  const pts        = s.points || []
  const displayPts = editing ? (pts.length ? pts : ['']) : pts.filter(p => p && p.trim())
  const addPt      = () => onChange('points', [...pts, ''])
  const delPt      = i  => onChange('points', pts.filter((_, j) => j !== i))

  return (
    <CardWrapper bg={t.bg}>

      {/* 풀블리드 이미지 + 그라데이션 오버레이 */}
      <div style={{ position: 'relative', minHeight: 480 }}>
        {img
          ? <ImgBox url={img} t={t} label="소재 이미지" editing={editing} onImgChange={v => onChange('secImg', v)}
              imgMeta={secMeta?.img1} onMetaChange={m => onSecMeta?.('img1', m)} minH={480} />
          : <NoBg t={t} minH={480} />
        }
        {/* 강한 하단 그라데이션 */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.32) 52%, transparent 100%)', pointerEvents: 'none' }} />
        {/* 오버레이 텍스트 */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '36px 60px 52px', pointerEvents: editing ? 'auto' : 'none' }}>
          {editing
            ? <>
                <input value={s.mainCopy || ''} onChange={e => onChange('mainCopy', e.target.value)}
                  placeholder="소재명 / 헤드라인"
                  style={{ ...overlayInput, fontSize: 40, fontFamily: SERIF, marginBottom: 10 }} />
                <input value={s.subCopy || ''} onChange={e => onChange('subCopy', e.target.value)}
                  placeholder="소재 설명 (짧게)"
                  style={{ ...overlayInput, fontSize: 17 }} />
              </>
            : <>
                <div style={{ fontSize: 46, fontWeight: 900, color: '#fff', lineHeight: 1.24, wordBreak: 'keep-all', fontFamily: SERIF, textShadow: '0 3px 18px rgba(0,0,0,0.55)', marginBottom: 10 }}>{s.mainCopy}</div>
                <div style={{ fontSize: 19, color: 'rgba(255,255,255,0.86)', lineHeight: 1.68, wordBreak: 'keep-all' }}>{s.subCopy}</div>
              </>
          }
        </div>
      </div>

      {/* 하단 포인트 리스트 */}
      <div style={{ padding: '60px 60px 72px', background: '#fff' }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.3em', color: t.ac, textTransform: 'uppercase', marginBottom: 32 }}>MATERIAL DETAIL</div>

        {/* 2번째 이미지 (소재 클로즈업) */}
        {s.secImg2 && (
          <div style={{ marginBottom: 40, borderRadius: 12, overflow: 'hidden' }}>
            <ImgBox url={s.secImg2} t={t} label="소재 클로즈업" editing={editing} onImgChange={v => onChange('secImg2', v)}
              imgMeta={secMeta?.img2} onMetaChange={m => onSecMeta?.('img2', m)} minH={240} />
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {displayPts.map((p, i) => {
            const lines = p.split('\n')
            return (
              <div key={i} style={{ display: 'flex', gap: 22, alignItems: 'flex-start', padding: '24px 0', borderBottom: `1px solid ${t.bd}` }}>
                {/* 아이콘 배지 */}
                <div style={{ width: 52, height: 52, borderRadius: 14, background: t.ac, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 22, fontWeight: 700, color: '#fff', fontFamily: SERIF, lineHeight: 1 }}>{sectionRoman(i)}</span>
                </div>
                <div style={{ flex: 1 }}>
                  {editing
                    ? <PointInput value={p} onChange={v => { const n = [...pts]; n[i] = v; onChange('points', n) }} placeholder={'특징 제목\n상세 설명'} />
                    : <>
                        <div style={{ fontSize: 17, fontWeight: 700, color: t.fg, lineHeight: 1.4, marginBottom: 5, fontFamily: SERIF }}>{lines[0]}</div>
                        {lines.slice(1).join('\n') && <div style={{ fontSize: 15, color: t.fg, opacity: 0.62, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{lines.slice(1).join('\n')}</div>}
                      </>
                  }
                </div>
                {editing && <button onClick={() => delPt(i)} style={delBtnInline}>×</button>}
              </div>
            )
          })}
        </div>
        {editing && <button onClick={addPt} style={{ ...addBtnStyle, marginTop: 20, width: '100%', padding: '12px 0' }}>+ 항목 추가</button>}
      </div>

    </CardWrapper>
  )
}

/* ── 3. Detail2col (디테일형) ──────────────────────
   좌우 50:50 분할
   왼쪽: 이미지 1·2 세로 쌓기 (기본 2장, 빈칸 업로드박스)
   오른쪽: 텍스트 + 체크 아이콘 포인트
   하단: 이미지 3·4 (툴바 추가 시) → 2열 그리드
─────────────────────────────────────────────── */
export function TplDetail2col({ s, img, t, editing, onChange, secMeta, onSecMeta }) {
  const pts        = s.points || []
  const displayPts = editing ? (pts.length ? pts : ['']) : pts.filter(p => p && p.trim())
  const addPt      = () => onChange('points', [...pts, ''])
  const delPt      = i  => onChange('points', pts.filter((_, j) => j !== i))

  const img2 = s.secImg2
  const img3 = s.secImg3
  const img4 = s.secImg4
  const imgH = s.detailImgH || 320

  return (
    <CardWrapper bg={t.bg}>

      {/* ── 상단 50:50 분할 ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>

        {/* 왼쪽: 이미지 2장 세로 쌓기 */}
        <div style={{ display: 'flex', flexDirection: 'column', background: t.ac }}>

          {/* 이미지 1 (위) — 정사각형 크롭 */}
          <div style={{ height: imgH, position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
            {img
              ? <>
                  <ImgBox url={img} t={t} label="이미지 1" editing={editing} onImgChange={v => onChange('secImg', v)}
                    imgMeta={secMeta?.img1} onMetaChange={m => onSecMeta?.('img1', m)} minH={imgH} fixedH={imgH} fitMode='contain' />
                  <div style={{ position: 'absolute', inset: 0, background: `${t.ac}22`, pointerEvents: 'none' }} />
                </>
              : editing
                ? <ImgBox url="slot" t={t} label="이미지 1 업로드" editing={editing} onImgChange={v => onChange('secImg', v)}
                    imgMeta={secMeta?.img1} onMetaChange={m => onSecMeta?.('img1', m)} minH={imgH} fixedH={imgH} fitMode='contain' />
                : <div style={{ height: imgH, background: `linear-gradient(160deg, ${t.ac} 0%, ${t.ac}cc 100%)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 60, opacity: 0.15 }}>📷</span>
                  </div>
            }
          </div>

          {/* 구분선 */}
          <div style={{ height: 3, background: `${t.bg}55`, flexShrink: 0 }} />

          {/* 이미지 2 (아래) — 정사각형 크롭 */}
          <div style={{ height: imgH, position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
            {img2
              ? <>
                  <ImgBox url={img2} t={t} label="이미지 2" editing={editing} onImgChange={v => onChange('secImg2', v)}
                    imgMeta={secMeta?.img2} onMetaChange={m => onSecMeta?.('img2', m)} minH={imgH} fixedH={imgH} fitMode='contain' />
                  <div style={{ position: 'absolute', inset: 0, background: `${t.ac}22`, pointerEvents: 'none' }} />
                </>
              : editing
                ? <ImgBox url="slot" t={t} label="이미지 2 업로드" editing={editing} onImgChange={v => onChange('secImg2', v)}
                    imgMeta={secMeta?.img2} onMetaChange={m => onSecMeta?.('img2', m)} minH={imgH} fixedH={imgH} fitMode='contain' />
                : <div style={{ height: imgH, background: `linear-gradient(160deg, ${t.ac}cc 0%, ${t.ac}88 100%)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 60, opacity: 0.10 }}>📷</span>
                  </div>
            }
          </div>
        </div>

        {/* 오른쪽: 텍스트 */}
        <div style={{ padding: '68px 52px', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: '#fff' }}>
          {(s.description || editing) && (
            <EditText editing={editing} value={s.description} onChange={v => onChange('description', v)}
              style={{ fontSize: 11, fontWeight: 800, color: t.ac, letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 20 }} />
          )}
          <EditText editing={editing} value={s.mainCopy} onChange={v => onChange('mainCopy', v)}
            style={{ fontSize: 34, fontWeight: 900, color: '#111', lineHeight: 1.3, letterSpacing: '-0.02em', marginBottom: 16, wordBreak: 'keep-all', fontFamily: SERIF }} />
          <EditText editing={editing} value={s.subCopy} onChange={v => onChange('subCopy', v)}
            style={{ fontSize: 15, color: '#666', lineHeight: 1.82, marginBottom: 36, wordBreak: 'keep-all' }} />

          {/* 체크 아이콘 포인트 */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {displayPts.map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: '16px 0', borderBottom: `1px solid ${t.bd}` }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: t.ac, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                  <span style={{ fontSize: 15, color: '#fff', fontWeight: 800 }}>✓</span>
                </div>
                {editing
                  ? <PointInput value={p} onChange={v => { const n = [...pts]; n[i] = v; onChange('points', n) }} />
                  : <span style={{ fontSize: 16, color: '#333', lineHeight: 1.74, whiteSpace: 'pre-wrap' }}>{p}</span>
                }
                {editing && <button onClick={() => delPt(i)} style={delBtnInline}>×</button>}
              </div>
            ))}
          </div>
          {editing && <button onClick={addPt} style={{ ...addBtnStyle, marginTop: 16, padding: '10px 0' }}>+ 항목 추가</button>}
        </div>
      </div>

      {/* ── 하단: 이미지 3·4 (툴바에서 추가 시) → 2열 그리드 ── */}
      {(img3 || img4) && (
        <div style={{ display: 'grid', gridTemplateColumns: (img3 && img4) ? '1fr 1fr' : '1fr' }}>
          {img3 && (
            <ImgBox url={img3} t={t} label="이미지 3" editing={editing} onImgChange={v => onChange('secImg3', v)}
              imgMeta={secMeta?.img3} onMetaChange={m => onSecMeta?.('img3', m)} />
          )}
          {img4 && (
            <ImgBox url={img4} t={t} label="이미지 4" editing={editing} onImgChange={v => onChange('secImg4', v)}
              imgMeta={secMeta?.img4} onMetaChange={m => onSecMeta?.('img4', m)} />
          )}
        </div>
      )}

    </CardWrapper>
  )
}

/* ── 4. Scene (사용장면형) ─────────────────────────
   이미지 풀블리드 600px (80%) / 강한 그라데이션
   하단 텍스트 오버레이 (20%)
─────────────────────────────────────────────── */
export function TplScene({ s, img, t, editing, onChange, secMeta, onSecMeta }) {
  return (
    <CardWrapper bg={t.bg}>

      <div style={{ position: 'relative', minHeight: 640 }}>
        {img
          ? <ImgBox url={img} t={t} label="라이프스타일 이미지" editing={editing} onImgChange={v => onChange('secImg', v)}
              imgMeta={secMeta?.img1} onMetaChange={m => onSecMeta?.('img1', m)} minH={640} />
          : <NoBg t={t} minH={640} />
        }

        {/* 강한 하단 그라데이션 */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.5) 35%, rgba(0,0,0,0.1) 65%, transparent 100%)', pointerEvents: 'none' }} />

        {/* 하단 텍스트 오버레이 */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '36px 60px 56px', pointerEvents: editing ? 'auto' : 'none' }}>
          {editing
            ? <>
                <input value={s.mainCopy || ''} onChange={e => onChange('mainCopy', e.target.value)}
                  placeholder="메인 카피"
                  style={{ ...overlayInput, fontSize: 38, fontFamily: SERIF, marginBottom: 10 }} />
                <input value={s.subCopy || ''} onChange={e => onChange('subCopy', e.target.value)}
                  placeholder="서브 카피"
                  style={{ ...overlayInput, fontSize: 17 }} />
              </>
            : <>
                <div style={{ fontSize: 44, fontWeight: 900, color: '#fff', lineHeight: 1.26, wordBreak: 'keep-all', fontFamily: SERIF, textShadow: '0 4px 24px rgba(0,0,0,0.65)', marginBottom: 12 }}>{s.mainCopy}</div>
                <div style={{ fontSize: 19, color: 'rgba(255,255,255,0.84)', lineHeight: 1.68, wordBreak: 'keep-all' }}>{s.subCopy}</div>
              </>
          }
        </div>
      </div>

      {/* 추가 이미지 */}
      {s.secImg2 && (
        <ImgBox url={s.secImg2} t={t} label="이미지 2" editing={editing} onImgChange={v => onChange('secImg2', v)}
          imgMeta={secMeta?.img2} onMetaChange={m => onSecMeta?.('img2', m)} />
      )}

    </CardWrapper>
  )
}

/* ── 5. Compare (비교형) ───────────────────────────
   상단 t.ac 배경 타이틀 크게
   이제품 컬럼 t.ac 포인트 강조
   표 테두리 t.ac 2px
─────────────────────────────────────────────── */
export function TplCompare({ s, img, t, editing, onChange, secMeta, onSecMeta }) {
  const pts        = s.points || []
  const displayPts = pts.length ? pts : (editing ? ['', '', ''] : [])
  const addPt      = () => onChange('points', [...pts, ''])
  const delPt      = i  => onChange('points', pts.filter((_, j) => j !== i))

  return (
    <CardWrapper bg={t.bg}>

      {/* 배경 꽉 채운 타이틀 */}
      <div style={{ background: t.ac, padding: '64px 64px 60px', textAlign: 'center' }}>
        <EditText editing={editing} value={s.mainCopy} onChange={v => onChange('mainCopy', v)}
          style={{ fontSize: 48, fontWeight: 900, color: '#fff', lineHeight: 1.24, letterSpacing: '-0.028em', marginBottom: 14, wordBreak: 'keep-all', fontFamily: SERIF }} />
        <EditText editing={editing} value={s.subCopy} onChange={v => onChange('subCopy', v)}
          style={{ fontSize: 19, color: 'rgba(255,255,255,0.8)', lineHeight: 1.68 }} />
      </div>

      {/* 비교 표 */}
      <div style={{ padding: '52px 48px 68px', background: '#fff' }}>
        <div style={{ border: `2.5px solid ${t.ac}`, borderRadius: 18, overflow: 'hidden' }}>

          {/* 헤더 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
            <div style={{ padding: '22px 28px', borderRight: `2.5px solid ${t.ac}`, background: '#f5f5f7', textAlign: 'center' }}>
              <EditText editing={editing} value={s.compareLeft || '일반 제품'} onChange={v => onChange('compareLeft', v)}
                style={{ fontSize: 16, fontWeight: 700, color: '#999' }} />
            </div>
            <div style={{ padding: '22px 28px', background: t.ac, textAlign: 'center' }}>
              <EditText editing={editing} value={s.compareRight || '이 제품'} onChange={v => onChange('compareRight', v)}
                style={{ fontSize: 16, fontWeight: 800, color: '#fff' }} />
            </div>
          </div>

          {/* 비교 행 */}
          {displayPts.map((p, i) => {
            const [a, ...r] = p.split('/'); const b = r.join('/').trim()
            return editing ? (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', borderTop: `1px solid ${t.bd}` }}>
                <div style={{ padding: '12px 14px', borderRight: `2.5px solid ${t.ac}` }}>
                  <input value={a.replace(/일반제품:/i, '').trim()}
                    onChange={e => { const n = [...pts]; n[i] = e.target.value + ' / ' + r.join('/').trim(); onChange('points', n) }}
                    placeholder="일반 제품" style={cmpInput} />
                </div>
                <div style={{ padding: '12px 14px' }}>
                  <input value={b}
                    onChange={e => { const n = [...pts]; n[i] = a.replace(/일반제품:/i, '').trim() + ' / ' + e.target.value; onChange('points', n) }}
                    placeholder="이 제품" style={cmpInput} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', padding: '0 10px' }}>
                  <button onClick={() => delPt(i)} style={delBtnInline}>×</button>
                </div>
              </div>
            ) : (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderTop: `1px solid ${t.bd}`, background: i % 2 === 0 ? '#fafafa' : '#fff' }}>
                <div style={{ padding: '22px 28px', fontSize: 16, color: '#bbb', textAlign: 'center', borderRight: `2.5px solid ${t.ac}`, textDecoration: 'line-through' }}>{a.replace(/일반제품:/i, '').trim()}</div>
                <div style={{ padding: '22px 28px', fontSize: 16, color: t.ac, fontWeight: 700, textAlign: 'center' }}>{b || '—'}</div>
              </div>
            )
          })}
          {editing && (
            <button onClick={addPt} style={{ width: '100%', padding: '16px 0', fontSize: 13, fontWeight: 600, border: 'none', borderTop: `1px dashed ${t.bd}`, background: '#fafafa', color: t.ac, cursor: 'pointer' }}>+ 행 추가</button>
          )}
        </div>

        {img && <div style={{ marginTop: 44 }}>
          <ImgBox url={img} t={t} label="비교 이미지" editing={editing} onImgChange={v => onChange('secImg', v)}
            imgMeta={secMeta?.img1} onMetaChange={m => onSecMeta?.('img1', m)} />
        </div>}
      </div>

    </CardWrapper>
  )
}

/* ── 6. Points3 (포인트3단형) ──────────────────────
   상단 이미지 풀블리드 → 타이틀 → 하단 3단 카드
   교차 배경(짝수: t.ac 강하게 / 홀수: t.sub)
   원형 아이콘 배지 크게 (72px)
─────────────────────────────────────────────── */
export function TplPoints3({ s, img, t, editing, onChange, secMeta, onSecMeta }) {
  const pts        = s.points || []
  const displayPts = pts.length ? pts : (editing ? ['', '', ''] : [])
  const cols       = Math.max(1, Math.min(displayPts.length || 1, 3))
  const addPt      = () => onChange('points', [...pts, ''])
  const delPt      = i  => onChange('points', pts.filter((_, j) => j !== i))

  return (
    <CardWrapper bg={t.bg}>

      {/* 상단 이미지 풀블리드 */}
      {img
        ? <ImgBox url={img} t={t} label="이미지" editing={editing} onImgChange={v => onChange('secImg', v)}
            imgMeta={secMeta?.img1} onMetaChange={m => onSecMeta?.('img1', m)} minH={420} />
        : <NoBg t={t} minH={320} />
      }

      {/* 타이틀 영역 */}
      <div style={{ padding: '68px 64px 0', textAlign: 'center' }}>
        <EditText editing={editing} value={s.mainCopy} onChange={v => onChange('mainCopy', v)}
          style={{ fontSize: 44, fontWeight: 900, color: t.fg, lineHeight: 1.28, letterSpacing: '-0.025em', marginBottom: 14, wordBreak: 'keep-all', fontFamily: SERIF }} />
        <EditText editing={editing} value={s.subCopy} onChange={v => onChange('subCopy', v)}
          style={{ fontSize: 19, color: t.fg, opacity: 0.62, lineHeight: 1.75 }} />
      </div>

      {/* 하단 3단 카드 */}
      <div style={{ padding: '52px 40px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 20 }}>
          {displayPts.map((p, i) => {
            const lines  = p.split('\n')
            const title  = lines[0]?.trim() || `포인트 ${i + 1}`
            const desc   = lines.slice(1).join('\n').trim()
            const isDark = i % 2 === 0
            return (
              <div key={i} style={{ position: 'relative', background: isDark ? t.ac : t.sub, borderRadius: 22,
                padding: '48px 28px 44px', textAlign: 'center',
                boxShadow: isDark ? `0 10px 36px ${t.ac}40` : `0 2px 10px rgba(0,0,0,0.06)` }}>
                {editing && <button onClick={() => delPt(i)} style={delBtnAbsolute}>×</button>}
                {/* 원형 배지 */}
                <div style={{ width: 76, height: 76, borderRadius: '50%',
                  background: isDark ? 'rgba(255,255,255,0.2)' : t.ac,
                  border: isDark ? '2px solid rgba(255,255,255,0.45)' : 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 26px',
                  boxShadow: isDark ? 'none' : `0 6px 20px ${t.ac}44` }}>
                  <span style={{ fontSize: 30, fontWeight: 800, color: '#fff', fontFamily: SERIF, lineHeight: 1 }}>{sectionRoman(i)}</span>
                </div>
                {editing
                  ? <PointInput value={p} onChange={v => { const n = [...pts]; n[i] = v; onChange('points', n) }} placeholder={'제목\n설명'} />
                  : <>
                      <p style={{ fontSize: 19, fontWeight: 800, color: isDark ? '#fff' : t.fg, margin: '0 0 10px', lineHeight: 1.3, fontFamily: SERIF }}>{title}</p>
                      {desc && <p style={{ fontSize: 14, color: isDark ? 'rgba(255,255,255,0.78)' : t.fg, margin: 0, lineHeight: 1.68, opacity: isDark ? 1 : 0.65, whiteSpace: 'pre-wrap' }}>{desc}</p>}
                    </>
                }
              </div>
            )
          })}
        </div>
        {editing && (
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <button onClick={addPt} style={addBtnStyle}>+ 포인트 추가</button>
          </div>
        )}
        {s.secImg2 && <div style={{ marginTop: 44 }}>
          <ImgBox url={s.secImg2} t={t} label="이미지 2" editing={editing} onImgChange={v => onChange('secImg2', v)}
            imgMeta={secMeta?.img2} onMetaChange={m => onSecMeta?.('img2', m)} />
        </div>}
      </div>

    </CardWrapper>
  )
}

/* ── 7. Target (추천대상형) ────────────────────────
   상단 t.ac 헤더 / 체크리스트
   홀짝 행 교차 배경색 (흰색 / t.ac 10% 틴트)
─────────────────────────────────────────────── */
export function TplTarget({ s, img, t, editing, onChange, secMeta, onSecMeta }) {
  const pts        = s.points || []
  const displayPts = pts.length ? pts : (editing ? ['', '', ''] : [])
  const addPt      = () => onChange('points', [...pts, ''])
  const delPt      = i  => onChange('points', pts.filter((_, j) => j !== i))

  return (
    <CardWrapper bg={'#fff'}>

      {/* 상단 배경색 헤더 */}
      <div style={{ background: t.ac, padding: '64px 64px 60px', textAlign: 'center' }}>
        <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', marginBottom: 18 }}>RECOMMENDED FOR</div>
        <EditText editing={editing} value={s.mainCopy} onChange={v => onChange('mainCopy', v)}
          style={{ fontSize: 44, fontWeight: 900, color: '#fff', lineHeight: 1.28, letterSpacing: '-0.025em', marginBottom: 14, wordBreak: 'keep-all', fontFamily: SERIF }} />
        <EditText editing={editing} value={s.subCopy} onChange={v => onChange('subCopy', v)}
          style={{ fontSize: 19, color: 'rgba(255,255,255,0.78)', lineHeight: 1.65 }} />
      </div>

      {/* 교차 배경 체크리스트 */}
      <div style={{ paddingBottom: 56 }}>
        {displayPts.map((p, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 24, padding: '30px 64px', background: i % 2 === 0 ? '#fff' : `${t.ac}0E` }}>
            <div style={{ width: 46, height: 46, borderRadius: '50%', background: t.ac, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 4px 14px ${t.ac}44` }}>
              <span style={{ fontSize: 22, color: '#fff', fontWeight: 800 }}>✓</span>
            </div>
            {editing
              ? <PointInput value={p} onChange={v => { const n = [...pts]; n[i] = v; onChange('points', n) }} />
              : <span style={{ fontSize: 20, color: '#1a1a1a', lineHeight: 1.68, fontWeight: 500, whiteSpace: 'pre-wrap' }}>{p.replace(/이런 분께 추천\d*:/i, '').trim()}</span>
            }
            {editing && <button onClick={() => delPt(i)} style={delBtnInline}>×</button>}
          </div>
        ))}
        {editing && (
          <div style={{ padding: '16px 64px 0' }}>
            <button onClick={addPt} style={{ ...addBtnStyle, width: '100%', padding: '12px 0' }}>+ 항목 추가</button>
          </div>
        )}
      </div>

      {/* 이미지 (선택) */}
      {img && (
        <ImgBox url={img} t={t} label="이미지" editing={editing} onImgChange={v => onChange('secImg', v)}
          imgMeta={secMeta?.img1} onMetaChange={m => onSecMeta?.('img1', m)} />
      )}

    </CardWrapper>
  )
}

/* ── 8. CTA ────────────────────────────────────────
   배경 t.ac 꽉 채우기 / 텍스트 크게 / 여백 넉넉
   이미지 있으면 상단 풀블리드 + 하단 그라데이션 연결
─────────────────────────────────────────────── */
export function TplCTA({ s, img, t, editing, onChange, secMeta, onSecMeta }) {
  return (
    <CardWrapper bg={t.ac}>

      {img && (
        <div style={{ position: 'relative' }}>
          <ImgBox url={img} t={t} label="CTA 이미지" editing={editing} onImgChange={v => onChange('secImg', v)}
            imgMeta={secMeta?.img1} onMetaChange={m => onSecMeta?.('img1', m)} minH={440} />
          <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to bottom, transparent 35%, ${t.ac} 100%)`, pointerEvents: 'none' }} />
        </div>
      )}

      {!img && <div style={{ minHeight: 160, background: `linear-gradient(135deg, ${t.ac} 0%, ${t.ac}cc 100%)` }} />}

      {/* 텍스트 영역 */}
      <div style={{ padding: '76px 80px 96px', textAlign: 'center', background: t.ac }}>
        <EditText editing={editing} value={s.mainCopy} onChange={v => onChange('mainCopy', v)}
          style={{ fontSize: 52, fontWeight: 900, color: '#fff', lineHeight: 1.24, letterSpacing: '-0.03em', marginBottom: 24, wordBreak: 'keep-all', fontFamily: SERIF }} />
        <EditText editing={editing} value={s.subCopy} onChange={v => onChange('subCopy', v)}
          style={{ fontSize: 21, color: 'rgba(255,255,255,0.8)', lineHeight: 1.78, wordBreak: 'keep-all' }} />
      </div>

    </CardWrapper>
  )
}

/* ── 공통 버튼 스타일 상수 ── */
const delBtnAbsolute = { position: 'absolute', top: 10, right: 10, width: 22, height: 22, borderRadius: '50%', border: '1px solid #fca5a5', background: '#fef2f2', color: '#ef4444', fontSize: 12, cursor: 'pointer', fontWeight: 700, lineHeight: 1, zIndex: 2 }
const delBtnInline   = { width: 26, height: 26, borderRadius: 6, border: '1px solid #fca5a5', background: '#fef2f2', color: '#ef4444', fontSize: 14, cursor: 'pointer', flexShrink: 0, fontWeight: 700, lineHeight: 1 }
const addBtnStyle    = { padding: '14px 36px', fontSize: 15, fontWeight: 700, border: '1.5px dashed #ccc', borderRadius: 8, background: 'transparent', color: '#888', cursor: 'pointer' }
const overlayInput   = { display: 'block', width: '100%', background: 'rgba(255,255,255,0.92)', border: '2px solid #3b82f6', borderRadius: 8, padding: '8px 14px', outline: 'none', fontFamily: 'inherit', color: '#111', boxSizing: 'border-box', fontWeight: 700 }
const cmpInput       = { width: '100%', fontSize: 15, border: '1px solid #3b82f6', borderRadius: 6, padding: '7px 10px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }

/* ── 9. SpecTable (제품상세표시) ────────────────────────
   항목::값 형식의 points 배열을 표로 렌더링
   편집 시 각 셀 인라인 input / 행 추가·삭제
─────────────────────────────────────────────── */
const DEFAULT_SPEC_ROWS = [
  '제품명::','식품유형::','업소명::','소재지::',
  '유통기한::','중량::','원재료::','보관방법::','주의사항::',
]

export function TplSpecTable({ s, img, t, editing, onChange }) {
  const pts        = s.points || []
  const displayPts = editing ? (pts.length ? pts : [...DEFAULT_SPEC_ROWS]) : pts.filter(p => p && p.trim())
  const addRow     = () => onChange('points', [...pts, '항목::'])
  const delRow     = i  => onChange('points', pts.filter((_, j) => j !== i))

  return (
    <CardWrapper bg="#fff">

      {/* 헤더 */}
      <div style={{ padding: '52px 64px 36px', textAlign: 'center', borderBottom: '2.5px solid #111' }}>
        <EditText editing={editing} value={s.mainCopy || '제품 상세 정보'} onChange={v => onChange('mainCopy', v)}
          style={{ fontSize: 32, fontWeight: 900, color: '#111', letterSpacing: '-0.025em', marginBottom: 10, fontFamily: SERIF }} />
        {(s.subCopy || editing) && (
          <EditText editing={editing} value={s.subCopy} onChange={v => onChange('subCopy', v)}
            style={{ fontSize: 15, color: '#888', lineHeight: 1.65 }} />
        )}
      </div>

      {/* 표 */}
      <div style={{ padding: '0 64px 72px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 36 }}>
          <thead>
            <tr style={{ background: '#f5f4f0', borderBottom: '2px solid #333' }}>
              <th style={{ padding: '14px 20px', fontSize: 13, fontWeight: 700, color: '#333', textAlign: 'left', width: '28%', borderRight: '1px solid #e4e2dc' }}>항목</th>
              <th style={{ padding: '14px 20px', fontSize: 13, fontWeight: 700, color: '#333', textAlign: 'left' }}>내용</th>
              {editing && <th style={{ width: 44 }} />}
            </tr>
          </thead>
          <tbody>
            {displayPts.map((p, i) => {
              const sep = p.indexOf('::')
              const key = sep >= 0 ? p.slice(0, sep) : p
              const val = sep >= 0 ? p.slice(sep + 2) : ''
              return (
                <tr key={i} style={{ borderBottom: '1px solid #e4e2dc', background: i % 2 === 0 ? '#fff' : '#fafaf8' }}>
                  <td style={{ padding: '14px 20px', fontSize: 14, fontWeight: 600, color: '#555', borderRight: '1px solid #e4e2dc', verticalAlign: 'middle' }}>
                    {editing
                      ? <input value={key} onChange={e => { const n=[...pts]; n[i]=e.target.value+'::'+val; onChange('points',n) }}
                          style={{ width:'100%', border:'1px solid #3b82f6', borderRadius:5, padding:'5px 8px', fontSize:13, fontFamily:'inherit', outline:'none', boxSizing:'border-box' }} />
                      : key
                    }
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: 14, color: '#222', verticalAlign: 'middle' }}>
                    {editing
                      ? <input value={val} onChange={e => { const n=[...pts]; n[i]=key+'::'+e.target.value; onChange('points',n) }}
                          style={{ width:'100%', border:'1px solid #3b82f6', borderRadius:5, padding:'5px 8px', fontSize:13, fontFamily:'inherit', outline:'none', boxSizing:'border-box' }} />
                      : val ? <span style={{ whiteSpace:'pre-wrap' }}>{val}</span> : <span style={{ color:'#ccc' }}>—</span>
                    }
                  </td>
                  {editing && (
                    <td style={{ textAlign:'center', padding:'0 8px', verticalAlign:'middle' }}>
                      <button onClick={() => delRow(i)} style={{ width:24, height:24, borderRadius:6, border:'1px solid #fca5a5', background:'#fef2f2', color:'#ef4444', fontSize:13, cursor:'pointer', fontWeight:700, lineHeight:1 }}>×</button>
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
        {editing && (
          <button onClick={addRow} style={{ marginTop:16, width:'100%', padding:'11px 0', fontSize:13, fontWeight:600, border:'1.5px dashed #ccc', borderRadius:8, background:'transparent', color:'#888', cursor:'pointer' }}>
            + 항목 추가
          </button>
        )}
      </div>

    </CardWrapper>
  )
}

export const TPL = { hero: TplHero, material: TplMaterial, detail2col: TplDetail2col, scene: TplScene, compare: TplCompare, points3: TplPoints3, target: TplTarget, cta: TplCTA, specTable: TplSpecTable }
