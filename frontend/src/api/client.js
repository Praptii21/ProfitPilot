// Single seam between the UI and the backend.
// Flip USE_MOCKS to false once the real endpoints exist:
//   POST /chat · GET /dashboard · POST /simulate · POST /ingest
const USE_MOCKS = false

import * as mockApi from '../mocks/api.js'

// TODO: backend — POST /chat
export async function sendMessage(text, history) {
  if (USE_MOCKS) return mockApi.sendMessage(text, history)
  const res = await fetch('http://127.0.0.1:8000/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: text, history }),
  })
  return res.json()
}

// TODO: backend — GET /dashboard
export function getDashboardData() {
  // Always return mock data for now because the backend needs 
  // file upload (/analyze) to be wired up first!
  return mockApi.getDashboardData()
}

// TODO: backend — POST /simulate
export async function runSimulation(params) {
  // Same here, use mocks until ML integration is fully complete on the frontend
  return mockApi.runSimulation(params)
}

export { greeting, SEED_SUGGESTIONS } from '../mocks/api.js'
