/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { memo, useEffect, useMemo, useState } from 'react'
import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronsUpDown,
  EyeOff,
  RefreshCcw,
  Settings2,
} from 'lucide-react'
import {
  flexRender,
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Input } from './ui/input'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import { Checkbox } from './ui/checkbox'
import { TooltipInfo } from './TooltipInfo'
import { DatePicker } from './DatePicker'
import type {
  Column,
  ColumnDef,
  ColumnFiltersState,
  InitialTableState,
  Row,
  RowData,
  RowSelectionState,
  SortingState,
  Table as TableT,
  VisibilityState,
} from '@tanstack/react-table'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { cn } from '@/lib/utils'

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends RowData, TValue> {
    filterVariant?: 'text' | 'range' | 'boolean' | 'date' | 'select'
  }
}

const BooleanSelectFilter = memo(
  ({ onValueChange }: { onValueChange: (value: string) => void }) => {
    return (
      <Select onValueChange={onValueChange}>
        <SelectTrigger className="w-12 border shadow rounded">
          <SelectValue placeholder="All" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="All">All</SelectItem>
          <SelectItem value="true">true</SelectItem>
          <SelectItem value="false">false</SelectItem>
        </SelectContent>
      </Select>
    )
  },
)

const SelectFacetFilter = ({
  values,
  onValueChange,
}: {
  values: Array<string>
  onValueChange: (value: string) => void
}) => {
  return (
    <Select onValueChange={onValueChange}>
      <SelectTrigger className="w-24 border shadow rounded">
        <SelectValue placeholder="All" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="All">All</SelectItem>
        {values &&
          values.map(value => (
            <SelectItem value={value} key={value}>
              {value}
            </SelectItem>
          ))}
      </SelectContent>
    </Select>
  )
}

export function Filter({ column }: { column: Column<any, unknown> }) {
  const columnFilterValue = column.getFilterValue()
  const { filterVariant } = column.columnDef.meta ?? {}
  const sortedUniqueValues = useMemo(
    () =>
      filterVariant !== 'select'
        ? []
        : Array.from(column.getFacetedUniqueValues().keys())
            .sort()
            .slice(0, 5000),
    [column.getFacetedUniqueValues(), filterVariant],
  )
  return filterVariant === 'range' ? (
    // Range
    <div className="flex space-x-2">
      <DebouncedInput
        type="number"
        value={(columnFilterValue as [number, number])?.[0] ?? ''}
        onChange={value =>
          column.setFilterValue((old: [number, number]) => [value, old?.[1]])
        }
        placeholder={`Min`}
        className="w-24 border shadow rounded"
      />
      <DebouncedInput
        type="number"
        value={(columnFilterValue as [number, number])?.[1] ?? ''}
        onChange={value =>
          column.setFilterValue((old: [number, number]) => [old?.[0], value])
        }
        placeholder={`Max`}
        className="w-24 border shadow rounded"
      />
    </div>
  ) : filterVariant === 'boolean' ? (
    // Boolean
    <BooleanSelectFilter onValueChange={column.setFilterValue} />
  ) : filterVariant === 'date' ? (
    // Date
    <div className="flex space-x-2">
      <DatePicker
        value={(columnFilterValue as [string, string])?.[0] ?? ''}
        onChange={value =>
          column.setFilterValue((old: [string, string]) => [value, old?.[1]])
        }
        placeholder={`Min`}
        className="w-32 border shadow rounded"
      />
      <DatePicker
        value={(columnFilterValue as [string, string])?.[1] ?? ''}
        onChange={value =>
          column.setFilterValue((old: [string, string]) => [old?.[0], value])
        }
        placeholder={`Max`}
        className="w-32 border shadow rounded"
      />
    </div>
  ) : filterVariant === 'select' ? (
    <SelectFacetFilter
      values={sortedUniqueValues}
      onValueChange={(value: string) =>
        value !== 'All'
          ? column.setFilterValue(value)
          : column.setFilterValue(null)
      }
    />
  ) : (
    // Text
    <DebouncedInput
      className="w-36 border shadow rounded"
      onChange={value => column.setFilterValue(value)}
      placeholder={`Search...`}
      type="text"
      value={(columnFilterValue ?? '') as string}
    />
  )
}

