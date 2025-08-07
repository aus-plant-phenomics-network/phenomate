import { Clock } from 'lucide-react'
import { memo } from 'react'
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

const TZTrigger = memo(({ timezone }: { timezone: string }) => {
  return (
    <TooltipInfo contentText="Select timezone format">
      <SelectTrigger asChild>
        <Button variant="outline">
          <Clock />
          {timezone}
        </Button>
      </SelectTrigger>
    </TooltipInfo>
  )
})

const TZContents = memo(() => {
  return (
    <SelectContent align="end">
      <SelectItem value="UTC">UTC</SelectItem>
      {timezones.map(item => (
        <SelectItem value={item} key={item}>
          {item}
        </SelectItem>
      ))}
    </SelectContent>
  )
})

export function TZSelect() {
  const { timezone, setTimezone } = usePhenomate()

  return (
    <Select value={timezone} onValueChange={setTimezone}>
      <TZTrigger timezone={timezone} />
      <TZContents />
    </Select>
  )
}
