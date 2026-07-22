import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage.jsx'
import AppPage from './pages/AppPage.jsx'
import GoalsPage from './pages/GoalsPage.jsx'
import { greeting, getDashboardData, SEED_SUGGESTIONS } from './api/client.js'

export default function App() {
  // Lift state here so navigating to /goals doesn't destroy chat/dashboard
  const [messages, setMessages] = useState([
    { role: 'assistant', content: greeting.reply, ...greeting },
  ])
  const [thinking, setThinking] = useState(false)
  const [chatExpanded, setChatExpanded] = useState(false)
  const [dashboardData, setDashboardData] = useState(() => getDashboardData())
  const [isUploading, setIsUploading] = useState(false)

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/app"
        element={
          <AppPage
            messages={messages}
            setMessages={setMessages}
            thinking={thinking}
            setThinking={setThinking}
            chatExpanded={chatExpanded}
            setChatExpanded={setChatExpanded}
            dashboardData={dashboardData}
            setDashboardData={setDashboardData}
            isUploading={isUploading}
            setIsUploading={setIsUploading}
          />
        }
      />
      <Route path="/goals" element={<GoalsPage />} />
    </Routes>
  )
}
