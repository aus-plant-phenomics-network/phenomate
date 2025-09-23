import { Trash2 } from 'lucide-react'

import type { ColumnDef } from '@tanstack/react-table'

import type { ParsedFileData } from '@/lib/utils'
import { formatDT, inDateRange } from '@/lib/utils'
import { Button } from '@/components/ui/button'

import {
  DataTableColumnHeader,
  SelectPageRowsCheckBox,
  SelectRowCheckBox,
} from '@/components/Table'

export const makeFileDataColumn = (
  removeSelectedFileHandler: (data: ParsedFileData) => void,
  timezone: string,
): Array<ColumnDef<ParsedFileData>> => {
  return [
    {
      id: 'taskId',
      header: '#',
      cell: ({ row, table }) => {
        // Get current page index and page size from table state
        const pageIndex = table.getState().pagination.pageIndex;
        const pageSize = table.getState().pagination.pageSize;
        // Calculate the row number
        return row.index + 1 + pageIndex * pageSize;
      },
    },	  
    {
      id: 'select',
      header: ({ table }) => <SelectPageRowsCheckBox table={table} />,
      cell: ({ row }) => <SelectRowCheckBox row={row} />,
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: 'remove',
      cell: ({ row }) => (
        <Button
          variant="ghost"
          onClick={() => {
            const selected = row.getIsSelected()
            row.toggleSelected(!!selected)
            removeSelectedFileHandler(row.original)
          }}
        >
          <Trash2 />
        </Button>
      ),
    },
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="File Name" />
      ),
    },
    {
      accessorKey: 'datetime',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Date Time" />
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
      accessorKey: 'sensor',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Sensor" />
      ),
      meta: {
        filterVariant: 'select',
      },
    },
    {
      accessorKey: 'site',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Site" />
      ),
      meta: {
        filterVariant: 'select',
      },
    },
    {
      accessorKey: 'id',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="File Path" />
      ),
    },
    {
      accessorKey: 'size',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Size(kB)" />
      ),
      cell: ({ cell }) => {
        return (Number(cell.getValue()) / 1000).toFixed(2)
      },
      enableColumnFilter: false,
    },
  ]
}
