/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { useCallback, useMemo, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { makeFileDataColumn } from './-project.offload.tables'
import type { FileData } from '@aperturerobotics/chonky'
import type { components } from '@/lib/api/v1'
import { $api } from '@/lib/api'
import { VFS } from '@/components/VFS'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertMessage, Fieldset } from '@/components/Form'
import {
  DataTablePagination,
  RawDataTable,
  useTableWithFilterSort,
} from '@/components/Table'

const queryOption = (projectId: number) =>
  $api.queryOptions('get', '/api/project/id/{project_id}', {
    params: { path: { project_id: projectId } },
  })

export const Route = createFileRoute('/project/$projectId/offload')({
  component: OffloadProjectPage,
})

const offloadSchema = z.object({
  src_files: z.array(z.string()).min(1),
})

export default function OffloadProjectPage() {
  const navigate = useNavigate()
  const { projectId } = Route.useParams()
  const [submitError, setError] = useState<string>('')
  const [selectedFiles, setSelectedFiles] = useState<Array<FileData>>([])
  const { data } = useSuspenseQuery(queryOption(parseInt(projectId)))
  console.log(data)

  const mutation = $api.useMutation(
    'post',
    '/api/activity/offload/{project_id}',
    {
      onSuccess: () =>
        navigate({
          to: '/project/$projectId/activities',
          params: { projectId: projectId },
        }),
      onError(error) {
        if (error) setError((error as Error).message)
      },
    },
  )
  const defaultProjectOffloadValues: components['schemas']['OffloadActivityForm'] =
    {
      src_files: [],
    }
  const form = useForm({
    defaultValues: defaultProjectOffloadValues,
    validators: {
      onMount: offloadSchema,
      onChange: offloadSchema,
    },
    canSubmitWhenInvalid: true,
    onSubmit: ({ value }) => {
      console.log(value)
      mutation.mutate({
        params: { path: { project_id: projectId } },
        body: value,
      })
    },
  })

  const addSelectedFiles = useCallback(
    (files: Array<FileData>) => {
      if (files.length > 0) {
        setSelectedFiles(prev => {
          const prevIdSet = new Set(prev.map(item => item.id))
          const toAdd = files.filter(item => !prevIdSet.has(item.id))
          return [...prev, ...toAdd]
        })
        form.setFieldValue('src_files', prev => {
          const prevIdSet = new Set(prev)
          const toAdd = files
            .map(item => item.id)
            .filter(item => !prevIdSet.has(item))
          return [...prev, ...toAdd]
        })
      }
    },
    [setSelectedFiles, form],
  )

  const removeAllFiles = useCallback(() => {
    setSelectedFiles([])
    form.setFieldValue('src_files', [])
  }, [setSelectedFiles, form])

  const removeSelectedFiles = useCallback(
    (files: Array<FileData>) => {
      if (files.length > 0) {
        const toRemove = new Set(files.map(item => item.id))
        setSelectedFiles(prev => prev.filter(item => !toRemove.has(item.id)))
        form.setFieldValue('src_files', prev =>
          prev.filter(item => !toRemove.has(item)),
        )
      }
    },
    [setSelectedFiles, form],
  )

  const removeSelectedFile = useCallback(
    (file: FileData) => {
      setSelectedFiles((prev: Array<FileData>) =>
        prev.filter(item => item.id !== file.id),
      )
      form.setFieldValue('src_files', (prev: Array<string>) =>
        prev.filter(item => item != file.id),
      )
    },
    [setSelectedFiles, form],
  )

  const columns = useMemo(
    () => makeFileDataColumn(removeSelectedFile),
    [removeSelectedFile],
  )

  const { table } = useTableWithFilterSort({
    columns: columns,
    data: selectedFiles,
  })

  return (
    <div className="flex flex-col xl:flex-row w-full gap-4 flex-grow-1 min-h-0">
      {/* Form */}
      <div className="flex flex-col gap-y-4 items-center min-w-[350px]">
        <form
          id="project-create-form"
          onSubmit={e => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
        >
          <h1 className="flex justify-center text-2xl font-bold items-center px-6 pb-4">
            Offload Data
          </h1>
          <div className="flex flex-col gap-y-6 max-w-[600px] py-6">
            <div className="flex flex-col justify-center gap-y-4 px-6">
              {/* Src Field Field */}
              <form.Field
                name="src_files"
                children={field => {
                  return (
                    <>
                      <Fieldset>
                        <Label htmlFor={field.name}>Data*</Label>
                        <Input
                          type="text"
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          multiple
                          readOnly
                          hidden
                          aria-hidden
                        />
                        <VFS
                          addSelectedFiles={addSelectedFiles}
                          triggerText="Offload Data"
                          title="Select Offload Data"
                          description="Select File(s) or Folder(s) to offload to project"
                          multiple={true}
                          dirOnly={false}
                        />
                      </Fieldset>
                    </>
                  )
                }}
              />
            </div>
            {/* Submit button */}
            <div className="flex justify-end px-6 py-4">
              <form.Subscribe
                selector={state => [state.canSubmit, state.isSubmitting]}
                children={([canSubmit, isSubmitting]) => (
                  <Button type="submit" disabled={!canSubmit}>
                    {isSubmitting ? '...' : 'Submit'}
                  </Button>
                )}
              />
            </div>
          </div>
        </form>
        {submitError ? <AlertMessage>{submitError}</AlertMessage> : null}
      </div>
      {/* Display Table */}
      <div className="flex flex-col flex-grow-1 min-h-0 overflow-x-auto gap-y-4">
        <div className="flex justify-end gap-x-2 p-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const selectedRows = table.getFilteredSelectedRowModel().rows
              selectedRows.forEach(row => row.toggleSelected(false))
              const selectedRowsData = selectedRows.map(item => item.original)
              removeSelectedFiles(selectedRowsData)
            }}
          >
            <Trash2 />
            Remove Selected
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              table.toggleAllRowsSelected(false)
              removeAllFiles()
            }}
          >
            <Trash2 />
            Remove All
          </Button>
        </div>
        <RawDataTable table={table} />
        <DataTablePagination table={table} />
      </div>
    </div>
  )
}
