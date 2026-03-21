'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'

interface ActivityDataPoint {
  date: string
  solved: number
}

interface ActivityChartProps {
  data: ActivityDataPoint[]
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(10, 10, 10, 0.95)',
        border: '1px solid rgba(212, 175, 55, 0.3)',
        borderRadius: '8px',
        padding: '12px 16px',
        color: '#e8e8e8',
        fontSize: '0.85rem',
      }}>
        <div style={{ color: 'var(--haomun-gold)', fontWeight: 'bold', marginBottom: '4px' }}>
          {label}
        </div>
        <div>
          Problems Solved: <span style={{ color: '#4ade80', fontWeight: 'bold' }}>{payload[0].value}</span>
        </div>
      </div>
    )
  }
  return null
}

export default function ActivityChart({ data }: ActivityChartProps) {
  if (!data || data.length === 0) {
    return (
      <div style={{
        height: 250,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--haomun-mist)',
        fontStyle: 'italic',
      }}>
        No activity data available
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="solvedGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#d4af37" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#d4af37" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(212, 175, 55, 0.08)" />
        <XAxis
          dataKey="date"
          tick={{ fill: 'var(--haomun-slate)', fontSize: 11 }}
          axisLine={{ stroke: 'rgba(212, 175, 55, 0.2)' }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: 'var(--haomun-slate)', fontSize: 11 }}
          axisLine={{ stroke: 'rgba(212, 175, 55, 0.2)' }}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="solved"
          stroke="#d4af37"
          strokeWidth={2}
          fill="url(#solvedGradient)"
          animationDuration={800}
          dot={{ r: 3, fill: '#d4af37', strokeWidth: 0 }}
          activeDot={{ r: 5, fill: '#d4af37', stroke: 'rgba(212, 175, 55, 0.4)', strokeWidth: 3 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
