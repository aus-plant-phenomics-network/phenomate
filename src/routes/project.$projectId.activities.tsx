import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Plus, Trash2 } from 'lucide-react'
import { activityColumns } from './-project.activities.tables'
import type { components } from '@/lib/api/v1'
import type { Table } from '@tanstack/react-table'
import { $api, queryClient } from '@/lib/api'
import {
  DataTablePagination,
  DataTableViewOptions,
  RawDataTable,
  useTableWithFilterSort,
} from '@/components/Table'
import { Button } from '@/components/ui/button'
import { DeleteDialog } from '@/components/DeleteDialog'

const queryOption = (projectId: string) =>
  $api.queryOptions('get', '/api/activity/{project_id}', {
    params: {
      path: { project_id: projectId },
    },
  })

export const Route = createFileRoute('/project/$projectId/activities')({
  component: RouteComponent,
  loader: ({ params }) =>
    queryClient.ensureQueryData(queryOption(params.projectId)),
})

function DeleteSelectedButton({
  table,
  projectId,
}: {
  table: Table<components['schemas']['ActivitySchema']>
  projectId: string
}) {
  const navigate = useNavigate()
  const mutation = $api.useMutation('delete', '/api/activity/', {
    onSuccess: () =>
      navigate({
        to: '/project/$projectId/activities',
        reloadDocument: true,
        params: { projectId: projectId },
      }),
  })
  const selectedRows = table.getFilteredSelectedRowModel().rows
  const confirmHandler = () => {
    const selectedIds = selectedRows.map(item => item.original.id)
    mutation.mutate({ body: selectedIds })
  }
  const disabled = selectedRows.length === 0
  return (
    <DeleteDialog
      asChild
      contentTitle="Delete Selected Activities"
      contentDescription="This action cannot be undone. This will permanently delete the selected activities and remove all data on the computer."
      confirmHandler={confirmHandler}
    >
      <Button variant="outline" disabled={disabled}>
        <Trash2 />
        Delete
      </Button>
    </DeleteDialog>
  )
}

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
            Offload
          </Button>
        </Link>
        <DeleteSelectedButton table={table} projectId={projectId} />
        <DataTableViewOptions table={table} />
      </div>
      <RawDataTable table={table} />
      <DataTablePagination table={table} />
    </>
  )
}
