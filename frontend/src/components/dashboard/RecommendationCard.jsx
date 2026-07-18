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
    impact,
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
                {Math.round(confidence * 100)}% confidence
              </span>
            )}
          </div>
          <h4 className="text-sm font-semibold text-slate-800">{title}</h4>
          {impact && (
            <p className="mt-1 text-xs text-slate-500">{impact}</p>
          )}
        </div>
        {estimatedRecovery && (
          <div className="shrink-0 text-right">
            <p className="text-[10px] font-medium text-slate-400">Est. Recovery</p>
            <p className="text-sm font-bold text-emerald-600">{estimatedRecovery}</p>
          </div>
        )}
      </div>

      {/* Confidence bar */}
      {confidence && (
        <div className="mt-3">
          <div className="h-1 w-full rounded-full bg-slate-100">
            <div
              className="h-1 rounded-full bg-emerald-500 transition-all"
              style={{ width: `${Math.round(confidence * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Explain button */}
      <button
        onClick={() => onExplain?.(title)}
        className="mt-3 flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
      >
        Ask Gemma to explain
        <ChevronRight size={12} />
      </button>
    </div>
  )
}
