// =====================================================================
// API CONTRACT — POST /chat
// This is the exact shape the backend must return. Do not deviate.
//
// Request:  { "message": string, "history": [{ "role": "user"|"assistant", "content": string }] }
// Response:
// {
//   "reply": "Your margin fell from 18% to 15.4%. Root cause: Product A sold at a 22% average discount...",
//   "steps": [
//     { "icon": "file", "text": "reading ledger_june_2026.jpg" },
//     { "icon": "function", "text": "calling find_profit_leaks() -> 3 results" },
//     { "icon": "book", "text": "retrieving 'discount optimization' · SBA guide p.12" }
//   ],
//   "evidence": {
//     "metrics": [
//       { "label": "Avg discount, Product A", "value": "22%" },
//       { "label": "Margin, June", "value": "15.4%" },
//       { "label": "Monthly loss", "value": "₹22,000" }
//     ],
//     "source": {
//       "title": "SBA pricing strategy guide",
//       "page": 12,
//       "snippet": "Discounts above 15% typically require volume increases of...",
//       "why_used": "Product A's 22% discount exceeds the threshold discussed in this guidance."
//     },
//     "confidence": 0.82
//   },
//   "suggestions": ["What if I cut the discount to 10%?", "Which customer is worst?"],
//   "actions": [{ "id": "draft_email", "label": "Draft supplier email" }]
// }
//
// "evidence" may be null. "steps", "suggestions", "actions" may be empty arrays.
// =====================================================================

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export const SEED_SUGGESTIONS = [
  'Why did profits decrease this month?',
  'Which customer is hurting me most?',
  "What if I cut Product A's discount to 10%?",
  'How can I improve customer retention?',
  'Draft a payment reminder',
]

// Proactive greeting — same response shape as POST /chat, rendered on load.
export const greeting = {
  reply:
    "Hello! I've finished reviewing your June ledger for ABC Retail. Revenue grew 12% to ₹12.0L — good news. But profit slipped to ₹1.85L, and your margin is down from 18% to 15.4%. I found 3 places where money is leaking, worth about ₹1.2L per month. Want me to walk you through the biggest one?",
  steps: [
    { icon: 'file', text: 'reading ledger_june_2026.jpg' },
    { icon: 'function', text: 'calling find_profit_leaks() -> 3 results' },
    { icon: 'chart', text: 'computing monthly health score -> 78/100' },
  ],
  evidence: null,
  suggestions: SEED_SUGGESTIONS,
  actions: [],
}

// ---- canned responses, varied by input so the demo can be rehearsed ----

const profitLeakResponse = {
  reply:
    'Your margin fell from 18% to 15.4%. Root cause: Product A sold at a 22% average discount in June. It moves at volume, but after discount it nets almost nothing — that alone is costing you around ₹22,000 a month. Second, Customer XYZ pays 45 days late on average, which is quietly financing their business with your cash. Third, delivery costs rose 8% but your prices did not.',
  steps: [
    { icon: 'file', text: 'reading ledger_june_2026.jpg' },
    { icon: 'function', text: 'calling find_profit_leaks() -> 3 results' },
    { icon: 'book', text: "retrieving 'discount optimization' · SBA guide p.12" },
    { icon: 'sparkles', text: 'generating recommendation' },
  ],
  evidence: {
    metrics: [
      { label: 'Avg discount, Product A', value: '22%' },
      { label: 'Margin, June', value: '15.4%' },
      { label: 'Monthly loss', value: '₹22,000' },
    ],
    source: {
      title: 'SBA pricing strategy guide',
      page: 12,
      snippet:
        'Discounts above 15% typically require volume increases of 40% or more to break even on contribution margin...',
      why_used: "Product A's 22% discount exceeds the threshold discussed in this guidance.",
    },
    confidence: 0.82,
  },
  suggestions: [
    'What if I cut the discount to 10%?',
    'Which customer is worst?',
    'How do I fix late payments?',
  ],
  actions: [{ id: 'draft_email', label: 'Draft supplier email' }],
}

