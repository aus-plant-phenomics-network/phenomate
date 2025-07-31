import { Link, useNavigate } from '@tanstack/react-router'

import type { ColumnDef, Row } from '@tanstack/react-table'
import type { components } from '@/lib/api/v1'

import {
  DataTableColumnHeader,
  SelectPageRowsCheckBox,
  SelectRowCheckBox,
} from '@/components/Table'
import { ActionDropdownMenu } from '@/components/ActionDropdownMenu'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { $api } from '@/lib/api'
import { DeleteDialog } from '@/components/DeleteDialog'
import { formatDT } from '@/lib/utils'

function DeleteActivityDialog({
  row,
}: {
  row: Row<components['schemas']['ActivitySchema']>
}) {
  const navigate = useNavigate()
  const mutation = $api.useMutation(
    'delete',
    '/api/activity/activity/{activity_id}',
    {
      onSuccess: () => navigate({ to: '/project', reloadDocument: true }),
    },
  )
  const confirmHandler = () => {
    mutation.mutate({
      params: { path: { activity_id: row.original.id } },
    })
  }
  return (
    <DeleteDialog
      contentTitle="Delete Confirmation?"
      contentDescription="This action cannot be undone. This will permanently delete the
            activity and remove all data on the computer."
      confirmHandler={confirmHandler}
      asChild
    >
      <DropdownMenuItem onSelect={e => e.preventDefault()}>
        Delete Activity
      </DropdownMenuItem>
    </DeleteDialog>
  )
}

function ActivityAction(
  props: Omit<React.ComponentProps<'button'>, 'children'> & {
    row: Row<components['schemas']['ActivitySchema']>
  },
) {
  const { row, ...rest } = props
  return (
    <ActionDropdownMenu {...rest}>
      <DropdownMenuItem>
        <Link
          className="w-full"
          to="/activity/$activityId"
          params={{ activityId: row.original.id.toString() }}
        >
          Details
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem>
        <Link
          className="w-full"
          to="/activity/$activityId"
          params={{ activityId: row.original.id.toString() }}
        >
          Rerun Activity
        </Link>
      </DropdownMenuItem>
      <DeleteActivityDialog row={row} />
    </ActionDropdownMenu>
  )
}

export function makeActivityColumns(
  timezone: string,
): Array<ColumnDef<components['schemas']['ActivitySchema']>> {
  return [
    {
      id: 'select',
      header: ({ table }) => <SelectPageRowsCheckBox table={table} />,
      cell: ({ row }) => <SelectRowCheckBox row={row} />,
      enableSorting: false,
      enableHiding: false,
    },
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
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader title="Status" column={column} />
      ),
    },
    {
      accessorKey: 'created',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created" />
      ),
      cell: ({ cell }) => {
        const value = cell.getValue()
        return formatDT(timezone, value as string)
      },
      enableColumnFilter: false,
    },
    {
      accessorKey: 'updated',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Last Updated" />
      ),
      cell: ({ cell }) => {
        const value = cell.getValue()
        return formatDT(timezone, value as string)
      },
      enableColumnFilter: false,
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
  ]
}
