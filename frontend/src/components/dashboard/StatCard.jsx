import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts'

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-white/10 bg-slate-900/90 px-2.5 py-1.5 text-xs shadow-md backdrop-blur-sm">
        <span className="text-white font-medium">{payload[0].value.toLocaleString()}</span>
      </div>
    )
  }
  return null
}

export default function StatCard({ title, value, change, changeType, icon: Icon, chartData, prefix = '' }) {
  const isPositive = changeType === 'positive'
  const chartColor = isPositive ? '#4ade80' : '#f87171'

  return (
    <div className="glass-card rounded-2xl p-5 cursor-pointer">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-400">{title}</h3>
        {Icon && <Icon className="h-4 w-4 text-slate-500" />}
      </div>
      <div className="mt-3 flex items-end justify-between">
        <div className="flex flex-col">
          <p className="text-2xl font-bold tracking-tight text-white">
            {prefix}{value}
          </p>
          <p className={`mt-1 text-xs font-medium ${
            isPositive ? 'text-emerald-400' : changeType === 'negative' ? 'text-red-400' : 'text-blue-400'
          }`}>
            {change}
          </p>
        </div>
        {chartData && chartData.length > 0 && (
          <div className="h-10 w-24">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
                <Tooltip content={<CustomTooltip />} cursor={false} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={chartColor}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}
