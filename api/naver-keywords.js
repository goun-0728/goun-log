// api/naver-keywords.js
// 네이버 검색광고 API — 키워드 도구 (서버에서 HMAC 서명 처리)
import crypto from 'crypto'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { keywords } = req.query
  if (!keywords) return res.status(400).json({ error: '키워드를 입력해주세요' })

  // 공백 제거 후 사용
  const rawCustomerId = (process.env.NAVER_AD_CUSTOMER_ID || '').trim()
  const accessLicense = (process.env.NAVER_AD_ACCESS_LICENSE || '').trim()
  const secretKey     = (process.env.NAVER_AD_SECRET_KEY || '').trim()

  // X-Customer 헤더는 숫자 ID만 허용 — ncp_ 접두사나 문자 제거
  // (Naver Ad 대시보드 > API 관리에서 확인되는 순수 숫자 Customer ID)
  const customerId = rawCustomerId.replace(/^ncp_/i, '').replace(/\D/g, '')

  if (!customerId || !accessLicense || !secretKey) {
    return res.status(500).json({
      error: '네이버 광고 API 인증 정보가 설정되지 않았습니다',
      debug: {
        hasCustomerId:    !!rawCustomerId,
        parsedCustomerId: customerId || '(비어있음 — 숫자만 필요, ncp_ 제외)',
        hasAccessLicense: !!accessLicense,
        hasSecretKey:     !!secretKey,
      },
    })
  }

  try {
    const timestamp = Date.now().toString()
    const method    = 'GET'
    const uri       = '/keywordstool'

    // HMAC-SHA256 서명: "{timestamp}.{METHOD}.{uri}"
    const signature = crypto
      .createHmac('sha256', secretKey)
      .update(`${timestamp}.${method}.${uri}`)
      .digest('base64')

    const params = new URLSearchParams({ hintKeywords: keywords, showDetail: '1' })

    const resp = await fetch(`https://api.naver.com${uri}?${params}`, {
      headers: {
        'X-Timestamp' : timestamp,
        'X-API-KEY'   : accessLicense,
        'X-Customer'  : customerId,
        'X-Signature' : signature,
        'Content-Type': 'application/json; charset=UTF-8',
      },
    })

    if (!resp.ok) {
      const body = await resp.text()
      return res.status(resp.status).json({
        error: `네이버 API 오류 (${resp.status}): ${body}`,
        debug: { customerId, accessLicensePrefix: accessLicense.slice(0, 8) + '…' },
      })
    }

    const data = await resp.json()
    return res.status(200).json(data)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
