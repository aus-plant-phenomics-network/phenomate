import { createFileRoute } from '@tanstack/react-router'
import { $api, queryClient } from '@/lib/api'

const queryOption = (activityId: string) =>
  $api.queryOptions('get', '/api/activity/activity/{activity_id}', {
    params: { path: { activity_id: String(activityId) } },
  })

export const Route = createFileRoute('/activity/$activityId')({
  component: RouteComponent,
  loader: ({ params }) =>
    queryClient.ensureQueryData(queryOption(params.activityId)),
})

function RouteComponent() {
  const data = Route.useLoaderData()
  return (
    <div className="w-full overflow-auto">
      <div>Activity: {data.activity}</div>
      <div>Filename: {data.filename}</div>
      <div>Target: {data.target}</div>
      <div>Created: {data.created}</div>
      <div>Updated: {data.updated}</div>
      <div>Status: {data.status}</div>
      <pre>Error: {data.error_log}</pre>
    </div>
  )
}
