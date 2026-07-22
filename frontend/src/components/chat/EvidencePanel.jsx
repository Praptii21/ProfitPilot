import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'
import { useState } from 'react'

export default function EvidencePanel({ evidence }) {
  const [expanded, setExpanded] = useState(true)

  if (!evidence) return null

  const { metrics, source, confidence } = evidence

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="border-t border-slate-100"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-4 py-2.5 text-xs font-medium text-slate-500 hover:bg-slate-50 transition-colors"
      >
        <span className="flex items-center gap-1.5">
          <BookOpen size={13} />
          Evidence & Sources
          {confidence && (
            <span className="ml-2 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
              {Math.round(confidence * 100)}% confidence
            </span>
          )}
        </span>
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-3 px-4 pb-4">
              {/* Metrics */}
              {metrics && metrics.length > 0 && (
                <div>
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Supporting Metrics
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {metrics.map((m, i) => (
                      <span
                        key={i}
                        className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs"
                      >
                        <span className="text-slate-500">{m.label}: </span>
                        <span className="font-semibold text-slate-700">{m.value}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Source document */}
              {source && (
                <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-3">
                  <div className="flex items-start gap-2">
                    <ExternalLink size={12} className="mt-0.5 shrink-0 text-blue-500" />
                    <div>
                      <p className="text-xs font-semibold text-blue-700">
                        {source.title}
                        {source.page && (
                          <span className="ml-1 font-normal text-blue-500">
                            · Page {source.page}
                          </span>
                        )}
                      </p>
                      {source.snippet && (
                        <p className="mt-1 text-[11px] italic leading-relaxed text-blue-600/80">
                          "{source.snippet}"
                        </p>
                      )}
                      {source.why_used && (
                        <p className="mt-1.5 text-[11px] text-slate-500">
                          <span className="font-medium">Why used: </span>
                          {source.why_used}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
