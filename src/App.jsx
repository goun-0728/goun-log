// src/App.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react'
import { C, TASKS, BLOG_TONES, getSys, EXTRA_SECTIONS, getExtraSectSys, mkSec } from './constants'
import { parseBlocks, parseSections, capturePNG, downloadURL } from './utils'
import { generateContent } from './api/generate'
import SectionEditor from './components/SectionEditor'
import CardNewsView from './components/CardNewsEditor'
import BlogKeywords from './components/BlogKeywords'
import BlogThumbnail from './components/BlogThumbnail'

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

/* ── 섹션 사이 추가 버튼 ────────────────────────────── */
function AddBetweenBtn({ onClick, loading }) {
  return (
    <div style={{ margin:'6px 0 14px' }}>
      <button onClick={onClick} disabled={loading}
        style={{ width:'100%', padding:'10px 0', fontSize:12, borderRadius:12, border:'1.5px solid #3B82F6', background:loading?'#93c5fd':'#3B82F6', color:'#fff', cursor:loading?'not-allowed':'pointer', fontWeight:600, transition:'background .12s', opacity:loading?0.7:1 }}>
        {loading ? '생성 중…' : '+ 섹션 추가'}
      </button>
    </div>
  )
}

/* ── 추가 섹션 AI 출력 파서 ─────────────────────────── */
function parseExtraSection(text, typeInfo) {
  const gf = (k, t) => { const rx = new RegExp(k + ':\\s*([^\\n]+)'); const f = t.match(rx); return f ? f[1].trim() : '' }
  const gb = (k, t) => {
    const rx = new RegExp(k + ':\\s*\\n([\\s\\S]*?)(?=\\n[가-힣A-Za-z]+:|$)')
    const f = t.match(rx); if (!f) return []
    return f[1].split('\n').map(l => l.replace(/^[\s•\-\d\.]+/, '').trim()).filter(l => l.length > 1)
  }
  return mkSec({
    sectionType: typeInfo.label,
    template: typeInfo.template,
    designStyle: typeInfo.designStyle || '크림',
    mainCopy: gf('메인카피', text),
    subCopy:  gf('서브카피', text),
    points:   gb('포인트', text),
  })
}

