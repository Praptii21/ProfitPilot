import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

export default function CTASection() {
  return (
    <section className="relative px-6 py-28">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl bg-slate-900 px-8 py-16 text-center sm:px-16"
      >
        {/* Background decoration */}
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(59,130,246,0.3) 0%, transparent 70%)',
          }}
        />

        <div className="relative z-10">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to find your profit leaks?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base text-slate-400">
            Upload your business data and let ProfitPilot's AI engine analyze
            your financials, identify risks, and recommend real actions.
          </p>
          <Link
            to="/app"
            className="group mt-8 inline-flex items-center gap-2 rounded-full bg-blue-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:bg-blue-500 hover:shadow-xl"
          >
            Start Analysis
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </motion.div>
    </section>
  )
}
