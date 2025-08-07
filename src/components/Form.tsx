import { AlertCircleIcon } from 'lucide-react'
import type { AnyFieldApi } from '@tanstack/react-form'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export function FieldInfo({ field }: { field: AnyFieldApi }) {
  return (
    <>
      {field.state.meta.isTouched && !field.state.meta.isValid
        ? field.state.meta.errors.map(item => (
            <em className="text-red-500" key={item.code}>
              {item.message}
            </em>
          ))
        : null}
    </>
  )
}

export function Fieldset(props: React.ComponentProps<'fieldset'>) {
  const { children, ...rest } = props
  return (
    <fieldset className="grid grid-cols-2 gap-4" {...rest}>
      {children}
    </fieldset>
  )
}

export function AlertMessage(props: React.ComponentProps<'div'>) {
  const { children, ...rest } = props
  return (
    <Alert variant="destructive" {...rest}>
      <AlertCircleIcon />
      <AlertTitle>Submission Error</AlertTitle>
      <AlertDescription children={children} />
    </Alert>
  )
}
