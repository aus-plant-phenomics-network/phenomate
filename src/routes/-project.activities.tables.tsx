import { Link, useNavigate } from '@tanstack/react-router'

import type { ColumnDef, Row } from '@tanstack/react-table'
import type { components } from '@/lib/api/v1'

import { DataTableColumnHeader } from '@/components/Table'
import { Checkbox } from '@/components/ui/checkbox'
import { ActionDropdownMenu } from '@/components/ActionDropdownMenu'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { $api } from '@/lib/api'
import { DeleteDialog } from '@/components/DeleteDialog'

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

export const activityColumns: Array<
  ColumnDef<components['schemas']['ActivitySchema']>
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
