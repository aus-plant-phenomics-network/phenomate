import type { ColumnDef /*, Row*/ } from '@tanstack/react-table'
import type { components } from '@/lib/api/v1'

import {
  DataTableColumnHeader,
  SelectPageRowsCheckBox,
  SelectRowCheckBox,
} from '@/components/Table'

import { formatDT, inDateRange } from '@/lib/utils'
import { OffloadOrQueueDialog } from "@/components/OffloadOrQueueDialog";


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
      cell: ({ row /*, table*/ }) => {
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
		 // return  removeLastDirectory(cell.getValue())
		 const value = cell.getValue();
         return typeof value === 'string' ? removeLastDirectory(value) : '';
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
      header: ({ /*column*/}) => (
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
	  
      header: ({ /*column*/ }) => (
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
