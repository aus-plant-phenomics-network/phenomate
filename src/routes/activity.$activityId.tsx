import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/activity/$activityId')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/activity/$activityId"!</div>
}
