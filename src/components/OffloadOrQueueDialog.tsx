'use client'

import * as React from 'react'
import { useNavigate } from '@tanstack/react-router'
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

import type { ColumnDef, Row } from '@tanstack/react-table'
import type { components } from '@/lib/api/v1'

import { $api } from '@/lib/api'
import { DeleteDialog } from './DeleteDialog'




function DeleteProjectDialog({
  row,
}: {
  row: Row<components['schemas']['ProjectListSchema']>
}) {
  const navigate = useNavigate()
  const mutation = $api.useMutation('delete', '/api/project/{project_id}', {
    onSuccess: () => navigate({ to: '/project', reloadDocument: true }),
  })
  const confirmHandler = () => {
    mutation.mutate({
      params: { path: { project_id: row.original.id } },
    })
  }
  return (
    <DeleteDialog
      contentTitle="Delete Confirmation?"
      contentDescription="This will remove the Project row
            (the project data will remain). The project can be re-imported at a later stage to add more data."
      confirmHandler={confirmHandler}
      asChild
    >
     <button
		className="w-full px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition"
	  >
		Delete Row
	</button>
    </DeleteDialog>
  )
}



//interface OffloadOrQueueDialogProps {
//  rowNumber: string | number
//}

export const OffloadOrQueueDialog: React.FC<OffloadOrQueueDialogProps> = ({
  row,
}: {
  row: Row<components['schemas']['ProjectListSchema']>
}) => {
	
  const navigate = useNavigate();
  const rowNumber = row.original.id.toString()
	
  const handleSelect = (option: 'Offload Data' | 'View Queue') => {    
	if (option === 'Offload Data') {
        navigate({ to: `/project/${rowNumber}/offload` })
    } else if (option === 'View Queue') {
	    navigate({ to: `/project/${rowNumber}/activities` })
    } 
	
  }

  return (
  
		
		
			<Dialog>
			  <DialogTrigger asChild>
				<a
				  href="#"
				  className="inline-block px-4 py-2 bg-green-600 text-white rounded hover:bg-blue-650 transition w-full text-center"
				 logTrigger>
				 Select Action
				 </a>
				</DialogTrigger> 
			  <DialogContent>
			  
				<DialogHeader>
				  <DialogTitle>Choose an action for project {rowNumber}</DialogTitle>
				</DialogHeader>
				
				
				<div className="flex flex-col gap-3 mt-4">
				 
				 <TooltipInfo contentText="Select .bin data files for extraction">
				 <button
					className="w-full px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 transition"
					onClick={() => handleSelect('Offload Data')}
				  >
					Select Offload Data
				  </button>
				   </TooltipInfo>
				  
	  
				  <TooltipInfo contentText="View the queue of offload tasks for the currently selected project">
				  <button
					className="w-full px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 transition"
					onClick={() => handleSelect('View Queue')}
				   >
					View Queue
				  </button>
				  </TooltipInfo>
				  
				 <DeleteProjectDialog row={row} />
				 </div>
				 
				 
				
				
				
				<DialogFooter>
				  <DialogClose asChild>
					<button className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-650 transition w-full text-center">
					  Cancel
					</button>
				  </DialogClose>
				</DialogFooter>
				 
			  </DialogContent>
			  
			</Dialog>
  )
}

export default OffloadOrQueueDialog
