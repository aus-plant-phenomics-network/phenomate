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
  
  // This functionality runs in backend/project/api.py -> def delete_project/s()
  const mutation = $api.useMutation('delete', '/api/project/{project_id}', {
    onSuccess: () => navigate({ to: '/project', reloadDocument: true }),
  })
  
  const confirmHandler = () => {
    mutation.mutate({
      params: { path: { project_id: row.original.id } },
    })
  }
  return (
    <TooltipInfo contentText="Remove the selected project from the list">
    <DeleteDialog
      contentTitle="Delete Confirmation?"
      contentDescription="This will remove the Project row from the table
            (the project data will remain). The project directory can be re-imported at a later stage to add more data."
      confirmHandler={confirmHandler}
      asChild
    >
	
     <button
		className="w-full px-4 py-2 rounded-full bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 shadow-sm transition"
	  >
		Remove Row
	</button>

    </DeleteDialog>
	</TooltipInfo>
  )
}


interface OffloadOrQueueDialogProps {
  row: Row<components['schemas']['ProjectListSchema']>;
}


export const OffloadOrQueueDialog: React.FC<OffloadOrQueueDialogProps> = ({
  row,
}) =>
 {
	
  const navigate = useNavigate();
  const projectRowId = row.original.id.toString()
  // const rowIndex  = row.index + 1
  const projectName = row.original.name.toString()	

  const handleSelect = (option: 'Offload Data' | 'View Queue') => {    
	if (option === 'Offload Data') {
        navigate({ to: `/project/${projectRowId}/offload` })
    } else if (option === 'View Queue') {
	    navigate({ to: `/project/${projectRowId}/activities` })
    } 
  }

  return (
			<Dialog>
			  
			  <DialogTrigger asChild>
				
				<a
				  href="#"
				  className="w-full px-4 py-2 rounded-full bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 shadow-sm transition"
				 >
				 Select Action
				 </a>
				 
				</DialogTrigger> 
			  <DialogContent>
			  
				<DialogHeader>
				  <DialogTitle className="text-med text-gray-500"> Select operation for project (pid: {projectRowId}):</DialogTitle>
				</DialogHeader>
				
				
				<div className="flex flex-col gap-3 mt-4">
				 
				  <TooltipInfo contentText="Add data (.bin) to queue for extraction">
				    <button
					  className="w-full px-4 py-2 rounded-full bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 shadow-sm transition"
					  onClick={() => handleSelect('Offload Data')}
					>
					  Select Offload Data
					</button>
				  </TooltipInfo>

				  <TooltipInfo contentText="View the queue of offload tasks">
				    <button
				      className="w-full px-4 py-2 rounded-full bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 shadow-sm transition"
					  onClick={() => handleSelect('View Queue')}
				    >
					  View Queue
				    </button>
				  </TooltipInfo>
				  
				 <DeleteProjectDialog row={row} />
				 
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
}

export default OffloadOrQueueDialog
