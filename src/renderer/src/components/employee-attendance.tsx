"use client"

import { useState } from "react"
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

export function EmployeeAttendance() {
  const [date, setDate] = useState<Date>(new Date())
  const [month, setMonth] = useState<Date>(new Date())

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Monthly Attendance</CardTitle>
              <CardDescription>Attendance record for {format(month, "MMMM yyyy")}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  const newMonth = new Date(month)
                  newMonth.setMonth(newMonth.getMonth() - 1)
                  setMonth(newMonth)
                }}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="min-w-[120px]">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(month, "MMM yyyy")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={month} onSelect={(date) => date && setMonth(date)} initialFocus />
                </PopoverContent>
              </Popover>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  const newMonth = new Date(month)
                  newMonth.setMonth(newMonth.getMonth() + 1)
                  setMonth(newMonth)
                }}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="text-center text-sm font-medium">
                {day}
              </div>
            ))}
            {Array.from({ length: 35 }).map((_, i) => {
              const day = i + 1
              const isWeekend = i % 7 === 0 || i % 7 === 6
              const isPresent = !isWeekend && Math.random() > 0.2
              const isHalfDay = isPresent && Math.random() > 0.8
              const isLeave = !isPresent && !isWeekend && Math.random() > 0.5

              return (
                <div
                  key={i}
                  className={cn(
                    "flex h-12 flex-col items-center justify-center rounded-md border p-1 text-center",
                    isWeekend && "bg-muted",
                    isPresent && !isHalfDay && "border-green-500 bg-green-50",
                    isHalfDay && "border-yellow-500 bg-yellow-50",
                    isLeave && "border-red-500 bg-red-50",
                  )}
                >
                  <span className="text-sm">{day}</span>
                  {isPresent && !isHalfDay && <span className="text-[10px] text-green-600">Present</span>}
                  {isHalfDay && <span className="text-[10px] text-yellow-600">Half Day</span>}
                  {isLeave && <span className="text-[10px] text-red-600">Leave</span>}
                  {isWeekend && <span className="text-[10px] text-muted-foreground">Weekend</span>}
                </div>
              )
            })}
          </div>
          <div className="mt-4 flex items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500" />
              <span className="text-xs">Present</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-yellow-500" />
              <span className="text-xs">Half Day</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500" />
              <span className="text-xs">Leave</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-muted" />
              <span className="text-xs">Weekend/Holiday</span>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Attendance Log</CardTitle>
          <CardDescription>Daily attendance records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(date, "PPP")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={date} onSelect={(date) => date && setDate(date)} initialFocus />
              </PopoverContent>
            </Popover>
            <Button variant="outline">Add Manual Entry</Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Clock In</TableHead>
                <TableHead>Clock Out</TableHead>
                <TableHead>Total Hours</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>{format(new Date(), "MMM dd, yyyy")}</TableCell>
                <TableCell>09:00 AM</TableCell>
                <TableCell>05:30 PM</TableCell>
                <TableCell>8.5 hrs</TableCell>
                <TableCell className="text-green-600">Present</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{format(new Date(Date.now() - 86400000), "MMM dd, yyyy")}</TableCell>
                <TableCell>09:15 AM</TableCell>
                <TableCell>05:45 PM</TableCell>
                <TableCell>8.5 hrs</TableCell>
                <TableCell className="text-green-600">Present</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{format(new Date(Date.now() - 172800000), "MMM dd, yyyy")}</TableCell>
                <TableCell>09:05 AM</TableCell>
                <TableCell>05:30 PM</TableCell>
                <TableCell>8.5 hrs</TableCell>
                <TableCell className="text-green-600">Present</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{format(new Date(Date.now() - 259200000), "MMM dd, yyyy")}</TableCell>
                <TableCell>-</TableCell>
                <TableCell>-</TableCell>
                <TableCell>-</TableCell>
                <TableCell className="text-red-600">Leave</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{format(new Date(Date.now() - 345600000), "MMM dd, yyyy")}</TableCell>
                <TableCell>09:00 AM</TableCell>
                <TableCell>01:00 PM</TableCell>
                <TableCell>4 hrs</TableCell>
                <TableCell className="text-yellow-600">Half Day</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Leave Records</CardTitle>
          <CardDescription>Leave applications and history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end mb-4">
            <Button>Apply for Leave</Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Days</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Sick Leave</TableCell>
                <TableCell>{format(new Date(Date.now() - 259200000), "MMM dd, yyyy")}</TableCell>
                <TableCell>{format(new Date(Date.now() - 259200000), "MMM dd, yyyy")}</TableCell>
                <TableCell>1</TableCell>
                <TableCell>Medical appointment</TableCell>
                <TableCell className="text-green-600">Approved</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Vacation</TableCell>
                <TableCell>May 15, 2025</TableCell>
                <TableCell>May 20, 2025</TableCell>
                <TableCell>6</TableCell>
                <TableCell>Family vacation</TableCell>
                <TableCell className="text-yellow-600">Pending</TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <div className="mt-4 rounded-lg border p-4">
            <h3 className="text-sm font-medium">Leave Balance</h3>
            <div className="mt-2 grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Annual Leave</p>
                <p className="text-lg font-medium">15 days</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Sick Leave</p>
                <p className="text-lg font-medium">7 days</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Used</p>
                <p className="text-lg font-medium">1 day</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
