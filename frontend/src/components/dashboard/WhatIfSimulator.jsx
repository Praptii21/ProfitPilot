import { useState } from 'react'
import { FlaskConical, Play, CheckCircle2, XCircle, ArrowRight, TrendingUp } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function WhatIfSimulator({ onSimulate }) {
  const [priceChange, setPriceChange] = useState(0)
  const [discountChange, setDiscountChange] = useState(0)
  const [collectionDays, setCollectionDays] = useState(0)
  
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSimulate() {
    setLoading(true)
    setResult(null) // clear old result
    try {
      const res = await onSimulate?.({
        priceChange,
        discountChange,
        collectionDays,
      })
      setResult(res)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col h-full">
      <div className="p-5 border-b border-slate-100 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          <FlaskConical size={20} />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-800">What-If Simulator</h3>
          <p className="text-xs text-slate-500">Test strategies before implementing them.</p>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        {/* Business Levers */}
        <div className="space-y-5 mb-6">
          <SliderInput
            label="Increase Product A Price"
            value={priceChange}
            onChange={setPriceChange}
            min={0}
            max={20}
            suffix="%"
            color="indigo"
          />
          <SliderInput
            label="Reduce Discount on Product B"
            value={discountChange}
            onChange={setDiscountChange}
            min={0}
            max={15}
            suffix="%"
            color="emerald"
          />
          <SliderInput
            label="Improve Payment Collection"
            value={collectionDays}
            onChange={setCollectionDays}
            min={0}
            max={30}
            suffix=" Days Faster"
            color="blue"
          />
        </div>

        {/* Run button */}
        <button
          onClick={handleSimulate}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-slate-800 disabled:opacity-80"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
              Gemma is re-evaluating your business strategy...
            </span>
          ) : (
            <>
              <Play size={16} fill="currentColor" />
              Run AI Simulation
            </>
          )}
        </button>

        {/* Loading skeleton for impact */}
        {loading && (
          <div className="mt-6 flex-1 flex flex-col gap-4 animate-pulse">
            <div className="h-24 bg-slate-100 rounded-xl w-full"></div>
            <div className="h-40 bg-slate-100 rounded-xl w-full"></div>
          </div>
        )}

        {/* Results Area */}
        {!loading && result && (
          <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Current vs Projected */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-center">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Current Profit</p>
                <p className="mt-1 text-xl font-bold text-slate-700">{result.impact.currentProfit}</p>
              </div>
              <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 text-center">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-indigo-500">Projected Profit</p>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <p className="text-xl font-bold text-indigo-700">{result.impact.projectedProfit}</p>
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${result.impact.difference.startsWith('+') ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    {result.impact.difference}
                  </span>
                </div>
              </div>
            </div>

            {/* Simulation Graph */}
            <div className="h-48 w-full mt-4 rounded-xl border border-slate-100 p-3">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Projected Trajectory</h4>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={result.graph} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(val) => [`₹${val.toFixed(2)}L`]}
                  />
                  <Line type="monotone" dataKey="current" name="Current" stroke="#94a3b8" strokeWidth={2} dot={false} strokeDasharray="4 4" />
                  <Line type="monotone" dataKey="projected" name="Projected" stroke="#10b981" strokeWidth={3} dot={{r:3}} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* AI Verdict Card */}
            <div className={`rounded-xl p-4 border ${result.verdict.color === 'green' ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
              <div className="flex items-center gap-2 mb-2">
                {result.verdict.color === 'green' ? (
                  <CheckCircle2 className="text-emerald-600" size={18} />
                ) : (
                  <XCircle className="text-red-600" size={18} />
                )}
                <h4 className={`text-sm font-bold ${result.verdict.color === 'green' ? 'text-emerald-800' : 'text-red-800'}`}>
                  AI Verdict: {result.verdict.status}
                </h4>
              </div>
              <p className={`text-xs ${result.verdict.color === 'green' ? 'text-emerald-700' : 'text-red-700'}`}>
                {result.verdict.reason}
              </p>
            </div>

            {/* Decision Summary */}
            <div className="grid grid-cols-3 divide-x divide-slate-100 rounded-xl border border-slate-100 bg-white py-3 text-center">
              <div>
                <p className="text-[10px] text-slate-400 font-medium">Margin</p>
                <p className="text-xs font-bold text-slate-700 mt-0.5">{result.impact.projectedMargin}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-medium">Risk</p>
                <p className="text-xs font-bold text-slate-700 mt-0.5">{result.impact.risk}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-medium">Reward</p>
                <p className="text-xs font-bold text-slate-700 mt-0.5">{result.impact.reward}</p>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  )
}

function SliderInput({ label, value, onChange, min, max, suffix, color }) {
  const colorMap = {
    indigo: 'accent-indigo-600',
    emerald: 'accent-emerald-600',
    blue: 'accent-blue-600',
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-700">{label}</label>
        <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-800">
          {value > 0 && !label.includes('Reduce') && !label.includes('Faster') ? '+' : ''}{value}{suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`mt-3 w-full h-2 rounded-full bg-slate-100 appearance-none cursor-pointer ${colorMap[color]}`}
      />
    </div>
  )
}
