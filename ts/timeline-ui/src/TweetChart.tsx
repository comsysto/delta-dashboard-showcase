import React, { FC } from 'react'
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

type WithRange = {
  range: string
}

export type DataPoint = WithRange | Omit<Record<string, number>, 'range'>

export const TweetChart: FC<{ selectedTerms: string[]; colorMap: Record<string, string>; data: DataPoint[] }> = ({
  selectedTerms,
  colorMap,
  data,
}) => (
  <ResponsiveContainer width="100%" height="100%">
    <BarChart
      width={500}
      height={300}
      data={data}
      margin={{
        top: 5,
        right: 30,
        left: 20,
        bottom: 10,
      }}
    >
      <CartesianGrid strokeDasharray="1 5" />
      <XAxis dataKey="range" />
      <YAxis />
      <Tooltip />
      <Legend layout="vertical" align={'left'} verticalAlign={'middle'} />
      {selectedTerms.map((t) => (
        <Bar dataKey={t} fill={colorMap[t]} key={`bar-${t}`} />
      ))}
    </BarChart>
  </ResponsiveContainer>
)
