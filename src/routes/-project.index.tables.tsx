import { Link, useNavigate } from '@tanstack/react-router'
import type { ColumnDef, Row } from '@tanstack/react-table'
import type { components } from '@/lib/api/v1'

import { DataTableColumnHeader } from '@/components/Table'
import { $api } from '@/lib/api'
import { Checkbox } from '@/components/ui/checkbox'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { DeleteDialog } from '@/components/DeleteDialog'
import { ActionDropdownMenu } from '@/components/ActionDropdownMenu'
import { formatDT } from '@/lib/utils'

function DeleteProjectDialog({
  row,
}: {
  row: Row<components['schemas']['ProjectListSchema']>
}) {
  const navigate = useNavigate()
  const mutation = $api.useMutation('delete', '/api/project/{project_id}', {
    onSuccess: () => navigate({ to: '/project', reloadDocument: true }),
  })
  const confirmHandler = () => {
    mutation.mutate({
      params: { path: { project_id: row.original.id } },
    })
  }
  return (
    <DeleteDialog
      contentTitle="Delete Confirmation?"
      contentDescription="This action cannot be undone. This will permanently delete the
            project and remove all data on the computer."
      confirmHandler={confirmHandler}
      asChild
    >
      <DropdownMenuItem onSelect={e => e.preventDefault()}>
        Delete Project
      </DropdownMenuItem>
    </DeleteDialog>
  )
}

function ProjectAction(
  props: Omit<React.ComponentProps<'button'>, 'children'> & {
    row: Row<components['schemas']['ProjectListSchema']>
  },
) {
  const { row, ...rest } = props
  return (
    <ActionDropdownMenu {...rest}>
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
      <DeleteProjectDialog row={row} />
    </ActionDropdownMenu>
  )
}

export const makeIndexDataColumn = (
  timezone: string,
): Array<ColumnDef<components['schemas']['ProjectListSchema']>> => {
  return [
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
      cell: ({ cell }) => {
        const value = cell.getValue()
        return formatDT(timezone, value as string)
      },
      enableColumnFilter: false,
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
}
