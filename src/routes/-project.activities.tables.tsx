import { Link } from '@tanstack/react-router'

import { MoreHorizontal } from 'lucide-react'
import type { ColumnDef, Row } from '@tanstack/react-table'
import type { components } from '@/lib/api/v1'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { DataTableColumnHeader } from '@/components/Table'

function ActivityAction(
  props: Omit<React.ComponentProps<'button'>, 'children'> & {
    row: Row<components['schemas']['ActivitySchema']>
  },
) {
  const { row, className, ...rest } = props
  return (
    <DropdownMenu>
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
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem>
          <Link
            className="w-full"
            to="/project/$projectId/offload"
            params={{ projectId: row.original.id.toString() }}
          >
            Offload Data
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link
            className="w-full"
            to="/project/$projectId/activities"
            params={{ projectId: row.original.id.toString() }}
          >
            View Queued Tasks
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export const activityColumns: Array<
  ColumnDef<components['schemas']['ActivitySchema']>
> = [
  {
    id: 'action',
    cell: ({ row }) => <ActivityAction row={row} />,
  },
  {
    accessorKey: 'activity',
    header: ({ column }) => (
      <DataTableColumnHeader title="Activity" column={column} />
    ),
  },
  {
    accessorKey: 'filename',
    header: ({ column }) => (
      <DataTableColumnHeader title="FileName" column={column} />
    ),
  },
  {
    accessorKey: 'target',
    header: ({ column }) => (
      <DataTableColumnHeader title="Target" column={column} />
    ),
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader title="Status" column={column} />
    ),
  },
]
