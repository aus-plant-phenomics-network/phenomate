import { Link, useNavigate } from '@tanstack/react-router'
import { MoreHorizontal } from 'lucide-react'
import type { ColumnDef, Row } from '@tanstack/react-table'
import type { components } from '@/lib/api/v1'
import type { AlertDialogTriggerProps } from '@radix-ui/react-alert-dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

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
import { $api } from '@/lib/api'
import { Checkbox } from '@/components/ui/checkbox'

function DropdownMenuDialog(
  props: AlertDialogTriggerProps & {
    row: Row<components['schemas']['ProjectGetSchema']>
  },
) {
  const { onSelect, row } = props
  const navigate = useNavigate()
  const mutation = $api.useMutation('delete', '/api/project/{project_id}', {
    onSuccess: () => navigate({ to: '/project', reloadDocument: true }),
  })

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <DropdownMenuItem
          onSelect={e => {
            e.preventDefault()
            onSelect && onSelect(e as any)
          }}
        >
          Delete Project
        </DropdownMenuItem>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Confirmation?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            project and remove all data on the computer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              variant="destructive"
              onClick={() => {
                mutation.mutate({
                  params: { path: { project_id: row.original.id } },
                })
              }}
            >
              Continue
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function ProjectAction(
  props: Omit<React.ComponentProps<'button'>, 'children'> & {
    row: Row<components['schemas']['ProjectGetSchema']>
  },
) {
  const { row, className, ...rest } = props
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
        <DropdownMenuDialog row={row} />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export const projectColumns: Array<
  ColumnDef<components['schemas']['ProjectGetSchema']>
> = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={value => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: 'action',
    cell: ({ row }) => <ProjectAction row={row} />,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
  },
  {
    accessorKey: 'updated',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last Updated" />
    ),
  },
  {
    accessorKey: 'is_valid',
    cell: ({ cell }) => (cell.getValue() as boolean).toString(),
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Valid" />
    ),
    meta: {
      filterVariant: 'boolean',
    },
  },
  {
    accessorKey: 'location',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Location" />
    ),
  },
  {
    accessorKey: 'year',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Year" />
    ),
    meta: {
      filterVariant: 'range',
    },
  },
  {
    accessorKey: 'internal',
    cell: ({ cell }) => (cell.getValue() as boolean).toString(),
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Internal" />
    ),
    meta: {
      filterVariant: 'boolean',
    },
  },
  {
    accessorKey: 'researcherName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Researcher" />
    ),
  },
  {
    accessorKey: 'organisationName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Organisation" />
    ),
  },
]
