import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Loader2, FileText, Wrench, BookOpen, Sparkles, BarChart3, ChevronDown, ChevronUp } from 'lucide-react'

const iconMap = {
  file: FileText,
  function: Wrench,
  book: BookOpen,
  sparkles: Sparkles,
  chart: BarChart3,
}

export default function AIStatusPanel({ steps, isThinking }) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  if ((!steps || steps.length === 0) && !isThinking) return null

  return (
    <div className="border-t border-slate-100 dark:border-slate-800/60 px-4 py-3 select-none">
      <div 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="flex items-center justify-between cursor-pointer mb-2 group/header"
      >
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 group-hover/header:text-slate-600 transition-colors">
          AI Pipeline
        </p>
        <button 
          className="text-slate-400 group-hover/header:text-slate-600 p-0.5 rounded hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          aria-label={isCollapsed ? "Expand pipeline" : "Collapse pipeline"}
        >
          {isCollapsed ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
        </button>
      </div>

      {!isCollapsed && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-1.5 overflow-hidden"
        >
          {steps?.map((step, i) => {
            const Icon = iconMap[step.icon] || Wrench
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex items-center gap-2 text-xs"
              >
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/30">
                  <Check size={11} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <Icon size={12} className="shrink-0 text-slate-400 dark:text-slate-500" />
                <span className="text-slate-500 dark:text-slate-400">{step.text}</span>
              </motion.div>
            )
          })}
          {isThinking && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-xs"
            >
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950/30">
                <Loader2 size={11} className="animate-spin text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-blue-600 dark:text-blue-400 font-medium">Processing...</span>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  )
}
