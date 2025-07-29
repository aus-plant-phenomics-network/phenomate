import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { FolderUp, Plus, Trash2 } from 'lucide-react'
import { z } from 'zod'
import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import { projectColumns } from './-project.index.tables'
import type { Table } from '@tanstack/react-table'
import type { components } from '@/lib/api/v1'
import type { FileData } from '@aperturerobotics/chonky'
import { $api, queryClient } from '@/lib/api'
import {
  DataTablePagination,
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
import { AlertMessage } from '@/components/Form'
import { BaseVFS } from '@/components/VFS'

const queryOption = $api.queryOptions('get', '/api/project/')

export const Route = createFileRoute('/project/')({
  component: RouteComponent,
  loader: () => queryClient.ensureQueryData(queryOption),
})

const projectImportSchema = z.object({
  project_path: z.string().nonempty(),
})

function AddProjectButton() {
  return (
    <Link to="/project/create">
      <Button variant="outline">
        <Plus />
        Add
      </Button>
    </Link>
  )
}

function DeleteSelectedButton({
  table,
}: {
  table: Table<components['schemas']['ProjectListSchema']>
}) {
  const navigate = useNavigate()
  const mutation = $api.useMutation('delete', '/api/project/', {
    onSuccess: () => navigate({ to: '/project', reloadDocument: true }),
  })
  return (
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
            This action cannot be undone. This will permanently delete all
            selected projects and remove their data on the computer.
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
  )
}

function ImportProjectButton({
  setError,
}: {
  setError: (value: string) => void
}) {
  const navigate = useNavigate()
  const mutation = $api.useMutation('post', '/api/project/load', {
    onSuccess: () => navigate({ to: '/project', reloadDocument: true }),
    onError(error) {
      console.log(error)
      setError((error as Error).message)
    },
  })
  const defaultProjectImportValues: components['schemas']['ProjectImportSchema'] =
    {
      project_path: '',
      metadata_path: '',
    }
  const form = useForm({
    defaultValues: defaultProjectImportValues,
    validators: {
      onMount: projectImportSchema,
      onChange: projectImportSchema,
    },
    listeners: {
      onChange: ({ formApi }) => {
        if (formApi.state.isValid) formApi.handleSubmit()
      },
      onChangeDebounceMs: 500,
    },
    canSubmitWhenInvalid: false,
    onSubmit: ({ value }) => {
      console.log(value)
      mutation.mutate({
        body: value,
      })
    },
  })
  return (
    <form
      id="project-import-form"
      onSubmit={e => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
    >
      <form.Field
        name="project_path"
        children={field => {
          const addSelectedFiles = (files: Array<FileData>) => {
            if (files.length != 1) field.handleChange('')
            else field.handleChange(files[0].id)
          }
          return (
            <>
              <BaseVFS
                addSelectedFiles={addSelectedFiles}
                baseAddr="/home"
                title="Import Project"
                description="Select Project Folder to Import"
                multiple={false}
                dirOnly={true}
              >
                <Button variant="outline">
                  <FolderUp />
                  Import
                </Button>
              </BaseVFS>
            </>
          )
        }}
      />
    </form>
  )
}

function RouteComponent() {
  const [submitError, setError] = useState<string>('')
  const { data } = useSuspenseQuery(queryOption)
  const { table } = useTableWithFilterSort({
    columns: projectColumns,
    data: data,
  })

  return (
    <>
      {/* Buttons panel */}
      <div className="flex justify-end items-center gap-x-4 w-full">
        <AddProjectButton />
        <ImportProjectButton setError={setError} />
        <DeleteSelectedButton table={table} />
        <DataTableViewOptions table={table} />
      </div>
      {/* Table and Pagination */}
      <RawDataTable table={table} />
      <DataTablePagination table={table} />
      {submitError ? (
        <AlertMessage className="w-fit absolute top-4 right-2">
          {submitError}
        </AlertMessage>
      ) : null}
    </>
  )
}
