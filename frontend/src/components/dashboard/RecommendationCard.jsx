import { AlertTriangle, TrendingUp, ChevronRight, Target } from 'lucide-react'

const priorityConfig = {
  high: { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-400', border: 'border-red-200 dark:border-red-900/50', badge: 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400' },
  medium: { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-900/50', badge: 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400' },
  low: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-900/50', badge: 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400' },
  goal: { bg: 'bg-indigo-50 dark:bg-indigo-900/20', text: 'text-indigo-700 dark:text-indigo-400', border: 'border-indigo-200 dark:border-indigo-900/50', badge: 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400' },
}

export default function RecommendationCard({ recommendation, onExplain }) {
  const {
    title,
    priority = 'medium',
    reason,
    confidence,
    estimatedRecovery,
    isGoal,
  } = recommendation

  const config = isGoal ? priorityConfig.goal : (priorityConfig[priority] || priorityConfig.medium)

  return (
    <div
      className={`rounded-xl border ${config.border} bg-white dark:bg-slate-900 p-4 shadow-sm transition-all hover:shadow-md relative overflow-hidden`}
    >
      {isGoal && (
        <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none opacity-5 dark:opacity-10 text-indigo-600">
          <Target size={120} className="-mt-8 -mr-8" />
        </div>
      )}
      <div className="flex items-start justify-between gap-3 relative z-10">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-2">
            <span className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${config.badge}`}>
              {isGoal && <Target size={10} strokeWidth={2.5} />}
              {isGoal ? 'Your Goal' : priority}
            </span>
            {confidence && (
              <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
                {confidence}% match
              </span>
            )}
          </div>
          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{title}</h4>
          {reason && (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{reason}</p>
          )}
        </div>
        {estimatedRecovery && (
          <div className="shrink-0 text-right">
            <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500">Target</p>
            <p className={`text-sm font-bold ${isGoal ? 'text-indigo-600 dark:text-indigo-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
              {estimatedRecovery}
            </p>
          </div>
        )}
      </div>

      {/* Explain button */}
      <div className="mt-4 flex items-center border-t border-slate-100 dark:border-slate-800 pt-3 relative z-10">
        <button
          onClick={() => onExplain?.(title)}
          className="group/btn flex items-center gap-2 rounded-full bg-indigo-50 dark:bg-indigo-950/40 px-3.5 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 transition-all duration-300 hover:bg-gradient-to-r hover:from-indigo-600 hover:to-violet-600 hover:text-white hover:shadow-md hover:shadow-indigo-300/30 dark:hover:shadow-indigo-900/30 hover:scale-[1.03] active:scale-[0.98]"
        >
          <svg className="w-3.5 h-3.5 transition-transform duration-500 group-hover/btn:rotate-[72deg]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
          Ask Gemma to Explain
          <svg className="w-3 h-3 opacity-0 -ml-1 transition-all duration-300 group-hover/btn:opacity-100 group-hover/btn:ml-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </button>
      </div>
    </div>
  )
}
