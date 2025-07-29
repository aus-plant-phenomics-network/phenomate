/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { useState } from 'react'
import type { FileData } from '@aperturerobotics/chonky'
import type { components } from '@/lib/api/v1'
import { $api } from '@/lib/api'
import { Autocomplete } from '@/components/Autocomplete'
import { VFS } from '@/components/VFS'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertMessage, FieldInfo, Fieldset } from '@/components/Form'

export const Route = createFileRoute('/project/create')({
  component: CreateProjectPage,
})

const projectCreateSchema = z.object({
  year: z.int().gte(1000),
  summary: z.string().max(50).min(1),
  root: z.string(),
  internal: z.boolean(),
  template: z.string().nullable(),
  researcherName: z.string().nullable(),
  organisationName: z.string().nullable(),
})

export default function CreateProjectPage() {
  const navigate = useNavigate()
  const [submitError, setError] = useState<string>('')
  const mutation = $api.useMutation('post', '/api/project/', {
    onSuccess: () => navigate({ to: '/project' }),
    onError(error) {
      if (error) setError((error as Error).message)
    },
  })
  const researcherQuery = $api.useQuery('get', '/api/researcher/')
  const orgQuery = $api.useQuery('get', '/api/organisation/')
  const defaultProjectCreateValues: components['schemas']['ProjectCreateSchema'] =
    {
      year: new Date().getFullYear(),
      summary: '',
      root: '',
      internal: true,
      template: null,
      researcherName: null,
      organisationName: null,
    }
  const form = useForm({
    defaultValues: defaultProjectCreateValues,
    validators: {
      onMount: projectCreateSchema,
      onChange: projectCreateSchema,
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
    <div className="flex flex-col gap-y-4 items-center h-full">
      <form
        id="project-create-form"
        onSubmit={e => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
      >
        <div className="flex flex-col gap-y-6 w-[410px] sm:w-[600px]">
          <h1 className="flex justify-center text-2xl font-bold items-center px-6 pb-4">
            Create Project
          </h1>
          <div className="flex flex-col justify-center gap-y-4 px-6">
            {/* Year Field */}
            <form.Field
              name="year"
              children={field => {
                return (
                  <>
                    <Fieldset>
                      <Label htmlFor={field.name}>Year*</Label>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        type="number"
                        onChange={e =>
                          field.handleChange(e.target.valueAsNumber)
                        }
                      />
                    </Fieldset>
                    <FieldInfo field={field} />
                  </>
                )
              }}
            />
            {/* Summary Field */}
            <form.Field
              name="summary"
              children={field => {
                return (
                  <>
                    <Fieldset>
                      <Label htmlFor={field.name}>Summary*</Label>
                      <Input
                        type="text"
                        id={field.name}
                        name={field.name}
                        placeholder="Project Summary"
                        onBlur={field.handleBlur}
                        onChange={e => field.handleChange(e.target.value)}
                      />
                    </Fieldset>
                    <FieldInfo field={field} />
                  </>
                )
              }}
            />
            {/* Root Field */}
            <form.Field
              name="root"
              children={field => {
                const addSelectedFiles = (files: Array<FileData>) => {
                  if (!files || files.length != 1) field.handleChange(null)
                  else field.handleChange(files[0].id)
                }
                return (
                  <>
                    <Fieldset>
                      <Label htmlFor={field.name}>Root</Label>
                      <VFS
                        addSelectedFiles={addSelectedFiles}
                        baseAddr="/home"
                        triggerText={
                          !field.state.value
                            ? 'Select Root Directory'
                            : field.state.value
                        }
                        title="Select Root Directory"
                        description="Set project's parent directory"
                        multiple={false}
                        dirOnly={true}
                      />
                    </Fieldset>
                  </>
                )
              }}
            />
            {/* Template Field */}
            <form.Field
              name="template"
              children={field => {
                const addSelectedFiles = (files: Array<FileData>) => {
                  if (!files || files.length != 1) field.handleChange(null)
                  else field.handleChange(files[0].id)
                }
                return (
                  <>
                    <Fieldset>
                      <Label htmlFor={field.name}>Template</Label>
                      <VFS
                        addSelectedFiles={addSelectedFiles}
                        baseAddr="/home"
                        triggerText={
                          !field.state.value
                            ? 'Select Template Directory'
                            : field.state.value
                        }
                        title="Select Template Directory"
                        description="Select template metadata file"
                        multiple={false}
                        dirOnly={false}
                      />
                    </Fieldset>
                  </>
                )
              }}
            />
            {/* Internal field */}
            <form.Field
              name="internal"
              children={field => {
                return (
                  <>
                    <Fieldset>
                      <Label htmlFor={field.name}>Internal</Label>
                      <Checkbox
                        id={field.name}
                        name={field.name}
                        checked={field.state.value as boolean}
                        onCheckedChange={checked =>
                          field.handleChange(checked === true)
                        }
                      />
                    </Fieldset>
                  </>
                )
              }}
            />
            {/* Researcher */}
            <form.Field
              name="researcherName"
              children={field => {
                return (
                  <>
                    <Fieldset>
                      <Label>Researcher</Label>
                      <Autocomplete
                        name={field.name}
                        id={field.name}
                        value={field.state.value}
                        setValue={field.handleChange}
                        placeholder="Search Researcher"
                        defaultValue="Search Researcher"
                        data={
                          researcherQuery.data
                            ? researcherQuery.data.map(item => item.name)
                            : []
                        }
                      />
                    </Fieldset>
                  </>
                )
              }}
            />
            {/* Organisation */}
            <form.Field
              name="organisationName"
              children={field => {
                return (
                  <>
                    <Fieldset>
                      <Label>Organisation</Label>
                      <Autocomplete
                        name={field.name}
                        id={field.name}
                        value={field.state.value}
                        setValue={field.handleChange}
                        placeholder="Search Org"
                        defaultValue="Search Org"
                        data={
                          orgQuery.data
                            ? orgQuery.data.map(item => item.name)
                            : []
                        }
                      />
                    </Fieldset>
                  </>
                )
              }}
            />

            {/* End of form */}
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
