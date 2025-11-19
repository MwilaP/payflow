"use client"

import { useState } from "react"
import { Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface EmployeeFiltersProps {
  onFilterChange: (filters: {
    department?: string
    status?: string
    search?: string
  }) => void
}

export function EmployeeFilters({ onFilterChange }: EmployeeFiltersProps) {
  const [search, setSearch] = useState("")
  const [department, setDepartment] = useState("all")
  const [status, setStatus] = useState("all")
  return (
    <div className="flex flex-col gap-4 md:flex-row">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search employees..."
          className="pl-8"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            onFilterChange({ search: e.target.value })
          }}
        />
      </div>
      <div className="grid grid-cols-2 gap-4 md:flex md:w-auto">
        <Select
          defaultValue="all"
          value={department}
          onValueChange={(value) => {
            setDepartment(value)
            onFilterChange({ department: value })
          }}
        >
          <SelectTrigger className="w-full md:w-[150px]">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            <SelectItem value="engineering">Engineering</SelectItem>
            <SelectItem value="marketing">Marketing</SelectItem>
            <SelectItem value="finance">Finance</SelectItem>
            <SelectItem value="hr">Human Resources</SelectItem>
            <SelectItem value="product">Product</SelectItem>
            <SelectItem value="design">Design</SelectItem>
            <SelectItem value="sales">Sales</SelectItem>
            <SelectItem value="support">Support</SelectItem>
          </SelectContent>
        </Select>
        <Select
          defaultValue="all"
          value={status}
          onValueChange={(value) => {
            setStatus(value)
            onFilterChange({ status: value })
          }}
        >
          <SelectTrigger className="w-full md:w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="on-leave">On Leave</SelectItem>
            <SelectItem value="terminated">Terminated</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          className="col-span-2"
          onClick={() => {
            setSearch("")
            setDepartment("all")
            setStatus("all")
            onFilterChange({ department: "all", status: "all", search: "" })
          }}
        >
          Reset Filters
        </Button>
      </div>
    </div>
  )
}
