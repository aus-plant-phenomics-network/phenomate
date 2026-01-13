// import { z } from 'zod'
import { useState, useEffect, useRef } from 'react'
import { $api } from '@/lib/api'
import type { components } from '@/lib/api/v1'

type ProjectPreviewInput = components['schemas']['ProjectPreviewSchema']

/*
const ProjectPreviewSchema = z.object({
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

type ProjectPreviewInput = z.infer<typeof ProjectPreviewSchema>
*/

// New preview component that calls the backend with current form inputs
export function ProjectPreview({
  input,
}: {
  input: Partial<ProjectPreviewInput>
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
        // setLoading(true)
        setError('')
        // previewMutation.mutate({ body: input })
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