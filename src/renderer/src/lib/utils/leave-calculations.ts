import { differenceInMonths } from "date-fns"

export function calculateLeaveBalance(startDate: string): number {
  const months = differenceInMonths(new Date(), new Date(startDate))
  return Math.max(0, months * 2) // 2 days per month
}

export function calculateLeaveTaken(history: Array<{days: number}>): number {
  return history.reduce((total, entry) => total + entry.days, 0)
}

export function calculateAvailableLeave(startDate: string, history: Array<{days: number}>): number {
  const earned = calculateLeaveBalance(startDate)
  const taken = calculateLeaveTaken(history)
  return earned - taken
}