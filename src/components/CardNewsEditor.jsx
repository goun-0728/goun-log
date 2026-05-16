// src/components/CardNewsEditor.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react'
import { C } from '../constants'
import { parseBlocks, capturePNG, readFileAsDataURL } from '../utils'

// ── 파서 ────────────────────────────────────────────────────────
function parseCardResult(text) {
  const DEFS = [
    { id: 1, type: '훅',    mainText: '', subText: '', title: '', content: '', highlight: '', buttonText: '', bgColor: '#1a1a2e', fgColor: '#ffffff', accentColor: '#e94560', image: null, layout: 'center' },
    { id: 2, type: '공감',  mainText: '', subText: '', title: '', content: '', highlight: '', buttonText: '', bgColor: '#fffbf5', fgColor: '#2d2926', accentColor: '#d4845a', image: null, layout: 'bottom' },
    { id: 3, type: '핵심',  mainText: '', subText: '', title: '', content: '', highlight: '', buttonText: '', bgColor: '#f0f5ff', fgColor: '#1e3a8a', accentColor: '#3b82f6', image: null, layout: 'bottom' },
    { id: 4, type: '차별점', mainText: '', subText: '', title: '', content: '', highlight: '', buttonText: '', bgColor: '#faf5ff', fgColor: '#4c1d95', accentColor: '#8b5cf6', image: null, layout: 'bottom' },
    { id: 5, type: 'CTA',   mainText: '', subText: '', title: '', content: '', highlight: '', buttonText: '', bgColor: '#1d6b45', fgColor: '#ffffff', accentColor: '#6fcf9e', image: null, layout: 'center' },
  ]
  try {
    const section = text.match(/▼ 카드 구성([\s\S]*?)(?=\n▼|$)/)?.[1] || text
    const re = /\[카드\s*(\d+)[^\]]*\]([\s\S]*?)(?=\[카드\s*\d+|$)/g
    const result = DEFS.map(d => ({ ...d }))
    let m
    while ((m = re.exec(section)) !== null) {
      const i = parseInt(m[1]) - 1
      if (i < 0 || i >= 5) continue
      const body = m[2]
      const gf = key => { const f = body.match(new RegExp(key + ':\\s*([^\\n]+)')); return f ? f[1].trim() : '' }
      result[i] = {
        ...result[i],
        mainText:    gf('메인문구'),
        subText:     gf('서브문구'),
        title:       gf('제목'),
        content:     gf('내용'),
        highlight:   gf('강조단어'),
        buttonText:  gf('버튼문구'),
        bgColor:     gf('배경색')  || result[i].bgColor,
        fgColor:     gf('글자색')  || result[i].fgColor,
        accentColor: gf('포인트색') || result[i].accentColor,
      }
    }
    return result
  } catch { return DEFS }
}

// ── 강조 텍스트 ──────────────────────────────────────────────────
function HL({ text, word, color }) {
  if (!text) return null
  if (!word) return <>{text}</>
  const parts = text.split(word)
  return (
    <>
      {parts.map((p, i) => (
        <React.Fragment key={i}>
          {p}
          {i < parts.length - 1 && <span style={{ color }}>{word}</span>}
        </React.Fragment>
      ))}
    </>
  )
}

// ── 복사 버튼 ────────────────────────────────────────────────────
function CopyBtn({ text }) {
  const [ok, set] = useState(false)
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); set(true); setTimeout(() => set(false), 2000) }}
      style={{ padding: '4px 10px', fontSize: 11, borderRadius: 6, border: `1px solid ${C.bd}`, background: ok ? '#f0fdf4' : C.sur, color: ok ? '#15803d' : C.mu, cursor: 'pointer' }}>
      {ok ? '✓ 복사됨' : '⎘ 복사'}
    </button>
  )
}

// ── 텍스트 블록 ──────────────────────────────────────────────────
function Blk({ title, lines }) {
  const tx = lines.join('\n').trim()
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: C.fa, textTransform: 'uppercase' }}>{title}</span>
        <CopyBtn text={tx} />
      </div>
      <div style={{ background: C.alt, borderRadius: 10, border: `1px solid ${C.bd}`, padding: '14px 16px' }}>
        <pre style={{ margin: 0, fontFamily: 'inherit', fontSize: 13.5, lineHeight: 1.9, color: C.tx, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{tx}</pre>
      </div>
    </div>
  )
}

