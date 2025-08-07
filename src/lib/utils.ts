import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

import type { ClassValue } from 'clsx'
import type { FilterFn, Row } from '@tanstack/react-table'

export function cn(...inputs: Array<ClassValue>) {
  return twMerge(clsx(inputs))
}

export function formatDT(
  timezone: string,
  value: string | Date | undefined,
  displayTime: boolean = true,
) {
  if (!value) return ''
  const formatter = displayTime
    ? new Intl.DateTimeFormat('en-AU', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      })
    : new Intl.DateTimeFormat('en-AU', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour12: true,
      })
  return formatter.format(new Date(value))
}

export function isValidDate(date: string | Date | undefined | null) {
  if (!date) {
    return false
  }
  const dt = typeof date === 'string' ? new Date(date) : date
  return !isNaN(dt.getTime())
}

const equalsDateTime: FilterFn<any> = <TData>(
  row: Row<TData>,
  columnId: string,
  filterValue: Date,
) => {
  const data: string | undefined | null = row.getValue(columnId)
  if (!isValidDate(data)) return false
  const dt = new Date(data as string)
  return (
    dt.getUTCFullYear() === filterValue.getUTCFullYear() &&
    dt.getUTCMonth() === filterValue.getUTCMonth() &&
    dt.getUTCDate() === filterValue.getUTCDate() &&
    dt.getUTCHours() == filterValue.getUTCHours() &&
    dt.getUTCMinutes() == filterValue.getUTCMinutes() &&
    dt.getUTCSeconds() == filterValue.getUTCSeconds()
  )
}

equalsDateTime.autoRemove = (val: any) => !isValidDate(val)
equalsDateTime.resolveFilterValue = (val: any) => new Date(val)

const equalsDate: FilterFn<any> = <TData>(
  row: Row<TData>,
  columnId: string,
  filterValue: Date,
) => {
  const data: string | undefined | null = row.getValue(columnId)
  if (!isValidDate(data)) return false
  const dt = new Date(data as string)
  return (
    dt.getUTCFullYear() === filterValue.getUTCFullYear() &&
    dt.getUTCMonth() === filterValue.getUTCMonth() &&
    dt.getUTCDate() === filterValue.getUTCDate()
  )
}
equalsDate.autoRemove = (val: any) => !isValidDate(val)
equalsDate.resolveFilterValue = (val: any) => new Date(val)

const inDateRange: FilterFn<any> = <TData>(
  row: Row<TData>,
  columnId: string,
  filterValue: [Date | null, Date | null],
) => {
  const [min, max] = filterValue
  if (!min && !max) return true
  let filterResult = true
  const data: string | undefined | null = row.getValue(columnId)
  if (!isValidDate(data)) return false
  const dt = new Date(data as string)
  if (min) filterResult = dt >= min
  if (max) filterResult = filterResult && dt <= max
  return filterResult
}

inDateRange.resolveFilterValue = (val: [any, any]) => {
  const [unsafeMin, unsafeMax] = val
  const parsedMin = isValidDate(unsafeMin) ? new Date(unsafeMin) : null
  const parsedMax = isValidDate(unsafeMax) ? new Date(unsafeMax) : null
  if (!parsedMin && !parsedMax) return [null, null] as const
  if (parsedMin && !parsedMax) return [parsedMin, null] as const
  if (!parsedMin && parsedMax) return [null, parsedMax] as const
  if ((parsedMin as Date) > (parsedMax as Date))
    return [parsedMax, parsedMin] as const
  return [parsedMin, parsedMax] as const
}

export { equalsDate, equalsDateTime, inDateRange }