/* ── 상세페이지 결과 뷰 ─────────────────────────────── */
function DetailView({ result, savedSects, onSectsChange, productInput }) {
  const top    = parseBlocks(result)
  const rep    = top.find(b => b.title === '기획 보고서')
  const ptMeta = top.find(b => b.title.includes('Page Title'))
  const seo    = top.find(b => b.title.includes('SEO'))

  const ptText   = ptMeta?.lines.join('\n') || ''
  const pageTitle = ptText.match(/Page Title:\s*(.+)/)?.[1]?.trim() || ''
  const metaDesc  = ptText.match(/Meta Description:\s*(.+)/)?.[1]?.trim() || ''
  const [sects,    setSects]    = useState(() => savedSects ?? parseSections(result))
  const [planOpen, setPlanOpen] = useState({})
  const [dlAll,      setDlAll]      = useState(false)
  const [addLoading, setAddLoading] = useState(null)
  const [addModal,   setAddModal]   = useState(null)   // null | insertAfterIdx
  const [deleteConfirm, setDeleteConfirm] = useState(null) // null | sectionIdx
  const [savedMap,   setSavedMap]   = useState({})
  const [dlWarnModal, setDlWarnModal] = useState(false)

  const sectsInit    = useRef(false)

  useEffect(() => {
    if (!sectsInit.current) { sectsInit.current = true; return }
    onSectsChange?.(sects)
  }, [sects])

  const upd = useCallback((i, v) => setSects(p => p.map((s, j) => j === i ? v : s)), [])
  const handleSavedChange = useCallback((i, isSaved) => setSavedMap(prev => ({ ...prev, [i]: isSaved })), [])

  const deleteSection = useCallback(i => {
    setSects(p => p.filter((_, j) => j !== i))
    setPlanOpen({})
  }, [])

  const addSection = useCallback(async (typeInfo, insertAfterIdx) => {
    setAddModal(null)
    setAddLoading(typeInfo.type)
    try {
      const text = await generateContent({
        systemPrompt: getExtraSectSys(typeInfo.type),
        userPrompt: productInput?.trim()
          ? `다음 제품 정보를 참고해서 "${typeInfo.label}" 섹션을 만들어줘:\n${productInput}`
          : `"${typeInfo.label}" 섹션 내용을 작성해줘.`,
        model: 'gpt-4o',
        maxTokens: 700,
      })
      const ns = { ...parseExtraSection(text, typeInfo), _userAdded: true }
      setSects(p => { const n = [...p]; n.splice(insertAfterIdx + 1, 0, ns); return n })
    } catch {
      const ns = mkSec({ sectionType: typeInfo.label, template: typeInfo.template, designStyle: typeInfo.designStyle || '크림', _userAdded: true })
      setSects(p => { const n = [...p]; n.splice(insertAfterIdx + 1, 0, ns); return n })
    } finally {
      setAddLoading(null)
    }
  }, [productInput])

  const dlAllPNG = async () => {
    if (Object.values(savedMap).some(v => v === false)) {
      setDlWarnModal(true)
      return
    }
    setDlAll(true)
    const els = document.querySelectorAll('[data-sect-card]')
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

      {/* ── 기획 보고서 ── #FFFFFF */}
      {rep && (
        <div style={{ background: '#FFFFFF', margin: '0 -20px', padding: '20px 20px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: C.tx, letterSpacing: '-0.02em' }}>📋 기획 보고서</span>
            <CopyBtn text={rep.lines.join('\n').trim()} />
          </div>
          <div style={{ background: C.alt, borderRadius: 10, border: `1px solid ${C.bd}`, padding: '14px 16px' }}>
            <pre style={{ margin: 0, fontFamily: 'inherit', fontSize: 13.5, lineHeight: 1.9, color: C.tx, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{rep.lines.join('\n').trim()}</pre>
          </div>
        </div>
      )}

      {/* ── Page Title & Meta Description ── #EFF6FF */}
      {(pageTitle || metaDesc) && (
        <div style={{ background: '#EFF6FF', margin: '0 -20px', padding: '20px 20px', borderTop: '1px solid #BFDBFE', borderBottom: '1px solid #BFDBFE' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: '#1E40AF', letterSpacing: '-0.02em' }}>🔍 Page Title & Meta Description</span>
            <span style={{ fontSize: 11, color: '#3B82F6' }}>— SEO 최적화</span>
          </div>
          {pageTitle && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#1E40AF' }}>Page Title</span>
                <CopyBtn text={pageTitle} />
              </div>
              <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #BFDBFE', padding: '10px 14px', fontSize: 13.5, color: C.tx, lineHeight: 1.7 }}>{pageTitle}</div>
            </div>
          )}
          {metaDesc && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#1E40AF' }}>Meta Description</span>
                <CopyBtn text={metaDesc} />
              </div>
              <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #BFDBFE', padding: '10px 14px', fontSize: 13.5, color: C.tx, lineHeight: 1.7 }}>{metaDesc}</div>
            </div>
          )}
        </div>
      )}

      {/* ── 섹션별 기획안 ── #FEFCE8 */}
      {sects.length > 0 && (
        <div style={{ background: '#FEFCE8', margin: '0 -20px', padding: '20px 20px 24px', borderTop: '1px solid #FEF08A', borderBottom: '1px solid #FEF08A' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: '#713F12', letterSpacing: '-0.02em' }}>📐 섹션별 기획안</span>
            <span style={{ fontSize: 11, color: '#A16207' }}>— 촬영 가이드 · AI 프롬프트 포함</span>
          </div>
          {sects.map((s, i) => {
            let sp = {}
            try { sp = JSON.parse(s.photoDir || '{}') } catch {}
            return (
              <div key={s._id || i} style={{ marginBottom: 6, border: `1px solid ${C.bd}`, borderRadius: 8, overflow: 'hidden' }}>
                <button onClick={() => setPlanOpen(o => ({ ...o, [i]: !o[i] }))} style={{ width: '100%', padding: '9px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: 'none', background: planOpen[i] ? '#ECEAE5' : C.sur, cursor: 'pointer', textAlign: 'left' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: C.mu, background: C.alt, padding: '1px 7px', borderRadius: 4, border: `1px solid ${C.bd}` }}>S{i + 1}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: C.tx }}>{s.sectionType}</span>
                    {s.mainCopy && <span style={{ fontSize: 11, color: C.mu }}>— {s.mainCopy}</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 11, color: '#3b82f6', fontWeight: 700 }}>{planOpen[i] ? '접기' : '열어보기'}</span>
                    {s._userAdded && (
                      <span onClick={e => { e.stopPropagation(); deleteSection(i) }}
                        style={{ fontSize: 12, color: '#ef4444', fontWeight: 700, cursor: 'pointer', padding: '2px 7px', borderRadius: 4, background: '#fef2f2', border: '1px solid #fca5a5', lineHeight: 1 }}>×</span>
                    )}
                  </div>
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
                      <>
                        <div style={{ background: '#111', borderRadius: 7, padding: '9px 12px', display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                          <code style={{ fontSize: 11, color: '#D4D4D4', fontFamily: "'Courier New',monospace", lineHeight: 1.7, flex: 1, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{s.imagePrompt}</code>
                          <CopyBtn text={s.imagePrompt} />
                        </div>
                        <p style={{ margin: '8px 0 0', fontSize: 11, color: C.mu, lineHeight: 1.6 }}>
                          💡 이 프롬프트를 복사해서 미드저니(Midjourney) 또는 ChatGPT 이미지 생성에 붙여넣으세요.
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ── 다운로드용 섹션 이미지 ── #F8F8F8 */}
      {sects.length > 0 && (
        <div style={{ background: '#F8F8F8', margin: '0 -20px', padding: '20px 20px 24px', borderBottom: '1px solid #E0E0E0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: C.tx, letterSpacing: '-0.02em' }}>🖼 다운로드용 섹션 이미지</span>
              <span style={{ fontSize: 11, color: C.mu }}>— 수정 후 PNG 저장</span>
            </div>
            <button onClick={dlAllPNG} disabled={dlAll} style={{ padding: '6px 12px', fontSize: 11, borderRadius: 7, border: `1px solid ${dlAll ? C.bd : C.bdm}`, background: dlAll ? C.alt : C.sur, color: dlAll ? C.fa : C.tx, cursor: dlAll ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontWeight: 600 }}>
              {dlAll ? <><Spin /> 저장 중…</> : '↓ 전체 PNG'}
            </button>
          </div>
          {sects.map((s, i) => (
            <React.Fragment key={s._id || i}>
              <div data-sect>
                <SectionEditor sec={s} idx={i} onUpdate={upd} onDelete={() => setDeleteConfirm(i)} onSavedChange={handleSavedChange} />
              </div>
              <AddBetweenBtn onClick={() => setAddModal(i)} loading={addLoading !== null} />
            </React.Fragment>
          ))}
        </div>
      )}

      {/* ── SEO 키워드 ── */}
      {seo && (
        <div style={{ marginTop: 20 }}>
          <Blk title={seo.title} lines={seo.lines} />
        </div>
      )}

      {/* ── 섹션 추가 모달 ── */}
      {addModal !== null && (
        <div onClick={() => setAddModal(null)}
          style={{ position:'fixed', inset:0, zIndex:200, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div onClick={e => e.stopPropagation()}
            style={{ background:'#fff', borderRadius:16, padding:'24px', maxWidth:480, width:'90%', maxHeight:'80vh', overflowY:'auto', boxShadow:'0 20px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
              <span style={{ fontSize:14, fontWeight:700, color:C.tx }}>추가할 섹션 선택</span>
              <button onClick={() => setAddModal(null)}
                style={{ width:28, height:28, borderRadius:'50%', border:'none', background:C.alt, cursor:'pointer', fontSize:18, color:C.mu, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700 }}>×</button>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:8 }}>
              {EXTRA_SECTIONS.map(sec => (
                <button key={sec.type} onClick={() => addSection(sec, addModal)}
                  style={{ padding:'12px 14px', borderRadius:10, border:`1px solid ${C.bd}`, background:C.sur, cursor:'pointer', textAlign:'left', transition:'border-color .12s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor='#3b82f6'}
                  onMouseLeave={e => e.currentTarget.style.borderColor=C.bd}>
                  <div style={{ fontSize:13, fontWeight:700, color:C.tx }}>{sec.label}</div>
                  <div style={{ fontSize:11, color:C.fa, marginTop:3 }}>{sec.sub}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── 전체 PNG 다운로드 미저장 경고 모달 ── */}
      {dlWarnModal && (
        <div style={{ position:'fixed', inset:0, zIndex:300, background:'rgba(0,0,0,0.55)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ background:'#fff', borderRadius:16, padding:'32px 36px', maxWidth:400, width:'90%', boxShadow:'0 20px 60px rgba(0,0,0,0.3)', textAlign:'center' }}>
            <div style={{ fontSize:48, marginBottom:14 }}>⚠️</div>
            <p style={{ fontSize:17, fontWeight:700, color:'#18170F', margin:'0 0 10px' }}>저장되지 않은 섹션이 있습니다</p>
            <p style={{ fontSize:13, color:'#B0ADA5', margin:'0 0 28px', lineHeight:1.7 }}>모든 섹션을 저장한 후 다운로드해주세요.</p>
            <button onClick={() => setDlWarnModal(false)}
              style={{ padding:'11px 40px', borderRadius:9, border:'none', background:'#3b82f6', color:'#fff', cursor:'pointer', fontWeight:700, fontSize:14 }}>확인</button>
          </div>
        </div>
      )}

      {/* ── 섹션 삭제 확인 모달 ── */}
      {deleteConfirm !== null && (
        <div style={{ position:'fixed', inset:0, zIndex:200, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ background:'#fff', borderRadius:14, padding:'28px 32px', maxWidth:320, width:'90%', boxShadow:'0 20px 60px rgba(0,0,0,0.3)', textAlign:'center' }}>
            <p style={{ fontSize:15, fontWeight:600, color:C.tx, margin:'0 0 6px' }}>섹션을 삭제하시겠습니까?</p>
            <p style={{ fontSize:12, color:C.fa, margin:'0 0 24px' }}>이 작업은 되돌릴 수 없습니다.</p>
            <div style={{ display:'flex', gap:10, justifyContent:'center' }}>
              <button onClick={() => setDeleteConfirm(null)}
                style={{ padding:'9px 24px', borderRadius:8, border:`1px solid ${C.bd}`, background:C.sur, color:C.mu, cursor:'pointer', fontWeight:600, fontSize:13 }}>취소</button>
              <button onClick={() => { deleteSection(deleteConfirm); setDeleteConfirm(null) }}
                style={{ padding:'9px 24px', borderRadius:8, border:'none', background:'#ef4444', color:'#fff', cursor:'pointer', fontWeight:700, fontSize:13 }}>삭제</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── 메인 앱 ───────────────────────────────────────── */
export default function App() {
  const [task, setTask] = useState(TASKS[0])
  const [sharedInput, setSharedInput] = useState('')
  const [tone, setTone] = useState('생활형')
  const [tabLoading, setTabLoading] = useState({})
  const [error, setError] = useState('')

  // 모든 탭이 같은 입력값 공유
  const input   = sharedInput
  const loading = tabLoading[task.id] || false
  const setInput = setSharedInput

  // 탭별 결과 — 새로고침 시 초기화 (localStorage는 세션 내 탭 전환용으로만 사용)
  const [tabResults, setTabResults] = useState(() => {
    const r = {}
    for (const t of TASKS) { r[t.id] = '' }
    return r
  })

  const result = tabResults[task.id] || ''

  const saveResult = useCallback((tid, text) => {
    setTabResults(prev => ({ ...prev, [tid]: text }))
    try { localStorage.setItem(`cos_result_${tid}`, text) } catch {}
  }, [])

  // 카드/섹션 에디터 상태 — 새로고침 시 초기화
  const [cardData,   setCardData]   = useState(null)
  const [detailData, setDetailData] = useState(null)
  const [cardGenKey,   setCardGenKey]   = useState(0)
  const [detailGenKey, setDetailGenKey] = useState(0)

  // 이미지 제거 헬퍼 (1탭만 이미지 보관 — 용량 초과 방지)
  const saveCardData = useCallback((cards) => {
    setCardData(cards)
    try {
      // 저장 전 detail 이미지 제거
      try {
        const dd = localStorage.getItem('cos_detail_data')
        if (dd) {
          const p = JSON.parse(dd)
          if (p.some(s => s.secImg || s.secImg2 || s.secImg3 || s.secImg4))
            localStorage.setItem('cos_detail_data', JSON.stringify(p.map(s => ({ ...s, secImg: null, secImg2: null, secImg3: null, secImg4: null }))))
        }
      } catch {}
      localStorage.setItem('cos_card_data', JSON.stringify(cards))
    } catch {
      // 용량 초과 시 이미지 제외 저장
      try { localStorage.setItem('cos_card_data', JSON.stringify(cards.map(c => ({ ...c, image: null })))) } catch {}
    }
  }, [])

  const saveDetailData = useCallback((sects) => {
    setDetailData(sects)
    try {
      // 저장 전 card 이미지 제거
      try {
        const cd = localStorage.getItem('cos_card_data')
        if (cd) {
          const p = JSON.parse(cd)
          if (p.some(c => c.image))
            localStorage.setItem('cos_card_data', JSON.stringify(p.map(c => ({ ...c, image: null }))))
        }
      } catch {}
      localStorage.setItem('cos_detail_data', JSON.stringify(sects))
    } catch {
      // 용량 초과 시 이미지 제외 저장
      try { localStorage.setItem('cos_detail_data', JSON.stringify(sects.map(s => ({ ...s, secImg: null, secImg2: null, secImg3: null, secImg4: null })))) } catch {}
    }
  }, [])

  // 블로그 키워드 분석 컨텍스트 (GPT 프롬프트에 포함)
  const [keywordContext, setKeywordContext] = useState('')

  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cos_history') || '[]') } catch { return [] }
  })
  const [histOpen, setHistOpen] = useState(false)

  const taRef = useRef(null)
  const resRef = useRef(null)
  const imgUploadRef = useRef(null)
  const [titleHover, setTitleHover] = useState(false)

  // 제품 사진 업로드 (detail 탭용, 최대 5장)
  const [productImgs, setProductImgs] = useState([])
  const handleProductImgs = e => {
    const files = Array.from(e.target.files)
    const remaining = 5 - productImgs.length
    files.slice(0, remaining).forEach(f => {
      const fr = new FileReader()
      fr.onload = ev => setProductImgs(prev => prev.length < 5 ? [...prev, ev.target.result] : prev)
      fr.readAsDataURL(f)
    })
    e.target.value = ''
  }

  // 전체 리셋 (히스토리는 유지)
  const resetAll = () => {
    setSharedInput('')
    const empty = {}
    for (const t of TASKS) {
      empty[t.id] = ''
      try { localStorage.removeItem(`cos_result_${t.id}`) } catch {}
    }
    setTabResults(empty)
    setCardData(null);   try { localStorage.removeItem('cos_card_data')   } catch {}
    setDetailData(null); try { localStorage.removeItem('cos_detail_data') } catch {}
    setTask(TASKS[0])
    setError('')
    setKeywordContext('')
    setProductImgs([])
  }

  // textarea 자동 높이
  useEffect(() => {
    if (!taRef.current) return
    taRef.current.style.height = 'auto'
    taRef.current.style.height = Math.max(150, taRef.current.scrollHeight) + 'px'
  }, [sharedInput, task.id])

  // 히스토리 localStorage 저장
  useEffect(() => {
    try { localStorage.setItem('cos_history', JSON.stringify(history.slice(0, 20))) } catch {}
  }, [history])

  // 탭 전환 — 결과 유지, 입력값은 공통 공유
  const sw = t => {
    setTask(t)
    setError('')
  }

  const run = async () => {
    const curInput = sharedInput
    if (!curInput.trim() || tabLoading[task.id]) return
    const tid = task.id
    setTabLoading(prev => ({ ...prev, [tid]: true }))
    saveResult(tid, '')
    setError('')
    try {
      const userPrompt = (tid === 'blog' && keywordContext)
        ? `다음 키워드를 자연스럽게 포함하고, 아래 내용을 참고해서 블로그 글을 작성해줘.\n키워드: ${keywordContext}\n참고 내용: ${curInput.trim()}`
        : curInput.trim()
      const hasImgs = tid === 'detail' && productImgs.length > 0
      const systemPrompt = hasImgs
        ? getSys(tid, tone) + '\n\n업로드된 제품 사진을 분석해서 제품의 외형·색상·패키지 디자인을 파악하고, 각 섹션 AI프롬프트에 실제 제품의 시각적 특성(색상, 형태, 질감, 소재감)을 구체적으로 반영해줘.'
        : getSys(tid, tone)
      const text = await generateContent({
        systemPrompt,
        userPrompt,
        images: hasImgs ? productImgs : [],
        model: 'gpt-4o',
        maxTokens: tid === 'detail' ? 4000 : 2000,
      })
      saveResult(tid, text)
      if (tid === 'card') {
        setCardData(null); try { localStorage.removeItem('cos_card_data') } catch {}
        setCardGenKey(k => k + 1)
      }
      if (tid === 'detail') {
        setDetailData(null); try { localStorage.removeItem('cos_detail_data') } catch {}
        setDetailGenKey(k => k + 1)
      }
      const h = { id: Date.now(), taskId: tid, label: task.label, preview: curInput.slice(0, 60), result: text, ts: new Date().toISOString() }
      setHistory(p => [h, ...p].slice(0, 20))
      setTimeout(() => resRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
    } catch (e) {
      setError('오류: ' + e.message)
    } finally {
      setTabLoading(prev => ({ ...prev, [tid]: false }))
    }
  }

  const topBlocks = result ? parseBlocks(result) : []

  // 블로그 결과에서 첫 번째 제목 후보 추출 (썸네일 기본값용)
  const blogTitle = (() => {
    if (task.id !== 'blog' || !result) return ''
    const block = topBlocks.find(b => b.title.includes('제목'))
    if (!block) return ''
    const line = block.lines.find(l => /^\d[..]/.test(l.trim()))
    return line ? line.replace(/^\d+[..]\s*/, '').trim() : ''
  })()

  return (
    <>
      {/* ── 고정 네비게이션 ── */}
      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 60, background: 'rgba(245,244,240,0.97)', backdropFilter: 'blur(18px)', borderBottom: `1px solid ${C.bd}`, height: 52, display: 'flex', alignItems: 'center', padding: '0 16px', gap: 8 }}>
        <button
          onClick={() => setHistOpen(o => !o)}
          style={{ width: 32, height: 32, borderRadius: 7, border: 'none', background: histOpen ? C.alt : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.mu, fontSize: 18, flexShrink: 0 }}>
          {histOpen ? '‹' : '≡'}
        </button>
        <div style={{ width: 26, height: 26, borderRadius: 7, background: C.tx, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 13 }}>C</div>
        <span style={{ fontWeight: 800, fontSize: 15, letterSpacing: '-0.04em' }}>ContentOS</span>
        <span style={{ fontSize: 12, color: C.mu, fontWeight: 500 }}>— {task.label}</span>
        <span style={{ fontSize: 10, color: C.fa, background: '#ECEAE5', padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>BETA</span>
      </header>

      {/* ── 왼쪽 사이드바 (히스토리) ── */}
      <aside style={{ position: 'fixed', top: 52, left: 0, bottom: 0, zIndex: 50, width: histOpen ? 260 : 0, transition: 'width .22s ease', background: C.sur, borderRight: histOpen ? `1px solid ${C.bd}` : 'none', overflow: 'hidden' }}>
        <div style={{ width: 260, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '12px 14px 10px', borderBottom: `1px solid ${C.bd}`, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontWeight: 700, fontSize: 13, color: C.tx }}>히스토리</span>
            {history.length > 0 && (
              <span style={{ fontSize: 10, background: C.alt, color: C.mu, borderRadius: 20, padding: '1px 7px', fontWeight: 600 }}>{history.length}</span>
            )}
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 10px 20px' }}>
            {history.length === 0
              ? <p style={{ fontSize: 12, color: C.fa, textAlign: 'center', marginTop: 32 }}>아직 기록 없음</p>
              : history.map(h => {
                  const tk = TASKS.find(t => t.id === h.taskId) || TASKS[0]
                  return (
                    <button key={h.id} onClick={() => {
                      const tk2 = TASKS.find(t => t.id === h.taskId) || TASKS[0]
                      setTask(tk2)
                      saveResult(h.taskId, h.result)
                      if (h.taskId === 'card') {
                        setCardData(null); try { localStorage.removeItem('cos_card_data') } catch {}
                        setCardGenKey(k => k + 1)
                      }
                      if (h.taskId === 'detail') {
                        setDetailData(null); try { localStorage.removeItem('cos_detail_data') } catch {}
                        setDetailGenKey(k => k + 1)
                      }
                      setTimeout(() => resRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
                    }} style={{ width: '100%', textAlign: 'left', padding: '9px 10px', borderRadius: 8, border: `1px solid ${C.bd}`, background: C.sur, cursor: 'pointer', marginBottom: 5, display: 'block' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
                        <span style={{ fontSize: 14 }}>{tk.icon}</span>
                        <span style={{ fontSize: 10, fontWeight: 700, color: tk.col }}>{tk.label}</span>
                        <span style={{ fontSize: 10, color: C.fa, marginLeft: 'auto' }}>{new Date(h.ts).toLocaleString('ko', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div style={{ fontSize: 11, color: C.mu, lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{h.preview}</div>
                    </button>
                  )
                })}
          </div>
        </div>
      </aside>

      {/* ── 메인 콘텐츠 (사이드바 열리면 오른쪽으로 밀림) ── */}
      <div style={{ marginLeft: histOpen ? 260 : 0, transition: 'margin-left .22s ease', paddingTop: 52, minHeight: '100vh', background: C.bg, color: C.tx }}>
        <main style={{ maxWidth: 860, margin: '0 auto', padding: '36px 18px 100px' }}>

          {/* 클릭 시 전체 리셋 */}
          <div
            onClick={resetAll}
            onMouseEnter={() => setTitleHover(true)}
            onMouseLeave={() => setTitleHover(false)}
            style={{ textAlign: 'center', marginBottom: 40, cursor: 'pointer', opacity: titleHover ? 0.6 : 1, transition: 'opacity .15s' }}
          >
            <h1 style={{ fontSize: 'clamp(24px,4vw,34px)', fontWeight: 800, letterSpacing: '-0.05em', lineHeight: 1.2, margin: '0 0 10px' }}>제품 정보 하나로<br />마케팅 콘텐츠 완성</h1>
            <p style={{ fontSize: 14, color: C.mu, lineHeight: 1.75, margin: 0 }}>기획부터 수정 가능한 섹션 카드까지 자동 생성</p>
          </div>

        {/* 작업 탭 */}
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${TASKS.length},1fr)`, gap: 8, marginBottom: 16 }}>
          {TASKS.map(t => {
            const on = task.id === t.id
            const hasResult = !!(tabResults[t.id])
            return (
              <button key={t.id} onClick={() => sw(t)} style={{ padding: '13px 8px', borderRadius: 12, border: on ? `2px solid ${t.col}` : `1.5px solid ${C.bd}`, background: on ? t.li : C.sur, cursor: 'pointer', textAlign: 'center', position: 'relative' }}>
                {hasResult && !on && (
                  <span style={{ position: 'absolute', top: 6, right: 8, width: 6, height: 6, borderRadius: '50%', background: t.col, opacity: 0.6 }} />
                )}
                <div style={{ fontSize: 19, marginBottom: 4, color: on ? t.col : C.fa }}>{t.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: on ? t.col : C.tx, letterSpacing: '-0.02em' }}>{t.label}</div>
                <div style={{ fontSize: 10, color: on ? t.col + '99' : C.fa, marginTop: 2 }}>{t.sub}</div>
              </button>
            )
          })}
        </div>

        {/* 입력창 — 블로그는 별도 레이아웃, 나머지는 공통 */}
        {task.id === 'blog' ? (
          <div style={{ background: C.sur, borderRadius: 16, border: `1.5px solid ${C.bd}`, boxShadow: '0 2px 24px rgba(0,0,0,0.05)', overflow: 'hidden', marginBottom: 12 }}>
            <div style={{ padding: '12px 14px 4px' }}>
              <BlogKeywords onKeywordsChange={setKeywordContext} />
            </div>
            <div style={{ padding: '0 14px' }}>
              <textarea ref={taRef} value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) run() }}
                placeholder="하고 싶은 말 / 강조할 내용"
                style={{ width: '100%', minHeight: 110, padding: '12px 6px', border: 'none', outline: 'none', resize: 'none', fontSize: 14.5, lineHeight: 1.85, color: C.tx, background: 'transparent', fontFamily: 'inherit', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ padding: '10px 14px', borderTop: `1px solid ${C.bd}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 9, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 11, color: C.mu, fontWeight: 600 }}>말투</span>
                {BLOG_TONES.map(t => (
                  <button key={t} onClick={() => setTone(t)} style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, border: tone === t ? `1.5px solid ${TASKS[1].col}` : `1.5px solid ${C.bd}`, background: tone === t ? TASKS[1].li : C.sur, color: tone === t ? TASKS[1].col : C.mu, cursor: 'pointer' }}>{t}</button>
                ))}
              </div>
              <button onClick={run} disabled={loading || !input.trim()} style={{ padding: '9px 22px', borderRadius: 9, border: 'none', background: (!input.trim() || loading) ? '#ECEAE5' : TASKS[1].col, color: (!input.trim() || loading) ? C.fa : '#fff', fontSize: 13, fontWeight: 700, cursor: (!input.trim() || loading) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 7 }}>
                {loading ? <><Spin />생성 중…</> : '✦ 블로그 글 생성'}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ background: C.sur, borderRadius: 16, border: `1.5px solid ${C.bd}`, boxShadow: '0 2px 24px rgba(0,0,0,0.05)', overflow: 'hidden', marginBottom: 12 }}>
            <div style={{ padding: '8px 16px', background: task.li, borderBottom: `1px solid ${task.col}22`, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: task.col }}>{task.icon}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: task.col }}>{task.label} — {task.sub}</span>
            </div>
            <textarea ref={taRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) run() }}
              placeholder={'마케팅을 시작하세요. 제품 특징이나 원하는 내용을 자유롭게 입력해보세요.\n\n예) 듀라론 냉감패드 상세페이지 만들어줘'}
              style={{ width: '100%', minHeight: 150, padding: '18px 20px', border: 'none', outline: 'none', resize: 'none', fontSize: 14.5, lineHeight: 1.85, color: C.tx, background: 'transparent', fontFamily: 'inherit' }}
            />

            {/* 제품 사진 업로드 (detail 탭 전용) */}
            {task.id === 'detail' && (
              <div style={{ padding: '12px 16px 14px', borderTop: `1px solid ${C.bd}`, background: C.alt }}>
                <input ref={imgUploadRef} type="file" accept="image/*" multiple onChange={handleProductImgs} style={{ display: 'none' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: productImgs.length ? 10 : 0, flexWrap: 'wrap' }}>
                  <button onClick={() => imgUploadRef.current?.click()} disabled={productImgs.length >= 5}
                    style={{ padding: '5px 12px', fontSize: 11, borderRadius: 7, border: `1px solid ${C.bd}`, background: C.sur, color: productImgs.length >= 5 ? C.fa : C.mu, cursor: productImgs.length >= 5 ? 'not-allowed' : 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                    📷 프롬프트용 제품 사진 업로드 ({productImgs.length}/5)
                  </button>
                  <span style={{ fontSize: 11, color: C.fa, lineHeight: 1.5 }}>사진을 올리면 더 정확한 AI 이미지 프롬프트를 만들 수 있어요</span>
                </div>
                {productImgs.length > 0 && (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {productImgs.map((img, i) => (
                      <div key={i} style={{ position: 'relative', width: 72, height: 72, flexShrink: 0 }}>
                        <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8, border: `1px solid ${C.bd}`, display: 'block' }} />
                        <button onClick={() => setProductImgs(p => p.filter((_, j) => j !== i))}
                          style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', background: '#ef4444', color: '#fff', border: '2px solid #fff', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, lineHeight: 1, padding: 0 }}>×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div style={{ padding: '10px 14px', borderTop: `1px solid ${C.bd}`, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 9 }}>
              <span style={{ fontSize: 11, color: C.fa }}>⌘ Enter</span>
              <button onClick={run} disabled={loading || !input.trim()} style={{ padding: '9px 22px', borderRadius: 9, border: 'none', background: (!input.trim() || loading) ? '#ECEAE5' : C.tx, color: (!input.trim() || loading) ? C.fa : '#fff', fontSize: 13, fontWeight: 700, cursor: (!input.trim() || loading) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 7 }}>
                {loading ? <><Spin />생성 중…</> : '✦ 생성하기'}
              </button>
            </div>
          </div>
        )}

        {error && <div style={{ padding: '12px 15px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 9, fontSize: 13, color: '#b91c1c', marginBottom: 14 }}>{error}</div>}

        {loading && (
          <div style={{ background: C.sur, borderRadius: 14, border: `1.5px solid ${C.bd}`, padding: '28px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 22, color: C.mu, fontSize: 13 }}><Spin />{task.id === 'detail' ? '상세페이지 8개 섹션 생성 중…' : task.id === 'card' ? '카드뉴스 5장 생성 중…' : task.id === 'blog' ? '블로그 포스팅 생성 중…' : '콘텐츠 생성 중…'}</div>
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
                ? <DetailView key={detailGenKey} result={result} savedSects={detailData} onSectsChange={saveDetailData} productInput={sharedInput} />
                : task.id === 'card'
                  ? <CardNewsView key={cardGenKey} result={result} savedCards={cardData} onCardsChange={saveCardData} />
                  : <>
                      {topBlocks.map((b, i) => <Blk key={i} title={b.title} lines={b.lines} />)}
                      {task.id === 'blog' && <BlogThumbnail key={result.slice(0, 40)} blogTitle={blogTitle} />}
                    </>
              }
            </div>
          </div>
        )}
        </main>
      </div>
    </>
  )
}