// ── 텍스트 입력 필드 ─────────────────────────────────────────────
function Field({ label, value, onChange, multiline }) {
  return (
    <div>
      <label style={{ fontSize: 10, color: C.mu, display: 'block', marginBottom: 3 }}>{label}</label>
      {multiline
        ? <textarea value={value} onChange={e => onChange(e.target.value)} rows={3}
            style={{ width: '100%', padding: '6px 8px', fontSize: 12, border: `1px solid ${C.bd}`, borderRadius: 6, fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box', outline: 'none' }} />
        : <input value={value} onChange={e => onChange(e.target.value)}
            style={{ width: '100%', padding: '6px 8px', fontSize: 12, border: `1px solid ${C.bd}`, borderRadius: 6, fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none' }} />
      }
    </div>
  )
}

// ── 카드 내용 (1080×1350 렌더러) ─────────────────────────────────
function CardContent({ card }) {
  const { type, mainText, subText, title, content, highlight, buttonText, bgColor, fgColor, accentColor, image, layout } = card
  const ts = image ? '0 2px 16px rgba(0,0,0,0.65)' : 'none'
  const base = {
    width: '100%', height: '100%',
    display: 'flex', flexDirection: 'column',
    position: 'relative', zIndex: 2,
    boxSizing: 'border-box', padding: '80px 72px',
  }

  if (type === '훅') {
    return (
      <div style={{ ...base, alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <div style={{ width: 48, height: 4, background: accentColor, marginBottom: 48, borderRadius: 2 }} />
        <h1 style={{ fontSize: 80, fontWeight: 900, color: fgColor, lineHeight: 1.15, textShadow: ts, margin: '0 0 32px', whiteSpace: 'pre-wrap', wordBreak: 'keep-all' }}>
          {mainText || '메인 문구'}
        </h1>
        <div style={{ width: 48, height: 2, background: accentColor, opacity: 0.5, marginBottom: 32, borderRadius: 2 }} />
        <p style={{ fontSize: 30, color: fgColor, opacity: 0.85, textShadow: ts, margin: 0, lineHeight: 1.65, wordBreak: 'keep-all' }}>
          {subText || '서브 문구'}
        </p>
      </div>
    )
  }

  if (type === 'CTA') {
    return (
      <div style={{ ...base, alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <p style={{ fontSize: 28, color: fgColor, opacity: 0.75, textShadow: ts, margin: '0 0 24px', lineHeight: 1.65, wordBreak: 'keep-all' }}>
          {subText || '서브 문구'}
        </p>
        <div style={{ width: 48, height: 4, background: accentColor, marginBottom: 28, borderRadius: 2 }} />
        <h1 style={{ fontSize: 64, fontWeight: 900, color: fgColor, lineHeight: 1.2, textShadow: ts, margin: '0 0 56px', whiteSpace: 'pre-wrap', wordBreak: 'keep-all' }}>
          {mainText || '메인 문구'}
        </h1>
        <div style={{ background: accentColor, borderRadius: 100, padding: '22px 72px', display: 'inline-block' }}>
          <span style={{ fontSize: 28, fontWeight: 700, color: bgColor }}>{buttonText || '버튼 문구'}</span>
        </div>
      </div>
    )
  }

  // 공감 / 핵심 / 차별점 (본문 카드)
  const justMap = { top: 'flex-start', center: 'center', bottom: 'flex-end' }
  return (
    <div style={{ ...base, justifyContent: justMap[layout] || 'flex-end' }}>
      <div style={{ fontSize: 18, color: accentColor, fontWeight: 700, letterSpacing: '0.15em', marginBottom: 24, textShadow: ts }}>
        {String(card.id).padStart(2, '0')}
      </div>
      <h2 style={{ fontSize: 56, fontWeight: 800, color: fgColor, lineHeight: 1.2, textShadow: ts, margin: '0 0 32px', wordBreak: 'keep-all' }}>
        {title || '제목'}
      </h2>
      <p style={{ fontSize: 28, color: fgColor, opacity: 0.88, lineHeight: 1.75, textShadow: ts, margin: 0, wordBreak: 'keep-all' }}>
        <HL text={content || '내용'} word={highlight} color={accentColor} />
      </p>
    </div>
  )
}

// ── 개별 카드 에디터 ─────────────────────────────────────────────
function CardEditor({ card, idx, onUpdate }) {
  const [editing,   setEditing]   = useState(false)
  const [dr,        setDr]        = useState({ ...card })
  const [saved,     setSaved]     = useState(true)
  const [dl,        setDl]        = useState(false)
  const [showPanel, setShowPanel] = useState(false)
  const [scale,     setScale]     = useState(0.5)

  const ref     = useRef(null)
  const wrapRef = useRef(null)
  const fileRef = useRef(null)

  useEffect(() => { setDr({ ...card }); setSaved(true) }, [card])

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const obs = new ResizeObserver(() => setScale(el.offsetWidth / 1080))
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const change = (key, val) => { setDr(d => ({ ...d, [key]: val })); setSaved(false) }

  const save = () => { onUpdate(idx, { ...dr }); setEditing(false); setSaved(true) }
  const cancel = () => { setDr({ ...card }); setEditing(false); setShowPanel(false); setSaved(true) }

  const dlPNG = async () => {
    if (!ref.current || !saved) return
    setDl(true)
    try { await capturePNG(ref.current, `card_${idx + 1}_${card.type}.png`) }
    catch (e) { alert('저장 오류: ' + e.message) }
    finally { setDl(false) }
  }

  const handleImg = async e => {
    const f = e.target.files[0]; if (!f) return
    const url = await readFileAsDataURL(f)
    change('image', url)
    e.target.value = ''
  }

  const CARD_W = 1080, CARD_H = 1350
  const dlDisabled = dl || !saved

  return (
    <div style={{ marginBottom: 20, borderRadius: 12, overflow: 'hidden', border: `2px solid ${editing ? '#3b82f6' : C.bd}`, transition: 'border-color .2s' }}>

      {/* ── 툴바 ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', background: editing ? '#EFF6FF' : C.alt, borderBottom: `1px solid ${editing ? '#BFDBFE' : C.bd}`, flexWrap: 'wrap', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: dr.accentColor }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: C.tx }}>카드 {idx + 1}</span>
          <span style={{ fontSize: 11, color: C.mu }}>{card.type}</span>
          {!saved && <span style={{ fontSize: 10, color: '#d97706', background: '#fffbeb', padding: '2px 7px', borderRadius: 10, border: '1px solid #fcd34d' }}>● 미저장</span>}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {editing
            ? <>
                <button onClick={save} style={{ padding: '5px 14px', fontSize: 11, borderRadius: 7, border: 'none', background: '#3b82f6', color: '#fff', cursor: 'pointer', fontWeight: 700 }}>✓ 저장</button>
                <button onClick={cancel} style={{ padding: '5px 10px', fontSize: 11, borderRadius: 7, border: `1px solid ${C.bd}`, background: C.sur, color: C.mu, cursor: 'pointer' }}>취소</button>
              </>
            : <button onClick={() => { setEditing(true); setShowPanel(true) }}
                style={{ padding: '5px 12px', fontSize: 11, borderRadius: 7, border: `1px solid ${C.bd}`, background: C.sur, color: C.mu, cursor: 'pointer', fontWeight: 600 }}>✎ 수정</button>
          }
          <button
            onClick={dlPNG}
            disabled={dlDisabled}
            title={!saved ? '수정 후 저장해야 다운로드 가능합니다' : 'PNG 저장'}
            style={{ padding: '5px 10px', fontSize: 11, borderRadius: 7, border: `1px solid ${dlDisabled ? C.bd : '#1d6b45'}`, background: dlDisabled ? C.alt : '#f0fdf4', color: dlDisabled ? C.fa : '#1d6b45', cursor: dlDisabled ? 'not-allowed' : 'pointer', fontWeight: dlDisabled ? 400 : 600 }}>
            {dl ? '변환 중…' : dlDisabled ? '저장 후 다운로드' : '↓ PNG'}
          </button>
        </div>
      </div>

      {/* ── 2단: 카드 미리보기 + 사이드패널 ── */}
      <div style={{ display: 'flex', alignItems: 'stretch' }}>

        {/* 카드 미리보기 (PNG 캡처 대상) */}
        <div ref={wrapRef} style={{ flex: 1, minWidth: 0, position: 'relative', background: '#e8e6e0', overflow: 'hidden' }}>
          {/* 4:5 비율박스 (paddingTop = 1350/1080 × 100%) */}
          <div style={{ paddingTop: '125%', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' }}>
              <div style={{ width: CARD_W, transformOrigin: 'top left', transform: `scale(${scale})` }}>
                <div
                  ref={ref}
                  data-card-img
                  style={{
                    width: CARD_W, height: CARD_H,
                    position: 'relative',
                    background: dr.bgColor,
                    overflow: 'hidden',
                    fontFamily: "'Noto Sans KR','Apple SD Gothic Neo',sans-serif",
                  }}
                >
                  {/* 배경 이미지 */}
                  {dr.image && (
                    <img src={dr.image} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }} />
                  )}
                  {/* 텍스트 가독성 오버레이 (사진 있을 때만) */}
                  {dr.image && (
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.6) 100%)', zIndex: 1 }} />
                  )}
                  {/* 카드 내용 — 항상 최상위 */}
                  <CardContent card={dr} />
                  {/* 브랜딩 */}
                  <div style={{ position: 'absolute', bottom: 20, right: 28, fontSize: 14, color: dr.fgColor, opacity: 0.12, zIndex: 3 }}>ContentOS</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 사이드 패널 */}
        {(editing || showPanel) && (
          <div style={{ width: 284, minWidth: 284, borderLeft: `1px solid ${C.bd}`, background: '#F8FAFF', overflowY: 'auto', animation: 'slideInRight .22s ease' }}>
            <div style={{ padding: '16px 14px 28px' }}>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleImg} style={{ display: 'none' }} />

              {/* 사진 업로드 */}
              <p style={{ fontSize: 10, fontWeight: 700, color: C.fa, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 7 }}>사진</p>
              <div style={{ marginBottom: 18 }}>
                {dr.image
                  ? <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => fileRef.current?.click()} style={{ flex: 1, padding: '8px', fontSize: 11, borderRadius: 7, border: `1px solid ${C.bd}`, background: C.sur, cursor: 'pointer', color: C.tx, fontWeight: 600 }}>📷 교체</button>
                      <button onClick={() => change('image', null)} style={{ padding: '8px 12px', fontSize: 11, borderRadius: 7, border: '1px solid #fca5a5', background: '#fef2f2', cursor: 'pointer', color: '#ef4444' }}>✕ 제거</button>
                    </div>
                  : <button onClick={() => fileRef.current?.click()} style={{ width: '100%', padding: '12px', fontSize: 11, borderRadius: 7, border: `2px dashed ${C.bd}`, background: C.sur, cursor: 'pointer', color: C.mu }}>📷 사진 업로드</button>
                }
              </div>

              {/* 텍스트 위치 (본문 카드만) */}
              {!['훅', 'CTA'].includes(card.type) && (
                <>
                  <p style={{ fontSize: 10, fontWeight: 700, color: C.fa, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 7 }}>텍스트 위치</p>
                  <div style={{ display: 'flex', gap: 5, marginBottom: 18 }}>
                    {[['top', '위'], ['center', '중앙'], ['bottom', '아래']].map(([v, l]) => (
                      <button key={v} onClick={() => change('layout', v)}
                        style={{ flex: 1, padding: '7px', fontSize: 11, borderRadius: 7, border: `1.5px solid ${dr.layout === v ? '#3b82f6' : C.bd}`, background: dr.layout === v ? '#EFF6FF' : C.sur, color: dr.layout === v ? '#1d4ed8' : C.mu, cursor: 'pointer', fontWeight: dr.layout === v ? 700 : 400 }}>
                        {l}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* 색상 */}
              <p style={{ fontSize: 10, fontWeight: 700, color: C.fa, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 7 }}>색상</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
                {[['bgColor', '배경색'], ['fgColor', '글자색'], ['accentColor', '포인트색']].map(([key, label]) => (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input type="color" value={dr[key]} onChange={e => change(key, e.target.value)}
                      style={{ width: 32, height: 32, padding: 2, border: `1px solid ${C.bd}`, borderRadius: 6, cursor: 'pointer', flexShrink: 0 }} />
                    <span style={{ fontSize: 11, color: C.mu }}>{label}</span>
                    <span style={{ fontSize: 10, color: C.fa, fontFamily: 'monospace', marginLeft: 'auto' }}>{dr[key]}</span>
                  </div>
                ))}
              </div>

              {/* 텍스트 편집 */}
              <p style={{ fontSize: 10, fontWeight: 700, color: C.fa, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 7 }}>텍스트</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {card.type === '훅' && <>
                  <Field label="메인 문구 (8자 이내)" value={dr.mainText}   onChange={v => change('mainText',   v)} />
                  <Field label="서브 문구"            value={dr.subText}    onChange={v => change('subText',    v)} />
                </>}
                {card.type === 'CTA' && <>
                  <Field label="메인 문구"  value={dr.mainText}   onChange={v => change('mainText',   v)} />
                  <Field label="서브 문구"  value={dr.subText}    onChange={v => change('subText',    v)} />
                  <Field label="버튼 문구"  value={dr.buttonText} onChange={v => change('buttonText', v)} />
                </>}
                {['공감', '핵심', '차별점'].includes(card.type) && <>
                  <Field label="제목"      value={dr.title}     onChange={v => change('title',     v)} />
                  <Field label="내용"      value={dr.content}   onChange={v => change('content',   v)} multiline />
                  <Field label="강조 단어" value={dr.highlight} onChange={v => change('highlight', v)} />
                </>}
              </div>

              <div style={{ marginTop: 16, padding: '10px 12px', background: '#EFF6FF', borderRadius: 9, border: '1px solid #BFDBFE', fontSize: 11, color: '#1d4ed8', lineHeight: 1.8 }}>
                저장 후 PNG 다운로드 가능
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── 카드뉴스 뷰 (메인 export) ────────────────────────────────────
export default function CardNewsView({ result }) {
  const [cards, setCards] = useState(() => parseCardResult(result))
  const [dlAll, setDlAll] = useState(false)

  useEffect(() => { setCards(parseCardResult(result)) }, [result])

  const updateCard = useCallback((idx, newCard) => {
    setCards(prev => prev.map((c, i) => i === idx ? { ...newCard } : c))
  }, [])

  const dlAllPNG = async () => {
    setDlAll(true)
    const els = document.querySelectorAll('[data-card-img]')
    for (let i = 0; i < els.length; i++) {
      try {
        await capturePNG(els[i], `card_${i + 1}.png`)
        await new Promise(r => setTimeout(r, 600))
      } catch (e) { console.error(e) }
    }
    setDlAll(false)
  }

  const blocks = parseBlocks(result)
  const caption = blocks.find(b => b.title === '캡션')
  const hashtag = blocks.find(b => b.title === '해시태그')

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <span style={{ fontSize: 10, fontWeight: 700, color: C.fa, textTransform: 'uppercase', letterSpacing: '0.08em' }}>인스타그램 카드뉴스</span>
          <span style={{ fontSize: 11, color: C.mu, marginLeft: 8 }}>— 수정 후 PNG 저장</span>
        </div>
        <button onClick={dlAllPNG} disabled={dlAll}
          style={{ padding: '6px 12px', fontSize: 11, borderRadius: 7, border: `1px solid ${C.bd}`, background: C.sur, color: dlAll ? C.fa : C.mu, cursor: dlAll ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
          {dlAll ? '저장 중…' : '↓ 전체 PNG'}
        </button>
      </div>
      {cards.map((card, i) => (
        <CardEditor key={i} card={card} idx={i} onUpdate={updateCard} />
      ))}
      {caption  && <Blk title="캡션"   lines={caption.lines}  />}
      {hashtag  && <Blk title="해시태그" lines={hashtag.lines} />}
    </div>
  )
}
