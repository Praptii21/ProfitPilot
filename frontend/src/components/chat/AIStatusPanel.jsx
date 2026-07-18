import { motion } from 'framer-motion'
import { Check, Loader2, FileText, Wrench, BookOpen, Sparkles, BarChart3 } from 'lucide-react'

const iconMap = {
  file: FileText,
  function: Wrench,
  book: BookOpen,
  sparkles: Sparkles,
  chart: BarChart3,
}

export default function AIStatusPanel({ steps, isThinking }) {
  if ((!steps || steps.length === 0) && !isThinking) return null

  return (
    <div className="border-t border-slate-100 px-4 py-3">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        AI Pipeline
      </p>
      <div className="space-y-1.5">
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
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50">
                <Check size={11} className="text-emerald-600" />
              </div>
              <Icon size={12} className="shrink-0 text-slate-400" />
              <span className="text-slate-500">{step.text}</span>
            </motion.div>
          )
        })}
        {isThinking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-xs"
          >
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-50">
              <Loader2 size={11} className="animate-spin text-blue-600" />
            </div>
            <span className="text-blue-600 font-medium">Processing...</span>
          </motion.div>
        )}
      </div>
    </div>
  )
}
