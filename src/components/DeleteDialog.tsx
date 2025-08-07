import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './ui/alert-dialog'
import { Button } from './ui/button'

export interface DeleteDialogProps {
  children: React.ReactNode
  contentTitle: string
  contentDescription: string
  confirmHandler?: React.ReactEventHandler<HTMLButtonElement>
  asChild?: boolean
}

export function DeleteDialog(props: DeleteDialogProps) {
  const {
    asChild,
    children,
    contentTitle,
    contentDescription,
    confirmHandler,
  } = props
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild={asChild}>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{contentTitle}</AlertDialogTitle>
          <AlertDialogDescription>{contentDescription}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button variant="destructive" onClick={confirmHandler}>
              Continue
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
