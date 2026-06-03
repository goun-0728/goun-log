const DEFAULT_TRACK_URL = 'https://goun-log.vercel.app/api/track-generation'

export function trackGenerationCount() {
  const endpoint = import.meta.env.VITE_GOUN_LOG_TRACK_GENERATION_URL || DEFAULT_TRACK_URL

  try {
    return fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
    }).catch(() => null)
  } catch {
    return Promise.resolve(null)
  }
}
