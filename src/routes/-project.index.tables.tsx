import { Link, useNavigate } from '@tanstack/react-router'
import type { ColumnDef, Row } from '@tanstack/react-table'
import type { components } from '@/lib/api/v1'

import {
  DataTableColumnHeader,
  SelectPageRowsCheckBox,
  SelectRowCheckBox,
} from '@/components/Table'
import { $api } from '@/lib/api'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { DeleteDialog } from '@/components/DeleteDialog'
import { ActionDropdownMenu } from '@/components/ActionDropdownMenu'
import { equalsBoolean, formatDT, inDateRange } from '@/lib/utils'
import * as Tooltip from '@radix-ui/react-tooltip';

import { OffloadOrQueueDialog } from "@/components/OffloadOrQueueDialog";


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

/*function ProjectAction(
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
}*/

type ProjectRow = Row<components['schemas']['ProjectListSchema']>;


function ProjectAction({
  row,
  ...rest
}: Omit<React.ComponentProps<'button'>, 'children'> & { row: ProjectRow }) {
  const projectId = row.original.id.toString();

  return (
  
	<Tooltip.Provider>
	  <Tooltip.Root>
		<Tooltip.Trigger asChild>
        
		<Link
		  className="inline-block px-4 py-2 bg-green-600 text-white rounded hover:bg-blue-650 transition w-full text-center"
		  to={`/project/${projectId}/offload`}
		  {...rest}
		>
		  Select Data
		</Link>
		
		</Tooltip.Trigger>
		<Tooltip.Content side="bottom" className="bg-gray-600 text-white p-2 rounded">
		  Select Phenomate .bin data files for extraction
		</Tooltip.Content>
	  </Tooltip.Root>
	</Tooltip.Provider>

  );
}


function removeLastDirectory(path: string): string {
  const parts = path.split('/');
  parts.pop(); // remove the last part
  return parts.join('/');
}



export const makeIndexDataColumn = (
  timezone: string,
): Array<ColumnDef<components['schemas']['ProjectListSchema']>> => {
  return [
    {
      id: 'select',
      header: ({ table }) => <SelectPageRowsCheckBox table={table} />,
      cell: ({ row }) => <SelectRowCheckBox row={row} />,
      enableSorting: false,
      enableHiding: true,
    },
	{	 
	  id: 'projectId',
      header: 'pid',
      cell: ({ row, table }) => {
        /*// Get current page index and page size from table state
        const pageIndex = table.getState().pagination.pageIndex;
        const pageSize = table.getState().pagination.pageSize;
        // Calculate the row number
        return row.index + 1 + pageIndex * pageSize;*/
		return row.original.id.toString()
       },
	},
    {
      id: 'action',
	  cell: ({ row }) => <OffloadOrQueueDialog  row={row} />,  // this is our green 'Select Action' button and it's dialog box
    },
    {
      accessorKey: 'name',
      header: ({ column }) => (

        <DataTableColumnHeader column={column} title="Name" tooltip="These are the output directory names which are derived from the template.yaml file used and the data entered on project creation" />
		
      ),
    },
	{
      accessorKey: 'location',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Location" tooltip="This is the full directory path to where data will be extracted" />
      ),
	  cell: ({ cell }) => {
		 return  removeLastDirectory(cell.getValue())
	  },
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
      filterFn: inDateRange,
      meta: {
        filterVariant: 'date',
      },
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
	{
      accessorKey: 'internal',
      cell: ({ cell }) => (cell.getValue() as boolean).toString(),
      header: ({ column }) => (
        // <DataTableColumnHeader column={column} title="Internal" />
		<span title="Indicates if the project is internal to APPN">Internal</span>
      ),
	  enableColumnFilter: false,
      /*meta: {
        filterVariant: 'boolean',
      },*/
    },
	{
      accessorKey: 'is_valid',
      cell: ({ cell }) => (cell.getValue() as boolean).toString(),
	  
      header: ({ column }) => (
        // <DataTableColumnHeader column={column} title="Valid" />
		<span title="Indicates if the values are valid (ToDo: check what determines this as true)">Valid</span>
      ),
	  enableColumnFilter: false,
      /*filterFn: equalsBoolean,
      meta: {
        filterVariant: 'boolean',
      },*/
    },
  ]
}
