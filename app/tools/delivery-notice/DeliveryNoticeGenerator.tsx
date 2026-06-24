'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

const HOLIDAYS: Record<string, string> = {
  '2025-01-01':'새해','2025-01-28':'설연휴','2025-01-29':'설날','2025-01-30':'설연휴',
  '2025-03-01':'삼일절','2025-05-05':'어린이날','2025-05-06':'어린이날대체',
  '2025-06-06':'현충일','2025-08-15':'광복절',
  '2025-10-03':'개천절','2025-10-05':'추석연휴','2025-10-06':'추석',
  '2025-10-07':'추석연휴','2025-10-08':'추석대체','2025-10-09':'한글날','2025-12-25':'크리스마스',
  '2026-01-01':'새해','2026-01-28':'설연휴','2026-01-29':'설날','2026-01-30':'설연휴',
  '2026-03-01':'삼일절','2026-05-05':'어린이날','2026-06-06':'현충일','2026-08-15':'광복절',
  '2026-09-24':'추석연휴','2026-09-25':'추석','2026-09-26':'추석연휴',
  '2026-10-03':'개천절','2026-10-09':'한글날','2026-12-25':'크리스마스',
  '2027-01-01':'새해','2027-02-17':'설연휴','2027-02-18':'설날','2027-02-19':'설연휴',
  '2027-03-01':'삼일절','2027-05-05':'어린이날','2027-06-06':'현충일','2027-08-15':'광복절',
  '2027-10-03':'개천절','2027-10-09':'한글날','2027-12-25':'크리스마스',
}
const DOWS = ['일','월','화','수','목','금','토']
const W = 860

function toKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}
function fmtDate(d: Date | null) {
  if (!d) return '—'
  return `${d.getMonth()+1}월 ${d.getDate()}일 (${DOWS[d.getDay()]})`
}
function sameDay(a: Date | null, b: Date | null) {
  return !!a && !!b && a.toDateString() === b.toDateString()
}

type Mood = 'clean' | 'cute' | 'premium' | 'food'
const moodCfg = {
  clean:   { bg:'#FFFFFF', accent:'#534AB7', textSub:'#5F5E5A', textBody:'#3A3A38', badge:'#EEEDFE', badgeText:'#3C3489', rowA:'#F4F3FF', border:'#AFA9EC', title:'택배 공지' },
  cute:    { bg:'#FFF5F8', accent:'#D4537E', textSub:'#993556', textBody:'#6B2438', badge:'#FBEAF0', badgeText:'#72243E', rowA:'#FFF0F5', border:'#F4C0D1', title:'🎀 택배 공지' },
  premium: { bg:'#F8F7F4', accent:'#2C2C2A', textSub:'#888780', textBody:'#444441', badge:'#F1EFE8', badgeText:'#444441', rowA:'#EEECE6', border:'#D3D1C7', title:'DELIVERY NOTICE' },
  food:    { bg:'#F4FAF0', accent:'#3B6D11', textSub:'#3B6D11', textBody:'#2A4A0A', badge:'#EAF3DE', badgeText:'#27500A', rowA:'#E4F2D8', border:'#C0DD97', title:'🌿 택배 공지' },
}

