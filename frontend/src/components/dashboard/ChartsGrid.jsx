import TrendChart from './TrendChart.jsx'

export default function ChartsGrid({ chartData }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <TrendChart
        title="Revenue Trend"
        data={chartData?.revenueTrend ?? []}
        dataKey="revenue"
        color="#3B82F6"
        type="area"
      />
      <TrendChart
        title="Profit Trend"
        data={chartData?.profitTrend ?? []}
        dataKey="profit"
        color="#10B981"
        type="area"
      />
      <TrendChart
        title="Margin Trend"
        data={chartData?.marginTrend ?? []}
        dataKey="margin"
        color="#8B5CF6"
        type="line"
      />
      <TrendChart
        title="Top Products"
        data={chartData?.topProducts ?? []}
        dataKey="revenue"
        color="#F59E0B"
        type="bar"
      />
    </div>
  )
}
