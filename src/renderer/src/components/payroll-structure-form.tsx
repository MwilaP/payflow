'use client'

import type React from 'react'

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Minus, Plus, Save, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { PayrollStructureSummary } from './payroll-structure-summary'
import { createPayrollStructureServiceCompat } from '@/lib/db/sqlite-payroll-service'
import { initializeSQLiteDatabase } from '@/lib/db/indexeddb-sqlite-service'
import { calculateTaxDeduction, calculateNapsaContribution } from '@/lib/utils/payroll-calculations'

interface Allowance {
  id: string
  name: string
  type: 'fixed' | 'percentage'
  value: number
}

interface Deduction {
  id: string
  name: string
  type: 'fixed' | 'percentage'
  value: number
  preTax: boolean
}

interface PayrollStructureFormProps {
  id?: string
}

export function PayrollStructureForm({ id }: PayrollStructureFormProps = {}) {
  const navigate = useNavigate()
  const { toast } = useToast()
  const isEditing = !!id
  const [isLoading, setIsLoading] = useState(false)
  const [dbInitialized, setDbInitialized] = useState(false)

  // Create SQLite service instance
  const payrollService = createPayrollStructureServiceCompat()

  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [frequency, setFrequency] = useState('monthly')
  const [basicSalary, setBasicSalary] = useState<number>(0)
  const [allowances, setAllowances] = useState<Allowance[]>([
    { id: '1', name: 'Housing', type: 'percentage', value: 20 }
  ])
  const [deductions, setDeductions] = useState<Deduction[]>([
    {
      id: '1',
      name: 'PAYE',
      type: 'fixed',
      value: 0,
      preTax: true
    },
    {
      id: '2',
      name: 'NAPSA',
      type: 'percentage',
      value: 0,
      preTax: true
    }
  ])

  // Initialize database
  useEffect(() => {
    const initDb = async () => {
      try {
        const { success } = await initializeSQLiteDatabase()
        setDbInitialized(success)
        if (!success) {
          toast({
            title: 'Database Error',
            description: 'Failed to initialize database. Some features may not work correctly.',
            variant: 'destructive'
          })
        }
      } catch (error) {
        console.error('Error initializing database:', error)
        toast({
          title: 'Database Error',
          description: 'Failed to initialize database. Some features may not work correctly.',
          variant: 'destructive'
        })
      }
    }

    initDb()
  }, [toast])

  // Update tax deduction when salary or allowances change
  useEffect(() => {
    if (basicSalary > 0) {
      // Calculate total allowances
      const totalAllowances = allowances.reduce((total, allowance) => {
        if (allowance.type === 'fixed') {
          return total + allowance.value
        }
        return total + (basicSalary * allowance.value) / 100
      }, 0)

      const grossPay = basicSalary + totalAllowances
      const tax = calculateTaxDeduction(grossPay)
      const napsa = calculateNapsaContribution(grossPay)
      const totalDeduction = tax

      setDeductions((prev) => {
        const otherDeductions = prev.filter((d) => d.id !== '2')
        return [
          {
            id: '2',
            name: 'NAPSA',
            type: 'fixed',
            value: parseFloat(napsa.toFixed(2)),
            preTax: true
          },
          ...otherDeductions
        ]
      })

      setDeductions((prev) => {
        const otherDeductions = prev.filter((d) => d.id !== '1')
        return [
          {
            id: '1',
            name: 'PAYE',
            type: 'fixed',
            value: parseFloat(totalDeduction.toFixed(2)),
            preTax: true
          },
          ...otherDeductions
        ]
      })
    }
  }, [basicSalary, allowances])

  // Load data if editing
  useEffect(() => {
    if (isEditing && dbInitialized) {
      const fetchPayrollStructure = async () => {
        try {
          setIsLoading(true)
          const structure = await payrollService.getById(id)

          if (structure) {
            setName(structure.name)
            setDescription(structure.description || '')
            setFrequency(structure.frequency)
            setBasicSalary(structure.basicSalary)
            setAllowances(structure.allowances || [])
            setDeductions(structure.deductions || [])
          } else {
            toast({
              title: 'Not Found',
              description: 'The requested payroll structure could not be found.',
              variant: 'destructive'
            })
            navigate('/payroll/structures')
          }
        } catch (error) {
          console.error('Error fetching payroll structure:', error)
          toast({
            title: 'Error',
            description: 'Failed to load payroll structure data.',
            variant: 'destructive'
          })
        } finally {
          setIsLoading(false)
        }
      }

      fetchPayrollStructure()
    }
  }, [isEditing, id, dbInitialized, toast])

  // Handlers for allowances
  const addAllowance = () => {
    const newId = (allowances.length + 1).toString()
    setAllowances([...allowances, { id: newId, name: '', type: 'fixed', value: 0 }])
  }

  const updateAllowance = (id: string, field: keyof Allowance, value: any) => {
    setAllowances(
      allowances.map((allowance) =>
        allowance.id === id ? { ...allowance, [field]: value } : allowance
      )
    )
  }

  const removeAllowance = (id: string) => {
    setAllowances(allowances.filter((allowance) => allowance.id !== id))
  }

  // Handlers for deductions
  const addDeduction = () => {
    const newId = (deductions.length + 1).toString()
    setDeductions([...deductions, { id: newId, name: '', type: 'fixed', value: 0, preTax: true }])
  }

  const updateDeduction = (id: string, field: keyof Deduction, value: any) => {
    setDeductions(
      deductions.map((deduction) =>
        deduction.id === id ? { ...deduction, [field]: value } : deduction
      )
    )
  }

  const removeDeduction = (id: string) => {
    setDeductions(deductions.filter((deduction) => deduction.id !== id))
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Structure name is required.',
        variant: 'destructive'
      })
      return
    }

    if (basicSalary <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Basic salary must be greater than zero.',
        variant: 'destructive'
      })
      return
    }

    // Validate allowances
    const invalidAllowance = allowances.find((a) => !a.name.trim() || a.value < 0)
    if (invalidAllowance) {
      toast({
        title: 'Validation Error',
        description: 'All allowances must have a name and a non-negative value.',
        variant: 'destructive'
      })
      return
    }

    // Validate deductions
    const invalidDeduction = deductions.find((d) => !d.name.trim() || d.value < 0)
    if (invalidDeduction) {
      toast({
        title: 'Validation Error',
        description: 'All deductions must have a name and a non-negative value.',
        variant: 'destructive'
      })
      return
    }

    try {
      setIsLoading(true)

      const payrollStructureData = {
        name,
        description,
        frequency,
        basicSalary,
        allowances,
        deductions
      }

      if (isEditing) {
        // Update existing structure
        await payrollService.update(id, payrollStructureData)
        toast({
          title: 'Structure updated',
          description: 'The payroll structure has been updated successfully.'
        })
      } else {
        // Create new structure
        console.log('Creating payroll structure with data:', payrollStructureData)
        console.log('Database initialized:', dbInitialized)

        if (!dbInitialized) {
          throw new Error('Database not initialized')
        }

        const result = await payrollService.create(payrollStructureData)
        console.log('Create result:', result)

        if (!result) {
          throw new Error('Failed to create payroll structure')
        }
        toast({
          title: 'Structure created',
          description: 'The payroll structure has been created successfully.'
        })
      }

      navigate('/payroll/structures')
    } catch (error) {
      console.error('Error saving payroll structure:', error)
      toast({
        title: 'Error',
        description: 'Failed to save payroll structure. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading && isEditing) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">Loading payroll structure...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div
        className="space-y-6 md:col-span-2 overflow-y-auto"
        style={{ maxHeight: 'calc(100vh - 8rem)' }}
      >
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Structure Details</CardTitle>
              <CardDescription>
                Define the basic information for this payroll structure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Structure Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Standard Staff Payroll"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the purpose of this structure"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="frequency">Pay Frequency *</Label>
                  <Select value={frequency} onValueChange={setFrequency}>
                    <SelectTrigger id="frequency">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="biweekly">Bi-weekly</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="basicSalary">Basic Salary *</Label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                      $
                    </span>
                    <Input
                      id="basicSalary"
                      type="number"
                      placeholder="0.00"
                      className="pl-8"
                      value={basicSalary || ''}
                      onChange={(e) => setBasicSalary(Number.parseFloat(e.target.value) || 0)}
                      required
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Allowances</CardTitle>
                <CardDescription>Add allowances to the payroll structure</CardDescription>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addAllowance}>
                <Plus className="mr-2 h-4 w-4" />
                Add Allowance
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {allowances.length === 0 ? (
                <div className="rounded-md border border-dashed p-8 text-center">
                  <p className="text-sm text-muted-foreground">No allowances added yet</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={addAllowance}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Allowance
                  </Button>
                </div>
              ) : (
                allowances.map((allowance) => (
                  <div
                    key={allowance.id}
                    className="grid gap-4 rounded-md border p-4 md:grid-cols-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor={`allowance-name-${allowance.id}`}>Name</Label>
                      <Input
                        id={`allowance-name-${allowance.id}`}
                        placeholder="e.g., Housing"
                        value={allowance.name}
                        onChange={(e) => updateAllowance(allowance.id, 'name', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`allowance-type-${allowance.id}`}>Type</Label>
                      <Select
                        value={allowance.type}
                        onValueChange={(value) => updateAllowance(allowance.id, 'type', value)}
                      >
                        <SelectTrigger id={`allowance-type-${allowance.id}`}>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fixed">Fixed Amount</SelectItem>
                          <SelectItem value="percentage">Percentage</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`allowance-value-${allowance.id}`}>Value</Label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                          {allowance.type === 'percentage' ? '%' : '$'}
                        </span>
                        <Input
                          id={`allowance-value-$F{allowance.id}`}
                          type="number"
                          placeholder="0"
                          className="pl-8"
                          value={allowance.value || ''}
                          onChange={(e) =>
                            updateAllowance(
                              allowance.id,
                              'value',
                              Number.parseFloat(e.target.value) || 0
                            )
                          }
                        />
                      </div>
                    </div>
                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="ml-auto"
                        onClick={() => removeAllowance(allowance.id)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                    {allowance.type === 'percentage' && basicSalary > 0 && allowance.value > 0 && (
                      <div className="col-span-full text-sm text-muted-foreground">
                        Preview: {allowance.name} = {allowance.value}% of ZMW
                        {basicSalary.toLocaleString()} = ZMW
                        {((allowance.value / 100) * basicSalary).toLocaleString()}
                      </div>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Deductions</CardTitle>
                <CardDescription>Add deductions to the payroll structure</CardDescription>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addDeduction}>
                <Plus className="mr-2 h-4 w-4" />
                Add Deduction
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {deductions.length === 0 ? (
                <div className="rounded-md border border-dashed p-8 text-center">
                  <p className="text-sm text-muted-foreground">No deductions added yet</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={addDeduction}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Deduction
                  </Button>
                </div>
              ) : (
                deductions.map((deduction) => (
                  <div
                    key={deduction.id}
                    className="grid gap-4 rounded-md border p-4 md:grid-cols-5"
                  >
                    <div className="space-y-2">
                      <Label htmlFor={`deduction-name-${deduction.id}`}>Name</Label>
                      <Input
                        id={`deduction-name-${deduction.id}`}
                        placeholder="e.g., Tax"
                        value={deduction.name}
                        onChange={(e) => updateDeduction(deduction.id, 'name', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`deduction-type-${deduction.id}`}>Type</Label>
                      <Select
                        value={deduction.type}
                        onValueChange={(value) => updateDeduction(deduction.id, 'type', value)}
                      >
                        <SelectTrigger id={`deduction-type-${deduction.id}`}>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fixed">Fixed Amount</SelectItem>
                          <SelectItem value="percentage">Percentage</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`deduction-value-${deduction.id}`}>Value</Label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                          {deduction.type === 'percentage' ? '%' : '$'}
                        </span>
                        <Input
                          id={`deduction-value-${deduction.id}`}
                          type="number"
                          placeholder="0"
                          className="pl-8"
                          value={deduction.value || ''}
                          onChange={(e) =>
                            updateDeduction(
                              deduction.id,
                              'value',
                              Number.parseFloat(e.target.value) || 0
                            )
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`deduction-preTax-${deduction.id}`}>Tax Treatment</Label>
                      <Select
                        value={deduction.preTax ? 'pre-tax' : 'post-tax'}
                        onValueChange={(value) =>
                          updateDeduction(deduction.id, 'preTax', value === 'pre-tax')
                        }
                      >
                        <SelectTrigger id={`deduction-preTax-${deduction.id}`}>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pre-tax">Pre-Tax Deduction</SelectItem>
                          <SelectItem value="post-tax">Post-Tax Deduction</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="ml-auto"
                        onClick={() => removeDeduction(deduction.id)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                    {deduction.type === 'percentage' && basicSalary > 0 && deduction.value > 0 && (
                      <div className="col-span-full text-sm text-muted-foreground">
                        Preview: {deduction.name} = {deduction.value}% of K
                        {basicSalary.toLocaleString()} = K
                        {((deduction.value / 100) * basicSalary).toLocaleString()}
                      </div>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <div className="mt-6 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => navigate('/payroll/structures')}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {isEditing ? 'Update Structure' : 'Create Structure'}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
      <div className="md:col-span-1">
        <div
          className="sticky top-6"
          style={{ maxHeight: 'calc(100vh - 8rem)', overflowY: 'auto' }}
        >
          <PayrollStructureSummary
            basicSalary={basicSalary}
            allowances={allowances}
            deductions={deductions}
            frequency={frequency}
          />
        </div>
      </div>
    </div>
  )
}
