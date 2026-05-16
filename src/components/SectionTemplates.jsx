// src/components/SectionTemplates.jsx
import React, { useRef, useState } from 'react'

const CARD_W = 860

/* ── 로마자 숫자 + 섹션별 다른 폰트 ─────────────────
   아이콘 대신 Ⅰ Ⅱ Ⅲ … 로마자로 표기
   섹션 인덱스별로 다른 폰트 사용
─────────────────────────────────────────────────── */
const ROMAN = ['Ⅰ','Ⅱ','Ⅲ','Ⅳ','Ⅴ','Ⅵ','Ⅶ','Ⅷ','Ⅸ','Ⅹ']
const ICON_FONTS = [
  "'Georgia', serif",
  "'Palatino Linotype', 'Book Antiqua', serif",
  "'Times New Roman', serif",
  "'Garamond', serif",
  "'Didot', 'Bodoni MT', serif",
  "'Baskerville', 'Baskerville Old Face', serif",
  "'Trebuchet MS', sans-serif",
  "'Gill Sans', sans-serif",
]
export const sectionRoman = i => ROMAN[i % ROMAN.length]
export const sectionFont  = i => ICON_FONTS[i % ICON_FONTS.length]

/* ── CardWrapper ───────────────────────────────── */
export function CardWrapper({ children, bg = '#fff' }) {
  return (
    <div style={{ width: CARD_W, background: bg, overflow: 'hidden', position: 'relative' }}>
      {children}
    </div>
  )
}

/* ── EditText: 인라인 편집 ──────────────────────── */
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

