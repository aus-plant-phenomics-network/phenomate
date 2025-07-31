import { Trash2 } from 'lucide-react'

import type { ColumnDef } from '@tanstack/react-table'
import type { FileData } from '@aperturerobotics/chonky'

import { Button } from '@/components/ui/button'

import {
  DataTableColumnHeader,
  SelectPageRowsCheckBox,
  SelectRowCheckBox,
} from '@/components/Table'

export const makeFileDataColumn = (
  removeSelectedFileHandler: (data: FileData) => void,
): Array<ColumnDef<FileData>> => {
  return [
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
      accessorKey: 'id',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="File Path" />
      ),
    },
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="File Name" />
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