export default function DeliveryNoticeGenerator() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef   = useRef<HTMLDivElement>(null)
  const imgRef    = useRef<HTMLImageElement | null>(null)
  const imgRatioRef = useRef(1)

  const [mood, setMood]         = useState<Mood>('clean')
  const [greeting, setGreeting] = useState('')
  const [noteText, setNoteText] = useState('빠른 배송을 원하시면 마감 시간 전에 주문해 주세요 😊')
  const [imgName, setImgName]   = useState('')
  const [ampm, setAmpm]         = useState('오후')
  const [hour, setHour]         = useState('')
  const [minute, setMinute]     = useState('00')

  const [calYear, setCalYear]   = useState(new Date().getFullYear())
  const [calMonth, setCalMonth] = useState(new Date().getMonth())
  const [dateStep, setDateStep] = useState(0)
  const [lastDate, setLastDate] = useState<Date | null>(null)
  const [resumeDate, setResumeDate] = useState<Date | null>(null)

  const draw = useCallback(() => {
    const cv = canvasRef.current
    if (!cv) return
    const c = moodCfg[mood]
    const font = "'Noto Sans KR', sans-serif"
    const tx = 56, tw = W - 112, PAD = 48

    function rrect(ctx: CanvasRenderingContext2D, x:number,y:number,w:number,h:number,r:number) {
      ctx.beginPath()
      ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.arcTo(x+w,y,x+w,y+r,r)
      ctx.lineTo(x+w,y+h-r); ctx.arcTo(x+w,y+h,x+w-r,y+h,r)
      ctx.lineTo(x+r,y+h); ctx.arcTo(x,y+h,x,y+h-r,r)
      ctx.lineTo(x,y+r); ctx.arcTo(x,y,x+r,y,r)
      ctx.closePath()
    }
    function measureLines(ctx: CanvasRenderingContext2D, text:string, maxW:number): string[] {
      const lines: string[] = []
      text.split('\n').forEach(para => {
        if (!para.trim()) { lines.push(''); return }
        let cur = ''
        for (const ch of para) {
          if (ctx.measureText(cur+ch).width > maxW && cur) { lines.push(cur); cur = ch } else cur += ch
        }
        if (cur) lines.push(cur)
      })
      return lines
    }

    // 높이 계산
    cv.width = W; cv.height = 10
    const ctx0 = cv.getContext('2d')!
    ctx0.font = `400 28px ${font}`
    const greetLines = greeting ? measureLines(ctx0, greeting, tw) : []
    ctx0.font = `400 24px ${font}`
    const noteLines = noteText ? measureLines(ctx0, noteText, tw - 48) : []

    const imgH = imgRef.current ? Math.round(W / imgRatioRef.current) : 0
    const deadlineBoxH = 160
    const resumeBoxH = 120
    const calH = 520

    let H = 8 + PAD + 80 + PAD
    H += imgH + (imgH ? PAD : 0)
    if (greetLines.length > 0) H += greetLines.length * 48 + PAD * 2
    H += PAD * 0.5 + deadlineBoxH + 20 + resumeBoxH + PAD
    H += calH + PAD
    if (noteLines.length > 0) H += noteLines.length * 40 + 60 + PAD
    H += PAD + 36 + PAD + 8
    H = Math.max(800, Math.round(H))

    cv.width = W; cv.height = H
    const ctx = cv.getContext('2d')!

    ctx.fillStyle = c.bg; ctx.fillRect(0,0,W,H)
    let curY = 0

    // 상단 바
    ctx.fillStyle = c.accent; ctx.fillRect(0,0,W,10); curY = 10

    // 제목
    curY += PAD
    ctx.fillStyle = c.accent
    ctx.font = `900 72px ${font}`
    ctx.textAlign = 'center'
    ctx.fillText(c.title, W/2, curY+60)
    curY += 60 + PAD * 0.8

    // 구분선
    ctx.strokeStyle = c.border; ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.moveTo(tx, curY); ctx.lineTo(W-tx, curY); ctx.stroke()
    curY += PAD * 0.8

    // 사진
    if (imgRef.current && imgH > 0) {
      ctx.drawImage(imgRef.current, 0, curY, W, imgH)
      curY += imgH + PAD
    }

    // 인사말
    if (greetLines.length > 0) {
      ctx.fillStyle = c.textBody
      ctx.font = `400 28px ${font}`
      ctx.textAlign = 'center'
      greetLines.forEach(line => { ctx.fillText(line, W/2, curY+32); curY += 48 })
      curY += PAD * 0.5
      ctx.strokeStyle = c.border; ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(tx, curY); ctx.lineTo(W-tx, curY); ctx.stroke()
      curY += PAD * 0.8
    }
    curY += PAD * 0.5

    // 택배 마감일 박스
    const deadlineDateStr = fmtDate(lastDate)
    const hasTime = !!hour
    const timeStr = hasTime ? `${ampm} ${hour}:${minute}` : ''

    rrect(ctx, tx, curY, tw, deadlineBoxH, 16)
    ctx.fillStyle = c.rowA; ctx.fill()
    ctx.strokeStyle = c.border; ctx.lineWidth = 1.5; ctx.stroke()

    // 마감 점
    ctx.fillStyle = '#EF9F27'
    ctx.beginPath(); ctx.arc(tx+32, curY+deadlineBoxH/2, 10, 0, Math.PI*2); ctx.fill()

    // 마감 라벨
    ctx.fillStyle = c.textSub
    ctx.font = `500 22px ${font}`
    ctx.textAlign = 'left'
    ctx.fillText('📦 택배 마감일', tx+58, curY+44)

    // 마감 날짜
    ctx.fillStyle = c.accent
    ctx.font = `700 44px ${font}`
    ctx.textAlign = 'left'
    ctx.fillText(deadlineDateStr, tx+58, curY+110)

    if (hasTime) {
      const dw = ctx.measureText(deadlineDateStr).width
      ctx.font = `500 28px ${font}`
      ctx.fillText(timeStr, tx+58+dw+16, curY+110)
    }
    curY += deadlineBoxH + 20

    // 택배 발송일 박스
    rrect(ctx, tx, curY, tw, resumeBoxH, 16)
    ctx.fillStyle = 'rgba(127,119,221,0.08)'; ctx.fill()
    ctx.strokeStyle = c.border; ctx.lineWidth = 1.5; ctx.stroke()

    ctx.fillStyle = '#7F77DD'
    ctx.beginPath(); ctx.arc(tx+32, curY+resumeBoxH/2, 10, 0, Math.PI*2); ctx.fill()

    ctx.fillStyle = c.textSub
    ctx.font = `500 22px ${font}`
    ctx.textAlign = 'left'
    ctx.fillText('🚚 택배 발송일', tx+58, curY+36)

    ctx.fillStyle = c.accent
    ctx.font = `700 38px ${font}`
    ctx.textAlign = 'left'
    ctx.fillText(fmtDate(resumeDate), tx+58, curY+90)
    curY += resumeBoxH + PAD

    // 달력
    drawCal(ctx, tx, curY, tw, calH, lastDate ? lastDate.getFullYear() : calYear, lastDate ? lastDate.getMonth() : calMonth, c, rrect)
    curY += calH + PAD

    // 하단 메시지
    if (noteLines.length > 0) {
      const boxH = noteLines.length * 40 + 60
      rrect(ctx, tx, curY, tw, boxH, 16)
      ctx.fillStyle = c.badge; ctx.fill()
      ctx.strokeStyle = c.border; ctx.lineWidth = 1.5; ctx.stroke()
      ctx.fillStyle = c.badgeText
      ctx.font = `400 24px ${font}`
      ctx.textAlign = 'center'
      noteLines.forEach((line, i) => ctx.fillText(line, W/2, curY+40+i*40))
      curY += boxH + PAD
    }

    // 감사인사
    ctx.fillStyle = c.textSub
    ctx.font = `400 24px ${font}`
    ctx.textAlign = 'center'
    ctx.fillText('이용해 주셔서 감사합니다', W/2, curY+28)
    curY += 28 + PAD

    // 하단 바
    ctx.fillStyle = c.accent; ctx.fillRect(0, H-10, W, 10)

    scaleCanvas()
  }, [mood, greeting, noteText, ampm, hour, minute, lastDate, resumeDate, calYear, calMonth])

  function drawCal(
    ctx: CanvasRenderingContext2D,
    cx:number, cy:number, cw:number, ch:number,
    year:number, month:number,
    c: typeof moodCfg.clean,
    rrect: (ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,r:number)=>void
  ) {
    const font = "'Noto Sans KR', sans-serif"
    const pad = 24
    const cellW = Math.floor((cw - pad*2) / 7)
    const headerH = 56
    const dowH = 36
    const cellH = Math.floor((ch - pad*2 - headerH - dowH) / 6)

    rrect(ctx, cx, cy, cw, ch, 16)
    ctx.fillStyle = 'rgba(255,255,255,0.92)'; ctx.fill()
    ctx.strokeStyle = c.border; ctx.lineWidth = 1.5; ctx.stroke()

    // 월 헤더
    ctx.fillStyle = c.accent
    ctx.font = `700 26px ${font}`
    ctx.textAlign = 'center'
    ctx.fillText(`${year}년 ${month+1}월`, cx+cw/2, cy+pad+26)

    // 요일 헤더
    const dowColors = ['#E24B4A','#666','#666','#666','#666','#666','#378ADD']
    DOWS.forEach((d,i) => {
      ctx.fillStyle = dowColors[i]
      ctx.font = `600 16px ${font}`
      ctx.textAlign = 'center'
      ctx.fillText(d, cx+pad+i*cellW+cellW/2, cy+pad+headerH+dowH*0.75)
    })

    const divY = cy+pad+headerH+dowH
    ctx.strokeStyle = c.border; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(cx+pad, divY); ctx.lineTo(cx+cw-pad, divY); ctx.stroke()

    const first = new Date(year, month, 1)
    const lastD = new Date(year, month+1, 0).getDate()
    const startDow = first.getDay()

    const allDays: {d:Date,cur:boolean}[] = []
    for (let i=0;i<startDow;i++) allDays.push({d:new Date(year,month,1-(startDow-i)),cur:false})
    for (let d=1;d<=lastD;d++) allDays.push({d:new Date(year,month,d),cur:true})
    while (allDays.length<42) allDays.push({d:new Date(year,month+1,allDays.length-startDow-lastD+1),cur:false})

    allDays.forEach(({d:thisD,cur},idx) => {
      const col = idx%7, row = Math.floor(idx/7)
      const dx = cx+pad+col*cellW, dy = divY+row*cellH
      const dow = thisD.getDay()
      const hname = HOLIDAYS[toKey(thisD)]
      const isLast = sameDay(thisD, lastDate)
      const isResume = sameDay(thisD, resumeDate)
      const inRange = lastDate && resumeDate && thisD.getTime() > lastDate.getTime() && thisD.getTime() < resumeDate.getTime()

      if (isLast) {
        rrect(ctx, dx+2, dy+2, cellW-4, cellH-4, 8)
        ctx.fillStyle = '#FFF3CD'; ctx.fill()
        ctx.strokeStyle = '#EF9F27'; ctx.lineWidth = 2.5; ctx.stroke()
      } else if (isResume) {
        rrect(ctx, dx+2, dy+2, cellW-4, cellH-4, 8)
        ctx.fillStyle = '#E8DEF8'; ctx.fill()
        ctx.strokeStyle = '#7F77DD'; ctx.lineWidth = 2.5; ctx.stroke()
      } else if (inRange) {
        ctx.fillStyle = 'rgba(93,202,165,0.15)'
        ctx.fillRect(dx, dy, cellW, cellH)
      }

      ctx.save()
      ctx.globalAlpha = cur ? 1 : 0.25

      let nc = '#333'
      if (dow===0||hname) nc = '#E24B4A'
      else if (dow===6) nc = '#378ADD'
      if (isLast) nc = '#633806'
      if (isResume) nc = '#26215C'

      ctx.fillStyle = nc
      ctx.font = `${isLast||isResume?'700':'400'} 18px ${font}`
      ctx.textAlign = 'center'
      ctx.fillText(String(thisD.getDate()), dx+cellW/2, dy+cellH*0.46)

      if (hname) {
        ctx.fillStyle = '#E24B4A'
        ctx.font = `400 9px ${font}`
        ctx.textAlign = 'center'
        ctx.fillText(hname.length>4?hname.slice(0,4):hname, dx+cellW/2, dy+cellH*0.72)
      }
      if (isLast||isResume) {
        ctx.fillStyle = isLast ? '#854F0B' : '#534AB7'
        ctx.font = `700 10px ${font}`
        ctx.textAlign = 'center'
        ctx.fillText(isLast?'마감':'발송', dx+cellW/2, dy+cellH*0.85)
      }
      ctx.restore()
    })
  }

  function scaleCanvas() {
    const cv = canvasRef.current, wrap = wrapRef.current
    if (!cv || !wrap || !cv.height) return
    const avail = wrap.clientWidth - 24
    const scale = Math.min(1, avail / W)
    cv.style.width  = Math.round(W * scale) + 'px'
    cv.style.height = Math.round(cv.height * scale) + 'px'
  }

  useEffect(() => { draw() }, [draw])
  useEffect(() => {
    window.addEventListener('resize', scaleCanvas)
    return () => window.removeEventListener('resize', scaleCanvas)
  }, [])

  function pickDate(d: Date) {
    if (dateStep===0) { setLastDate(d); setDateStep(1) }
    else if (dateStep===1) { setResumeDate(d); setDateStep(2) }
  }
  function resetDates() { setLastDate(null); setResumeDate(null); setDateStep(0) }
  function prevMonth() { if (calMonth===0) { setCalMonth(11); setCalYear(y=>y-1) } else setCalMonth(m=>m-1) }
  function nextMonth() { if (calMonth===11) { setCalMonth(0); setCalYear(y=>y+1) } else setCalMonth(m=>m+1) }

  function handleImg(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return
    const reader = new FileReader()
    reader.onload = ev => {
      const img = new Image()
      img.onload = () => {
        imgRef.current = img
        imgRatioRef.current = img.naturalWidth / img.naturalHeight
        setImgName(f.name)
        draw()
      }
      img.src = ev.target?.result as string
    }
    reader.readAsDataURL(f)
  }
  function clearImg() { imgRef.current = null; setImgName(''); draw() }

  function downloadPNG() {
    const cv = canvasRef.current; if (!cv) return
    const a = document.createElement('a')
    a.download = `택배공지_${Date.now()}.png`
    a.href = cv.toDataURL('image/png', 1.0)
    a.click()
  }

  function renderCalCells() {
    const first = new Date(calYear, calMonth, 1)
    const lastD = new Date(calYear, calMonth+1, 0).getDate()
    const cells = []
    for (let i=0;i<first.getDay();i++) {
      const pd = new Date(calYear, calMonth, 1-(first.getDay()-i))
      cells.push(<div key={`p${i}`} className="cal-day other"><span>{pd.getDate()}</span></div>)
    }
    for (let d=1;d<=lastD;d++) {
      const thisD = new Date(calYear, calMonth, d)
      const dow = thisD.getDay()
      const hname = HOLIDAYS[toKey(thisD)]
      const isLast = sameDay(thisD, lastDate)
      const isResume = sameDay(thisD, resumeDate)
      const inRange = lastDate && resumeDate && thisD.getTime() > lastDate.getTime() && thisD.getTime() < resumeDate.getTime()
      let cls = 'cal-day'
      if (dow===0||hname) cls+=' sun'
      else if (dow===6) cls+=' sat'
      if (isLast) cls+=' sel-last'
      else if (isResume) cls+=' sel-resume'
      else if (inRange) cls+=' in-range'
      cells.push(
        <div key={d} className={cls} onClick={()=>pickDate(new Date(calYear,calMonth,d))}>
          <span className="dnum">{d}</span>
          {hname && <span className="hname">{hname.length>4?hname.slice(0,4):hname}</span>}
        </div>
      )
    }
    return cells
  }

  return (
    <>
      <style>{`
        .generator-wrap{display:grid;grid-template-columns:260px 1fr;gap:20px;align-items:start;}
        .panel{display:flex;flex-direction:column;gap:12px;}
        .card{background:white;border:1px solid #e8e8e8;border-radius:14px;padding:16px;}
        .lbl{font-size:11px;color:#999;font-weight:600;letter-spacing:.08em;text-transform:uppercase;margin-bottom:7px;}
        .fi{width:100%;font-size:13px;padding:8px 10px;border:1.5px solid #e8e8e8;border-radius:8px;background:white;color:#222;line-height:1.5;font-family:inherit;box-sizing:border-box;}
        textarea.fi{resize:vertical;min-height:70px;}
        select.fi{cursor:pointer;}
        .time-row{display:grid;grid-template-columns:1fr 1fr 1fr;gap:5px;margin-top:6px;}
        .mood-row{display:grid;grid-template-columns:1fr 1fr;gap:6px;}
        .mbtn{padding:8px 4px;font-size:12px;border:1.5px solid #e8e8e8;border-radius:8px;background:white;color:#555;cursor:pointer;text-align:center;font-family:inherit;}
        .mbtn.active{border-color:#534AB7;color:#534AB7;background:#EEEDFE;font-weight:600;}
        .upload-zone{border:1.5px dashed #d0d0d0;border-radius:10px;padding:14px;text-align:center;cursor:pointer;font-size:12px;color:#aaa;transition:background 0.2s;}
        .upload-zone:hover{background:#f8f8f8;}
        .cal-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;}
        .cal-hdr span{font-size:13px;font-weight:700;color:#222;}
        .cal-nav{background:none;border:none;cursor:pointer;color:#888;font-size:18px;padding:2px 8px;border-radius:6px;line-height:1;}
        .cal-nav:hover{background:#f0f0f0;}
        .cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:1px;}
        .cal-dow{font-size:10px;text-align:center;padding:3px 0;font-weight:600;}
        .cal-dow.sun{color:#E24B4A;}.cal-dow.sat{color:#378ADD;}.cal-dow.wd{color:#888;}
        .cal-day{font-size:11px;text-align:center;padding:3px 1px;border-radius:5px;cursor:pointer;border:1px solid transparent;min-height:32px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;}
        .cal-day:hover:not(.other){background:#f5f5f5;}
        .cal-day.other{opacity:.25;cursor:default;pointer-events:none;}
        .dnum{font-size:12px;font-weight:500;}
        .hname{font-size:7px;line-height:1;white-space:nowrap;overflow:hidden;max-width:32px;text-overflow:ellipsis;color:#E24B4A;}
        .cal-day.sun .dnum{color:#E24B4A;}
        .cal-day.sat .dnum{color:#378ADD;}
        .cal-day.sel-last{background:#FFF3CD!important;border:2px solid #EF9F27!important;}
        .cal-day.sel-last .dnum{color:#633806!important;font-weight:700!important;}
        .cal-day.sel-resume{background:#E8DEF8!important;border:2px solid #7F77DD!important;}
        .cal-day.sel-resume .dnum{color:#26215C!important;font-weight:700!important;}
        .cal-day.in-range{background:rgba(93,202,165,.12);}
        .chips{display:flex;flex-direction:column;gap:5px;margin-top:8px;}
        .chip{display:flex;align-items:center;gap:6px;font-size:11px;padding:4px 8px;border-radius:6px;background:#f8f8f8;}
        .dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;}
        .chip-lbl{color:#999;}
        .chip-val{color:#222;font-weight:600;margin-left:auto;}
        .hint{font-size:10px;color:#bbb;margin-top:4px;}
        .reset-btn{width:100%;margin-top:6px;font-size:11px;padding:6px;border:1.5px solid #e8e8e8;border-radius:8px;background:none;color:#999;cursor:pointer;font-family:inherit;}
        .reset-btn:hover{background:#f5f5f5;}
        .preview-col{display:flex;flex-direction:column;gap:12px;}
        .canvas-wrap{width:100%;overflow:hidden;border:1.5px solid #e8e8e8;border-radius:14px;background:#f0f0ee;display:flex;align-items:flex-start;justify-content:center;padding:12px;}
        .dl-btn{width:100%;padding:14px;font-size:14px;font-weight:700;border:none;border-radius:12px;background:#1a1a1a;color:white;cursor:pointer;text-align:center;font-family:inherit;letter-spacing:0.02em;}
        .dl-btn:hover{background:#333;}
        @media(max-width:640px){.generator-wrap{grid-template-columns:1fr;}}
      `}</style>

      <div className="generator-wrap">
        {/* 왼쪽 패널 */}
        <div className="panel">
          <div className="card">
            <div className="lbl">분위기</div>
            <div className="mood-row">
              {(['clean','cute','premium','food'] as Mood[]).map(m=>(
                <button key={m} className={`mbtn${mood===m?' active':''}`} onClick={()=>setMood(m)}>
                  {m==='clean'?'깔끔한':m==='cute'?'귀여운':m==='premium'?'고급스러운':'식품몰'}
                </button>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="lbl">사진 업로드 (선택)</div>
            <div className="upload-zone" onClick={()=>document.getElementById('file-in')?.click()}>
              🖼 클릭하여 이미지 선택
              <input type="file" id="file-in" accept="image/*" style={{display:'none'}} onChange={handleImg}/>
            </div>
            {imgName&&<div style={{fontSize:11,color:'#aaa',marginTop:4,textAlign:'center'}}>{imgName}</div>}
            {imgName&&<button className="reset-btn" onClick={clearImg}>이미지 제거</button>}
          </div>

          <div className="card">
            <div className="lbl">인사말 / 내용</div>
            <textarea className="fi" value={greeting} onChange={e=>setGreeting(e.target.value)}
              placeholder={'안녕하세요 고객님\n설 연휴 배송 지연 안내드립니다 🙏'} rows={3}/>
          </div>

          <div className="card">
            <div className="lbl">날짜 선택</div>
            <div className="cal-hdr">
              <button className="cal-nav" onClick={prevMonth}>‹</button>
              <span>{calYear}년 {calMonth+1}월</span>
              <button className="cal-nav" onClick={nextMonth}>›</button>
            </div>
            <div className="cal-grid">
              {['일','월','화','수','목','금','토'].map((d,i)=>(
                <div key={d} className={`cal-dow ${i===0?'sun':i===6?'sat':'wd'}`}>{d}</div>
              ))}
              {renderCalCells()}
            </div>

            <div style={{marginTop:12}}>
              <div className="lbl">📦 택배 마감 시간</div>
              <div className="time-row">
                <select className="fi" value={ampm} onChange={e=>setAmpm(e.target.value)}>
                  <option value="오전">오전</option><option value="오후">오후</option>
                </select>
                <select className="fi" value={hour} onChange={e=>setHour(e.target.value)}>
                  <option value="">시간</option>
                  {[12,1,2,3,4,5,6,7,8,9,10,11].map(h=><option key={h} value={String(h)}>{h}시</option>)}
                </select>
                <select className="fi" value={minute} onChange={e=>setMinute(e.target.value)}>
                  <option value="00">00분</option><option value="30">30분</option>
                </select>
              </div>
            </div>

            <div className="chips">
              <div className="chip">
                <div className="dot" style={{background:'#EF9F27'}}/>
                <span className="chip-lbl">택배 마감</span>
                <span className="chip-val">{fmtDate(lastDate)}</span>
              </div>
              <div className="chip">
                <div className="dot" style={{background:'#7F77DD'}}/>
                <span className="chip-lbl">택배 발송</span>
                <span className="chip-val">{fmtDate(resumeDate)}</span>
              </div>
            </div>
            <div className="hint">클릭 순서: 택배마감 → 택배발송</div>
            <button className="reset-btn" onClick={resetDates}>날짜 초기화</button>
          </div>

          <div className="card">
            <div className="lbl">하단 메시지</div>
            <textarea className="fi" value={noteText} onChange={e=>setNoteText(e.target.value)} rows={2}/>
          </div>
        </div>

        {/* 오른쪽 미리보기 */}
        <div className="preview-col">
          <div style={{fontSize:12,color:'#aaa'}}>미리보기 — 실시간 반영 / 다운로드 860px 고정</div>
          <div className="canvas-wrap" ref={wrapRef}>
            <canvas ref={canvasRef}/>
          </div>
          <button className="dl-btn" onClick={downloadPNG}>⬇ PNG 다운로드 (860px)</button>
        </div>
      </div>
    </>
  )
}
