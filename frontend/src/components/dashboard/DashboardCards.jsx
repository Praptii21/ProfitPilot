import StatCard from './StatCard.jsx'
import {
  DollarSign,
  TrendingUp,
  Percent,
  Activity,
  TrendingDown,
  LineChart as LineChartIcon
} from 'lucide-react'

export default function DashboardCards({ data }) {
  if (!data) return null;

  const cards = [
    {
      title: data.revenue?.title ?? 'Total Revenue',
      value: data.revenue?.value ?? '—',
      change: data.revenue?.change ?? '',
      changeType: data.revenue?.changeType ?? 'positive',
      icon: DollarSign,
    },
    {
      title: data.profit?.title ?? 'Net Profit',
      value: data.profit?.value ?? '—',
      change: data.profit?.change ?? '',
      changeType: data.profit?.changeType ?? 'positive',
      icon: TrendingUp,
    },
    {
      title: data.margin?.title ?? 'Profit Margin',
      value: data.margin?.value ?? '—',
      change: data.margin?.change ?? '',
      changeType: data.margin?.changeType ?? 'positive',
      icon: Percent,
    },
    {
      title: data.leakage?.title ?? 'Est. Profit Leakage',
      value: data.leakage?.value ?? '—',
      change: data.leakage?.change ?? '',
      changeType: data.leakage?.changeType ?? 'negative',
      icon: TrendingDown,
    },
    {
      title: data.forecast?.title ?? '3-Month Forecast',
      value: data.forecast?.value ?? '—',
      change: data.forecast?.change ?? '',
      changeType: data.forecast?.changeType ?? 'neutral',
      icon: LineChartIcon,
    },
  ]

  return (
    <div className="rounded-2xl bg-slate-900 p-5"
      style={{
        background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(59,130,246,0.12) 0%, #0f172a 70%)',
      }}
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-300">Business Snapshot</h2>
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
