// src/App.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react'
import { C, TASKS, BLOG_TONES, DS, getSys } from './constants'
import { parseBlocks, parseSections, readFileAsDataURL, capturePNG, downloadURL } from './utils'
import { generateContent } from './api/generate'
import SectionEditor from './components/SectionEditor'

/* ── 미니 컴포넌트 ─────────────────────────────────── */
function Spin() {
  return <span style={{ display: 'inline-block', width: 14, height: 14, borderRadius: '50%', border: '2px solid #ddd', borderTopColor: '#555', animation: 'sp .6s linear infinite', flexShrink: 0 }} />
}

function CopyBtn({ text }) {
  const [ok, set] = useState(false)
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); set(true); setTimeout(() => set(false), 2000) }} style={{ padding: '4px 10px', fontSize: 11, borderRadius: 6, border: `1px solid ${C.bd}`, background: ok ? '#f0fdf4' : C.sur, color: ok ? '#15803d' : C.mu, cursor: 'pointer' }}>
      {ok ? '✓ 복사됨' : '⎘ 복사'}
    </button>
  )
}

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

/* ── 상세페이지 결과 뷰 ─────────────────────────────── */
function DetailView({ result }) {
  const top = parseBlocks(result)
  const rep = top.find(b => b.title === '기획 보고서')
  const seo = top.find(b => b.title.includes('SEO'))
  const [sects, setSects] = useState(() => parseSections(result))
  const [planOpen, setPlanOpen] = useState({})
  const [dlAll, setDlAll] = useState(false)

  const upd = useCallback((i, v) => setSects(p => p.map((s, j) => j === i ? v : s)), [])

  const dlAllPNG = async () => {
    setDlAll(true)
    const els = document.querySelectorAll('[data-sect]')
    for (let i = 0; i < els.length; i++) {
      try {
        await capturePNG(els[i], `section_${i + 1}.png`)
        await new Promise(r => setTimeout(r, 600))
      } catch (e) { console.error(e) }
    }
    setDlAll(false)
  }

  return (
    <div>
      {rep && <Blk title="기획 보고서" lines={rep.lines} />}

      {/* 섹션별 기획안 (아코디언) */}
      {sects.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: C.fa, textTransform: 'uppercase', letterSpacing: '0.08em' }}>섹션별 기획안</span>
            <span style={{ fontSize: 11, color: C.mu }}>— 촬영 가이드 · AI 프롬프트 포함</span>
          </div>
          {sects.map((s, i) => {
            let sp = {}
            try { sp = JSON.parse(s.photoDir || '{}') } catch {}
            return (
              <div key={i} style={{ marginBottom: 6, border: `1px solid ${C.bd}`, borderRadius: 8, overflow: 'hidden' }}>
                <button onClick={() => setPlanOpen(o => ({ ...o, [i]: !o[i] }))} style={{ width: '100%', padding: '9px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: 'none', background: planOpen[i] ? C.alt : C.sur, cursor: 'pointer', textAlign: 'left' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: C.mu, background: C.alt, padding: '1px 7px', borderRadius: 4, border: `1px solid ${C.bd}` }}>S{i + 1}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: C.tx }}>{s.sectionType}</span>
                    {s.mainCopy && <span style={{ fontSize: 11, color: C.mu }}>— {s.mainCopy}</span>}
                  </div>
                  <span style={{ fontSize: 10, color: C.fa, transform: planOpen[i] ? 'rotate(180deg)' : 'none' }}>▼</span>
                </button>
                {planOpen[i] && (
                  <div style={{ padding: '14px 16px', borderTop: `1px solid ${C.bd}` }}>
                    <pre style={{ margin: '0 0 12px', fontFamily: 'inherit', fontSize: 12.5, lineHeight: 1.85, color: C.tx, whiteSpace: 'pre-wrap' }}>
                      {[
                        s.mainCopy && `메인: ${s.mainCopy}`,
                        s.subCopy && `서브: ${s.subCopy}`,
                        s.points?.length && `\n포인트:\n${s.points.map((p, j) => `  ${j + 1}. ${p}`).join('\n')}`,
                      ].filter(Boolean).join('\n')}
                    </pre>
                    {Object.keys(sp).length > 0 && (
                      <div style={{ background: C.alt, borderRadius: 7, padding: '10px 13px', border: `1px solid ${C.bd}`, marginBottom: 10 }}>
                        <p style={{ fontSize: 10, fontWeight: 700, color: C.fa, marginBottom: 6 }}>📷 촬영 기획</p>
                        {Object.entries(sp).map(([k, v], j) => <div key={j} style={{ fontSize: 12, color: C.tx, marginBottom: 3 }}><span style={{ color: C.mu, fontWeight: 600 }}>{k}:</span> {v}</div>)}
                      </div>
                    )}
                    {s.imagePrompt && (
                      <div style={{ background: '#111', borderRadius: 7, padding: '9px 12px', display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                        <code style={{ fontSize: 11, color: '#D4D4D4', fontFamily: "'Courier New',monospace", lineHeight: 1.7, flex: 1, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{s.imagePrompt}</code>
                        <CopyBtn text={s.imagePrompt} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* 다운로드용 섹션 카드 */}
      {sects.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <div>
              <span style={{ fontSize: 10, fontWeight: 700, color: C.fa, textTransform: 'uppercase', letterSpacing: '0.08em' }}>다운로드용 섹션 이미지</span>
              <span style={{ fontSize: 11, color: C.mu, marginLeft: 8 }}>— 수정 후 PNG 저장</span>
            </div>
            <button onClick={dlAllPNG} disabled={dlAll} style={{ padding: '6px 12px', fontSize: 11, borderRadius: 7, border: `1px solid ${C.bd}`, background: C.sur, color: dlAll ? C.fa : C.mu, cursor: dlAll ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
              {dlAll ? <><Spin /> 저장 중…</> : '↓ 전체 PNG'}
            </button>
          </div>
          {sects.map((s, i) => <div key={i} data-sect><SectionEditor sec={s} idx={i} onUpdate={upd} /></div>)}
        </div>
      )}

      {seo && <Blk title={seo.title} lines={seo.lines} />}
    </div>
  )
}

/* ── 메인 앱 ───────────────────────────────────────── */
export default function App() {
  const [task, setTask] = useState(TASKS[0])
  const [input, setInput] = useState('')
  const [tone, setTone] = useState('생활형')
  const [uploads, setUploads] = useState([]) // {url: dataUrl}
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cos_history') || '[]') } catch { return [] }
  })
  const [histOpen, setHistOpen] = useState(false)

  const taRef = useRef(null)
  const resRef = useRef(null)
  const fileRef = useRef(null)

  // textarea 자동 높이
  useEffect(() => {
    if (!taRef.current) return
    taRef.current.style.height = 'auto'
    taRef.current.style.height = Math.max(150, taRef.current.scrollHeight) + 'px'
  }, [input])

  // 히스토리 localStorage 저장
  useEffect(() => {
    try { localStorage.setItem('cos_history', JSON.stringify(history.slice(0, 20))) } catch {}
  }, [history])

  const addFiles = useCallback(async (raw) => {
    const files = Array.from(raw).slice(0, 4 - uploads.length)
    const results = await Promise.all(files.map(f => readFileAsDataURL(f)))
    setUploads(p => [...p, ...results.map(url => ({ url }))].slice(0, 4))
  }, [uploads])

  const onDrop = useCallback(e => { e.preventDefault(); addFiles(e.dataTransfer.files) }, [addFiles])

  const sw = t => { setTask(t); setResult(''); setError('') }

  const run = async () => {
    if (!input.trim() || loading) return
    setLoading(true); setResult(''); setError('')
    try {
      const images = uploads.map(u => u.url)
      const text = await generateContent({
        systemPrompt: getSys(task.id, tone),
        userPrompt: input.trim(),
        images,
        model: task.id === 'detail' ? 'gpt-4o' : 'gpt-4o',
        maxTokens: task.id === 'detail' ? 4000 : 2000,
      })
      setResult(text)
      const h = { id: Date.now(), taskId: task.id, label: task.label, preview: input.slice(0, 60), result: text, ts: new Date().toISOString() }
      setHistory(p => [h, ...p].slice(0, 20))
      setTimeout(() => resRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
    } catch (e) {
      setError('오류: ' + e.message)
    } finally { setLoading(false) }
  }

  const topBlocks = result ? parseBlocks(result) : []

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.tx }}>
      {/* NAV */}
      <header style={{ position: 'sticky', top: 0, zIndex: 60, background: 'rgba(245,244,240,0.95)', backdropFilter: 'blur(18px)', borderBottom: `1px solid ${C.bd}`, height: 52, display: 'flex', alignItems: 'center', padding: '0 20px', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: C.tx, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 14 }}>C</div>
          <span style={{ fontWeight: 800, fontSize: 15, letterSpacing: '-0.04em' }}>ContentOS</span>
          <span style={{ fontSize: 10, color: C.fa, background: '#ECEAE5', padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>BETA</span>
        </div>
        <button onClick={() => setHistOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 13px', borderRadius: 7, border: `1px solid ${C.bd}`, background: C.sur, color: C.mu, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
          ≡ 히스토리 {history.length > 0 && <span style={{ background: C.tx, color: '#fff', borderRadius: 20, padding: '1px 6px', fontSize: 10, marginLeft: 2 }}>{history.length}</span>}
        </button>
      </header>

      {/* 히스토리 드로어 */}
      {histOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex' }} onClick={() => setHistOpen(false)}>
          <div style={{ flex: 1 }} />
          <div style={{ width: 300, background: C.sur, height: '100vh', overflow: 'auto', borderLeft: `1px solid ${C.bd}`, padding: 18 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <span style={{ fontWeight: 700, fontSize: 14 }}>히스토리</span>
              <button onClick={() => setHistOpen(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 18, color: C.fa }}>✕</button>
            </div>
            {history.length === 0
              ? <p style={{ fontSize: 13, color: C.fa, textAlign: 'center', marginTop: 40 }}>아직 기록 없음</p>
              : history.map(h => {
                const tk = TASKS.find(t => t.id === h.taskId) || TASKS[0]
                return (
                  <button key={h.id} onClick={() => { setResult(h.result); setHistOpen(false); setTimeout(() => resRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100) }} style={{ width: '100%', textAlign: 'left', padding: '10px 12px', borderRadius: 9, border: `1px solid ${C.bd}`, background: C.sur, cursor: 'pointer', marginBottom: 6 }}>
                    <div style={{ display: 'flex', gap: 6, marginBottom: 2 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: tk.col }}>{tk.label}</span>
                      <span style={{ fontSize: 10, color: C.fa }}>{new Date(h.ts).toLocaleString('ko', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div style={{ fontSize: 12, color: C.tx, lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{h.preview}</div>
                  </button>
                )
              })}
          </div>
        </div>
      )}

      {/* 메인 */}
      <main style={{ maxWidth: 860, margin: '0 auto', padding: '36px 18px 100px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 style={{ fontSize: 'clamp(24px,4vw,34px)', fontWeight: 800, letterSpacing: '-0.05em', lineHeight: 1.2, margin: '0 0 10px' }}>제품 정보 하나로<br />마케팅 콘텐츠 완성</h1>
          <p style={{ fontSize: 14, color: C.mu, lineHeight: 1.75, margin: 0 }}>기획부터 수정 가능한 섹션 카드까지 자동 생성</p>
        </div>

        {/* 작업 탭 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 16 }}>
          {TASKS.map(t => {
            const on = task.id === t.id
            return (
              <button key={t.id} onClick={() => sw(t)} style={{ padding: '13px 8px', borderRadius: 12, border: on ? `2px solid ${t.col}` : `1.5px solid ${C.bd}`, background: on ? t.li : C.sur, cursor: 'pointer', textAlign: 'center' }}>
                <div style={{ fontSize: 19, marginBottom: 4, color: on ? t.col : C.fa }}>{t.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: on ? t.col : C.tx, letterSpacing: '-0.02em' }}>{t.label}</div>
                <div style={{ fontSize: 10, color: on ? t.col + '99' : C.fa, marginTop: 2 }}>{t.sub}</div>
              </button>
            )
          })}
        </div>

        {/* 블로그 말투 */}
        {task.id === 'blog' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, color: C.mu, fontWeight: 600 }}>말투</span>
            {BLOG_TONES.map(t => (
              <button key={t} onClick={() => setTone(t)} style={{ padding: '4px 11px', borderRadius: 20, fontSize: 11, fontWeight: 600, border: tone === t ? `1.5px solid ${TASKS[1].col}` : `1.5px solid ${C.bd}`, background: tone === t ? TASKS[1].li : C.sur, color: tone === t ? TASKS[1].col : C.mu, cursor: 'pointer' }}>{t}</button>
            ))}
          </div>
        )}

        {/* 입력창 */}
        <div style={{ background: C.sur, borderRadius: 16, border: `1.5px solid ${C.bd}`, boxShadow: '0 2px 24px rgba(0,0,0,0.05)', overflow: 'hidden', marginBottom: 12 }} onDragOver={e => e.preventDefault()} onDrop={onDrop}>
          <div style={{ padding: '8px 16px', background: task.li, borderBottom: `1px solid ${task.col}22`, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: task.col }}>{task.icon}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: task.col }}>{task.label} — {task.sub}</span>
          </div>
          <textarea ref={taRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) run() }}
            placeholder={'마케팅을 시작하세요. 제품 특징이나 원하는 내용을 자유롭게 입력해보세요.\n\n예) 듀라론 냉감패드 상세페이지 만들어줘'}
            style={{ width: '100%', minHeight: 150, padding: '18px 20px', border: 'none', outline: 'none', resize: 'none', fontSize: 14.5, lineHeight: 1.85, color: C.tx, background: 'transparent', fontFamily: 'inherit' }}
          />

          {/* 업로드 이미지 미리보기 */}
          {uploads.length > 0 && (
            <div style={{ display: 'flex', gap: 7, padding: '0 16px 12px', flexWrap: 'wrap', alignItems: 'center' }}>
              {uploads.map((u, i) => (
                <div key={i} style={{ position: 'relative' }}>
                  <img src={u.url} alt="" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, border: `1px solid ${C.bd}` }} />
                  <button onClick={() => setUploads(p => p.filter((_, j) => j !== i))} style={{ position: 'absolute', top: -5, right: -5, width: 18, height: 18, borderRadius: '50%', background: '#ef4444', border: '2px solid #fff', color: '#fff', fontSize: 9, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>✕</button>
                </div>
              ))}
              {uploads.length < 4 && <button onClick={() => fileRef.current?.click()} style={{ width: 64, height: 64, borderRadius: 8, border: `1.5px dashed ${C.bdm}`, background: C.alt, cursor: 'pointer', color: C.fa, fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>}
            </div>
          )}

          <div style={{ padding: '10px 14px', borderTop: `1px solid ${C.bd}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 7 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <button onClick={() => fileRef.current?.click()} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 11px', borderRadius: 7, border: `1px solid ${C.bd}`, background: C.sur, color: C.mu, fontSize: 12, cursor: 'pointer' }}>📷 사진 추가{uploads.length > 0 && ` (${uploads.length}/4)`}</button>
              <input ref={fileRef} type="file" accept="image/*" multiple onChange={e => { addFiles(e.target.files); e.target.value = '' }} />
              <span style={{ fontSize: 11, color: C.fa }}>최대 4장</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <span style={{ fontSize: 11, color: C.fa }}>⌘ Enter</span>
              <button onClick={run} disabled={loading || !input.trim()} style={{ padding: '9px 22px', borderRadius: 9, border: 'none', background: (!input.trim() || loading) ? '#ECEAE5' : C.tx, color: (!input.trim() || loading) ? C.fa : '#fff', fontSize: 13, fontWeight: 700, cursor: (!input.trim() || loading) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 7 }}>
                {loading ? <><Spin />생성 중…</> : '✦ 생성하기'}
              </button>
            </div>
          </div>
        </div>

        {error && <div style={{ padding: '12px 15px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 9, fontSize: 13, color: '#b91c1c', marginBottom: 14 }}>{error}</div>}

        {loading && (
          <div style={{ background: C.sur, borderRadius: 14, border: `1.5px solid ${C.bd}`, padding: '28px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 22, color: C.mu, fontSize: 13 }}><Spin />{task.id === 'detail' ? '상세페이지 8개 섹션 생성 중…' : '콘텐츠 생성 중…'}</div>
            {[95, 75, 85, 60, 90, 50].map((w, i) => <div key={i} style={{ height: 10, background: C.alt, borderRadius: 5, width: `${w}%`, marginBottom: 9, animation: `pl 1.5s ease ${i * .12}s infinite` }} />)}
          </div>
        )}

        {result && !loading && (
          <div ref={resRef} style={{ background: C.sur, borderRadius: 16, border: `1.5px solid ${C.bd}`, boxShadow: '0 4px 28px rgba(0,0,0,0.06)', overflow: 'hidden', animation: 'fi .25s ease' }}>
            <div style={{ padding: '12px 20px 10px', borderBottom: `1px solid ${C.bd}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: task.col, background: task.li, padding: '2px 9px', borderRadius: 20 }}>{task.label}</span>
                <span style={{ fontSize: 11, color: '#15803d', background: '#f0fdf4', padding: '2px 8px', borderRadius: 20 }}>✓ 완성</span>
              </div>
              <CopyBtn text={result} />
            </div>
            <div style={{ padding: '16px 20px' }}>
              {task.id === 'detail'
                ? <DetailView result={result} />
                : topBlocks.map((b, i) => <Blk key={i} title={b.title} lines={b.lines} />)
              }
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
