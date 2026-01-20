import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { /*FolderUp,*/ Plus, Trash2 } from 'lucide-react'
import { z } from 'zod'
import { useForm } from '@tanstack/react-form'
import { useMemo, useState } from 'react'
import { makeIndexDataColumn } from './-project.index.tables'
import type { Table } from '@tanstack/react-table'
import type { components } from '@/lib/api/v1'
import type { FileData } from '@aperturerobotics/chonky'
import { $api, queryClient } from '@/lib/api'
import {
  DataTableAdvancedSelectionOptions,
  DataTablePagination,
  DataTableViewOptions,
  RawDataTable,
  useTableWithFilterSort,
} from '@/components/Table'
import { Button } from '@/components/ui/button'
import { AlertMessage } from '@/components/Form'
import { VFS_GREY } from '@/components/VFS'
import { TZSelect } from '@/components/TimezoneSelect'
import { DeleteDialog } from '@/components/DeleteDialog'
import { usePhenomate } from '@/lib/context'
import { TooltipInfo } from '@/components/TooltipInfo'

const queryOption = $api.queryOptions('get', '/api/project/')

export const Route = createFileRoute('/project/')({
  component: RouteComponent,
  loader: () => queryClient.ensureQueryData(queryOption),
})

const projectImportSchema = z.object({
  project_path: z.string().nonempty(),
})

function AddProjectPanelButton() {
  return (
    <TooltipInfo contentText="Add a project entry to the list">
    <Link to="/project/create">
      <Button variant="outline" >
        <Plus />
        Create Project
      </Button>
    </Link>
	</TooltipInfo>
  )
}

// This function calls backend/projects/api.py -> delete_projects()
// which has been modified to only remove the project entry in the table and
// and the project data on disk (instrument data files) remains 
// (def rm_projects() has been dissabled)
function RemoveSelectedButton({
  table,
}: {
  table: Table<components['schemas']['ProjectListSchema']>
}) {
  const navigate = useNavigate()
  const mutation = $api.useMutation('delete', '/api/project/', {
    onSuccess: () => navigate({ to: '/project', reloadDocument: true }),
  })
  const selectedRows = table.getFilteredSelectedRowModel().rows
  const confirmHandler = () => {
    const selectedIds = selectedRows.map(item => item.original.id)
    mutation.mutate({ body: selectedIds })
  }
  const disabled = selectedRows.length === 0
  // const disabled = true
  return (
    <DeleteDialog
      asChild
      contentTitle="Remove Project Row"
      contentDescription="This will remove the selected project from the list below. Project data will remain on disk."
      confirmHandler={confirmHandler}
    >
      <Button variant="outline" disabled={disabled}>
        <Trash2 />
        Remove Project
      </Button>
    </DeleteDialog>
  )
}

function ImportProjectPanelButton({
  setError,
}: {
  setError: (value: string) => void
}) {
  const navigate = useNavigate()
  const mutation = $api.useMutation('post', '/api/project/load', {
	onSuccess: (data) => {
		console.log("Success:", data)
		navigate({ to: '/project', reloadDocument: true })
	  },
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
              <VFS_GREY
				  addSelectedFiles={addSelectedFiles}
				  triggerText={
					"Import Project"
				  }
				  name_local_storage={"root"}
				  title="Import Project"
				  description="Select Project Folder to Import"
				  multiple={false}
				  dirOnly={true}
				  tooltip="Select the directory of a previously created project to import it and add data"
				/>
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
  const { timezone } = usePhenomate()
  const indexDataColumns = useMemo(
    () => makeIndexDataColumn(timezone),
    [timezone],
  )
  const { table } = useTableWithFilterSort({
    columns: indexDataColumns,
    data: data,
  })

  return (
    <>
      {/* Buttons panel */}
      <div className="flex justify-end items-center gap-x-4 w-full">
        <AddProjectPanelButton />
        <ImportProjectPanelButton setError={setError} />
        <DataTableAdvancedSelectionOptions table={table} />
        <RemoveSelectedButton table={table} />
        <DataTableViewOptions table={table} />
        <TZSelect />
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
