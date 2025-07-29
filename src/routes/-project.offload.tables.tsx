import { Trash2 } from 'lucide-react'

import type { ColumnDef } from '@tanstack/react-table'
import type { FileData } from '@aperturerobotics/chonky'

import { Button } from '@/components/ui/button'

import { DataTableColumnHeader } from '@/components/Table'
import { Checkbox } from '@/components/ui/checkbox'

export const makeFileDataColumn = (
  removeSelectedFileHandler: (data: FileData) => void,
): Array<ColumnDef<FileData>> => {
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
        <DataTableColumnHeader column={column} title="Size(B)" />
      ),
      meta: {
        filterVariant: 'range',
      },
    },
  ]
}
