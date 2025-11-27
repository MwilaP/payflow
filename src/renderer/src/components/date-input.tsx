import { useState, useEffect } from 'react'
import { CalendarIcon } from 'lucide-react'
import { format, parse, isValid } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface DateInputProps {
  id?: string
  value?: Date
  onChange: (date: Date | undefined) => void
  placeholder?: string
  disabled?: (date: Date) => boolean
  className?: string
}

export function DateInput({
  id,
  value,
  onChange,
  placeholder = 'DD/MM/YYYY',
  disabled,
  className
}: DateInputProps): JSX.Element {
  const [inputValue, setInputValue] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  // Update input value when the date prop changes
  useEffect(() => {
    if (value && isValid(value)) {
      setInputValue(format(value, 'dd/MM/yyyy'))
    } else {
      setInputValue('')
    }
  }, [value])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const newValue = e.target.value
    setInputValue(newValue)

    // Try to parse the input as a date
    // Support multiple formats: DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY
    const formats = ['dd/MM/yyyy', 'dd-MM-yyyy', 'dd.MM.yyyy', 'ddMMyyyy']

    for (const formatStr of formats) {
      try {
        const parsedDate = parse(newValue, formatStr, new Date())
        if (isValid(parsedDate)) {
          onChange(parsedDate)
          return
        }
      } catch {
        // Continue to next format
      }
    }

    // If no valid format matched and input is empty, clear the date
    if (newValue === '') {
      onChange(undefined)
    }
  }

  const handleCalendarSelect = (date: Date | undefined): void => {
    onChange(date)
    setIsOpen(false)
  }

  const handleInputBlur = (): void => {
    // Reformat the input to standard format if valid
    if (value && isValid(value)) {
      setInputValue(format(value, 'dd/MM/yyyy'))
    }
  }

  return (
    <div className={cn('flex gap-2', className)}>
      <Input
        id={id}
        type="text"
        placeholder={placeholder}
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        className="flex-1"
      />
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn('px-3', !value && 'text-muted-foreground')}
          >
            <CalendarIcon className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="single"
            selected={value}
            onSelect={handleCalendarSelect}
            disabled={disabled}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
