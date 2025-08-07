import { MoreHorizontal } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { Button } from './ui/button'
import { cn } from '@/lib/utils'

export function ActionDropdownMenu(props: React.ComponentProps<'button'>) {
  const { children, className, ...rest } = props
  return (
    <DropdownMenu dir="ltr">
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn('h-8 w-8 p-0', className)}
          {...rest}
        >
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
