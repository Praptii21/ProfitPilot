import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Maximize2, Minimize2 } from 'lucide-react'
import MessageBubble from './MessageBubble.jsx'
import Composer from './Composer.jsx'
import SuggestedQuestions from './chat/SuggestedQuestions.jsx'
import EvidencePanel from './chat/EvidencePanel.jsx'
import AIStatusPanel from './chat/AIStatusPanel.jsx'

export default function ChatPanel({ messages, thinking, onSend, expanded, onToggleExpand }) {
  const listRef = useRef(null)

  // Get latest assistant message for suggestions and evidence
  const latestAssistant = [...messages].reverse().find((m) => m.role === 'assistant')

  useEffect(() => {
    const el = listRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, thinking])

  return (
    <section className="flex h-full min-h-0 flex-col border-l border-slate-200 bg-white">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-sm">
            <Sparkles size={16} strokeWidth={1.75} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-slate-900">Gemma Business Advisor</div>
            <div className="truncate text-xs text-slate-500">
              AI-powered profit analysis
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Live
          </span>
          <button
            onClick={onToggleExpand}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
            aria-label={expanded ? 'Collapse' : 'Expand'}
          >
            {expanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      {/* Message list */}
      <div ref={listRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.map((m, i) => (
          <MessageBubble key={i} message={m} />
        ))}

        {thinking && (
          <div className="flex justify-start">
            <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-400 [animation-delay:0ms]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-400 [animation-delay:150ms]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-400 [animation-delay:300ms]" />
            </div>
          </div>
        )}
      </div>

      {/* AI Status Panel */}
      <AIStatusPanel steps={latestAssistant?.steps} isThinking={thinking} />

      {/* Evidence Panel */}
      {latestAssistant?.evidence && (
        <EvidencePanel evidence={latestAssistant.evidence} />
      )}

      {/* Suggested Questions */}
      {latestAssistant?.suggestions && (
        <SuggestedQuestions
          suggestions={latestAssistant.suggestions}
          onSelect={(text) => onSend(text)}
        />
      )}

      {/* Composer */}
      <Composer onSend={onSend} disabled={thinking} />
    </section>
  )
}
