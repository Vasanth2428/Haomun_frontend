'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface ScoreEntry {
  score: number
  timestamp: string | Date
}

interface ScoreHistoryChartProps {
  history: ScoreEntry[]
}

export default function ScoreHistoryChart({ history }: ScoreHistoryChartProps) {
  if (!history || history.length === 0) {
    return (
      <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--haomun-mist)' }}>
        No historical records yet.
      </div>
    )
  }

  const data = history.map(h => ({
    date: new Date(h.timestamp).toLocaleDateString('default', { month: 'short', day: 'numeric' }),
    score: h.score,
  }))

  return (
    <div style={{ width: '100%', height: 250 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis 
            dataKey="date" 
            stroke="var(--haomun-slate)" 
            fontSize={12} 
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="var(--haomun-slate)" 
            fontSize={12} 
            tickLine={false}
            axisLine={false}
            domain={['auto', 'auto']}
          />
          <Tooltip 
            contentStyle={{ 
              background: 'rgba(10, 10, 10, 0.9)', 
              border: '1px solid var(--haomun-primary)',
              borderRadius: '8px',
              color: 'var(--haomun-primary)'
            }}
          />
          <Line 
            type="monotone" 
            dataKey="score" 
            stroke="var(--haomun-gold)" 
            strokeWidth={3}
            dot={{ fill: 'var(--haomun-gold)', r: 4 }}
            activeDot={{ r: 6, stroke: 'white', strokeWidth: 2 }}
            animationDuration={1500}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