/* ── ImageAdjust: 사진 조정 (확대/이동) ─────────────
   드래그로 이동, 스크롤/버튼으로 확대/축소
   editing 모드에서만 조정 가능, 저장 시 transform 값 보존
─────────────────────────────────────────────────── */
export function ImageAdjust({ url, editing, onImgChange, imgMeta, onMetaChange, t }) {
  const [dragging, setDragging] = useState(false)
  const [start, setStart] = useState({ x: 0, y: 0 })
  const meta = imgMeta || { scale: 1, x: 0, y: 0 }

  const handleMouseDown = e => {
    if (!editing) return
    setDragging(true)
    setStart({ x: e.clientX - meta.x, y: e.clientY - meta.y })
    e.preventDefault()
  }
  const handleMouseMove = e => {
    if (!dragging) return
    onMetaChange({ ...meta, x: e.clientX - start.x, y: e.clientY - start.y })
  }
  const handleMouseUp = () => setDragging(false)
  const handleWheel = e => {
    if (!editing) return
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.05 : 0.05
    onMetaChange({ ...meta, scale: Math.max(0.5, Math.min(4, meta.scale + delta)) })
  }
  const zoomIn  = () => onMetaChange({ ...meta, scale: Math.min(4, meta.scale + 0.15) })
  const zoomOut = () => onMetaChange({ ...meta, scale: Math.max(0.5, meta.scale - 0.15) })
  const reset   = () => onMetaChange({ scale: 1, x: 0, y: 0 })

  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}
      onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
      onWheel={handleWheel}>
      <img src={url} alt=""
        style={{
          width: '100%', height: 'auto', display: 'block',
          transform: `scale(${meta.scale}) translate(${meta.x / meta.scale}px, ${meta.y / meta.scale}px)`,
          transformOrigin: 'center center',
          cursor: editing ? (dragging ? 'grabbing' : 'grab') : 'default',
          userSelect: 'none',
          transition: dragging ? 'none' : 'transform 0.1s',
        }}
        onMouseDown={handleMouseDown}
        draggable={false}
      />
      {/* 조정 컨트롤 — editing 모드에서만 표시 */}
      {editing && (
        <div style={{ position: 'absolute', bottom: 10, right: 10, display: 'flex', gap: 4, background: 'rgba(0,0,0,0.6)', borderRadius: 8, padding: '5px 8px' }}>
          <button onClick={zoomOut} style={{ width: 28, height: 28, borderRadius: 6, border: 'none', background: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
          <button onClick={reset}   style={{ height: 28, borderRadius: 6, border: 'none', background: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: 11, cursor: 'pointer', padding: '0 8px' }}>초기화</button>
          <button onClick={zoomIn}  style={{ width: 28, height: 28, borderRadius: 6, border: 'none', background: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
        </div>
      )}
    </div>
  )
}

/* ── ImgBox: 업로드 + 사진조정 통합 ─────────────────
   null   → 숨김
   'slot' → 업로드 박스
   url    → 이미지 + 사진조정
─────────────────────────────────────────────────── */
export function ImgBox({ url, t, label, editing = false, onImgChange, minH = 320, imgMeta, onMetaChange }) {
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
    <div style={{ position: 'relative' }}>
      <input ref={ref} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
      {/* 교체 버튼 — editing 모드 */}
      {editing && (
        <button onClick={() => ref.current?.click()}
          style={{ position: 'absolute', top: 10, left: 10, zIndex: 10, padding: '5px 12px', fontSize: 11, fontWeight: 600, background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
          📷 교체
        </button>
      )}
      <ImageAdjust
        url={url} editing={editing}
        imgMeta={imgMeta} onMetaChange={onMetaChange || (() => {})}
        t={t}
      />
    </div>
  )
}

/* ── PointInput: textarea 줄바꿈 ────────────────── */
function PointInput({ value, onChange, placeholder }) {
  return (
    <textarea value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder || '텍스트 입력 (엔터로 줄바꿈)'}
      rows={Math.max(2, (value || '').split('\n').length)}
      style={{ flex: 1, fontSize: 16, border: '1px solid #3b82f6', borderRadius: 6, padding: '8px 10px', outline: 'none', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.65, width: '100%' }}
    />
  )
}

/* ── PointList: 공통 포인트 리스트 ─────────────── */
function PointList({ pts, t, editing, onChange, s, numbered = false, plain = false }) {
  const items = editing
    ? (pts.length ? pts : [''])
    : pts.filter(p => p && p.trim())
  if (!items.length && !editing) return null

  const addPoint = () => onChange('points', [...(s.points || []), ''])
  const delPoint = i => onChange('points', (s.points || []).filter((_, j) => j !== i))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: plain ? 0 : 12, marginTop: 28 }}>
      {items.map((p, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <div style={{
            flex: 1, display: 'flex', gap: 16, alignItems: 'flex-start',
            ...(plain ? {
              padding: '14px 0',
              borderBottom: i < items.length - 1 ? `1px solid ${t.bd}` : 'none',
            } : {
              padding: '16px 20px',
              background: t.sub,
              borderRadius: 10,
              border: `1px solid ${t.bd}`,
            }),
          }}>
            {numbered
              ? <span style={{ width: 28, height: 28, borderRadius: '50%', background: t.ac, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.bg, fontSize: 14, fontWeight: 800, flexShrink: 0, marginTop: 4 }}>{i + 1}</span>
              : <span style={{ color: t.ac, fontSize: 20, flexShrink: 0, marginTop: 2, fontWeight: 700, fontFamily: sectionFont(i) }}>{ROMAN[i % ROMAN.length]}</span>
            }
            {editing
              ? <PointInput value={p} onChange={v => { const n = [...(s.points || [])]; n[i] = v; onChange('points', n) }} />
              : <span style={{ fontSize: 18, color: t.fg, lineHeight: 1.65, opacity: 0.9, whiteSpace: 'pre-wrap' }}>{p}</span>
            }
          </div>
          {editing && (
            <button onClick={() => delPoint(i)}
              style={{ width: 26, height: 26, borderRadius: 6, border: '1px solid #fca5a5', background: '#fef2f2', color: '#ef4444', fontSize: 14, cursor: 'pointer', flexShrink: 0, marginTop: plain ? 14 : 16, fontWeight: 700, lineHeight: 1 }}>×</button>
          )}
        </div>
      ))}
      {editing && (
        <button onClick={addPoint}
          style={{ marginTop: 8, padding: '8px 0', width: '100%', fontSize: 13, fontWeight: 600, border: `1.5px dashed ${t.bd}`, borderRadius: 8, background: 'transparent', color: t.ac, cursor: 'pointer' }}>
          + 항목 추가
        </button>
      )}
    </div>
  )
}

/* ════════════════════════════════════════════════
   8가지 템플릿
════════════════════════════════════════════════ */

