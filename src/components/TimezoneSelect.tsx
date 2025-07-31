import { Clock } from 'lucide-react'
import { Button } from './ui/button'
import { TooltipInfo } from './TooltipInfo'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select'

export const currentTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
const timezones = Intl.supportedValuesOf('timeZone')

export interface TZSelectProps {
  value: string
  onValueChange: (value: string) => void
}

export function TZSelect({ value, onValueChange }: TZSelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <TooltipInfo contentText="Select timezone format">
        <SelectTrigger asChild>
          <Button variant="outline">
            <Clock />
            {value}
          </Button>
        </SelectTrigger>
      </TooltipInfo>
      <SelectContent align="end">
        <SelectItem value="UTC">UTC</SelectItem>
        {timezones.map(item => (
          <SelectItem value={item} key={item}>
            {item}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
