import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

import { DateTime } from 'luxon'
import type { ClassValue } from 'clsx'
import type { FilterFn, Row } from '@tanstack/react-table'
import type { components } from './api/v1'
import type { FileData } from '@aperturerobotics/chonky'

export function cn(...inputs: Array<ClassValue>) {
  return twMerge(clsx(inputs))
}

export interface RawNameStruct {
  date: string
  time: string
  site: string
  sensor: string
  trial: string
}

export interface ParsedNameStruct extends RawNameStruct {
  datetime: Date
}

function _parseFileName(
  name: string,
  pattern: string,
): ParsedNameStruct | null {
  const matched = name.match(pattern)
  if (!matched || !matched.groups) return null
  const group = matched.groups as any as RawNameStruct
  const { date, time } = group
  const year = parseInt(date.slice(0, 4), 10)
  const month = parseInt(date.slice(4, 6), 10) - 1 // JS months are 0-based
  const day = parseInt(date.slice(6, 8), 10)

  const hour = parseInt(time.slice(0, 2), 10)
  const minute = parseInt(time.slice(2, 4), 10)
  const second = parseInt(time.slice(4, 6), 10)

  // Construct Date object in UTC
  const utcDate = new Date(Date.UTC(year, month, day, hour, minute, second))
  return { ...group, datetime: utcDate }
}

export function parseFileName(
  name: string,
  regexMap: components['schemas']['ProjectGetSchema']['regex'],
) {
  const ext = name.split('.').pop()
  if (ext && ext in regexMap) return _parseFileName(name, regexMap[ext])
  if ('*' in regexMap) return _parseFileName(name, regexMap['*'])
  return null
}

export type ParsedFileData = Partial<ParsedNameStruct> & FileData

export function parseFileData(
  data: Array<FileData>,
  regexMap: components['schemas']['ProjectGetSchema']['regex'],
): Array<ParsedFileData> {
  return data.map(item => {
    const parsed = parseFileName(item.name, regexMap)
    if (!parsed) return item
    return { ...item, ...parsed }
  })
}

/**
 * Convert UTC time to locale time for displaying
 *
 * @param timezone - local/selected timezone
 * @param value - UTC time value
 * @param displayTime - whether to display time component
 * @returns
 */
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

/**
 * Check whether input is a valid date value
 * @param date - nullable string or date
 * @returns
 */
export function isValidDate(date: string | Date | undefined | null) {
  if (!date) {
    return false
  }
  const dt = typeof date === 'string' ? new Date(date) : date
  return !isNaN(dt.getTime())
}

export function extractISODate(
  date: Date | undefined | null,
  timezone: string,
) {
  if (!date) return null
  return DateTime.fromObject(
    {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
      hour: date.getHours(),
      minute: date.getMinutes(),
      second: date.getSeconds(),
    },
    { zone: timezone },
  ).toISO()
}

// Filter functions

const equalsBoolean: FilterFn<any> = <TData>(
  row: Row<TData>,
  columnId: string,
  filterValue: boolean | null,
) => {
  const data: boolean = row.getValue(columnId)
  return filterValue === null || data === filterValue
}

equalsBoolean.autoRemove = (val: any) => val !== 'true' && val !== 'false'
equalsBoolean.resolveFilterValue = (val: any) => {
  if (val === 'true') return true
  if (val === 'false') return false
  return ''
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

// Only inDateRange works as expected, equalsDate and equalsDateTime only work for UTC
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

function saveDirectory(whichdir: string, directory: string) {
  localStorage.setItem(whichdir, JSON.stringify(directory));
}



export { equalsDate, equalsDateTime, inDateRange, equalsBoolean, saveDirectory }