/* ── 1. Hero (스마트스토어형) ─────────────────────
   구조: 브랜드 태그 → 강한 타이포 → 풀블리드 이미지
         → 곡선 구분선 → 핵심포인트 3열 (밝은 배경)
   배경: 디자인 테마 t.bg 자동 적용
─────────────────────────────────────────────── */
export function TplHero({ s, img, t, editing, onChange, secMeta, onSecMeta }) {
  const pts = s.points || []
  const displayPts = editing ? (pts.length ? pts : ['', '', '']) : pts.filter(p => p && p.trim())
  const cols = Math.max(1, Math.min(displayPts.length, 4))
  const addHeroPt = () => onChange('points', [...pts, ''])
  const delHeroPt = i => onChange('points', pts.filter((_, j) => j !== i))

  return (
    <CardWrapper bg={t.bg}>

      {/* ── 상단: 브랜드 태그 + 헤드라인 ── */}
      <div style={{ padding: '52px 64px 40px', textAlign: 'center' }}>

        {/* 브랜드/시리즈 라벨 (description 필드 활용) */}
        {(s.description || editing) && (
          <div style={{ marginBottom: 22 }}>
            <EditText editing={editing} value={s.description} onChange={v => onChange('description', v)}
              style={{
                display: 'inline-block', fontSize: 11, fontWeight: 800,
                color: t.ac, letterSpacing: '0.26em', textTransform: 'uppercase',
                border: `1.5px solid ${t.ac}55`, padding: '5px 20px',
                borderRadius: 30, background: `${t.ac}18`,
              }}
            />
          </div>
        )}

        {/* 메인 헤드라인 */}
        <EditText editing={editing} value={s.mainCopy} onChange={v => onChange('mainCopy', v)}
          style={{
            fontSize: 58, fontWeight: 900, color: t.fg,
            lineHeight: 1.18, letterSpacing: '-0.03em',
            marginBottom: 16, wordBreak: 'keep-all',
          }}
        />

        {/* 서브 카피 */}
        <EditText editing={editing} value={s.subCopy} onChange={v => onChange('subCopy', v)}
          style={{
            fontSize: 20, color: t.fg, opacity: 0.68,
            lineHeight: 1.72, wordBreak: 'keep-all',
          }}
        />
      </div>

      {/* ── 제품 이미지 풀블리드 ── */}
      <ImgBox
        url={img} t={t} label="메인 제품 이미지"
        editing={editing} onImgChange={v => onChange('secImg', v)}
        imgMeta={secMeta?.img1} onMetaChange={m => onSecMeta?.('img1', m)}
        minH={400}
      />

      {/* ── 곡선 구분선 + 핵심 포인트 영역 ── */}
      <div style={{ position: 'relative', overflow: 'hidden' }}>

        {/* 달걀컵 곡선 배경 */}
        <div style={{
          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
          width: '145%', height: '100%',
          background: '#ffffff',
          borderRadius: '60% 60% 0 0 / 9% 9% 0 0',
        }} />

        <div style={{ position: 'relative', padding: '60px 52px 68px' }}>

          {/* KEY POINT 라벨 */}
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <span style={{
              fontSize: 11, fontWeight: 800, letterSpacing: '0.26em',
              color: t.ac, textTransform: 'uppercase',
              borderBottom: `2.5px solid ${t.ac}`, paddingBottom: 5,
            }}>KEY POINT</span>
          </div>

          {/* 포인트 그리드 */}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 28 }}>
            {displayPts.map((raw, i) => {
              const lines = raw.split('\n')
              const ptTitle = lines[0]?.trim() || `포인트 ${i + 1}`
              const ptDesc = lines.slice(1).join('\n').trim()
              return (
                <div key={i} style={{
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', textAlign: 'center',
                  gap: 14, position: 'relative',
                }}>
                  {editing && (
                    <button onClick={() => delHeroPt(i)}
                      style={{
                        position: 'absolute', top: -8, right: -4,
                        width: 22, height: 22, borderRadius: '50%',
                        border: '1px solid #fca5a5', background: '#fef2f2',
                        color: '#ef4444', fontSize: 12, cursor: 'pointer',
                        fontWeight: 700, lineHeight: 1, zIndex: 2,
                      }}>×</button>
                  )}

                  {/* 아이콘 원 */}
                  <div style={{
                    width: 80, height: 80, borderRadius: '50%', background: t.ac,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 8px 22px rgba(0,0,0,0.14)', flexShrink: 0,
                  }}>
                    <span style={{
                      fontSize: 30, fontWeight: 700, color: t.bg,
                      fontFamily: sectionFont(i), lineHeight: 1,
                    }}>{sectionRoman(i)}</span>
                  </div>

                  {editing
                    ? <PointInput
                        value={raw}
                        onChange={v => { const n = [...pts]; n[i] = v; onChange('points', n) }}
                        placeholder={'제목\n설명(엔터로 구분)'}
                      />
                    : <>
                        <p style={{
                          fontSize: 18, fontWeight: 800, color: '#18170F',
                          margin: 0, lineHeight: 1.3, wordBreak: 'keep-all',
                        }}>{ptTitle}</p>
                        {ptDesc && (
                          <p style={{
                            fontSize: 14, color: '#6B6860',
                            margin: 0, lineHeight: 1.6,
                            wordBreak: 'keep-all', whiteSpace: 'pre-wrap',
                          }}>{ptDesc}</p>
                        )}
                      </>
                  }
                </div>
              )
            })}
          </div>

          {editing && (
            <div style={{ textAlign: 'center', marginTop: 28 }}>
              <button onClick={addHeroPt}
                style={{
                  padding: '8px 24px', fontSize: 13, fontWeight: 600,
                  border: '1.5px dashed #ccc', borderRadius: 8,
                  background: 'transparent', color: '#888', cursor: 'pointer',
                }}>+ 포인트 추가</button>
            </div>
          )}
        </div>
      </div>

    </CardWrapper>
  )
}

