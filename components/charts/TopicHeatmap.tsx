'use client'

import {
  Treemap,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

interface TopicData {
  name: string
  size: number
}

interface TopicHeatmapProps {
  data: Record<string, number>
}

const COLORS = ['#d4af37', '#6366f1', '#22d3ee', '#ec4899', '#8b5cf6', '#10b981', '#f59e0b']

const CustomizedContent = (props: any) => {
  const { x, y, width, height, index, name } = props

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: COLORS[index % COLORS.length],
          stroke: 'rgba(0,0,0,0.2)',
          strokeWidth: 2,
          fillOpacity: 0.8,
        }}
      />
      {width > 30 && height > 20 && (
        <text
          x={x + width / 2}
          y={y + height / 2}
          textAnchor="middle"
          fill="#fff"
          fontSize={Math.min(width / 6, 12)}
          fontFamily="Cinzel"
        >
          {name}
        </text>
      )}
    </g>
  )
}

export default function TopicHeatmap({ data }: TopicHeatmapProps) {
  if (!data || Object.keys(data).length === 0) {
    return (
      <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--haomun-mist)' }}>
        No topic data available.
      </div>
    )
  }

  const chartData = Object.entries(data)
    .map(([name, size]) => ({ name, size }))
    .sort((a, b) => b.size - a.size)
    .slice(0, 15) // Top 15 topics

  return (
    <div style={{ width: '100%', height: 400 }}>
      <ResponsiveContainer width="100%" height="100%">
        <Treemap
          data={chartData}
          dataKey="size"
          stroke="#000"
          fill="#8884d8"
          content={<CustomizedContent />}
        >
          <Tooltip 
            contentStyle={{ 
              background: 'rgba(10, 10, 10, 0.9)', 
              border: '1px solid var(--haomun-gold)',
              borderRadius: '8px',
              color: 'var(--haomun-mist)',
              fontSize: '0.8rem'
            }}
          />
        </Treemap>
      </ResponsiveContainer>
    </div>
  )
}
