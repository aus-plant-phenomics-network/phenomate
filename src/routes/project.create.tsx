/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { useState, useEffect, useRef } from 'react'
import type { FileData } from '@aperturerobotics/chonky'
import type { components } from '@/lib/api/v1'
import { $api } from '@/lib/api'
import { Autocomplete } from '@/components/Autocomplete'
import { VFS_GREY } from '@/components/VFS'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertMessage, FieldInfo, Fieldset } from '@/components/Form'
// import { saveDirectory } from '@/lib/utils'

export const Route = createFileRoute('/project/create')({
  component: CreateProjectPage,
})

const projectCreateSchema = z.object({
  year: z.int().gte(1000),
  summary: z.string().max(50).min(1),
  project: z.string().max(50).min(1),
  site: z.string().max(50).min(1),
  platform: z.string().max(50).min(1),
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
	    project: '',
	    site: '',
	    platform: '',
      root: '',
      internal: true,
      template: null,
      researcherName: null,
      organisationName: null,
    }
  const FormApi = useForm({
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

  // New preview component that calls the backend with current form inputs
  function ProjectPreview({
    input,
  }: {
    input: Partial<typeof defaultProjectCreateValues>
  }) {
    const [preview, setPreview] = useState<string>('')
    //const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string>('')
    const timerRef = useRef<number | null>(null)

    const previewMutation = $api.useMutation('post', '/api/project/preview/', {
      onSuccess(data) {
        console.log('Preview received:', data)

         setPreview(data)
      },
      onError(err) {
        console.error('Preview error:', err)
        setError((err as Error).message)
      },
    })

    useEffect(() => {
      console.log('Effect triggered with input:', input)
      
      if (timerRef.current) window.clearTimeout(timerRef.current)
      timerRef.current = window.setTimeout(() => {
        console.log('Debounce timeout fired, fetching preview')
        if (!input) {
          console.log('Input is empty, returning early')
          return
        }
        
        console.log('Sending preview request with input:', input)
        //setLoading(true)
        setError('')
        // Ensure all required fields are present before sending
        const completeInput = {
          year: input.year ?? 2000,
          summary: input.summary ?? '',
          project: input.project ?? '',
          site: input.site ?? '',
          platform: input.platform ?? '',
          root: input.root ?? '',
          internal: input.internal ?? true,
          template: input.template ?? null,
          researcherName: input.researcherName ?? null,
          organisationName: input.organisationName ?? null,
        }
        previewMutation.mutate({ body: completeInput })
      }, 500)

      return () => {
        if (timerRef.current) {
          window.clearTimeout(timerRef.current)
          timerRef.current = null
        }
      }
    }, [
      input.root,
      input.template,
      input.platform,
      input.project,
      input.site,
      input.summary,
      input.year,
      input.internal,
      input.researcherName,
      input.organisationName,
    ])

    return (
      <div className="px-6 py-4 mt-4 border-t">
        {previewMutation.isPending ? (
          <div>Loading preview...</div>
        ) : error ? (
          <div className="text-red-500">Preview error: {error}</div>
        ) : preview ? (
          <div className="space-y-2">
            {(() => {
              // split the incoming preview string into path and directory existence status
              const [path, status] = preview.split('| Exists:').map(s => s.trim())
              return (
                <>
                  <div>
                    <span className="font-semibold">Directory:</span>{' '}
                    <span className="font-mono">{path}</span>
                  </div>
                  <div>
                    <span className="font-semibold">Exists:</span>{'    '}
                    <span className="font-mono">{status}</span>
                  </div>
                </>
              )
            })()}
          </div>
        ) : null}
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-y-4 items-center h-full">
        <form
          id="project-create-form"
          onSubmit={e => {
            e.preventDefault()
            e.stopPropagation()
            FormApi.handleSubmit()
          }}
        >
          <div className="flex flex-col gap-y-6 w-[410px] sm:w-[600px]">
            <h1 className="flex justify-center text-2xl font-bold items-center px-6 pb-4">
              Create Project
            </h1>
            <div className="flex flex-col justify-center gap-y-4 px-6">
              {/* Root Field */}
              <FormApi.Field
                name="root"
                children={field => {
                  const addSelectedFiles = (files: Array<FileData>) => {
                    if (!files || files.length != 1) field.handleChange(null)
                    else field.handleChange(files[0].id)
                  }
                  return (
                    <>
                      <Fieldset>
                        <Label htmlFor={field.name}>Output Directory Path</Label>
                        <VFS_GREY
                          addSelectedFiles={addSelectedFiles}
                          triggerText={
                            !field.state.value
                              ? 'Select Project Base Directory'
                              : field.state.value
                          }
						  name_local_storage={field.name}
                          title="Output Directory"
                          description="Where do you want to save your data?"
                          multiple={false}
                          dirOnly={true}
						  tooltip="Select an output directory where output data will be stored"
                        />
                      </Fieldset>
                    </>
                  )
                }}
              />
			  {/* Template Field */}
              <FormApi.Field
                name="template"
                children={field => {
                  const addSelectedFiles = (files: Array<FileData>) => {
                    if (!files || files.length != 1) field.handleChange(null)
                    else field.handleChange(files[0].id)
                  }
                  return (
                    <>
                      <Fieldset>
                        <Label htmlFor={field.name}>Project Template</Label>
                        <VFS_GREY
                          addSelectedFiles={addSelectedFiles}
                          triggerText={
                            !field.state.value
                              ? 'YAML Template File'
                              : field.state.value
                          }
						  name_local_storage={field.name}
                          title="Select a template file"
                          description="YAML template that describes the input data filename structure and output directory structure (from APPM project) "
                          multiple={false}
                          dirOnly={false}
						  tooltip="Choose a template.yaml file that describes the expected file name format and output directory structure"
                        />
                      </Fieldset>
                    </>
                  )
                }}
              />
			  {/* Platform Name */}
              <FormApi.Field
                name="platform"
                children={field => {
                  return (
                    <>
                      <Fieldset>
                        <Label htmlFor={field.name}>Platform Name*</Label>
                        <Input
                          type="text"
                          id={field.name}
                          name={field.name}
                          placeholder="Platform Name"
                          onBlur={field.handleBlur}
                          onChange={e => field.handleChange(e.target.value)}
                        />
                      </Fieldset>
                      <FieldInfo field={field} />
                    </>
                  )
                }}
              />
			  {/* Project Name */}
              <FormApi.Field
                name="project"
                children={field => {
                  return (
                    <>
                      <Fieldset>
                        <Label htmlFor={field.name}>Project Name*</Label>
                        <Input
                          type="text"
                          id={field.name}
                          name={field.name}
                          placeholder="Project Name"
                          onBlur={field.handleBlur}
                          onChange={e => field.handleChange(e.target.value)}
                        />
                      </Fieldset>
                      <FieldInfo field={field} />
                    </>
                  )
                }}
              />
			  {/* Site Name */}
              <FormApi.Field
                name="site"
                children={field => {
                  return (
                    <>
                      <Fieldset>
                        <Label htmlFor={field.name}>Site Name*</Label>
                        <Input
                          type="text"
                          id={field.name}
                          name={field.name}
                          placeholder="Site Name"
                          onBlur={field.handleBlur}
                          onChange={e => field.handleChange(e.target.value)}
                        />
                      </Fieldset>
                      <FieldInfo field={field} />
                    </>
                  )
                }}
              />
			  
			  {/* Summary String */}
              <FormApi.Field
                name="summary"
                children={field => {
                  return (
                    <>
                      <Fieldset>
                        <Label htmlFor={field.name}>Project Summary*</Label>
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
			  {/* Year Field */}
              <FormApi.Field
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
              {/* Internal field */}
              <FormApi.Field
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
              <FormApi.Field
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
              <FormApi.Field
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
            {/* Form submit button */}
            <div className="flex justify-end px-6 py-4">
              <FormApi.Subscribe
                selector={state => [state.canSubmit, state.isSubmitting]}
                children={([canSubmit, isSubmitting]) => (
                  <Button type="submit" disabled={!canSubmit} title="project directory will be created if it is not existing">
                    {isSubmitting ? '...' : 'Create Project'}
                  </Button>
                )}
              />
            </div>
          </div>
        </form>

        {/* Subscribe to current form values and render the ProjectPreview */}
        <FormApi.Subscribe
          selector={state => state.values}
          children={({
            root,
            template,
            platform,
            project,
            site,
            summary,
            year,
            internal,
            researcherName,
            organisationName,
          }) => (
            <ProjectPreview
              input={{
                root,
                year,
                summary,
                platform,
                project,
                site,
                internal,
                researcherName,
                organisationName,
                template,
              }}
            />
          )}
        />
      </div>
      {submitError ? (
        <AlertMessage className="w-fit absolute bottom-10 right-8">
          {submitError}
        </AlertMessage>
      ) : null}
    </>
  )
}
