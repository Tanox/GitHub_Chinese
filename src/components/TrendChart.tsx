'use client';

import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

export interface TrendRecord {
  time: string;
  total: number;
  added: number;
  removed: number;
}

interface TrendChartProps {
  data: TrendRecord[];
}

export default function TrendChart({ data }: TrendChartProps) {
  // 转换数据格式以适宜图表展示（按时间正序排列）
  const chartData = data.map((item) => ({
    timeLabel: item.time.includes('T')
      ? item.time.split('T')[0].slice(5) + ' ' + item.time.split('T')[1].slice(0, 5)
      : item.time,
    fullTime: item.time.replace('T', ' '),
    total: item.total,
    added: item.added,
    removed: item.removed,
  }));

  if (chartData.length === 0) {
    return null;
  }

  return (
    <div id='trend-chart-container' style={{ width: '100%', height: 260, marginTop: '1.25rem' }}>
      <ResponsiveContainer width='100%' height='100%'>
        <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray='3 3' stroke='#eaeef2' vertical={false} />
          <XAxis
            dataKey='timeLabel'
            tick={{ fontSize: 12, fill: '#59636e' }}
            stroke='#d1d9e0'
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#59636e' }}
            stroke='#d1d9e0'
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              borderColor: '#d1d9e0',
              borderRadius: '8px',
              fontSize: '13px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            }}
            labelStyle={{ fontWeight: 600, color: '#1c2128', marginBottom: '4px' }}
          />
          <Legend
            wrapperStyle={{ paddingTop: '10px', fontSize: '13px' }}
            iconType='circle'
          />
          <Line
            type='monotone'
            dataKey='added'
            name='新增词条'
            stroke='#2ea44f'
            strokeWidth={2.5}
            activeDot={{ r: 6, fill: '#2ea44f' }}
            dot={{ r: 4, fill: '#2ea44f' }}
          />
          <Line
            type='monotone'
            dataKey='removed'
            name='移除词条'
            stroke='#cf222e'
            strokeWidth={2.5}
            activeDot={{ r: 6, fill: '#cf222e' }}
            dot={{ r: 4, fill: '#cf222e' }}
          />
          <Line
            type='monotone'
            dataKey='total'
            name='总计数'
            stroke='#0969da'
            strokeWidth={2}
            strokeDasharray='4 4'
            activeDot={{ r: 5, fill: '#0969da' }}
            dot={{ r: 3, fill: '#0969da' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
