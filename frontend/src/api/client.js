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
  // We start with mock data, but uploading a file will replace it with live data
  return mockApi.getDashboardData()
}

export async function uploadData(file) {
  // 1. Determine if it's an image (for Gemma Vision OCR) or a CSV
  const isImage = file.type.startsWith('image/')
  const endpoint = isImage ? 'http://127.0.0.1:8000/extract' : 'http://127.0.0.1:8000/analyze'

  const formData = new FormData()
  formData.append('file', file)
  const response = await fetch(endpoint, {
    method: 'POST',
    body: formData
  })
  
  if (!response.ok) {
    const err = await response.text()
    throw new Error(err)
  }
  
  const rawData = await response.json()
  // The /extract endpoint nests the analysis inside `rawData.analysis`, while /analyze returns it directly
  const analysis = isImage ? rawData.analysis : rawData

  // 2. Fetch the updated dashboard aggregates
  const dashRes = await fetch('http://127.0.0.1:8000/dashboard')
  const dash = await dashRes.json()

  // 3. Map backend data to UI shape
  return transformBackendToUI(analysis, dash)
}

function transformBackendToUI(analysis, dash) {
  const formatCurrency = (val) => `₹${val.toLocaleString('en-IN')}`
  
  // Format cards
  const cards = {
    revenue: {
      title: 'Total Revenue',
      value: formatCurrency(dash.metrics.total_revenue),
      change: 'Based on uploaded ledger',
      changeType: 'neutral',
    },
    profit: {
      title: 'Net Profit',
      value: formatCurrency(dash.metrics.total_profit),
      change: 'Based on uploaded ledger',
      changeType: 'neutral',
    },
    margin: {
      title: 'Profit Margin',
      value: `${dash.metrics.overall_margin.toFixed(1)}%`,
      change: 'Based on uploaded ledger',
      changeType: 'neutral',
    },
    leakage: {
      title: 'Est. Profit Leakage',
      value: formatCurrency(analysis.profit_leaks.reduce((sum, leak) => sum + leak.estimated_loss, 0)),
      change: analysis.profit_leaks.length > 0 ? 'Action Required' : 'Healthy',
      changeType: analysis.profit_leaks.length > 0 ? 'negative' : 'positive',
    },
    forecast: {
      title: 'Next Month Forecast',
      value: formatCurrency(analysis.forecast.next_month_profit),
      change: 'ML Forecast',
      changeType: 'neutral',
    },
  }

  // Format charts
  const revenueProfitTrend = dash.monthly_trend.map(item => ({
    month: item.month,
    revenue: item.revenue / 100000, // convert to L
    profit: item.profit / 100000
  }))

  const profitLeakageBreakdown = analysis.profit_leaks.map(leak => ({
    category: `Discount: ${leak.product}`,
    loss: leak.estimated_loss
  }))

  const productProfitability = dash.product_analysis.map(p => ({
    name: p.product_name,
    profit: p.profit,
    margin: p.margin
  }))

  const profitForecast = analysis.forecast.historical_trend.map((item, idx, arr) => {
    // Only map the last historical month + the predicted month to connect the line
    return {
      month: item.month,
      historical: item.monthly_profit / 100000,
      predicted: idx === arr.length - 1 ? item.monthly_profit / 100000 : null
    }
  })
  // Add next month prediction
  profitForecast.push({
    month: 'Next',
    historical: null,
    predicted: analysis.forecast.next_month_profit / 100000
  })

  // Format recommendations
  let recommendations = []
  analysis.profit_leaks.forEach(leak => {
    recommendations.push({
      title: `Review pricing for ${leak.product}`,
      priority: leak.severity.toLowerCase(),
      reason: `Anomaly detected. High discount of ${leak.avg_discount_pct}% is eroding contribution margin.`,
      confidence: leak.confidence_score * 100,
      estimatedRecovery: `${formatCurrency(leak.estimated_loss)}/mo`
    })
  })
  analysis.customer_risks.forEach(risk => {
    recommendations.push({
      title: `Address risk with ${risk.customer}`,
      priority: risk.issue === 'Late Payments' ? 'high' : 'medium',
      reason: risk.detail || `Customer pays ${risk.days_delayed} days late on average.`,
      confidence: 85,
      estimatedRecovery: 'Cashflow improvement'
    })
  })

  // Read custom goals from localStorage and tie them to the best data-backed recommendations
  try {
    const saved = localStorage.getItem('user_goals')
    if (saved) {
      const userGoals = JSON.parse(saved)
      
      if (userGoals.length > 0 && recommendations.length > 0) {
        const primaryGoal = userGoals[0]
        const formattedDate = new Date(primaryGoal.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        
        recommendations[0] = {
          ...recommendations[0],
          isGoal: true,
          reason: `To reach your goal of "${primaryGoal.title}" by ${formattedDate}: ${recommendations[0].reason}`
        }

        if (userGoals.length > 1 && recommendations.length > 1) {
           const secondaryGoal = userGoals[1]
           const formattedDate2 = new Date(secondaryGoal.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
           recommendations[1] = {
             ...recommendations[1],
             isGoal: true,
             reason: `To reach your goal of "${secondaryGoal.title}" by ${formattedDate2}: ${recommendations[1].reason}`
           }
        }
      }
    }
  } catch (e) {
    console.error(e)
  }

  return {
    cards,
    charts: {
      revenueProfitTrend,
      profitLeakageBreakdown,
      productProfitability,
      profitForecast
    },
    recommendations
  }
}

// Connect to the backend — POST /simulator
export async function runSimulation(params) {
  // Translate UI params to Backend payload
  const payload = {
    price_change_pct: params.priceChange || 0,
    discount_change_pct: -(params.discountChange || 0), // Assuming reduction in discount is negative change
    payment_terms_days: -(params.collectionDays || 0) // Faster collection
  }

  const res = await fetch('http://127.0.0.1:8000/simulator', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(err)
  }

  const simData = await res.json()
  
  // Format the backend data for the UI
  const formatCurrency = (val) => `₹${val.toLocaleString('en-IN')}`
  
  // To avoid needing another endpoint call, we calculate the current profit by subtracting the delta from the simulated profit
  const currentProfit = simData.simulated_profit - simData.profit_delta
  const projectedMargin = ((simData.simulated_profit / simData.simulated_revenue) * 100).toFixed(1)

  // Construct a simple trajectory graph
  const currentProfitL = currentProfit / 100000
  const projectedProfitL = simData.simulated_profit / 100000
  const graph = [
    { month: 'Current', current: currentProfitL, projected: currentProfitL },
    { month: '+1 Mo', current: currentProfitL, projected: currentProfitL + (projectedProfitL - currentProfitL) * 0.33 },
    { month: '+2 Mo', current: currentProfitL, projected: currentProfitL + (projectedProfitL - currentProfitL) * 0.66 },
    { month: '+3 Mo', current: currentProfitL, projected: projectedProfitL },
  ]

  const isPositive = simData.profit_delta >= 0

  return {
    impact: {
      currentProfit: formatCurrency(currentProfit),
      projectedProfit: formatCurrency(simData.simulated_profit),
      difference: `${isPositive ? '+' : ''}${formatCurrency(simData.profit_delta)}`,
      projectedMargin: `${projectedMargin}%`,
      risk: isPositive ? 'Low' : 'High',
      reward: isPositive ? 'High' : 'Low',
    },
    graph,
    verdict: {
      status: isPositive ? 'Recommended Strategy' : 'Not Recommended',
      reason: isPositive 
        ? `This combination of pricing and discounting increases net profit by ${formatCurrency(simData.profit_delta)} without severe volume risks.`
        : `This strategy degrades your margins and results in a net loss of ${formatCurrency(simData.profit_delta)}.`,
      color: isPositive ? 'green' : 'red',
    }
  }
}

export { greeting, SEED_SUGGESTIONS } from '../mocks/api.js'
