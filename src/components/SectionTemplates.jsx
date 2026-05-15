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
function ImageAdjust({ url, editing, onImgChange, imgMeta, onMetaChange, t }) {
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
  // 내용 있는 항목만 표시 (editing 모드에서는 빈 항목도 표시)
  const items = editing
    ? (pts.length ? pts : [''])
    : pts.filter(p => p && p.trim())
  if (!items.length) return null
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: plain ? 0 : 12, marginTop: 28 }}>
      {items.map((p, i) => (
        <div key={i} style={{
          display: 'flex', gap: 16, alignItems: 'flex-start',
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
      ))}
    </div>
  )
}

/* ════════════════════════════════════════════════
   8가지 템플릿
════════════════════════════════════════════════ */

/* ── 1. Hero ──────────────────────────────────── */
export function TplHero({ s, img, t, editing, onChange, secMeta, onSecMeta }) {
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
          <ImgBox url={img} t={t} label="메인 제품 이미지" editing={editing} onImgChange={v => onChange('secImg', v)}
            imgMeta={secMeta?.img1} onMetaChange={m => onSecMeta?.('img1', m)} />
        </div>
        {s.secImg2 && (
          <div style={{ margin: '16px 40px 0' }}>
            <ImgBox url={s.secImg2} t={t} label="서브 이미지" editing={editing} onImgChange={v => onChange('secImg2', v)}
              imgMeta={secMeta?.img2} onMetaChange={m => onSecMeta?.('img2', m)} />
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
                  <div style={{ width: 100, height: 100, borderRadius: '50%', background: '#f8b62d', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 20px rgba(248,182,45,0.4)', flexShrink: 0 }}>
                    <span style={{ fontSize: 36, fontWeight: 700, color: '#231815', fontFamily: sectionFont(i), lineHeight: 1 }}>{sectionRoman(i)}</span>
                  </div>
                  {editing
                    ? <PointInput value={raw} onChange={v => { const n = [...(s.points || [])]; n[i] = v; onChange('points', n) }} placeholder={'제목\n설명(엔터로 구분)'} />
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
        <PointList pts={(s.points||[]).slice(0,4)} t={t} editing={editing} onChange={onChange} s={s} numbered />
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
      <PointList pts={(s.points||[]).slice(0,4)} t={t} editing={editing} onChange={onChange} s={s} />
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
        <PointList pts={(s.points||[]).slice(0,4)} t={t} editing={editing} onChange={onChange} s={s} plain={true} />
      </div>
    </CardWrapper>
  )
}

/* ── 5. Compare ───────────────────────────────── */
export function TplCompare({ s, img, t, editing, onChange, secMeta, onSecMeta }) {
  const pts = (s.points || []).slice(0, 5)
  return (
    <CardWrapper bg={t.bg}>
      <div style={{ padding: '72px 64px 48px' }}>
        <EditText editing={editing} value={s.mainCopy} onChange={v => onChange('mainCopy', v)}
          style={{ fontSize: 42, fontWeight: 800, color: t.fg, lineHeight: 1.3, letterSpacing: '-0.02em', marginBottom: 14, wordBreak: 'keep-all' }} />
        <EditText editing={editing} value={s.subCopy} onChange={v => onChange('subCopy', v)}
          style={{ fontSize: 22, color: t.fg, opacity: 0.65, marginBottom: 40, lineHeight: 1.65 }} />
        <div style={{ border: `1.5px solid ${t.bd}`, borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: t.sub }}>
            <div style={{ padding: '18px 24px', fontSize: 17, fontWeight: 700, color: '#888', textAlign: 'center', borderRight: `1px solid ${t.bd}`, borderBottom: `1px solid ${t.bd}` }}>일반 제품</div>
            <div style={{ padding: '18px 24px', fontSize: 17, fontWeight: 700, color: t.ac, textAlign: 'center', borderBottom: `1px solid ${t.bd}` }}>이 제품</div>
          </div>
          {(pts.length ? pts : (editing ? ['', '', ''] : [])).map((p, i) => {
            const [a, ...r] = p.split('/'); const b = r.join('/').trim()
            return editing ? (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: i < (pts.length || 3) - 1 ? `1px solid ${t.bd}` : 'none' }}>
                <div style={{ padding: '10px 12px', borderRight: `1px solid ${t.bd}` }}>
                  <input
                    value={a.replace(/일반제품:/i, '').trim()}
                    onChange={e => { const n = [...(s.points || [])]; const bPart = r.join('/').trim(); n[i] = e.target.value + ' / ' + bPart; onChange('points', n) }}
                    placeholder="일반 제품"
                    style={{ width: '100%', fontSize: 15, border: '1px solid #3b82f6', borderRadius: 6, padding: '7px 10px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                  />
                </div>
                <div style={{ padding: '10px 12px' }}>
                  <input
                    value={b}
                    onChange={e => { const n = [...(s.points || [])]; const aPart = a.replace(/일반제품:/i, '').trim(); n[i] = aPart + ' / ' + e.target.value; onChange('points', n) }}
                    placeholder="이 제품"
                    style={{ width: '100%', fontSize: 15, border: '1px solid #3b82f6', borderRadius: 6, padding: '7px 10px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                  />
                </div>
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
  const pts = (s.points || []).slice(0, 3)
  const hasImg  = img && img !== 'slot'
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

        {/* 3단 카드 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, marginBottom: (hasImg || hasImg2 || editing) ? 48 : 0 }}>
          {(pts.length ? pts : (editing ? ['','',''] : [])).map((p, i) => {
            const lines = p.split('\n')
            const title = lines[0]?.trim() || `포인트 ${i+1}`
            const desc  = lines.slice(1).join('\n').trim()
            return (
              <div key={i} style={{ background: t.sub, borderRadius: 14, padding: '36px 24px', textAlign: 'center', border: `1px solid ${t.bd}` }}>
                {/* 로마자 숫자 원형 */}
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: t.ac, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', color: t.bg }}>
                  <span style={{ fontSize: 22, fontWeight: 700, fontFamily: sectionFont(i), lineHeight: 1 }}>{sectionRoman(i)}</span>
                </div>
                {editing
                  ? <PointInput value={p} onChange={v => { const n = [...(s.points || [])]; n[i] = v; onChange('points', n) }} placeholder={'제목\n설명(엔터로 줄바꿈)'} />
                  : <>
                      <p style={{ fontSize: 18, fontWeight: 700, color: t.fg, lineHeight: 1.4, margin: '0 0 6px', opacity: 0.95, wordBreak: 'keep-all' }}>{title}</p>
                      {desc && <p style={{ fontSize: 15, color: t.fg, lineHeight: 1.6, margin: 0, opacity: 0.65, wordBreak: 'keep-all', whiteSpace: 'pre-wrap' }}>{desc}</p>}
                    </>
                }
              </div>
            )
          })}
        </div>

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
  const pts = (s.points || []).slice(0, 5)
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
          {(pts.length ? pts : (editing ? ['','',''] : [])).map((p, i, a) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 18, padding: '16px 4px', borderBottom: i < a.length - 1 ? `1px solid ${t.bd}` : 'none' }}>
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
