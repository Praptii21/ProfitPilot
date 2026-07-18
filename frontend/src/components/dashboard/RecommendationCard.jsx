import { AlertTriangle, TrendingUp, ChevronRight } from 'lucide-react'

const priorityConfig = {
  high: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', badge: 'bg-red-100 text-red-700' },
  medium: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-700' },
  low: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-700' },
}

export default function RecommendationCard({ recommendation, onExplain }) {
  const {
    title,
    priority = 'medium',
    reason,
    confidence,
    estimatedRecovery,
  } = recommendation

  const config = priorityConfig[priority] || priorityConfig.medium

  return (
    <div
      className={`rounded-xl border ${config.border} bg-white p-4 shadow-sm transition-all hover:shadow-md`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-2">
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${config.badge}`}>
              {priority}
            </span>
            {confidence && (
              <span className="text-[10px] font-medium text-slate-400">
                {confidence}% confidence
              </span>
            )}
          </div>
          <h4 className="text-sm font-semibold text-slate-800">{title}</h4>
          {reason && (
            <p className="mt-1 text-xs text-slate-500">{reason}</p>
          )}
        </div>
        {estimatedRecovery && (
          <div className="shrink-0 text-right">
            <p className="text-[10px] font-medium text-slate-400">Est. Recovery</p>
            <p className="text-sm font-bold text-emerald-600">{estimatedRecovery}</p>
          </div>
        )}
      </div>

      {/* Explain button */}
      <div className="mt-4 flex items-center border-t border-slate-100 pt-3">
        <button
          onClick={() => onExplain?.(title)}
          className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
          Ask Gemma to Explain
        </button>
      </div>
    </div>
  )
}
