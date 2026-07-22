import { useState, useEffect } from 'react'
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

  // Chat sessions state
  const [currentSessionId, setCurrentSessionId] = useState(null)
  const [sessions, setSessions] = useState(() => {
    try {
      const saved = localStorage.getItem('chat_sessions')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // Auto-save active session
  useEffect(() => {
    const hasUserMessage = messages.some(m => m.role === 'user')
    if (!hasUserMessage) return

    const firstUserMsg = messages.find(m => m.role === 'user')?.content || 'Conversation'
    const title = firstUserMsg.length > 35 ? firstUserMsg.substring(0, 35) + '...' : firstUserMsg

    if (currentSessionId) {
      setSessions(prev => {
        const updated = prev.map(s => {
          if (s.id === currentSessionId) {
            return { ...s, messages, dashboardData, title }
          }
          return s
        })
        localStorage.setItem('chat_sessions', JSON.stringify(updated))
        return updated
      })
    } else {
      const newId = Date.now().toString()
      const newSession = {
        id: newId,
        title,
        messages,
        dashboardData,
        createdAt: new Date().toISOString()
      }
      setCurrentSessionId(newId)
      setSessions(prev => {
        const updated = [newSession, ...prev]
        localStorage.setItem('chat_sessions', JSON.stringify(updated))
        return updated
      })
    }
  }, [messages, dashboardData, currentSessionId])

  const handleLoadSession = (sessionId) => {
    const session = sessions.find(s => s.id === sessionId)
    if (session) {
      setCurrentSessionId(sessionId)
      setMessages(session.messages)
      setDashboardData(session.dashboardData)
    }
  }

  const handleNewSession = () => {
    setCurrentSessionId(null)
    setMessages([
      { role: 'assistant', content: greeting.reply, ...greeting },
    ])
    setDashboardData(getDashboardData())
  }

  const handleDeleteSession = (sessionId) => {
    const updated = sessions.filter(s => s.id !== sessionId)
    setSessions(updated)
    localStorage.setItem('chat_sessions', JSON.stringify(updated))
    if (currentSessionId === sessionId) {
      setCurrentSessionId(null)
      setMessages([
        { role: 'assistant', content: greeting.reply, ...greeting },
      ])
      setDashboardData(getDashboardData())
    }
  }

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
            sessions={sessions}
            currentSessionId={currentSessionId}
            onLoadSession={handleLoadSession}
            onNewSession={handleNewSession}
            onDeleteSession={handleDeleteSession}
          />
        }
      />
      <Route path="/goals" element={<GoalsPage />} />
    </Routes>
  )
}
