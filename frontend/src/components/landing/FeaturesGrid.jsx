import { motion } from 'framer-motion'
import {
  TrendingDown,
  BrainCircuit,
  BarChart3,
  FlaskConical,
  FileText,
  BookOpen,
} from 'lucide-react'

const features = [
  {
    icon: TrendingDown,
    title: 'Profit Leak Detection',
    description: 'ML-powered detection of discount leakage, late payments, customer concentration risks, and low-margin products.',
    color: 'text-rose-500',
    bg: 'bg-rose-50',
  },
  {
    icon: BrainCircuit,
    title: 'AI Business Advisor',
    description: 'Gemma reasons over your ML insights and retrieved knowledge to explain why profits are falling and what to do next.',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    icon: BarChart3,
    title: 'Business Health Dashboard',
    description: 'Real-time KPI cards and trend charts — revenue, profit, margins, health score — computed from your actual data.',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  {
    icon: FlaskConical,
    title: 'What-if Simulator',
    description: 'Test pricing changes, discount adjustments, and collection improvements. Gemma recalculates and advises on real metrics.',
    color: 'text-violet-600',
    bg: 'bg-violet-50',
  },
  {
    icon: FileText,
    title: 'AI Business Report',
    description: 'Auto-generated structured reports covering health, key findings, risks, growth opportunities, and priority actions.',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  {
    icon: BookOpen,
    title: 'Evidence-backed Advice',
    description: 'RAG retrieves real SME best-practice documents. Every recommendation cites the source, page, and why it was used.',
    color: 'text-teal-600',
    bg: 'bg-teal-50',
  },
]

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

export default function FeaturesGrid() {
  return (
    <section id="features" className="relative px-6 py-28">
      <div className="mx-auto max-w-6xl">
        {/* Section heading */}
        <div className="mb-16 text-center">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block rounded-full bg-slate-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500"
          >
            Features
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
          >
            Everything you need to understand your business
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="mx-auto mt-4 max-w-2xl text-base text-slate-500"
          >
            Real ML analysis. Real document retrieval. Real reasoning from Gemma.
            No fake features, no hardcoded responses.
          </motion.p>
        </div>

        {/* Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                variants={cardVariants}
                className="group rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all duration-300 hover:border-slate-200 hover:shadow-md"
              >
                <div
                  className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl ${feature.bg} ${feature.color} transition-transform group-hover:scale-110`}
                >
                  <Icon size={22} strokeWidth={1.75} />
                </div>
                <h3 className="text-base font-semibold text-slate-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  {feature.description}
                </p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
