'use client'

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

interface SkillRadarProps {
  metrics: {
    totalSolved: number
    maxRating: number
    consistencyBonus: number
    platforms: number
  }
}

export default function SkillRadar({ metrics }: SkillRadarProps) {
  // Normalize metrics to 0-100 for the radar chart
  const data = [
    { name: 'Breadth', value: Math.min(100, (metrics.platforms / 4) * 100) },
    { name: 'Volume', value: Math.min(100, (metrics.totalSolved / 1000) * 100) },
    { name: 'Elite Status', value: Math.min(100, (metrics.maxRating / 3000) * 100) },
    { name: 'Consistency', value: Math.min(100, (metrics.consistencyBonus / 500) * 100) },
    { name: 'Mastery', value: Math.min(100, (metrics.totalSolved / 200 + metrics.maxRating / 1000) * 50) },
  ]

  return (
    <div style={{ width: '100%', height: 350, position: 'relative' }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="rgba(212, 175, 55, 0.2)" />
          <PolarAngleAxis
            dataKey="name"
            tick={{ fill: 'var(--haomun-mist)', fontSize: 12, fontWeight: 500 }}
          />
          <Radar
            name="Skill DNA"
            dataKey="value"
            stroke="var(--haomun-gold)"
            fill="var(--haomun-gold)"
            fillOpacity={0.4}
            strokeWidth={3}
            animationDuration={1500}
          />
          <Tooltip 
            contentStyle={{ 
              background: 'rgba(10, 10, 10, 0.9)', 
              border: '1px solid var(--haomun-gold)',
              borderRadius: '8px',
              color: 'var(--haomun-gold)'
            }} 
            itemStyle={{ color: 'var(--haomun-gold)' }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