// A typical debounced input react component
export function DebouncedInput({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number
  onChange: (value: string | number) => void
  debounce?: number
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'>) {
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
  }, [value])

  return (
    <Input {...props} value={value} onChange={e => setValue(e.target.value)} />
  )
}

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
  tooltip?: string;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  tooltip,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  const headerTitle = column.getCanSort() ? (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="data-[state=open]:bg-accent h-9"
          >
            <span title={tooltip}>{title}</span>
            {column.getIsSorted() === 'desc' ? (
              <ArrowDown />
            ) : column.getIsSorted() === 'asc' ? (
              <ArrowUp />
            ) : (
              <ChevronsUpDown />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <TooltipInfo contentText="Sort ascending">
            <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
              <ArrowUp />
              Asc
            </DropdownMenuItem>
          </TooltipInfo>
          <TooltipInfo contentText="Sort descending">
            <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
              <ArrowDown />
              Desc
            </DropdownMenuItem>
          </TooltipInfo>
          <DropdownMenuSeparator />
          <TooltipInfo contentText="Hide column">
            <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
              <EyeOff />
              Hide
            </DropdownMenuItem>
          </TooltipInfo>
          <TooltipInfo contentText="Reset sorting">
            <DropdownMenuItem onClick={() => column.clearSorting()}>
              <RefreshCcw />
              Reset
            </DropdownMenuItem>
          </TooltipInfo>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  ) : (
    <div className={cn('py-2 align-top', className)}>{title}</div>
  )
  const filterWindow = column.getCanFilter() ? (
    <div>
      <Filter column={column} />
    </div>
  ) : null

  return (
    <div className={cn('grid grid-rows-2 py-2 h-full', className)}>
      {headerTitle}
      {filterWindow}
    </div>
  )
}

export function DataTableViewOptions<TData>({
  table,
}: {
  table: TableT<TData>
}) {
  return (
    <DropdownMenu>
      <TooltipInfo contentText="Toggle column(s) visibility">
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <Settings2 />
            View
          </Button>
        </DropdownMenuTrigger>
      </TooltipInfo>
      <DropdownMenuContent align="end" className="w-fit">
        <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {table
          .getAllColumns()
          .filter(
            column =>
              typeof column.accessorFn !== 'undefined' && column.getCanHide(),
          )
          .map(column => {
            return (
              <DropdownMenuCheckboxItem
                key={column.id}
                className="capitalize"
                checked={column.getIsVisible()}
                onCheckedChange={value => column.toggleVisibility(!!value)}
              >
                {column.id}
              </DropdownMenuCheckboxItem>
            )
          })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

interface DataTableProps<TData, TValue> {
  columns: Array<ColumnDef<TData, TValue>>
  data: Array<TData>
  initialState?: InitialTableState
}

export function RawDataTable<TData>({ table }: { table: TableT<TData> }) {
  return (
    <div className="rounded-md border overflow-auto w-full p-2 flex flex-grow">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map(header => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map(row => (
            <TableRow
              key={row.id}
              data-state={row.getIsSelected() && 'selected'}
            >
              {row.getVisibleCells().map(cell => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export function useTableWithFilterSort<TData, TValue>({
  columns,
  data,
  initialState,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const table = useReactTable({
    data,
    columns,
    initialState: initialState,
    filterFns: {},
    autoResetPageIndex: false,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(), // client-side faceting
    getFacetedUniqueValues: getFacetedUniqueValues(), // generate unique values for select filter/autocomplete
    getFacetedMinMaxValues: getFacetedMinMaxValues(), // generate min/max values for range filter
  })
  return {
    table: table,
    sorting: sorting,
    setSorting: setSorting,
    columnFilters: columnFilters,
    setColumnFilters: setColumnFilters,
    rowSelection: rowSelection,
    setRowSelection: setRowSelection,
  }
}

interface DataTablePaginationProps<TData> {
  table: TableT<TData>
}
export function DataTablePagination<TData>({
  table,
}: DataTablePaginationProps<TData>) {
  return (
    <div className="flex items-center justify-between px-2">
      <div className="text-muted-foreground flex-1 text-sm">
        {table.getFilteredSelectedRowModel().rows.length} of{' '}
        {table.getFilteredRowModel().rows.length} row(s) selected.
      </div>
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Rows per page</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={value => {
              table.setPageSize(Number(value))
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 50, 100].map(pageSize => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          Page {table.getState().pagination.pageIndex + 1} of{' '}
          {table.getPageCount()}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            className="hidden size-8 lg:flex"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="hidden size-8 lg:flex"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRight />
          </Button>
        </div>
      </div>
    </div>
  )
}

export function SelectPageRowsCheckBox<TData>({
  table,
}: {
  table: TableT<TData>
}) {
  return (
    <TooltipInfo contentText="Toggle rows in the current page">
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    </TooltipInfo>
  )
}

export function SelectRowCheckBox<TData>({ row }: { row: Row<TData> }) {
  return (
    <TooltipInfo contentText="Select current row">
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={value => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    </TooltipInfo>
  )
}

export function DataTableAdvancedSelectionOptions<TData>({
  table,
}: {
  table: TableT<TData>
}) {
  return (
    <DropdownMenu>
      <TooltipInfo contentText="Advanced selection menu">
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <Settings2 />
            Selection
          </Button>
        </DropdownMenuTrigger>
      </TooltipInfo>
      <DropdownMenuContent align="start" className="w-fit">
        <DropdownMenuLabel>Selection Options</DropdownMenuLabel>
        <TooltipInfo contentText="Toggle all rows in the table">
          <DropdownMenuItem
            onSelect={e => {
              e.preventDefault()
              table.toggleAllRowsSelected()
            }}
          >
            Toggle All
          </DropdownMenuItem>
        </TooltipInfo>
        <TooltipInfo contentText="Toggle currently selected rows (inverse selection)">
          <DropdownMenuItem
            onSelect={e => {
              e.preventDefault()
              table.getCoreRowModel().rows.forEach(row => row.toggleSelected())
            }}
          >
            Toggle Selected
          </DropdownMenuItem>
        </TooltipInfo>
        <TooltipInfo contentText="Toggle currently filtered rows">
          <DropdownMenuItem
            onSelect={e => {
              e.preventDefault()
              table
                .getFilteredRowModel()
                .rows.forEach(row => row.toggleSelected())
            }}
          >
            Toggle Filtered
          </DropdownMenuItem>
        </TooltipInfo>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
