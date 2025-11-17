import { useNavigate } from '@tanstack/react-router'

import type { ColumnDef, Row  } from '@tanstack/react-table'
import type { components } from '@/lib/api/v1'

import {
  DataTableColumnHeader,
  SelectPageRowsCheckBox,
  SelectRowCheckBox,
} from '@/components/Table'

import { formatDT, inDateRange } from '@/lib/utils'


const ActivityButton = ({ row  }: {
  row: Row<components['schemas']['ActivitySchema']>;
}
) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate({
      to: '/activity/$activityId',
      params: { activityId: row.original.id.toString() },
    });
  };

  return (
    <button className="w-full px-4 py-2 rounded-full bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 shadow-sm transition" 
	 onClick={handleClick}>
      Activity Log
    </button>
  );
};


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
      id: 'activityId',
      header: 'activityid',
      cell: ({ row /*, table*/ }) => {
        // Get current page index and page size from table state
        // const pageIndex = table.getState().pagination.pageIndex;
        // const pageSize = table.getState().pagination.pageSize;
        // Calculate the row number
        // return row.index + 1 + pageIndex * pageSize;
		return row.id
      },
	  enableSorting: true,
    },	
    
    {
      id: 'action',
      // cell: ({ row }) => <ActivityAction row={row} />,
	  // cell: ({ row }) => <ActivityOptionsDialog row={row} />,
	   cell: ({ row }) => <ActivityButton row={row} />,
	 
    },
    {
      accessorKey: 'activity',
      header: ({ column }) => (
        <DataTableColumnHeader title="Activity" column={column} />
      ),
      meta: {
        filterVariant: 'select',
      },
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader title="Status" column={column} />
      ),
      meta: {
        filterVariant: 'select',
      },
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
      filterFn: inDateRange,
      meta: {
        filterVariant: 'date',
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
