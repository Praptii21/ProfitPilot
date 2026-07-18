import { useState } from 'react'
import TopBar from './components/TopBar.jsx'
import ChatPanel from './components/ChatPanel.jsx'
import { sendMessage, greeting } from './api/client.js'

export default function App() {
  // Conversation history — this array IS our memory; it is sent with every call.
  const [messages, setMessages] = useState([
    { role: 'assistant', content: greeting.reply, ...greeting },
  ])
  const [thinking, setThinking] = useState(false)

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

  // TODO: backend — POST /ingest (image → extraction flow lands in phase 4)
  function handleUpload(file) {
    console.log('upload:', file.name)
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-white text-neutral-900">
      <TopBar onUpload={handleUpload} />

      <div className="flex min-h-0 flex-1">
        {/* LEFT — chat, always visible */}
        <div className="min-h-0 w-[58%]">
          <ChatPanel messages={messages} thinking={thinking} onSend={handleSend} />
        </div>

        {/* RIGHT — scrolling rail (phase 5) */}
        <div className="min-h-0 w-[42%] overflow-y-auto bg-white">
          <div className="flex h-40 items-center justify-center text-sm text-neutral-300">
            Metrics rail
          </div>
        </div>
      </div>
    </div>
  )
}
