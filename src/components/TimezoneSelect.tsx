import { Clock } from 'lucide-react'
import { Button } from './ui/button'
import { TooltipInfo } from './TooltipInfo'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select'
import { usePhenomate } from '@/lib/context'

const timezones = Intl.supportedValuesOf('timeZone')

export function TZSelect() {
  const { timezone, setTimezone } = usePhenomate()
  return (
    <Select value={timezone} onValueChange={setTimezone}>
      <TooltipInfo contentText="Select timezone format">
        <SelectTrigger asChild>
          <Button variant="outline">
            <Clock />
            {timezone}
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
