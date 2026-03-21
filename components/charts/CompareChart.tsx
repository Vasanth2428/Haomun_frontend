'use client'

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts'

interface UserMetrics {
  username: string
  solved: number
  rating: number
  consistency: number
  contests: number
  topics: number
}

interface CompareChartProps {
  users: UserMetrics[]
}

const USER_COLORS = ['#d4af37', '#6366f1', '#22d3ee']

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
        <div style={{ fontWeight: 'bold', marginBottom: '6px', color: 'var(--haomun-gold)' }}>
          {payload[0]?.payload?.metric}
        </div>
        {payload.map((entry: any, index: number) => (
          <div key={index} style={{ color: entry.color, marginBottom: '2px' }}>
            {entry.name}: {entry.value}
          </div>
        ))}
      </div>
    )
  }
  return null
}

export default function CompareChart({ users }: CompareChartProps) {
  if (!users || users.length === 0) {
    return (
      <div style={{
        height: 300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--haomun-mist)',
        fontStyle: 'italic',
      }}>
        No comparison data available
      </div>
    )
  }

  // Normalize data to 0-100 scale for radar chart
  const metrics = ['Problems Solved', 'Rating', 'Consistency', 'Contests', 'Topic Breadth']
  const maxValues = {
    solved: Math.max(...users.map(u => u.solved), 1),
    rating: Math.max(...users.map(u => u.rating), 1),
    consistency: Math.max(...users.map(u => u.consistency), 1),
    contests: Math.max(...users.map(u => u.contests), 1),
    topics: Math.max(...users.map(u => u.topics), 1),
  }

  const data = metrics.map((metric, i) => {
    const entry: Record<string, any> = { metric }
    const fieldGetters = [
      (u: UserMetrics) => Math.round((u.solved / maxValues.solved) * 100),
      (u: UserMetrics) => Math.round((u.rating / maxValues.rating) * 100),
      (u: UserMetrics) => Math.round((u.consistency / maxValues.consistency) * 100),
      (u: UserMetrics) => Math.round((u.contests / maxValues.contests) * 100),
      (u: UserMetrics) => Math.round((u.topics / maxValues.topics) * 100),
    ]
    users.forEach((user) => {
      entry[user.username] = fieldGetters[i](user)
    })
    return entry
  })

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={data} cx="50%" cy="50%" outerRadius="75%">
        <PolarGrid stroke="rgba(212, 175, 55, 0.15)" />
        <PolarAngleAxis
          dataKey="metric"
          tick={{ fill: 'var(--haomun-mist)', fontSize: 11 }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 100]}
          tick={{ fill: 'var(--haomun-slate)', fontSize: 10 }}
          axisLine={false}
        />
        {users.map((user, index) => (
          <Radar
            key={user.username}
            name={user.username}
            dataKey={user.username}
            stroke={USER_COLORS[index % USER_COLORS.length]}
            fill={USER_COLORS[index % USER_COLORS.length]}
            fillOpacity={0.15}
            strokeWidth={2}
            animationDuration={800}
          />
        ))}
        <Tooltip content={<CustomTooltip />} />
        <Legend
          verticalAlign="bottom"
          formatter={(value: string) => (
            <span style={{ color: 'var(--haomun-mist)', fontSize: '0.8rem' }}>{value}</span>
          )}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}
