import type React from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export function TooltipInfo({
  children,
  contentText,
}: {
  children: React.ReactNode
  contentText: string
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent>
        <p>{contentText}</p>
      </TooltipContent>
    </Tooltip>
  )
}
