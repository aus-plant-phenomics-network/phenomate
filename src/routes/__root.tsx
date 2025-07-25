import { Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

import Header from '../components/Header'

export const Route = createRootRoute({
  component: () => (
    <div className="h-screen flex justify-center">
      <div className="w-[410px] sm:w-[600px] lg:w-[1000px] xl:w-[1200px] flex flex-col items-center h-screen gap-y-4 px-2 pb-6">
        <Header />
        <Outlet />
        <TanStackRouterDevtools />
      </div>
    </div>
  ),
})
