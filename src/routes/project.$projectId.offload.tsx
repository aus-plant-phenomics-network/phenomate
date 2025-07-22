/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { useState } from 'react'
import type { FileData } from '@aperturerobotics/chonky'
import type { components } from '@/lib/api/v1'
import { $api } from '@/lib/api'
import { VFS } from '@/components/VFS'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertMessage, FieldInfo, Fieldset } from '@/components/Form'

export const Route = createFileRoute('/project/$projectId/offload')({
  component: CreateProjectPage,
})

const offloadSchema = z.object({
  src_files: z.array(z.string()).min(1),
  site: z.string().min(1),
})

export default function CreateProjectPage() {
  const navigate = useNavigate()
  const { projectId } = Route.useParams()
  const [submitError, setError] = useState<string>('')
  const mutation = $api.useMutation(
    'post',
    '/api/project/{project_id}/offload',
    {
      onSuccess: () => navigate({ to: '/project' }),
      onError(error) {
        if (error) setError((error as Error).message)
      },
    },
  )
  const defaultProjectCreateValues: components['schemas']['OffloadActivityForm'] =
    {
      src_files: [],
      site: '',
    }
  const form = useForm({
    defaultValues: defaultProjectCreateValues,
    validators: {
      onMount: offloadSchema,
      onChange: offloadSchema,
    },
    canSubmitWhenInvalid: false,
    onSubmit: ({ value }) => {
      console.log(value)
      mutation.mutate({
        params: { path: { project_id: projectId } },
        body: value,
      })
    },
  })

  const addSelectedFiles = (files: Array<FileData>) => {
    if (files.length > 0) {
      form.setFieldValue('src_files', (prev: Array<string>) => {
        const prevMap = new Set(prev)
        const toAdd = files
          .filter(item => !prevMap.has(item.id))
          .map(item => item.id)
        return [...prev, ...toAdd]
      })
    }
  }

  const removeSelectedFiles = (files: Array<FileData>) => {
    if (files.length > 0) {
      form.setFieldValue('src_files', (prev: Array<string>) => {
        const toRemove = new Set(files.map(item => item.id))
        return prev.filter(item => !toRemove.has(item))
      })
    }
  }

  return (
    <div className="flex flex-col gap-y-4 items-center h-full">
      <form
        id="project-create-form"
        onSubmit={e => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
      >
        <div className="flex flex-col gap-y-6 max-w-[600px]">
          <h1 className="flex justify-start text-2xl font-bold items-center px-6 pb-4">
            Offload Data
          </h1>
          <div className="flex flex-col justify-center gap-y-4 px-6">
            {/* Root Field */}
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
                        baseAddr="/home"
                        triggerText="Select Offload Data"
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

            {/* Summary Field */}
            <form.Field
              name="site"
              children={field => {
                return (
                  <>
                    <Fieldset>
                      <Label htmlFor={field.name}>Site*</Label>
                      <Input
                        type="text"
                        id={field.name}
                        name={field.name}
                        placeholder="Site"
                        onBlur={field.handleBlur}
                        onChange={e => field.handleChange(e.target.value)}
                      />
                    </Fieldset>
                    <FieldInfo field={field} />
                  </>
                )
              }}
            />
          </div>
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
  )
}