/* ── 2. Material ──────────────────────────────── */
export function TplMaterial({ s, img, t, editing, onChange, secMeta, onSecMeta }) {
  return (
    <CardWrapper bg={t.bg}>
      <ImgBox url={img} t={t} label="소재 이미지 1" editing={editing} onImgChange={v => onChange('secImg', v)}
        imgMeta={secMeta?.img1} onMetaChange={m => onSecMeta?.('img1', m)} />
      {s.secImg2 && (
        <div style={{ marginTop: 12 }}>
          <ImgBox url={s.secImg2} t={t} label="소재 이미지 2" editing={editing} onImgChange={v => onChange('secImg2', v)}
            imgMeta={secMeta?.img2} onMetaChange={m => onSecMeta?.('img2', m)} />
        </div>
      )}
      <div style={{ padding: '52px 64px' }}>
        <EditText editing={editing} value={s.mainCopy} onChange={v => onChange('mainCopy', v)}
          style={{ fontSize: 40, fontWeight: 800, color: t.fg, lineHeight: 1.35, letterSpacing: '-0.02em', marginBottom: 14, wordBreak: 'keep-all' }} />
        <EditText editing={editing} value={s.subCopy} onChange={v => onChange('subCopy', v)}
          style={{ fontSize: 22, color: t.fg, opacity: 0.68, lineHeight: 1.7 }} />
        <PointList pts={(s.points||[])} t={t} editing={editing} onChange={onChange} s={s} numbered />
      </div>
    </CardWrapper>
  )
}

/* ── 3. Detail 2col ───────────────────────────── */
/* 레이아웃 분기:
   이미지 짝수(2,4장) → 2열 그리드, 텍스트 아래
   이미지 홀수(1,3장) → 왼쪽 이미지 | 오른쪽 텍스트
*/
export function TplDetail2col({ s, img, t, editing, onChange, secMeta, onSecMeta }) {
  const slots = [
    { k: 'secImg',  url: img       },
    { k: 'secImg2', url: s.secImg2 },
    { k: 'secImg3', url: s.secImg3 },
    { k: 'secImg4', url: s.secImg4 },
  ]
  // 실제 이미지가 있는 슬롯 수
  const imgCount = slots.filter(sl => sl.url && sl.url !== 'slot' && sl.url !== null).length
  // editing 모드에서는 활성화된 슬롯 표시
  const active = slots.filter(sl => sl.url)
  const isOdd = active.length % 2 === 1 // 홀수이면 텍스트 오른쪽

  const TextBlock = (
    <div style={{ padding: isOdd ? '52px 52px' : '52px 64px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <EditText editing={editing} value={s.mainCopy} onChange={v => onChange('mainCopy', v)}
        style={{ fontSize: 36, fontWeight: 800, color: t.fg, lineHeight: 1.35, letterSpacing: '-0.02em', marginBottom: 14, wordBreak: 'keep-all' }} />
      <EditText editing={editing} value={s.subCopy} onChange={v => onChange('subCopy', v)}
        style={{ fontSize: 19, color: t.fg, opacity: 0.68, lineHeight: 1.65 }} />
      <PointList pts={(s.points||[])} t={t} editing={editing} onChange={onChange} s={s} />
    </div>
  )

  if (isOdd && active.length > 0) {
    // 홀수 이미지: 왼쪽 이미지 그리드 | 오른쪽 텍스트
    return (
      <CardWrapper bg={t.bg}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
          <div>
            {active.map(({ k, url }, i) => (
              <div key={k} style={{ marginBottom: i < active.length - 1 ? 12 : 0 }}>
                <ImgBox url={url || (editing ? 'slot' : null)} t={t} label={`이미지 ${i+1}`} editing={editing}
                  onImgChange={v => onChange(k, v)} minH={300}
                  imgMeta={secMeta?.[`img${i+1}`]} onMetaChange={m => onSecMeta?.(`img${i+1}`, m)} />
              </div>
            ))}
          </div>
          {TextBlock}
        </div>
      </CardWrapper>
    )
  }

  // 짝수 이미지: 2열 그리드 위 + 텍스트 아래
  return (
    <CardWrapper bg={t.bg}>
      {active.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: active.length === 1 ? '1fr' : '1fr 1fr', gap: 12 }}>
          {active.map(({ k, url }, i) => (
            <div key={k} style={{ overflow: 'hidden' }}>
              <ImgBox url={url || (editing ? 'slot' : null)} t={t} label={`이미지 ${i+1}`} editing={editing}
                onImgChange={v => onChange(k, v)} minH={380}
                imgMeta={secMeta?.[`img${i+1}`]} onMetaChange={m => onSecMeta?.(`img${i+1}`, m)} />
            </div>
          ))}
        </div>
      )}
      {TextBlock}
    </CardWrapper>
  )
}

