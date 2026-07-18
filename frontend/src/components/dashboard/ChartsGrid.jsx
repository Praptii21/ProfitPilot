import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Cell
} from 'recharts'

const formatCurrency = (val) => `₹${(val / 100000).toFixed(1)}L`
const formatSmallCurrency = (val) => `₹${(val / 1000).toFixed(0)}k`

const Card = ({ title, subtitle, children }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="mb-4">
      <h3 className="text-sm font-bold text-slate-800">{title}</h3>
      {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
    </div>
    <div className="h-56 w-full">
      {children}
    </div>
  </div>
)

export default function ChartsGrid({ chartData }) {
  if (!chartData) return null;

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      
      {/* 1. Revenue vs Profit */}
      <Card title="Revenue vs Profit" subtitle="Growing revenue doesn't always mean growing profit.">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData.revenueProfitTrend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v) => `₹${v}L`} />
            <Tooltip
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              itemStyle={{ fontSize: '13px', fontWeight: 500 }}
              labelStyle={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}
              formatter={(val) => [`₹${val}L`, '']}
            />
            <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#3b82f6" strokeWidth={3} dot={false} activeDot={{ r: 5 }} />
            <Line type="monotone" dataKey="profit" name="Profit" stroke="#10b981" strokeWidth={3} dot={false} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* 2. Profit Leakage Breakdown */}
      <Card title="Profit Leakage Breakdown" subtitle="Where your business is losing money every month.">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData.profitLeakageBreakdown} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
            <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={formatSmallCurrency} />
            <YAxis type="category" dataKey="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#334155', fontWeight: 500 }} width={120} />
            <Tooltip
              cursor={{ fill: '#f8fafc' }}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              formatter={(val) => [`₹${val.toLocaleString()}`, 'Leakage']}
            />
            <Bar dataKey="loss" fill="#f43f5e" radius={[0, 4, 4, 0]} barSize={16} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* 3. Product Profitability */}
      <Card title="Most Profitable Products" subtitle="Top performers by net profit contribution.">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData.productProfitability} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={formatSmallCurrency} />
            <Tooltip
              cursor={{ fill: '#f8fafc' }}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              formatter={(val, name) => [name === 'profit' ? `₹${val.toLocaleString()}` : `${val}%`, name === 'profit' ? 'Profit' : 'Margin']}
            />
            <Bar dataKey="profit" name="profit" barSize={32} radius={[4, 4, 0, 0]}>
              {chartData.productProfitability.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.margin > 20 ? '#10b981' : entry.margin > 15 ? '#f59e0b' : '#f43f5e'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* 4. Profit Forecast */}
      <Card title="Profit Forecast" subtitle="Predicted using ML Forecast.">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData.profitForecast} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v) => `₹${v}L`} domain={['dataMin - 0.2', 'dataMax + 0.2']} />
            <Tooltip
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              formatter={(val) => [`₹${val.toFixed(2)}L`, 'Profit']}
            />
            <Line type="monotone" dataKey="historical" name="Historical" stroke="#64748b" strokeWidth={3} dot={{ r: 4, fill: '#64748b', strokeWidth: 0 }} />
            <Line type="monotone" dataKey="predicted" name="Forecast" stroke="#8b5cf6" strokeWidth={3} strokeDasharray="5 5" dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 0 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </Card>

    </div>
  )
}
