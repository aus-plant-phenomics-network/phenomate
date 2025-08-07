import { useEffect, useState } from 'react'
import { CalendarIcon } from 'lucide-react'
import { Input } from './ui/input'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Button } from './ui/button'
import { Calendar } from './ui/calendar'
import { usePhenomate } from '@/lib/context'
import { extractISODate, formatDT, isValidDate } from '@/lib/utils'

export function DatePicker({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string
  onChange: (value: string) => void
  debounce?: number
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'>) {
  const { timezone } = usePhenomate()
  const [value, setValue] = useState(initialValue)
  const [open, setOpen] = useState(false)
  const [date, setDate] = useState<Date | undefined>(
    isValidDate(initialValue) ? new Date(initialValue) : undefined,
  )
  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
  }, [value])

  return (
    <div className="flex flex-col gap-3">
      <div className="relative flex gap-2">
        <Input
          id="date"
          value={formatDT(timezone, value, false)}
          placeholder="June 01, 2025"
          className="bg-background pr-10"
          {...props}
          onChange={e => {
            if (isValidDate(e.target.value)) {
              const dt = new Date(e.target.value)
              setValue(extractISODate(dt, timezone) as string)
              setDate(dt)
            }
          }}
          onKeyDown={e => {
            if (e.key === 'ArrowDown') {
              e.preventDefault()
              setOpen(true)
            }
          }}
        />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              id="date-picker"
              variant="ghost"
              className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
            >
              <CalendarIcon className="size-3.5" />
              <span className="sr-only">Select date</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto overflow-hidden p-0"
            align="end"
            alignOffset={-8}
            sideOffset={10}
          >
            <Calendar
              mode="single"
              selected={date}
              captionLayout="dropdown"
              month={date}
              onMonthChange={setDate}
              onSelect={dt => {
                setDate(dt)
                setValue(extractISODate(dt, timezone) as string)
                setOpen(false)
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
