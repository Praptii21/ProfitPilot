import StatCard from './StatCard.jsx'
import {
  DollarSign,
  TrendingUp,
  Percent,
  Activity,
  TrendingDown,
} from 'lucide-react'

export default function DashboardCards({ data }) {
  const cards = [
    {
      title: 'Total Revenue',
      value: data?.revenue?.value ?? '—',
      change: data?.revenue?.change ?? '',
      changeType: data?.revenue?.changeType ?? 'positive',
      icon: DollarSign,
      chartData: data?.revenue?.trend ?? [],
      prefix: '₹',
    },
    {
      title: 'Total Profit',
      value: data?.profit?.value ?? '—',
      change: data?.profit?.change ?? '',
      changeType: data?.profit?.changeType ?? 'positive',
      icon: TrendingUp,
      chartData: data?.profit?.trend ?? [],
      prefix: '₹',
    },
    {
      title: 'Profit Margin',
      value: data?.margin?.value ?? '—',
      change: data?.margin?.change ?? '',
      changeType: data?.margin?.changeType ?? 'positive',
      icon: Percent,
      chartData: data?.margin?.trend ?? [],
    },
    {
      title: 'Health Score',
      value: data?.healthScore?.value ?? '—',
      change: data?.healthScore?.change ?? '',
      changeType: data?.healthScore?.changeType ?? 'positive',
      icon: Activity,
      chartData: data?.healthScore?.trend ?? [],
    },
    {
      title: 'Profit Leakage',
      value: data?.leakage?.value ?? '—',
      change: data?.leakage?.change ?? '',
      changeType: data?.leakage?.changeType ?? 'negative',
      icon: TrendingDown,
      chartData: data?.leakage?.trend ?? [],
      prefix: '₹',
    },
  ]

  return (
    <div className="rounded-2xl bg-slate-900 p-5"
      style={{
        background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(59,130,246,0.12) 0%, #0f172a 70%)',
      }}
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-300">Business Overview</h2>
        <span className="text-xs text-slate-500">Last updated just now</span>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-5">
        {cards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>
    </div>
  )
}
