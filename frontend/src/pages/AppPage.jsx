import { motion } from 'framer-motion'
import TopBar from '../components/TopBar.jsx'
import ChatPanel from '../components/ChatPanel.jsx'
import DashboardCards from '../components/dashboard/DashboardCards.jsx'
import ChartsGrid from '../components/dashboard/ChartsGrid.jsx'
import RecommendationCard from '../components/dashboard/RecommendationCard.jsx'
import WhatIfSimulator from '../components/dashboard/WhatIfSimulator.jsx'
import { sendMessage, runSimulation, uploadData, SEED_SUGGESTIONS } from '../api/client.js'

export default function AppPage({
  messages, setMessages,
  thinking, setThinking,
  chatExpanded, setChatExpanded,
  dashboardData, setDashboardData,
  isUploading, setIsUploading,
}) {

  async function handleSend(text, attachment) {
    // If the composer sends an attachment, treat it as a file upload
    if (attachment) {
      await handleUpload(attachment)
      return
    }

    if (!text.trim()) return

    const next = [...messages, { role: 'user', content: text }]
    setMessages(next)
    setThinking(true)
    try {
      const history = next.map(({ role, content }) => ({ role, content }))
      const res = await sendMessage(text, history)
      setMessages((prev) => [...prev, { role: 'assistant', content: res.reply, ...res }])
    } finally {
      setThinking(false)
    }
  }

  async function handleUpload(file) {
    console.log('uploading:', file.name)
    setIsUploading(true)

    // Generate local URL for preview if image
    let imageUrl = null
    if (file.type.startsWith('image/')) {
      imageUrl = URL.createObjectURL(file)
    }

    setMessages((prev) => [...prev, {
      role: 'user',
      content: `Uploaded file: ${file.name}`,
      imageUrl
    }])
    setThinking(true)

    try {
      const liveData = await uploadData(file)
      setDashboardData(liveData)
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: 'I have successfully extracted the data from your document and updated the dashboard. How can I help you analyze it?',
        suggestions: SEED_SUGGESTIONS
      }])
    } catch (err) {
      console.error('Failed to analyze ledger:', err)
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: "I encountered an error trying to process that document. Please ensure it is a clear image containing invoice data or a valid CSV."
      }])
      alert('Error analyzing the ledger. Check the backend connection.')
    } finally {
      setIsUploading(false)
      setThinking(false)
    }
  }

  function handleExplainRecommendation(title) {
    handleSend(`Explain this recommendation: ${title}`)
  }

  async function handleSimulate(params) {
    return runSimulation(params)
  }

  function handleDownloadPDF() {
    // Build a clean HTML report and download it
    const reportHTML = buildReportHTML(dashboardData)
    const blob = new Blob([reportHTML], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    
    // Open in new window for print-to-PDF, or use iframe trick for direct download
    const printWindow = window.open('', '_blank')
    printWindow.document.write(reportHTML)
    printWindow.document.close()
    
    // Auto-trigger print dialog after content loads
    printWindow.onload = () => {
      printWindow.print()
    }
  }

  // Dynamic widths for expand/collapse
  const leftWidth = chatExpanded ? '30%' : '55%'
  const rightWidth = chatExpanded ? '70%' : '45%'

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <div>
        <TopBar onUpload={handleUpload} isUploading={isUploading} />
      </div>

      <div className="flex min-h-0 flex-1 relative">
        
        {isUploading && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/60 dark:bg-slate-950/60 backdrop-blur-sm">
            <span className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600 mb-4" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Analyzing ledger with Machine Learning...</p>
          </div>
        )}

        {/* LEFT — Dashboard (scrollable) */}
        <motion.div
          animate={{ width: leftWidth }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="min-h-0 overflow-y-auto"
        >
          <div className="space-y-5 p-5">
            {/* KPI Cards */}
            <DashboardCards data={dashboardData.cards} />

            {/* Charts */}
            <ChartsGrid chartData={dashboardData.charts} />

            {/* Recommendations */}
            <div>
              <h2 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                Recommendations
              </h2>
              <div className="space-y-3">
                {dashboardData.recommendations?.map((rec, i) => (
                  <RecommendationCard
                    key={i}
                    recommendation={rec}
                    onExplain={handleExplainRecommendation}
                  />
                ))}
              </div>
            </div>

            {/* What-if Simulator */}
            <div>
              <WhatIfSimulator onSimulate={handleSimulate} />
            </div>

            {/* Download Action */}
            <div className="pt-4 flex justify-center">
              <button onClick={handleDownloadPDF} className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 shadow-sm transition-all hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                Download Business Report (PDF)
              </button>
            </div>
          </div>
        </motion.div>

        {/* RIGHT — Chat (resizable) */}
        <motion.div
          animate={{ width: rightWidth }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="min-h-0"
        >
          <ChatPanel
            messages={messages}
            thinking={thinking}
            onSend={handleSend}
            expanded={chatExpanded}
            onToggleExpand={() => setChatExpanded(!chatExpanded)}
          />
        </motion.div>
      </div>
    </div>
  )
}

