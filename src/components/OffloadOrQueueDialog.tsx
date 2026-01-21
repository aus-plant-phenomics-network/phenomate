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

import type { Row } from '@tanstack/react-table'
import type { components } from '@/lib/api/v1'

import { useAppDispatch } from '../store/hooks'
import { setForm }        from '../store/projectFormSlice'

// import { useSessionMirror } from '../utils/useSessionMirror'

interface OffloadOrQueueDialogProps {
  row: Row<components['schemas']['ProjectListSchema']>;
}

export const OffloadOrQueueDialog: React.FC<OffloadOrQueueDialogProps> = ({
  row,
}) =>
 {

  const navigate = useNavigate();
  const projectRowId = row.original.id.toString()
  const dispatch = useAppDispatch()

  const handleSelect = (option: 'Offload Data' | 'View Queue') => {  
	// useSessionMirror()
	// Save to Redux
	dispatch(
		setForm({
			projectData: row.original.project,
			siteData: row.original.site,
			platformData: row.original.platform,
			projectDirectory: row.original.location,
		})
	)

	if (option === 'Offload Data') {
        navigate({ to: `/project/$projectId/offload` , params: { projectId: projectRowId } })
    } else if (option === 'View Queue') {
	    navigate({ to: `/project/$projectId/activities` , params: { projectId: projectRowId } })
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
				 
				  <TooltipInfo contentText="Add Phenomate data files to queue for transfer to project folder">
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
				  
				 {/* <DeleteProjectDialog row={row} /> */}
				 
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
