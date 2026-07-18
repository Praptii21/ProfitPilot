import { motion } from 'framer-motion'

export default function SuggestedQuestions({ suggestions, onSelect }) {
  if (!suggestions || suggestions.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2 px-4 py-3">
      {suggestions.map((text, i) => (
        <motion.button
          key={i}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.04 }}
          onClick={() => onSelect(text)}
          className="rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-medium text-slate-600 transition-all hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
        >
          {text}
        </motion.button>
      ))}
    </div>
  )
}
