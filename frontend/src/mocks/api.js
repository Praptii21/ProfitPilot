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
        title: 'Total Revenue',
        value: '₹12,04,500',
        change: '↑ 12% from last month',
        changeType: 'positive',
      },
      profit: {
        title: 'Net Profit',
        value: '₹1,85,400',
        change: '↓ 8.2% from last month',
        changeType: 'negative',
      },
      margin: {
        title: 'Profit Margin',
        value: '15.4%',
        change: '↓ 2.6% from last month',
        changeType: 'negative',
      },
      leakage: {
        title: 'Est. Profit Leakage',
        value: '₹1,20,000/mo',
        change: 'Critical',
        changeType: 'negative',
      },
      forecast: {
        title: '3-Month Forecast',
        value: 'Stable Growth',
        change: '82% ML Confidence',
        changeType: 'neutral',
      },
    },
    charts: {
      revenueProfitTrend: [
        { month: 'Jan', revenue: 8.5, profit: 2.1 },
        { month: 'Feb', revenue: 9.2, profit: 2.25 },
        { month: 'Mar', revenue: 8.8, profit: 2.05 },
        { month: 'Apr', revenue: 9.5, profit: 2.15 },
        { month: 'May', revenue: 10.2, profit: 2.0 },
        { month: 'Jun', revenue: 12.04, profit: 1.85 },
      ],
      profitLeakageBreakdown: [
        { category: 'Discount Leakage', loss: 42000 },
        { category: 'Late Payments', loss: 28000 },
        { category: 'Low Margin Products', loss: 18000 },
        { category: 'Returns', loss: 8000 },
        { category: 'Inventory Waste', loss: 4000 },
      ],
      productProfitability: [
        { name: 'Product B', profit: 65000, margin: 28 },
        { name: 'Product A', profit: 42000, margin: 12 },
        { name: 'Product C', profit: 31000, margin: 22 },
        { name: 'Product D', profit: 28000, margin: 18 },
      ],
      profitForecast: [
        { month: 'Mar', historical: 2.05, predicted: null },
        { month: 'Apr', historical: 2.15, predicted: null },
        { month: 'May', historical: 2.00, predicted: null },
        { month: 'Jun', historical: 1.85, predicted: 1.85 },
        { month: 'Jul', historical: null, predicted: 1.95 },
        { month: 'Aug', historical: null, predicted: 2.14 },
        { month: 'Sep', historical: null, predicted: 2.30 },
      ],
    },
    recommendations: [
      {
        title: 'Reduce Product A discount from 22% to 10%',
        priority: 'high',
        reason: 'Product A moves at high volume, but the 22% discount destroys its contribution margin.',
        confidence: 85,
        estimatedRecovery: '₹22,000/mo',
      },
      {
        title: 'Enforce payment terms with Customer XYZ',
        priority: 'high',
        reason: 'Customer XYZ consistently pays 45 days late, acting as an interest-free loan at your expense.',
        confidence: 82,
        estimatedRecovery: '₹48,500 cashflow',
      },
      {
        title: 'Review pricing on low-margin products',
        priority: 'medium',
        reason: 'Products with <15% margin are dragging overall profitability down as operating costs rise.',
        confidence: 72,
        estimatedRecovery: '₹15,000/mo',
      },
    ],
  }
}

// ============ Simulation Mock ============

export async function runSimulation(params) {
  await sleep(1500) // Simulate Gemma processing
  
  // Calculate mock impacts based on the params passed in (price, discount, collection, marketing)
  let profitChange = 0;
  if (params.priceChange) profitChange += 28400; // Fake math for demo
  if (params.discountChange) profitChange += 22000;
  if (params.collectionDays) profitChange += 5000;
  
  const currentProfit = 185400;
  const projectedProfit = currentProfit + profitChange;
  
  // Fake graph data showing the simulation trend
  const graphData = [
    { month: 'Jun', current: 1.85, projected: 1.85 },
    { month: 'Jul', current: 1.95, projected: 1.95 + (profitChange / 100000) * 0.3 },
    { month: 'Aug', current: 2.14, projected: 2.14 + (profitChange / 100000) * 0.7 },
    { month: 'Sep', current: 2.30, projected: 2.30 + (profitChange / 100000) },
  ];

  // Simple verdict logic
  const isRecommended = profitChange > 0;
  
  return {
    impact: {
      currentProfit: `₹${(currentProfit/100000).toFixed(2)}L`,
      projectedProfit: `₹${(projectedProfit/100000).toFixed(2)}L`,
      difference: profitChange >= 0 ? `+₹${profitChange.toLocaleString()}/mo` : `-₹${Math.abs(profitChange).toLocaleString()}/mo`,
      confidence: '84%',
      risk: profitChange > 25000 ? 'Medium' : 'Low',
      reward: profitChange > 20000 ? 'High' : 'Moderate',
      projectedMargin: '18.6%',
    },
    graph: graphData,
    verdict: {
      status: isRecommended ? 'Recommended' : 'Not Recommended',
      color: isRecommended ? 'green' : 'red',
      reason: isRecommended 
        ? `Adjusting these parameters improves monthly profit by ₹${profitChange.toLocaleString()} while maintaining an acceptable churn risk.`
        : `This strategy increases churn probability by 22%, which outweighs the expected short-term gains.`,
    }
  }
}
