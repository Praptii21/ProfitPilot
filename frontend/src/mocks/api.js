// =====================================================================
// API CONTRACT — POST /chat
// This is the exact shape the backend must return. Do not deviate.
//
// Request:  { "message": string, "history": [{ "role": "user"|"assistant", "content": string }] }
// Response:
// {
//   "reply": "...",
//   "steps": [{ "icon": "file"|"function"|"book"|"chart"|"sparkles", "text": "..." }],
//   "evidence": {
//     "metrics": [{ "label": "...", "value": "..." }],
//     "source": { "title": "...", "page": N, "snippet": "...", "why_used": "..." },
//     "confidence": 0.82
//   },
//   "suggestions": ["...", "..."],
//   "actions": [{ "id": "...", "label": "..." }]
// }
// =====================================================================

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export const SEED_SUGGESTIONS = [
  'Why did profits decrease this month?',
  'Which customers are reducing profitability?',
  'What products should I bundle?',
  'How can I increase profit by 10%?',
  'Show my biggest profit leak.',
]

// Proactive greeting — same response shape as POST /chat, rendered on load.
export const greeting = {
  reply:
    "Hello! I've finished reviewing your June ledger for ABC Retail. Revenue grew 12% to ₹12.0L — good news. But profit slipped to ₹1.85L, and your margin is down from 18% to 15.4%. I found 3 places where money is leaking, worth about ₹1.2L per month. Want me to walk you through the biggest one?",
  steps: [
    { icon: 'file', text: 'reading ledger_june_2026.csv' },
    { icon: 'function', text: 'calling find_profit_leaks() → 3 results' },
    { icon: 'chart', text: 'computing monthly health score → 78/100' },
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
    { icon: 'file', text: 'reading ledger_june_2026.csv' },
    { icon: 'function', text: 'calling find_profit_leaks() → 3 results' },
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
    { icon: 'function', text: 'calling simulate(discount=10%) → projected margin 17.2%' },
    { icon: 'chart', text: 'checking Product A volume stability → steady, 4 months' },
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
    { icon: 'function', text: 'calling get_receivables(customer=XYZ) → ₹48,500 overdue' },
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
  if (t.includes('retention') || t.includes('how do i') || t.includes('how can i') || t.includes('bundle')) return ragResponse
  return profitLeakResponse
}

// TODO: backend — replace with POST /chat
export async function sendMessage(text, history) {
  void history // sent to the real backend later; unused by the mock
  await sleep(1200)
  return pickResponse(text)
}

// ============ Dashboard Mock Data ============

export function getDashboardData() {
  return {
    cards: {
      revenue: {
        value: '12,04,500',
        change: '+12% from last month',
        changeType: 'positive',
        trend: [
          { value: 850000 }, { value: 920000 }, { value: 880000 },
          { value: 950000 }, { value: 1020000 }, { value: 1075000 }, { value: 1204500 },
        ],
      },
      profit: {
        value: '1,85,400',
        change: '-8.2% from last month',
        changeType: 'negative',
        trend: [
          { value: 210000 }, { value: 225000 }, { value: 205000 },
          { value: 215000 }, { value: 200000 }, { value: 195000 }, { value: 185400 },
        ],
      },
      margin: {
        value: '15.4%',
        change: '-2.6% from last month',
        changeType: 'negative',
        trend: [
          { value: 22 }, { value: 20 }, { value: 19.5 },
          { value: 18 }, { value: 17.2 }, { value: 16.1 }, { value: 15.4 },
        ],
      },
      healthScore: {
        value: '78/100',
        change: 'Fair condition',
        changeType: 'positive',
        trend: [
          { value: 85 }, { value: 82 }, { value: 80 },
          { value: 79 }, { value: 78 }, { value: 78 }, { value: 78 },
        ],
      },
      leakage: {
        value: '1,20,000',
        change: '₹1.2L/month estimated',
        changeType: 'negative',
        trend: [
          { value: 80000 }, { value: 85000 }, { value: 95000 },
          { value: 100000 }, { value: 105000 }, { value: 115000 }, { value: 120000 },
        ],
      },
    },
    charts: {
      revenueTrend: [
        { name: 'Jan', revenue: 850000 }, { name: 'Feb', revenue: 920000 },
        { name: 'Mar', revenue: 880000 }, { name: 'Apr', revenue: 950000 },
        { name: 'May', revenue: 1020000 }, { name: 'Jun', revenue: 1204500 },
      ],
      profitTrend: [
        { name: 'Jan', profit: 210000 }, { name: 'Feb', profit: 225000 },
        { name: 'Mar', profit: 205000 }, { name: 'Apr', profit: 215000 },
        { name: 'May', profit: 200000 }, { name: 'Jun', profit: 185400 },
      ],
      marginTrend: [
        { name: 'Jan', margin: 22 }, { name: 'Feb', margin: 20 },
        { name: 'Mar', margin: 19.5 }, { name: 'Apr', margin: 18 },
        { name: 'May', margin: 17.2 }, { name: 'Jun', margin: 15.4 },
      ],
      topProducts: [
        { name: 'Product A', revenue: 380000 }, { name: 'Product B', revenue: 290000 },
        { name: 'Product C', revenue: 210000 }, { name: 'Product D', revenue: 165000 },
        { name: 'Product E', revenue: 98000 },
      ],
    },
    recommendations: [
      {
        title: 'Reduce Product A discount from 22% to 10%',
        priority: 'high',
        impact: 'This alone recovers ₹22,000/month in lost margin without significant volume risk.',
        confidence: 0.85,
        estimatedRecovery: '₹22,000/mo',
      },
      {
        title: 'Enforce payment terms with Customer XYZ',
        priority: 'high',
        impact: 'Customer XYZ pays 45 days late on average. Enforcing terms unlocks ₹48,500 in cash flow.',
        confidence: 0.82,
        estimatedRecovery: '₹48,500',
      },
      {
        title: 'Review pricing on low-margin products',
        priority: 'medium',
        impact: 'Products with <15% margin are dragging overall profitability down.',
        confidence: 0.72,
        estimatedRecovery: '₹15,000/mo',
      },
    ],
    report: {
      executiveSummary: 'ABC Retail showed strong revenue growth of 12% in June, reaching ₹12.04L. However, profit declined by 8.2% to ₹1.85L, with margins falling from 18% to 15.4%. Three primary profit leaks were identified, totaling approximately ₹1.2L in monthly losses.',
      healthScore: 78,
      keyFindings: [
        'Revenue grew 12% month-over-month to ₹12.04L',
        'Profit margin declined from 18% to 15.4%',
        'Customer concentration risk: top 3 customers represent 61% of revenue',
        'Average payment collection takes 45 days vs 30-day terms',
      ],
      profitLeaks: [
        'Product A discount of 22% is ₹22,000/month above break-even threshold',
        'Customer XYZ late payments (45 days) tie up ₹48,500 in receivables',
        'Delivery cost increase of 8% not passed through to pricing',
      ],
      growthOpportunities: [
        'Customer retention program could reduce churn by 15-20%',
        'Bundle Product A with complementary items to maintain volume at lower discount',
        'Expand top 20 customer relationships — they drive 61% of revenue',
      ],
      priorityActions: [
        'Cap Product A discount at 10% starting next billing cycle',
        'Send payment reminder to Customer XYZ for overdue ₹48,500',
        'Adjust delivery surcharge to reflect 8% cost increase',
        'Launch simple loyalty program for top 20 customers',
      ],
    },
  }
}

// ============ Simulation Mock ============

export async function runSimulation({ priceChange, discountChange, collectionReduction }) {
  await sleep(800)
  // Simple mock calculation
  const baseRevenue = 1204500
  const baseProfit = 185400
  const baseMargin = 15.4

  const revChange = baseRevenue * (priceChange / 100)
  const profitFromDiscount = -discountChange * 2200  // rough estimate per point
  const cashUnlocked = (baseRevenue / 365) * collectionReduction
  const totalProfitChange = revChange * 0.3 + profitFromDiscount
  const marginChange = (totalProfitChange / baseRevenue) * 100

  return {
    impact: {
      revenue_change: Math.round(revChange),
      profit_change: Math.round(totalProfitChange),
      margin_change_pct: Math.round(marginChange * 100) / 100,
      cash_unlocked_from_ar: Math.round(cashUnlocked),
    },
  }
}
