// src/components/BlogThumbnail.jsx
import React, { useState, useRef } from 'react'
import { C } from '../constants'
import { capturePNG, readFileAsDataURL } from '../utils'

const THUMB_W = 1000
const THUMB_H = 1000
const DISPLAY_SIZE = 540
const DISP_SCALE = DISPLAY_SIZE / THUMB_W  // 0.54

const THUMBNAIL_FONTS = [
  { v: 'Noto Sans KR',   l: '기본체'    },
  { v: 'Black Han Sans', l: '뻑뻑한산스' },
  { v: 'Nanum Myeongjo', l: '나눔명조'  },
  { v: 'Nanum Gothic',   l: '나눔고딕'  },
  { v: 'Gaegu',          l: '가애구'    },
  { v: 'Jua',            l: '주아체'    },
]

const PRESET_COLORS = ['#ffffff','#111111','#ef4444','#f59e0b','#10b981','#3b82f6','#8b5cf6','#ec4899']

function mkBox() {
  return {
    id: `tb_${Date.now()}`,
    content: '텍스트',
    x: 100, y: 100, w: 800,
    fontSize: 80,
    fontFamily: 'Noto Sans KR',
    color: '#ffffff',
    fontWeight: 700,
    textAlign: 'left',
  }
}

/* ─── 드래그 가능 텍스트 박스 (1000×1000 캔버스 내부) ─── */
function TBBox({ box, selected, capturing, onSelect, onMove, onChange }) {
  const [localEdit, setLocalEdit] = useState(false)
  const taRef = useRef(null)

  const handleMouseDown = e => {
    if (capturing || e.target.tagName === 'TEXTAREA') return
    e.stopPropagation(); e.preventDefault()
    onSelect()
    const startX = e.clientX, startY = e.clientY
    const baseX = box.x, baseY = box.y, baseW = box.w
    const move = ev => {
      const nx = Math.max(0, Math.min(THUMB_W - baseW, baseX + (ev.clientX - startX) / DISP_SCALE))
      const ny = Math.max(0, Math.min(THUMB_H - 20, baseY + (ev.clientY - startY) / DISP_SCALE))
      onMove({ x: nx, y: ny })
    }
    const up = () => { document.removeEventListener('mousemove', move); document.removeEventListener('mouseup', up) }
    document.addEventListener('mousemove', move)
    document.addEventListener('mouseup', up)
  }

  const txStyle = {
    fontSize: box.fontSize,
    fontFamily: box.fontFamily || 'Noto Sans KR',
    color: box.color || '#ffffff',
    fontWeight: box.fontWeight || 700,
    textAlign: box.textAlign || 'left',
    lineHeight: 1.4,
    whiteSpace: 'pre-wrap',
    wordBreak: 'keep-all',
  }

  return (
    <div
      onMouseDown={handleMouseDown}
      onClick={e => { e.stopPropagation(); if (!capturing) onSelect() }}
      onDoubleClick={e => {
        e.stopPropagation()
        if (!capturing) { setLocalEdit(true); setTimeout(() => taRef.current?.focus(), 0) }
      }}
      style={{
        position: 'absolute', left: box.x, top: box.y, width: box.w,
        cursor: capturing ? 'default' : 'grab', zIndex: 10, boxSizing: 'border-box',
      }}
    >
      {!capturing && selected && (
        <div style={{ position: 'absolute', inset: -2, border: '2px solid #3b82f6', borderRadius: 4, pointerEvents: 'none', zIndex: 5 }} />
      )}
      {localEdit
        ? <textarea
            ref={taRef}
            value={box.content}
            onChange={e => onChange({ content: e.target.value })}
            onBlur={() => setLocalEdit(false)}
            onClick={e => e.stopPropagation()}
            onMouseDown={e => e.stopPropagation()}
            rows={Math.max(2, (box.content || '').split('\n').length + 1)}
            style={{ ...txStyle, width: '100%', background: 'rgba(0,0,0,0.6)', border: '2px solid #3b82f6', borderRadius: 6, padding: '10px 14px', outline: 'none', resize: 'none', boxSizing: 'border-box' }}
          />
        : <p style={{ ...txStyle, margin: 0, padding: '8px 12px', textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>
            {box.content || '텍스트'}
          </p>
      }
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   메인 컴포넌트
══════════════════════════════════════════════════════════ */
export default function BlogThumbnail() {
  const [bgColor,    setBgColor]    = useState('#1A3FA3')
  const [image,      setImage]      = useState(null)
  const [boxes,      setBoxes]      = useState([])
  const [selId,      setSelId]      = useState(null)
  const [capturing,  setCapturing]  = useState(false)
  const [dl,         setDl]         = useState(false)

  const fileRef   = useRef(null)
  const canvasRef = useRef(null)

  const selBox = boxes.find(b => b.id === selId) || null

  const updBox = (id, patch) => setBoxes(bs => bs.map(b => b.id === id ? { ...b, ...patch } : b))
  const delBox = id => { setBoxes(bs => bs.filter(b => b.id !== id)); if (selId === id) setSelId(null) }

  const handleImg = async e => {
    const f = e.target.files[0]; if (!f) return
    setImage(await readFileAsDataURL(f))
    e.target.value = ''
  }

  const addBox = () => {
    const b = mkBox()
    setBoxes(bs => [...bs, b])
    setSelId(b.id)
  }

  const applyStyle = (key, val) => { if (selId) updBox(selId, { [key]: val }) }

  const dlPNG = async () => {
    if (!canvasRef.current) return
    setDl(true); setCapturing(true)
    await new Promise(r => setTimeout(r, 80))
    try {
      await capturePNG(canvasRef.current, 'blog_thumbnail.png', { windowWidth: THUMB_W })
    } catch (e) { alert('저장 오류: ' + e.message) }
    finally { setDl(false); setCapturing(false) }
  }

  return (
    <div style={{ marginTop: 24, marginBottom: 40, borderRadius: 12, overflow: 'hidden', border: `2px solid ${C.bd}` }}>

      {/* 헤더 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', background: C.alt, borderBottom: `1px solid ${C.bd}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#1A3FA3' }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: C.tx }}>블로그 썸네일</span>
          <span style={{ fontSize: 10, color: C.mu }}>1000 × 1000px</span>
        </div>
        <button onClick={dlPNG} disabled={dl}
          style={{ padding: '5px 10px', fontSize: 11, borderRadius: 7, border: `1px solid ${dl ? C.bd : '#1d6b45'}`, background: dl ? C.alt : '#f0fdf4', color: dl ? C.fa : '#1d6b45', cursor: dl ? 'not-allowed' : 'pointer', fontWeight: dl ? 400 : 600 }}>
          {dl ? '변환 중…' : '↓ PNG'}
        </button>
      </div>

      {/* 2단 레이아웃 */}
      <div style={{ display: 'flex', alignItems: 'stretch', background: C.sur }}>

        {/* ── 왼쪽: 썸네일 캔버스 (540×540 표시) ── */}
        <div style={{ position: 'relative', flexShrink: 0, width: DISPLAY_SIZE, height: DISPLAY_SIZE }}>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleImg} style={{ display: 'none' }} />

          {/* 표시 영역 */}
          <div
            style={{ width: DISPLAY_SIZE, height: DISPLAY_SIZE, position: 'relative', overflow: 'hidden', background: '#e0ddd8', cursor: !image ? 'pointer' : 'default' }}
            onClick={e => { if (!image) fileRef.current?.click(); else setSelId(null) }}
          >
            {/* 실제 1000×1000 캔버스 (스케일 다운) */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: THUMB_W, height: THUMB_H, transform: `scale(${DISP_SCALE})`, transformOrigin: 'top left' }}>
              <div ref={canvasRef}
                style={{ width: THUMB_W, height: THUMB_H, position: 'relative', overflow: 'hidden', background: bgColor, fontFamily: "'Noto Sans KR','Apple SD Gothic Neo',sans-serif" }}
              >
                {/* 배경 사진 */}
                {image && (
                  <img src={image} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                )}

                {/* 사진 없을 때 플레이스홀더 */}
                {!image && !capturing && (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                    <div style={{ fontSize: 120, marginBottom: 24, opacity: 0.4 }}>📷</div>
                    <div style={{ fontSize: 40, fontWeight: 600, color: 'rgba(255,255,255,0.55)' }}>사진 업로드</div>
                  </div>
                )}

                {/* 텍스트 박스들 */}
                {boxes.map(box => (
                  <TBBox
                    key={box.id}
                    box={box}
                    selected={selId === box.id && !capturing}
                    capturing={capturing}
                    onSelect={() => setSelId(box.id)}
                    onMove={pos => updBox(box.id, pos)}
                    onChange={patch => updBox(box.id, patch)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* 사진 X 버튼 (스크린 좌표, 우측 상단) */}
          {image && !capturing && (
            <button
              onClick={() => setImage(null)}
              style={{ position: 'absolute', top: 8, right: 8, zIndex: 30, width: 26, height: 26, borderRadius: '50%', border: 'none', background: 'rgba(0,0,0,0.65)', color: '#fff', fontSize: 16, cursor: 'pointer', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >×</button>
          )}

          {/* 텍스트 박스 X 버튼들 (스크린 좌표, 각 박스 우측 상단) */}
          {!capturing && boxes.map(box => (
            <button
              key={`del-${box.id}`}
              onMouseDown={e => e.stopPropagation()}
              onClick={e => { e.stopPropagation(); delBox(box.id) }}
              style={{
                position: 'absolute',
                left: Math.min(DISPLAY_SIZE - 10, (box.x + box.w) * DISP_SCALE) - 10,
                top:  Math.max(0, box.y * DISP_SCALE) - 9,
                zIndex: 30, width: 20, height: 20, borderRadius: '50%',
                border: 'none', background: '#ef4444', color: '#fff',
                fontSize: 13, cursor: 'pointer', fontWeight: 800,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >×</button>
          ))}
        </div>

        {/* ── 오른쪽: 편집 패널 ── */}
        <div style={{ flex: 1, minWidth: 0, borderLeft: `1px solid ${C.bd}`, padding: '14px 16px', overflowY: 'auto', maxHeight: DISPLAY_SIZE, background: '#F8FAFF' }}>

          {/* 배경색 */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.fa, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 7 }}>배경색</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)}
                style={{ width: 36, height: 30, padding: 2, border: `1px solid ${C.bd}`, borderRadius: 6, cursor: 'pointer' }} />
              <span style={{ fontSize: 11, color: C.fa, fontFamily: 'monospace' }}>{bgColor}</span>
            </div>
          </div>

          {/* 사진 업로드 */}
          <button onClick={() => fileRef.current?.click()}
            style={{ width: '100%', padding: '7px', fontSize: 11, borderRadius: 7, border: `1px solid ${C.bd}`, background: C.sur, cursor: 'pointer', fontWeight: 600, marginBottom: 10, color: C.mu }}>
            📷 {image ? '사진 교체' : '사진 업로드'}
          </button>

          {/* 텍스트 추가 */}
          <button onClick={addBox}
            style={{ width: '100%', padding: '8px 0', fontSize: 13, fontWeight: 700, borderRadius: 7, border: '1.5px dashed #3b82f6', background: '#eff6ff', color: '#1d4ed8', cursor: 'pointer', marginBottom: 14 }}>
            + 텍스트 추가
          </button>

          {/* 텍스트 편집 (선택된 박스가 있을 때) */}
          {selBox && (
            <>
              <div style={{ borderTop: `1px solid ${C.bd}`, marginBottom: 12 }} />
              <div style={{ fontSize: 10, fontWeight: 700, color: C.fa, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 10 }}>텍스트 편집</div>

              {/* 폰트 선택 */}
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 10, color: C.mu, marginBottom: 5 }}>폰트</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                  {THUMBNAIL_FONTS.map(f => {
                    const on = selBox.fontFamily === f.v
                    return (
                      <button key={f.v} onClick={() => applyStyle('fontFamily', f.v)}
                        style={{ padding: '6px 5px', fontSize: 12, borderRadius: 6, border: `1.5px solid ${on ? '#3b82f6' : C.bd}`, background: on ? '#EFF6FF' : C.sur, color: on ? '#1d4ed8' : C.mu, cursor: 'pointer', fontWeight: on ? 700 : 400, textAlign: 'left', fontFamily: f.v, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {f.l}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* 글자 크기 */}
              <div style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 10, color: C.mu }}>글자 크기</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: C.tx }}>{selBox.fontSize}px</span>
                </div>
                <input type="range" min={20} max={300} value={selBox.fontSize}
                  onChange={e => applyStyle('fontSize', +e.target.value)}
                  style={{ width: '100%', accentColor: '#3b82f6' }} />
              </div>

              {/* 굵게 */}
              <button onClick={() => applyStyle('fontWeight', selBox.fontWeight >= 700 ? 400 : 700)}
                style={{ width: '100%', padding: '6px 0', fontSize: 13, borderRadius: 6, border: `1.5px solid ${selBox.fontWeight >= 700 ? '#3b82f6' : C.bd}`, background: selBox.fontWeight >= 700 ? '#EFF6FF' : C.sur, color: selBox.fontWeight >= 700 ? '#1d4ed8' : C.mu, cursor: 'pointer', fontWeight: 700, marginBottom: 10 }}>
                <strong>B</strong> 굵게
              </button>

              {/* 글자색 */}
              <div style={{ fontSize: 10, color: C.mu, marginBottom: 5 }}>글자색</div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center', marginBottom: 4 }}>
                {PRESET_COLORS.map(c => (
                  <button key={c} onClick={() => applyStyle('color', c)}
                    style={{ width: 22, height: 22, borderRadius: 4, background: c, border: selBox.color === c ? '2px solid #3b82f6' : '1px solid #ccc', cursor: 'pointer', flexShrink: 0 }} />
                ))}
                <input type="color" value={selBox.color}
                  onChange={e => applyStyle('color', e.target.value)}
                  style={{ width: 26, height: 22, border: '1px solid #ccc', padding: 0, cursor: 'pointer', borderRadius: 4, flexShrink: 0 }} />
              </div>
            </>
          )}

          {/* 텍스트 박스 목록 */}
          {boxes.length > 0 && (
            <div style={{ borderTop: `1px solid ${C.bd}`, paddingTop: 10, marginTop: 12 }}>
              <div style={{ fontSize: 10, color: C.fa, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>텍스트 박스</div>
              {boxes.map(b => (
                <div key={b.id} onClick={() => setSelId(b.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 8px', borderRadius: 6, marginBottom: 4, cursor: 'pointer', background: selId === b.id ? '#EFF6FF' : C.alt, border: `1px solid ${selId === b.id ? '#3b82f6' : C.bd}` }}>
                  <span style={{ flex: 1, fontSize: 11, color: C.tx, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.content || '텍스트'}</span>
                  <button onClick={e => { e.stopPropagation(); delBox(b.id) }}
                    style={{ width: 18, height: 18, borderRadius: '50%', border: 'none', background: '#fef2f2', color: '#ef4444', cursor: 'pointer', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>×</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
