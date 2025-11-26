'use client'

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useState, useEffect } from 'react'
import { useDatabase } from '@/lib/db/db-context'

interface MonthlyData {
  name: string
  total: number
}

// Helper function to get empty months data
const getEmptyMonthsData = (): MonthlyData[] => {
  return [
    { name: 'Jan', total: 0 },
    { name: 'Feb', total: 0 },
    { name: 'Mar', total: 0 },
    { name: 'Apr', total: 0 },
    { name: 'May', total: 0 },
    { name: 'Jun', total: 0 },
    { name: 'Jul', total: 0 },
    { name: 'Aug', total: 0 },
    { name: 'Sep', total: 0 },
    { name: 'Oct', total: 0 },
    { name: 'Nov', total: 0 },
    { name: 'Dec', total: 0 }
  ]
}

export function DashboardChart(): JSX.Element {
  const { payrollHistoryService } = useDatabase()
  const [data, setData] = useState<MonthlyData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadPayrollData = async (): Promise<void> => {
      try {
        setIsLoading(true)

        if (!payrollHistoryService) {
          // Initialize with empty data if service not available
          setData(getEmptyMonthsData())
          return
        }

        // Get all payroll records
        const payrolls = await payrollHistoryService.getAllPayrollRecords()

        // Get current year
        const currentYear = new Date().getFullYear()

        // Initialize months data
        const monthsData = getEmptyMonthsData()

        // Aggregate payroll data by month for current year
        payrolls.forEach((payroll: { status: string; totalAmount?: number; date: string }) => {
          if (payroll.status === 'completed' && payroll.totalAmount) {
            const payrollDate = new Date(payroll.date)
            if (payrollDate.getFullYear() === currentYear) {
              const monthIndex = payrollDate.getMonth()
              monthsData[monthIndex].total += payroll.totalAmount
            }
          }
        })

        setData(monthsData)
      } catch (error) {
        console.error('Error loading payroll data for chart:', error)
        setData(getEmptyMonthsData())
      } finally {
        setIsLoading(false)
      }
    }

    loadPayrollData()
  }, [payrollHistoryService])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[350px]">
        <p className="text-muted-foreground">Loading payroll data...</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `K${value.toLocaleString()}`}
        />
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <Tooltip
          formatter={(value: number) => [`K${value.toLocaleString()}`, 'Total']}
          cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
        />
        <Bar dataKey="total" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