/* ── 4. Scene ─────────────────────────────────── */
export function TplScene({ s, img, t, editing, onChange, secMeta, onSecMeta }) {
  return (
    <CardWrapper bg={t.bg}>
      <div style={{ position: 'relative' }}>
        <ImgBox url={img} t={t} label="라이프스타일 이미지" editing={editing} onImgChange={v => onChange('secImg', v)}
          imgMeta={secMeta?.img1} onMetaChange={m => onSecMeta?.('img1', m)} />
        {(img && img !== 'slot') && (
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent,rgba(0,0,0,0.62))', padding: '60px 64px 48px', pointerEvents: 'none' }}>
            <div style={{ fontSize: 40, fontWeight: 800, color: '#fff', lineHeight: 1.3, wordBreak: 'keep-all' }}>{s.mainCopy}</div>
          </div>
        )}
      </div>
      {s.secImg2 && (
        <div style={{ marginTop: 12 }}>
          <ImgBox url={s.secImg2} t={t} label="이미지 2" editing={editing} onImgChange={v => onChange('secImg2', v)}
            imgMeta={secMeta?.img2} onMetaChange={m => onSecMeta?.('img2', m)} />
        </div>
      )}
      <div style={{ padding: '48px 64px' }}>
        {editing && (
          <input value={s.mainCopy || ''} onChange={e => onChange('mainCopy', e.target.value)}
            placeholder="메인 카피 (이미지 위에 표시)" style={{ width: '100%', fontSize: 18, border: '1px solid #3b82f6', borderRadius: 7, padding: '10px 14px', outline: 'none', marginBottom: 12, fontFamily: 'inherit' }} />
        )}
        <EditText editing={editing} value={s.subCopy} onChange={v => onChange('subCopy', v)}
          style={{ fontSize: 22, color: t.fg, opacity: 0.72, lineHeight: 1.75 }} />
        <PointList pts={(s.points||[])} t={t} editing={editing} onChange={onChange} s={s} plain={true} />
      </div>
    </CardWrapper>
  )
}