const ragResponse = {
  reply:
    'For a retail business like yours, retention usually beats acquisition on cost — the guidance I found suggests a repeat customer costs 5–7x less to serve than winning a new one. Three practical steps for ABC Retail: start a simple purchase-count reward (every 10th purchase gets 10% off), send a WhatsApp reminder to customers inactive for 30+ days, and prioritise your top 20 customers — they drive 61% of your revenue.',
  steps: [
    { icon: 'book', text: "retrieving 'customer retention strategies' · SBA guide p.34" },
    { icon: 'book', text: "retrieving 'loyalty programs for small retail' · SBA guide p.36" },
    { icon: 'sparkles', text: 'generating recommendation' },
  ],
  evidence: {
    metrics: [
      { label: 'Revenue from top 20 customers', value: '61%' },
      { label: 'Customers inactive 30+ days', value: '34' },
    ],
    source: {
      title: 'SBA customer retention guide',
      page: 34,
      snippet:
        'Retaining an existing customer costs 5 to 7 times less than acquiring a new one. Simple loyalty mechanics outperform complex point systems in small retail...',
      why_used: 'Your question is about retention strategy, which this guidance covers directly.',
    },
    confidence: 0.78,
  },
  suggestions: [
    'Draft a WhatsApp win-back message',
    'Who are my top 20 customers?',
    'Why did profits decrease this month?',
  ],
  actions: [],
}

const simulationResponse = {
  reply:
    "I ran the numbers. Cutting Product A's discount from 22% to 10% recovers roughly ₹22,000 per month, assuming volume drops no more than 8% — and Product A's demand has been steady for 4 months, so that's a reasonable assumption. Your margin would move from 15.4% to about 17.2%. The risk is low: even if volume drops 15%, you still come out ₹9,000 ahead.",
  steps: [
    { icon: 'function', text: 'calling simulate(discount=10%) -> projected margin 17.2%' },
    { icon: 'chart', text: 'checking Product A volume stability -> steady, 4 months' },
    { icon: 'sparkles', text: 'generating recommendation' },
  ],
  evidence: {
    metrics: [
      { label: 'Projected recovery', value: '₹22,000 / month' },
      { label: 'Projected margin', value: '17.2%' },
      { label: 'Break-even volume drop', value: '15%' },
    ],
    source: {
      title: 'SBA pricing strategy guide',
      page: 12,
      snippet:
        'Discounts above 15% typically require volume increases of 40% or more to break even on contribution margin...',
      why_used: 'The simulation applies the discount elasticity threshold from this guidance.',
    },
    confidence: 0.85,
  },
  suggestions: [
    'What if volume drops 20%?',
    'Apply this to the simulator',
    'Draft a price update notice',
  ],
  actions: [{ id: 'open_simulator', label: 'Open simulator' }],
}

const draftEmailResponse = {
  reply:
    'Here is a draft you can send:\n\nSubject: Payment reminder — invoice #2041\n\nDear XYZ Traders,\n\nI hope business is going well. This is a gentle reminder that invoice #2041 for ₹48,500, dated 3 June, is now 15 days past due. We value our partnership and would appreciate payment by Friday, 25 July.\n\nIf payment has already been made, please ignore this note. For any questions about the invoice, reply here or call us directly.\n\nWarm regards,\nABC Retail\n\nWant me to make it firmer, or shorter?',
  steps: [
    { icon: 'function', text: 'calling get_receivables(customer=XYZ) -> ₹48,500 overdue' },
    { icon: 'sparkles', text: 'drafting payment reminder' },
  ],
  evidence: {
    metrics: [
      { label: 'Overdue amount, XYZ', value: '₹48,500' },
      { label: 'Days overdue', value: '15' },
      { label: 'Avg payment delay, XYZ', value: '45 days' },
    ],
    source: null,
    confidence: 0.9,
  },
  suggestions: ['Make it firmer', 'Which customer is hurting me most?', 'How do I avoid late payments?'],
  actions: [],
}

function pickResponse(text) {
  const t = text.toLowerCase()
  if (t.includes('draft') || t.includes('email') || t.includes('reminder')) return draftEmailResponse
  if (t.includes('what if') || t.includes('discount') || t.includes('simulat')) return simulationResponse
  if (t.includes('retention') || t.includes('how do i') || t.includes('how can i')) return ragResponse
  return profitLeakResponse
}

// TODO: backend — replace with POST /chat
export async function sendMessage(text, history) {
  void history // sent to the real backend later; unused by the mock
  await sleep(1200)
  return pickResponse(text)
}
