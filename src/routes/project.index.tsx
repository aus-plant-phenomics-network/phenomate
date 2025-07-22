import { Link, createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { projectColumns } from './-project.index.tables'
import { $api, queryClient } from '@/lib/api'
import {
  DataTableViewOptions,
  RawDataTable,
  useTableWithFilterSort,
} from '@/components/Table'
import { Button } from '@/components/ui/button'

const queryOption = $api.queryOptions('get', '/api/project/')

export const Route = createFileRoute('/project/')({
  component: RouteComponent,
  loader: () => queryClient.ensureQueryData(queryOption),
})

function RouteComponent() {
  const { data } = useSuspenseQuery(queryOption)
  const { table } = useTableWithFilterSort({
    columns: projectColumns,
    data: data,
  })
  return (
    <>
      <div className="flex justify-end items-center gap-x-4 w-full">
        <Link to="/project/create">
          <Button variant="outline" size="sm">
            <Plus />
          </Button>
        </Link>
        <DataTableViewOptions table={table} />
      </div>
      <RawDataTable table={table} />
    </>
  )
}
