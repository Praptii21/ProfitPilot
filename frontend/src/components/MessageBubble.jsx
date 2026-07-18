import { FileText, Wrench, BookOpen, Sparkles, BarChart3 } from 'lucide-react'

const iconMap = {
  file: FileText,
  function: Wrench,
  book: BookOpen,
  sparkles: Sparkles,
  chart: BarChart3,
}

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user'

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-br-md bg-blue-600 px-4 py-2.5 text-[14px] leading-relaxed text-white shadow-sm">
          {message.content}
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-[92%] space-y-2">
        {/* Tool calling steps (inline) */}
        {message.steps && message.steps.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pb-1">
            {message.steps.map((step, i) => {
              const Icon = iconMap[step.icon] || Wrench
              return (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500"
                >
                  <Icon size={10} />
                  {step.text}
                </span>
              )
            })}
          </div>
        )}

        {/* Message content */}
        <div className="rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3 text-[14px] leading-relaxed whitespace-pre-wrap text-slate-700 shadow-sm">
          {message.content}
        </div>

        {/* Quick action buttons */}
        {message.actions && message.actions.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {message.actions.map((action) => (
              <button
                key={action.id}
                className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100"
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