/* ── 5. Compare ───────────────────────────────── */
export function TplCompare({ s, img, t, editing, onChange, secMeta, onSecMeta }) {
  const pts = s.points || []
  const displayPts = pts.length ? pts : (editing ? ['', '', ''] : [])
  const addComparePt = () => onChange('points', [...pts, ''])
  const delComparePt = i => onChange('points', pts.filter((_, j) => j !== i))
  return (
    <CardWrapper bg={t.bg}>
      <div style={{ padding: '72px 64px 48px' }}>
        <EditText editing={editing} value={s.mainCopy} onChange={v => onChange('mainCopy', v)}
          style={{ fontSize: 42, fontWeight: 800, color: t.fg, lineHeight: 1.3, letterSpacing: '-0.02em', marginBottom: 14, wordBreak: 'keep-all' }} />
        <EditText editing={editing} value={s.subCopy} onChange={v => onChange('subCopy', v)}
          style={{ fontSize: 22, color: t.fg, opacity: 0.65, marginBottom: 40, lineHeight: 1.65 }} />
        <div style={{ border: `1.5px solid ${t.bd}`, borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: t.sub }}>
            <div style={{ padding: '18px 24px', borderRight: `1px solid ${t.bd}`, borderBottom: `1px solid ${t.bd}` }}>
              <EditText editing={editing} value={s.compareLeft || '일반 제품'} onChange={v => onChange('compareLeft', v)}
                style={{ fontSize: 17, fontWeight: 700, color: '#888', textAlign: 'center' }} />
            </div>
            <div style={{ padding: '18px 24px', borderBottom: `1px solid ${t.bd}` }}>
              <EditText editing={editing} value={s.compareRight || '이 제품'} onChange={v => onChange('compareRight', v)}
                style={{ fontSize: 17, fontWeight: 700, color: t.ac, textAlign: 'center' }} />
            </div>
          </div>
          {displayPts.map((p, i) => {
            const [a, ...r] = p.split('/'); const b = r.join('/').trim()
            return editing ? (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', borderBottom: i < displayPts.length - 1 ? `1px solid ${t.bd}` : 'none' }}>
                <div style={{ padding: '10px 12px', borderRight: `1px solid ${t.bd}` }}>
                  <input
                    value={a.replace(/일반제품:/i, '').trim()}
                    onChange={e => { const n = [...pts]; const bPart = r.join('/').trim(); n[i] = e.target.value + ' / ' + bPart; onChange('points', n) }}
                    placeholder="일반 제품"
                    style={{ width: '100%', fontSize: 15, border: '1px solid #3b82f6', borderRadius: 6, padding: '7px 10px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                  />
                </div>
                <div style={{ padding: '10px 12px' }}>
                  <input
                    value={b}
                    onChange={e => { const n = [...pts]; const aPart = a.replace(/일반제품:/i, '').trim(); n[i] = aPart + ' / ' + e.target.value; onChange('points', n) }}
                    placeholder="이 제품"
                    style={{ width: '100%', fontSize: 15, border: '1px solid #3b82f6', borderRadius: 6, padding: '7px 10px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', padding: '0 8px' }}>
                  <button onClick={() => delComparePt(i)}
                    style={{ width: 24, height: 24, borderRadius: 6, border: '1px solid #fca5a5', background: '#fef2f2', color: '#ef4444', fontSize: 13, cursor: 'pointer', fontWeight: 700, lineHeight: 1 }}>×</button>
                </div>
              </div>
            ) : (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: i % 2 === 0 ? t.bg : t.sub }}>
                <div style={{ padding: '18px 24px', fontSize: 17, color: '#888', textAlign: 'center', borderRight: `1px solid ${t.bd}`, borderBottom: i < pts.length - 1 ? `1px solid ${t.bd}` : 'none', textDecoration: 'line-through', opacity: 0.7 }}>{a.replace(/일반제품:/i, '').trim()}</div>
                <div style={{ padding: '18px 24px', fontSize: 17, color: t.ac, fontWeight: 600, textAlign: 'center', borderBottom: i < pts.length - 1 ? `1px solid ${t.bd}` : 'none' }}>{b || '—'}</div>
              </div>
            )
          })}
          {editing && (
            <button onClick={addComparePt}
              style={{ width: '100%', padding: '12px 0', fontSize: 13, fontWeight: 600, border: 'none', borderTop: `1px dashed ${t.bd}`, background: t.sub, color: t.ac, cursor: 'pointer' }}>
              + 행 추가
            </button>
          )}
        </div>
      </div>
      <ImgBox url={img} t={t} label="비교 이미지 1" editing={editing} onImgChange={v => onChange('secImg', v)}
        imgMeta={secMeta?.img1} onMetaChange={m => onSecMeta?.('img1', m)} />
      {s.secImg2 && (
        <div style={{ marginTop: 12 }}>
          <ImgBox url={s.secImg2} t={t} label="비교 이미지 2" editing={editing} onImgChange={v => onChange('secImg2', v)}
            imgMeta={secMeta?.img2} onMetaChange={m => onSecMeta?.('img2', m)} />
        </div>
      )}
    </CardWrapper>
  )
}

