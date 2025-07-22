import { Link, createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { activityColumns } from './-project.activities.tables'
import { $api, queryClient } from '@/lib/api'
import {
  DataTableViewOptions,
  RawDataTable,
  useTableWithFilterSort,
} from '@/components/Table'
import { Button } from '@/components/ui/button'

const queryOption = (projectId: string) =>
  $api.queryOptions('get', '/api/project/{project_id}/activity', {
    params: {
      path: { project_id: projectId },
    },
  })

export const Route = createFileRoute('/project/$projectId/activities')({
  component: RouteComponent,
  loader: ({ params }) =>
    queryClient.ensureQueryData(queryOption(params.projectId)),
})

function RouteComponent() {
  const { projectId } = Route.useParams()
  const { data } = useSuspenseQuery(queryOption(projectId))
  const { table } = useTableWithFilterSort({
    columns: activityColumns,
    data: data,
  })
  return (
    <>
      <div className="flex justify-end items-center gap-x-4 w-full">
        <Link
          to="/project/$projectId/offload"
          params={{ projectId: projectId }}
        >
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
