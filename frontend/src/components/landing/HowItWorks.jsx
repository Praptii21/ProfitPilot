import { motion } from 'framer-motion'
import { Upload, Cpu, BrainCircuit, Rocket } from 'lucide-react'

const steps = [
  {
    icon: Upload,
    title: 'Upload Business Data',
    description: 'Upload your CSV or Excel file — invoices, sales ledger, or transaction history.',
    color: 'bg-blue-600',
  },
  {
    icon: Cpu,
    title: 'ML Analysis',
    description: 'Our ML engine computes revenue, profit margins, health scores, late payments, and profit leaks.',
    color: 'bg-violet-600',
  },
  {
    icon: BrainCircuit,
    title: 'Gemma + RAG Reasoning',
    description: 'Gemma reasons over ML output and retrieved SME best-practice documents to generate grounded insights.',
    color: 'bg-emerald-600',
  },
  {
    icon: Rocket,
    title: 'Actionable Recommendations',
    description: 'Get prioritized, evidence-backed recommendations with confidence scores and estimated recovery amounts.',
    color: 'bg-amber-600',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative bg-slate-50/50 px-6 py-28">
      <div className="mx-auto max-w-4xl">
        {/* Section heading */}
        <div className="mb-16 text-center">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block rounded-full bg-slate-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500"
          >
            How It Works
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
          >
            From raw data to actionable decisions
          </motion.h2>
        </div>

        {/* Steps */}
        <div className="relative">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isLast = index === steps.length - 1
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.12 }}
                className="relative flex gap-6 pb-12 last:pb-0"
              >
                {/* Vertical line + circle */}
                <div className="flex flex-col items-center">
                  <div
                    className={`relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${step.color} text-white shadow-lg`}
                  >
                    <Icon size={22} strokeWidth={1.75} />
                  </div>
                  {!isLast && (
                    <div className="mt-2 w-px flex-1 bg-gradient-to-b from-slate-300 to-slate-200" />
                  )}
                </div>

                {/* Content */}
                <div className="pt-2 pb-2">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-400">
                      STEP {index + 1}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-500">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
