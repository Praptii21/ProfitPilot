import { useEffect, useRef } from 'react'
import { Sparkles } from 'lucide-react'
import MessageBubble from './MessageBubble.jsx'
import Composer from './Composer.jsx'

export default function ChatPanel({ messages, thinking, onSend }) {
  const listRef = useRef(null)

  useEffect(() => {
    const el = listRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, thinking])

  return (
    <section className="flex h-full min-h-0 flex-col border-r border-neutral-200 bg-neutral-50/60">
      {/* Header */}
      <div className="flex shrink-0 items-center gap-3 border-b border-neutral-200 bg-white px-4 py-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-700 text-white">
          <Sparkles size={16} strokeWidth={1.75} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium text-neutral-900">ProfitPilot advisor</div>
          <div className="truncate text-xs text-neutral-500">Reviewed June data · 3 issues found</div>
        </div>
        <span className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Live
        </span>
      </div>

      {/* Message list */}
      <div ref={listRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.map((m, i) => (
          <MessageBubble key={i} message={m} />
        ))}

        {thinking && (
          <div className="flex justify-start">
            <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-neutral-200 bg-white px-4 py-3">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400 [animation-delay:0ms]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400 [animation-delay:150ms]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400 [animation-delay:300ms]" />
            </div>
          </div>
        )}
      </div>

      <Composer onSend={onSend} disabled={thinking} />
    </section>
  )
}
