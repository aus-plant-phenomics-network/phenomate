import * as React from 'react'

export function createContext<T>(
  rootComponentName: string,
  defaultContext?: T,
) {
  const Context = React.createContext<T | undefined>(defaultContext)

  function Provider({
    value,
    children,
  }: {
    value?: T
    children: React.ReactNode
  }) {
    const _value = value
      ? React.useMemo(() => value, Object.values(value))
      : defaultContext
    return <Context.Provider value={_value}>{children}</Context.Provider>
  }

  function useContext() {
    const context = React.useContext(Context)
    if (context) return context
    if (defaultContext !== undefined) return defaultContext
    // if a defaultContext wasn't specified, it's a required context.
    throw new Error(`context must be used within \`${rootComponentName}\``)
  }

  Provider.displayName = rootComponentName + 'Provider'
  return [Provider, useContext] as const
}

export interface PhenomateContext {
  timezone: string
  setTimezone: (tz: string) => void
  address: string
  setAddress: (addr: string) => void
}

const [PhenomateProvider, usePhenomate] =
  createContext<PhenomateContext>('PhenomateProvider')

export { PhenomateProvider, usePhenomate }