// Build a standalone HTML report string with inline CSS for PDF download
function buildReportHTML(dashboardData) {
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  
  const recItems = (dashboardData.recommendations || []).map((rec, i) => `
    <li style="display:flex;gap:16px;margin-bottom:24px;">
      <div style="flex-shrink:0;margin-top:4px;">
        <div style="width:28px;height:28px;border-radius:50%;background:${rec.isGoal ? '#e0e7ff' : '#eef2ff'};color:${rec.isGoal ? '#4338ca' : '#4f46e5'};display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px;">${i + 1}</div>
      </div>
      <div>
        <h3 style="font-size:16px;font-weight:700;color:#1e293b;margin:0 0 4px 0;">
          ${rec.title}
          ${rec.isGoal ? '<span style="margin-left:8px;font-size:10px;background:#e0e7ff;color:#4338ca;padding:2px 8px;border-radius:9999px;text-transform:uppercase;letter-spacing:0.05em;vertical-align:middle;">Your Goal</span>' : ''}
        </h3>
        <p style="font-size:13px;color:#475569;line-height:1.6;margin:0;">${rec.reason}</p>
        ${rec.estimatedRecovery ? `<p style="font-size:13px;font-weight:600;color:#059669;margin:8px 0 0 0;">Target Impact: ${rec.estimatedRecovery}</p>` : ''}
      </div>
    </li>
  `).join('')

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>ProfitPilot Executive Report</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', -apple-system, sans-serif; color: #1e293b; padding: 48px; max-width: 800px; margin: 0 auto; }
    .header { border-bottom: 3px solid #4f46e5; padding-bottom: 24px; margin-bottom: 32px; }
    .header h1 { font-size: 28px; font-weight: 800; color: #0f172a; margin-bottom: 4px; }
    .header p { font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 500; }
    .section-title { font-size: 18px; font-weight: 700; color: #4f46e5; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 1px solid #e2e8f0; }
    .metrics-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 40px; }
    .metric-card { padding: 16px; border: 1px solid #e2e8f0; border-radius: 8px; background: #f8fafc; }
    .metric-card.danger { background: #fef2f2; border-color: #fecaca; }
    .metric-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; font-weight: 600; color: #64748b; margin-bottom: 4px; }
    .metric-card.danger .metric-label { color: #dc2626; }
    .metric-value { font-size: 22px; font-weight: 700; color: #0f172a; }
    .metric-card.danger .metric-value { color: #b91c1c; }
    .action-list { list-style: none; padding: 0; }
    .footer { margin-top: 64px; padding-top: 24px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #94a3b8; }
    @media print { body { padding: 24px; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>ProfitPilot Executive Report</h1>
    <p>Generated on ${date}</p>
  </div>

  <h2 class="section-title">Key Financial Metrics</h2>
  <div class="metrics-grid">
    <div class="metric-card">
      <p class="metric-label">Total Revenue</p>
      <p class="metric-value">${dashboardData.cards.revenue.value}</p>
    </div>
    <div class="metric-card">
      <p class="metric-label">Net Profit</p>
      <p class="metric-value">${dashboardData.cards.profit.value}</p>
    </div>
    <div class="metric-card">
      <p class="metric-label">Profit Margin</p>
      <p class="metric-value">${dashboardData.cards.margin.value}</p>
    </div>
    <div class="metric-card danger">
      <p class="metric-label">Est. Profit Leakage</p>
      <p class="metric-value">${dashboardData.cards.leakage.value}</p>
    </div>
  </div>

  <h2 class="section-title">Strategic Action Points</h2>
  <ul class="action-list">
    ${recItems}
  </ul>

  <div class="footer">
    Confidential Business Document — Generated securely via ProfitPilot AI
  </div>
</body>
</html>`
}
