import { FileText, Download, Activity } from 'lucide-react'

export default function BusinessReport({ report }) {
  if (!report) return null

  const {
    executiveSummary,
    healthScore,
    keyFindings,
    profitLeaks,
    growthOpportunities,
    priorityActions,
  } = report

  return (
    <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <FileText size={16} />
          </div>
          <h3 className="text-sm font-semibold text-slate-800">Business Health Report</h3>
        </div>
        <button className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors">
          <Download size={13} />
          Download PDF
        </button>
      </div>

      <div className="space-y-5">
        {/* Health Score */}
        {healthScore != null && (
          <div className="flex items-center gap-4 rounded-lg bg-slate-50 p-4">
            <div className="flex flex-col items-center">
              <div className="relative flex h-16 w-16 items-center justify-center">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                  <circle
                    cx="18" cy="18" r="15" fill="none"
                    stroke={healthScore >= 70 ? '#10b981' : healthScore >= 40 ? '#f59e0b' : '#ef4444'}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={`${healthScore * 0.94} 100`}
                  />
                </svg>
                <span className="absolute text-lg font-bold text-slate-800">{healthScore}</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700">Business Health Score</p>
              <p className="text-xs text-slate-500">
                {healthScore >= 70 ? 'Good — your business is performing well' :
                 healthScore >= 40 ? 'Fair — there are areas that need attention' :
                 'Needs attention — several risks detected'}
              </p>
            </div>
          </div>
        )}

        {/* Executive Summary */}
        {executiveSummary && (
          <ReportSection title="Executive Summary" content={executiveSummary} />
        )}

        {/* Key Findings */}
        {keyFindings && keyFindings.length > 0 && (
          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Key Findings
            </h4>
            <ul className="space-y-1.5">
              {keyFindings.map((finding, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                  <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />
                  {finding}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Profit Leaks */}
        {profitLeaks && profitLeaks.length > 0 && (
          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Profit Leaks
            </h4>
            <ul className="space-y-1.5">
              {profitLeaks.map((leak, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                  <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
                  {leak}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Growth Opportunities */}
        {growthOpportunities && growthOpportunities.length > 0 && (
          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Growth Opportunities
            </h4>
            <ul className="space-y-1.5">
              {growthOpportunities.map((opp, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                  <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                  {opp}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Priority Actions */}
        {priorityActions && priorityActions.length > 0 && (
          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Priority Actions
            </h4>
            <ol className="space-y-1.5">
              {priorityActions.map((action, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                  <span className="shrink-0 flex h-4 w-4 items-center justify-center rounded-full bg-blue-100 text-[9px] font-bold text-blue-700">
                    {i + 1}
                  </span>
                  {action}
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  )
}

function ReportSection({ title, content }) {
  return (
    <div>
      <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
        {title}
      </h4>
      <p className="text-xs leading-relaxed text-slate-600">{content}</p>
    </div>
  )
}
