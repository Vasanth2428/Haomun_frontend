'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface DifficultyChartProps {
  easy: number
  medium: number
  hard: number
}

const COLORS = ['#4ade80', '#facc15', '#f87171']

const CustomTooltip = ({ active, payload }: any) => {
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
        <span style={{ color: payload[0].payload.fill, fontWeight: 'bold' }}>
          {payload[0].name}
        </span>
        : {payload[0].value} problems
      </div>
    )
  }
  return null
}

export default function DifficultyChart({ easy, medium, hard }: DifficultyChartProps) {
  const data = [
    { name: 'Easy', value: easy },
    { name: 'Medium', value: medium },
    { name: 'Hard', value: hard },
  ]

  const total = easy + medium + hard

  if (total === 0) {
    return (
      <div style={{
        height: 240,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--haomun-mist)',
        fontStyle: 'italic',
      }}>
        No difficulty data available
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={3}
          dataKey="value"
          stroke="none"
          animationBegin={0}
          animationDuration={800}
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          verticalAlign="bottom"
          height={36}
          formatter={(value: string) => (
            <span style={{ color: 'var(--haomun-mist)', fontSize: '0.8rem' }}>{value}</span>
          )}
        />
        {/* Center label */}
        <text
          x="50%"
          y="48%"
          textAnchor="middle"
          dominantBaseline="central"
          style={{ fontSize: '1.8rem', fontWeight: 'bold', fill: 'var(--haomun-gold)' }}
        >
          {total}
        </text>
        <text
          x="50%"
          y="58%"
          textAnchor="middle"
          dominantBaseline="central"
          style={{ fontSize: '0.65rem', fill: 'var(--haomun-mist)', textTransform: 'uppercase', letterSpacing: '2px' }}
        >
          SOLVED
        </text>
      </PieChart>
    </ResponsiveContainer>
  )
}
