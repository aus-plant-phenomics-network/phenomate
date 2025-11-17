'use client'

import * as React from 'react'
import {  useNavigate, useParams } from '@tanstack/react-router'
import { TooltipInfo } from './TooltipInfo'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from './ui/dialog' // Adjust the import path as needed

import type {  Row } from '@tanstack/react-table'
import type { components } from '@/lib/api/v1'

import { $api } from '@/lib/api'
// import { DeleteDialog } from './DeleteDialog'

/*

function DeleteActivityDialog({
  row,
}: {
  row: Row<components['schemas']['ActivitySchema']>
}) {
  const { projectId } = useParams({ strict: false })
  const navigate = useNavigate()
  const mutation = $api.useMutation(
    'delete',
    '/api/activity/activity/{activity_id}',
    {
      onSuccess: () =>
        navigate({
          to: '/project/$projectId/activities',
          reloadDocument: true,
          params: { projectId: projectId as string },
        }),
    },
  )
  const confirmHandler = () => {
    mutation.mutate({
      params: { path: { activity_id: row.original.id } },
    })
  }
  return (
	<TooltipInfo contentText="Remove the selected activity from the list">
    <DeleteDialog
      contentTitle="Delete Confirmation?"
      contentDescription="This will permanently delete the
            activity from the list and related backend logs. This action cannot be undone."
      confirmHandler={confirmHandler}
      asChild
    >
	
     <button
		className="w-full px-4 py-2 rounded-full bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 shadow-sm transition"
	  >
		Delete Activity
	</button>

    </DeleteDialog>
	</TooltipInfo>
  )
}*/


interface ActivityOptionsDialogProps {
  row: Row<components['schemas']['ActivitySchema']>;
}


export const ActivityOptionsDialog: React.FC<ActivityOptionsDialogProps> = ({
  row,
}) =>
 {
  const { projectId } = useParams({ strict: false })	
  const navigate = useNavigate();
  const activity_id = row.original.id.toString()
  // const rowIndex  = row.index + 1
  // const projectName = row.original.name.toString()
  const mutation = $api.useMutation(
    'post',
    '/api/activity/retry/{activity_id}',
    {
      onSuccess: () =>
        navigate({
          to: '/project/$projectId/activities',
          reloadDocument: true,
          params: { projectId: projectId as string },
        }),
    },
  )
  

  const handleSelect = (option: 'Activity Details' | 'Rerun Activity') => {    
	if (option === 'Activity Details') {
        
		navigate({
			  to: '/activity/$activityId',
			  params: { activityId: row.original.id.toString() },
			});

	}	else if (option === 'Rerun Activity') {
	    mutation.mutate({
            params: { path: { activity_id: row.original.id } },
          })
    } 
  }

  return (
			<Dialog>
			  
			  <DialogTrigger asChild>
				
				<a
				  href="#"
				  className="w-full px-4 py-2 rounded-full bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 shadow-sm transition"
				 >
				 Show Details
				 </a>
				 
				</DialogTrigger> 
			  <DialogContent>
			  
				<DialogHeader>
				  <DialogTitle className="text-med text-gray-500"> Select operation for activity (pid: {activity_id}):</DialogTitle>
				</DialogHeader>
				
				<div className="flex flex-col gap-3 mt-4">
				 
				  <TooltipInfo contentText="Show the activity logs">
				    <button
					  className="w-full px-4 py-2 rounded-full bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 shadow-sm transition"
					  onClick={() => handleSelect('Activity Details')}
					>
					  Show Activity Details
					</button>
					
				  </TooltipInfo>

				 
				 
				</div>

				<DialogFooter>
				  <DialogClose asChild>
					<button className="w-full px-4 py-2 rounded-full bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors duration-200">
					  Cancel
					</button>
				  </DialogClose>
				</DialogFooter>
				 
			  </DialogContent>
			</Dialog>
  )
  
   /*
     <TooltipInfo contentText="View the queue of offload tasks">
		<button
		  className="w-full px-4 py-2 rounded-full bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 shadow-sm transition"
		  onClick={() => handleSelect('Rerun Activity')}
		>
		  Rerun Activity
		</button>
	  </TooltipInfo>
	  
	 <DeleteActivityDialog row={row} />
	 
	 */
}

export default ActivityOptionsDialog
