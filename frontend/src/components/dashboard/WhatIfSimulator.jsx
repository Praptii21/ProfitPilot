import { useState } from 'react'
import { FlaskConical, Play, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react'

export default function WhatIfSimulator({ onSimulate }) {
  const [priceChange, setPriceChange] = useState(0)
  const [discountChange, setDiscountChange] = useState(0)
  const [collectionReduction, setCollectionReduction] = useState(0)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSimulate() {
    setLoading(true)
    try {
      const res = await onSimulate?.({
        priceChange,
        discountChange,
        collectionReduction,
      })
      setResult(res)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
          <FlaskConical size={16} />
        </div>
        <h3 className="text-sm font-semibold text-slate-800">What-if Simulator</h3>
      </div>

      {/* Sliders */}
      <div className="space-y-4">
        <SliderInput
          label="Price Adjustment"
          value={priceChange}
          onChange={setPriceChange}
          min={-20}
          max={30}
          suffix="%"
          color="blue"
        />
        <SliderInput
          label="Discount Change"
          value={discountChange}
          onChange={setDiscountChange}
          min={-30}
          max={10}
          suffix="% pts"
          color="amber"
        />
        <SliderInput
          label="Collection Improvement"
          value={collectionReduction}
          onChange={setCollectionReduction}
          min={0}
          max={30}
          suffix=" days"
          color="emerald"
        />
      </div>

      {/* Run button */}
      <button
        onClick={handleSimulate}
        disabled={loading}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-violet-600/20 transition-all hover:bg-violet-700 disabled:opacity-50"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Running...
          </span>
        ) : (
          <>
            <Play size={14} />
            Run Simulation
          </>
        )}
      </button>

      {/* Results */}
      {result && (
        <div className="mt-4 space-y-2 rounded-lg border border-slate-100 bg-slate-50 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Projected Impact
          </p>
          <div className="grid grid-cols-3 gap-2">
            <ImpactMetric
              label="Revenue"
              value={result.impact?.revenue_change}
              prefix="₹"
            />
            <ImpactMetric
              label="Profit"
              value={result.impact?.profit_change}
              prefix="₹"
            />
            <ImpactMetric
              label="Margin"
              value={result.impact?.margin_change_pct}
              suffix="%"
            />
          </div>
          {result.impact?.cash_unlocked_from_ar > 0 && (
            <p className="text-xs text-emerald-600 font-medium">
              💰 Cash unlocked: ₹{result.impact.cash_unlocked_from_ar.toLocaleString()}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

function SliderInput({ label, value, onChange, min, max, suffix, color }) {
  const colorMap = {
    blue: 'accent-blue-600',
    amber: 'accent-amber-600',
    emerald: 'accent-emerald-600',
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-slate-600">{label}</label>
        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
          {value > 0 ? '+' : ''}{value}{suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`mt-1.5 w-full h-1.5 rounded-full bg-slate-200 appearance-none cursor-pointer ${colorMap[color]}`}
      />
    </div>
  )
}

function ImpactMetric({ label, value, prefix = '', suffix = '' }) {
  if (value == null) return null
  const isPositive = value > 0
  const isZero = value === 0
  const Icon = isPositive ? ArrowUpRight : isZero ? Minus : ArrowDownRight

  return (
    <div className="text-center">
      <p className="text-[10px] text-slate-400">{label}</p>
      <p className={`text-sm font-bold ${isPositive ? 'text-emerald-600' : isZero ? 'text-slate-500' : 'text-red-500'}`}>
        <Icon size={12} className="inline -mt-0.5" />
        {' '}{prefix}{Math.abs(value).toLocaleString()}{suffix}
      </p>
    </div>
  )
}
