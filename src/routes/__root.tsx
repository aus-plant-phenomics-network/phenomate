import { Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

import { useState } from 'react'
import Header from '../components/Header'
import type { PhenomateContext } from '@/lib/context'
import { PhenomateProvider } from '@/lib/context'

export const currentTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

export const Route = createRootRoute({
  component: () => {
    // Define Phenomate context
    const [timezone, setTimezone] = useState<string>(currentTimeZone)
    const [address, setAddress] = useState<string>(
      import.meta.env.VITE_VFS_BASE_ADDR,
    )
    const contextValue: PhenomateContext = {
      timezone: timezone,
      setTimezone: setTimezone,
      address: address,
      setAddress: setAddress,
    }
    return (
      <PhenomateProvider value={contextValue}>
        <div className="h-screen flex justify-center">
          <div className="w-[410px] sm:w-[600px] lg:w-[1000px] xl:w-[1200px] flex flex-col items-center h-screen gap-y-4 px-2 pt-8 pb-15 relative">
            <Header />
            <Outlet />
            <TanStackRouterDevtools />
          </div>
        </div>
      </PhenomateProvider>
    )
  },
})
