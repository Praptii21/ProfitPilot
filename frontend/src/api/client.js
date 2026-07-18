// Single seam between the UI and the backend.
// Flip USE_MOCKS to false once the real endpoints exist:
//   POST /chat · GET /dashboard · POST /simulate · POST /ingest
const USE_MOCKS = true

import * as mockApi from '../mocks/api.js'

// TODO: backend — POST /chat
export async function sendMessage(text, history) {
  if (USE_MOCKS) return mockApi.sendMessage(text, history)
  const res = await fetch('/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: text, history }),
  })
  return res.json()
}

export { greeting, SEED_SUGGESTIONS } from '../mocks/api.js'
