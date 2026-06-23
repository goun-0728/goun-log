import type { Metadata } from 'next'
import DeliveryNoticeGenerator from './DeliveryNoticeGenerator'

export const metadata: Metadata = {
  title: '택배 공지 생성기 | GOUN LOG',
  description: '설·추석 등 택배 휴무 공지 이미지를 빠르게 만들 수 있는 무료 도구입니다.',
}

export default function DeliveryNoticePage() {
  return (
    <main className="simple-page">
      <section>
        <p className="eyebrow">Tools</p>
        <h1>택배 공지 생성기</h1>
        <p style={{color:'#888', marginBottom:'2rem', fontSize:'0.9rem'}}>
          설·추석 등 택배 휴무 공지 이미지를 빠르게 만들 수 있습니다. 무료로 사용 가능합니다.
        </p>
        <DeliveryNoticeGenerator />
      </section>
    </main>
  )
}