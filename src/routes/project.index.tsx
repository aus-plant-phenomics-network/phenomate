import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Plus, Trash2 } from 'lucide-react'
import { projectColumns } from './-project.index.tables'
import { $api, queryClient } from '@/lib/api'
import {
  DataTableViewOptions,
  RawDataTable,
  useTableWithFilterSort,
} from '@/components/Table'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

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
  const navigate = useNavigate()
  const mutation = $api.useMutation('delete', '/api/project/', {
    onSuccess: () => navigate({ to: '/project', reloadDocument: true }),
  })
  return (
    <>
      <div className="flex justify-end items-center gap-x-4 w-full">
        {/* Add Button */}
        <Link to="/project/create">
          <Button variant="outline" size="sm">
            <Plus />
            Add
          </Button>
        </Link>
        {/* Delete All Button */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline">
              <Trash2 />
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Confirmation</AlertDialogTitle>
              <AlertDialogDescription>
                Delete all selected projects
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction asChild>
                <Button
                  variant="destructive"
                  onClick={() => {
                    const selectedIds = table
                      .getFilteredSelectedRowModel()
                      .rows.map(item => item.original.id)
                    mutation.mutate({ body: selectedIds })
                  }}
                >
                  Continue
                </Button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        {/* View Button */}
        <DataTableViewOptions table={table} />
      </div>
      <RawDataTable table={table} />
    </>
  )
}
