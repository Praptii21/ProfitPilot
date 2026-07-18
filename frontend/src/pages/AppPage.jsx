import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import TopBar from '../components/TopBar.jsx'
import ChatPanel from '../components/ChatPanel.jsx'
import DashboardCards from '../components/dashboard/DashboardCards.jsx'
import ChartsGrid from '../components/dashboard/ChartsGrid.jsx'
import RecommendationCard from '../components/dashboard/RecommendationCard.jsx'
import WhatIfSimulator from '../components/dashboard/WhatIfSimulator.jsx'
import { sendMessage, greeting, getDashboardData, runSimulation } from '../api/client.js'

export default function AppPage() {
  // Chat state
  const [messages, setMessages] = useState([
    { role: 'assistant', content: greeting.reply, ...greeting },
  ])
  const [thinking, setThinking] = useState(false)
  const [chatExpanded, setChatExpanded] = useState(false)

  // Dashboard data
  const dashboardData = useMemo(() => getDashboardData(), [])

  async function handleSend(text) {
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

  function handleUpload(file) {
    console.log('upload:', file.name)
    // TODO: POST /ingest
  }

  function handleExplainRecommendation(title) {
    handleSend(`Explain this recommendation: ${title}`)
  }

  async function handleSimulate(params) {
    return runSimulation(params)
  }

  // Dynamic widths for expand/collapse
  const leftWidth = chatExpanded ? '30%' : '55%'
  const rightWidth = chatExpanded ? '70%' : '45%'

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-50 text-slate-900">
      <TopBar onUpload={handleUpload} />

      <div className="flex min-h-0 flex-1">
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
              <h2 className="mb-3 text-sm font-semibold text-slate-700">
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
            <WhatIfSimulator onSimulate={handleSimulate} />

            {/* Download Action */}
            <div className="pt-4 flex justify-center">
              <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:text-indigo-600">
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