/* ── 6. Points3 ───────────────────────────────── */
export function TplPoints3({ s, img, t, editing, onChange, secMeta, onSecMeta }) {
  const pts = s.points || []
  const displayPts = pts.length ? pts : (editing ? ['', '', ''] : [])
  const hasImg  = img && img !== 'slot'
  const hasImg2 = s.secImg2 && s.secImg2 !== 'slot'
  const addPt3 = () => onChange('points', [...pts, ''])
  const delPt3 = i => onChange('points', pts.filter((_, j) => j !== i))
  return (
    <CardWrapper bg={t.bg}>
      <div style={{ padding: '72px 64px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <EditText editing={editing} value={s.mainCopy} onChange={v => onChange('mainCopy', v)}
            style={{ fontSize: 42, fontWeight: 800, color: t.fg, lineHeight: 1.35, letterSpacing: '-0.02em', marginBottom: 14, wordBreak: 'keep-all' }} />
          <EditText editing={editing} value={s.subCopy} onChange={v => onChange('subCopy', v)}
            style={{ fontSize: 22, color: t.fg, opacity: 0.65, lineHeight: 1.7 }} />
        </div>

        {/* 포인트 카드 (개수에 따라 열 수 자동) */}
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(displayPts.length || 1, 4)},1fr)`, gap: 20, marginBottom: (hasImg || hasImg2 || editing) ? 48 : 0 }}>
          {displayPts.map((p, i) => {
            const lines = p.split('\n')
            const title = lines[0]?.trim() || `포인트 ${i+1}`
            const desc  = lines.slice(1).join('\n').trim()
            return (
              <div key={i} style={{ position: 'relative', background: t.sub, borderRadius: 14, padding: '36px 24px', textAlign: 'center', border: `1px solid ${t.bd}` }}>
                {editing && (
                  <button onClick={() => delPt3(i)}
                    style={{ position: 'absolute', top: 8, right: 8, width: 22, height: 22, borderRadius: '50%', border: '1px solid #fca5a5', background: '#fef2f2', color: '#ef4444', fontSize: 12, cursor: 'pointer', fontWeight: 700, lineHeight: 1 }}>×</button>
                )}
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: t.ac, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', color: t.bg }}>
                  <span style={{ fontSize: 22, fontWeight: 700, fontFamily: sectionFont(i), lineHeight: 1 }}>{sectionRoman(i)}</span>
                </div>
                {editing
                  ? <PointInput value={p} onChange={v => { const n = [...pts]; n[i] = v; onChange('points', n) }} placeholder={'제목\n설명(엔터로 줄바꿈)'} />
                  : <>
                      <p style={{ fontSize: 18, fontWeight: 700, color: t.fg, lineHeight: 1.4, margin: '0 0 6px', opacity: 0.95, wordBreak: 'keep-all' }}>{title}</p>
                      {desc && <p style={{ fontSize: 15, color: t.fg, lineHeight: 1.6, margin: 0, opacity: 0.65, wordBreak: 'keep-all', whiteSpace: 'pre-wrap' }}>{desc}</p>}
                    </>
                }
              </div>
            )
          })}
        </div>
        {editing && (
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <button onClick={addPt3}
              style={{ padding: '8px 24px', fontSize: 13, fontWeight: 600, border: `1.5px dashed ${t.bd}`, borderRadius: 8, background: 'transparent', color: t.ac, cursor: 'pointer' }}>
              + 포인트 추가
            </button>
          </div>
        )}

        {/* 이미지 */}
        <ImgBox url={img} t={t} label="이미지 1" editing={editing} onImgChange={v => onChange('secImg', v)}
          imgMeta={secMeta?.img1} onMetaChange={m => onSecMeta?.('img1', m)} />
        {s.secImg2 && (
          <div style={{ marginTop: 12 }}>
            <ImgBox url={s.secImg2} t={t} label="이미지 2" editing={editing} onImgChange={v => onChange('secImg2', v)}
              imgMeta={secMeta?.img2} onMetaChange={m => onSecMeta?.('img2', m)} />
          </div>
        )}
      </div>
    </CardWrapper>
  )
}

/* ── 7. Target ────────────────────────────────── */
export function TplTarget({ s, img, t, editing, onChange, secMeta, onSecMeta }) {
  const pts = s.points || []
  const displayPts = pts.length ? pts : (editing ? ['', '', ''] : [])
  const addTargetPt = () => onChange('points', [...pts, ''])
  const delTargetPt = i => onChange('points', pts.filter((_, j) => j !== i))
  return (
    <CardWrapper bg={t.bg}>
      <ImgBox url={img} t={t} label="이미지 1" editing={editing} onImgChange={v => onChange('secImg', v)}
        imgMeta={secMeta?.img1} onMetaChange={m => onSecMeta?.('img1', m)} />
      {s.secImg2 && (
        <div style={{ marginTop: 12 }}>
          <ImgBox url={s.secImg2} t={t} label="이미지 2" editing={editing} onImgChange={v => onChange('secImg2', v)}
            imgMeta={secMeta?.img2} onMetaChange={m => onSecMeta?.('img2', m)} />
        </div>
      )}
      <div style={{ padding: '60px 64px' }}>
        <EditText editing={editing} value={s.mainCopy} onChange={v => onChange('mainCopy', v)}
          style={{ fontSize: 42, fontWeight: 800, color: t.fg, lineHeight: 1.35, letterSpacing: '-0.02em', marginBottom: 14, wordBreak: 'keep-all' }} />
        <EditText editing={editing} value={s.subCopy} onChange={v => onChange('subCopy', v)}
          style={{ fontSize: 22, color: t.fg, opacity: 0.65, marginBottom: 36, lineHeight: 1.65 }} />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {displayPts.map((p, i, a) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 18, padding: '16px 4px', borderBottom: i < a.length - 1 ? `1px solid ${t.bd}` : 'none' }}>
              <span style={{ width: 32, height: 32, borderRadius: '50%', background: t.ac, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.bg, fontSize: 15, fontWeight: 700, flexShrink: 0, marginTop: 2 }}>✓</span>
              {editing
                ? <PointInput value={p} onChange={v => { const n = [...pts]; n[i] = v; onChange('points', n) }} />
                : <span style={{ fontSize: 20, color: t.fg, lineHeight: 1.65, opacity: 0.9, whiteSpace: 'pre-wrap' }}>{p.replace(/이런 분께 추천\d*:/i, '').trim()}</span>
              }
              {editing && (
                <button onClick={() => delTargetPt(i)}
                  style={{ width: 26, height: 26, borderRadius: 6, border: '1px solid #fca5a5', background: '#fef2f2', color: '#ef4444', fontSize: 14, cursor: 'pointer', flexShrink: 0, marginTop: 2, fontWeight: 700, lineHeight: 1 }}>×</button>
              )}
            </div>
          ))}
        </div>
        {editing && (
          <button onClick={addTargetPt}
            style={{ marginTop: 12, padding: '10px 0', width: '100%', fontSize: 13, fontWeight: 600, border: `1.5px dashed ${t.bd}`, borderRadius: 8, background: 'transparent', color: t.ac, cursor: 'pointer' }}>
            + 항목 추가
          </button>
        )}
      </div>
    </CardWrapper>
  )
}

/* ── 8. CTA — 구매하기 버튼 없음 ─────────────── */
export function TplCTA({ s, img, t, editing, onChange, secMeta, onSecMeta }) {
  return (
    <CardWrapper bg={t.bg}>
      <div style={{ position: 'relative' }}>
        <ImgBox url={img} t={t} label="CTA 이미지" editing={editing} onImgChange={v => onChange('secImg', v)}
          imgMeta={secMeta?.img1} onMetaChange={m => onSecMeta?.('img1', m)} />
        {(img && img !== 'slot') && <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(transparent 40%,${t.bg})`, pointerEvents: 'none' }} />}
      </div>
      {s.secImg2 && (
        <div style={{ marginTop: 12 }}>
          <ImgBox url={s.secImg2} t={t} label="추가 이미지" editing={editing} onImgChange={v => onChange('secImg2', v)}
            imgMeta={secMeta?.img2} onMetaChange={m => onSecMeta?.('img2', m)} />
        </div>
      )}
      <div style={{ padding: '56px 80px 72px', textAlign: 'center' }}>
        <EditText editing={editing} value={s.mainCopy} onChange={v => onChange('mainCopy', v)}
          style={{ fontSize: 44, fontWeight: 800, color: t.fg, lineHeight: 1.3, letterSpacing: '-0.025em', marginBottom: 18, wordBreak: 'keep-all' }} />
        <EditText editing={editing} value={s.subCopy} onChange={v => onChange('subCopy', v)}
          style={{ fontSize: 22, color: t.fg, opacity: 0.65, lineHeight: 1.7 }} />
        {/* 구매하기 버튼 없음 — CTA는 텍스트로만 */}
      </div>
    </CardWrapper>
  )
}

export const TPL = { hero: TplHero, material: TplMaterial, detail2col: TplDetail2col, scene: TplScene, compare: TplCompare, points3: TplPoints3, target: TplTarget, cta: TplCTA }
