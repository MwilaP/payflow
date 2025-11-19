"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const data = [
  { name: "Jan", total: 175000 },
  { name: "Feb", total: 190000 },
  { name: "Mar", total: 245678 },
  { name: "Apr", total: 250000 },
  { name: "May", total: 260000 },
  { name: "Jun", total: 265000 },
  { name: "Jul", total: 270000 },
  { name: "Aug", total: 275000 },
  { name: "Sep", total: 280000 },
  { name: "Oct", total: 285000 },
  { name: "Nov", total: 290000 },
  { name: "Dec", total: 300000 },
]

export function DashboardChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value.toLocaleString()}`}
        />
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <Tooltip
          formatter={(value: number) => [`$${value.toLocaleString()}`, "Total"]}
          cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
        />
        <Bar dataKey="total" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
