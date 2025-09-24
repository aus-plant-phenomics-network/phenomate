/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  ChonkyActions,
  FileHelper,
  FullFileBrowser,
} from '@aperturerobotics/chonky'
import { ChonkyIconFA } from '@aperturerobotics/chonky-icon-fontawesome'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'
import { Button } from './ui/button'
import type {
  ChonkyFileActionData,
  FileBrowserHandle,
  FileData,
} from '@aperturerobotics/chonky'
import { $api } from '@/lib/api'
import { usePhenomate } from '@/lib/context'
import { TooltipInfo } from './TooltipInfo'

// AddressBar
export interface AddressBarProps {
  currentAddress: string
  setCurrentAddress: (value: string) => void
}

export const AddressBar = (
  props: AddressBarProps & React.ComponentProps<'input'>,
) => {
  const { currentAddress, setCurrentAddress, ...rest } = props
  const [inputValue, setInputValue] = useState(currentAddress)

  // Sync inputValue and currentAddress
  useEffect(() => {
    if (currentAddress !== inputValue) {
      setInputValue(currentAddress)
    }
  }, [currentAddress])

  // Pressing enter or out of focus -> set current address
  const commitChange = () => {
    if (inputValue !== currentAddress) {
      setCurrentAddress(inputValue)
    }
  }

  return (
    <input
      {...rest}
      type="text"
      value={inputValue}
      onChange={e => setInputValue(e.target.value)}
      onBlur={commitChange}
      onKeyDown={e => {
        if (e.key === 'Enter') {
          commitChange()
          e.currentTarget.blur()
        }
      }}
    />
  )
}

// Content
export interface BaseVFSProps {
  title: string
  children: React.ReactNode
  description: string
  multiple: boolean
  dirOnly: boolean
  addSelectedFiles: (files: Array<FileData>) => void
}

export interface VFSProps extends Omit<BaseVFSProps, 'children'> {
  triggerText: string
}

export const useFolderChain = (currentAddress: string): Array<FileData> => {
  if (!currentAddress.startsWith('/')) {
    throw new Error('Path must start with "/"')
  }
  const parts = currentAddress.split('/').filter(p => p !== '')
  const result = []
  let currentPath = ''
  for (const part of parts) {
    currentPath += `/${part}`
    result.push({ id: currentPath, name: part, isDir: true })
  }
  return result
}

export const useFileActionHandler = (
  setCurrentAddress: (addr: string) => void,
  setDisabledState?: (files: Array<FileData>) => void,
) => {
  return useCallback(
    (data: ChonkyFileActionData) => {
      // Navigation
      if (data.id === ChonkyActions.OpenFiles.id) {
        const { targetFile, files } = data.payload
        const fileToOpen = targetFile ?? files[0]
        if (fileToOpen && FileHelper.isDirectory(fileToOpen)) {
          setCurrentAddress(fileToOpen.id)
          return
        } // File selection
      } else if (data.id === ChonkyActions.ChangeSelection.id) {
        const selectedFiles = data.state.selectedFiles
        if (setDisabledState) setDisabledState(selectedFiles)
      }
    },
    [setCurrentAddress, setDisabledState],
  )
}

/**
 * Handle the onClick event of the select button in the VFSContent component
 *
 * File(s) and/or Folder(s) currently selected in the VFS will be
 * added to the selectedFiles state value using addSelectedFiles handler
 *
 * @param files - all FileData currently visible under the currentAddress (folder)
 * @param fileBrowserHandleRef - ref to Chonky fileBrowserHandle with selection apis
 * @param addSelectedFiles - handler for the state variable selectedFiles
 * @returns - onClick event handler
 */
export const handleSelect = (
  files: Array<FileData> | undefined,
  fileBrowserHandleRef: React.RefObject<FileBrowserHandle | null>,
  addSelectedFiles?: (files: Array<FileData>) => void,
) => {
  if (!fileBrowserHandleRef.current || !addSelectedFiles || !files)
    return undefined
  const fileBrowserHandle = fileBrowserHandleRef.current
  return () => {
    const currentSelection = fileBrowserHandle.getFileSelection()
    const selectedFile = files.filter(item => currentSelection.has(item.id))
    addSelectedFiles(selectedFile)
    // Clean up - remove all selected file in Chonky's internal store
    fileBrowserHandle.setFileSelection(new Set())
  }
}

/**
 * Callback that determines the disable state of the Submit button for file selection
 *
 * If no file is selected => disabled
 * If not multiple but multiple files are selected => disabled
 */
function handleDisabledState(
  multiple: boolean,
  setDisabled: (value: boolean) => void,
) {
  return useCallback(
    (files: Array<FileData>) => {
      if (files.length == 0 || (!multiple && files.length > 1))
        setDisabled(true)
      else setDisabled(false)
    },
    [multiple, setDisabled],
  )
}

/**
 * Renders Shadcn's `Dialog` components with Chonky `FullFileBrowser` in `DialogContent`.
 */
export const BaseVFS = ({
  title,
  children,
  description,
  multiple,
  dirOnly,
  addSelectedFiles,
}: BaseVFSProps) => {
  const { address, setAddress } = usePhenomate()
  // Chonky Ref for imperative FS apis
  const fileBrowserRef = useRef<FileBrowserHandle>(null)
  // Chonky's files and folder chain query hook
  const folderChain = useFolderChain(address)
  const queryResult = $api.useQuery('get', '/api/urls/', {
    params: {
      query: {
        src: address,
        dirOnly: dirOnly,
      },
    },
  })
  // Select button disable state logic
  const [disabled, setDisabled] = useState<boolean>(true)
  const setDisabledState = handleDisabledState(multiple, setDisabled)
  const onClickHandler = handleSelect(
    queryResult.data,
    fileBrowserRef,
    addSelectedFiles,
  )
  // Chonky FileHandling Logic
  const handleFileAction = useFileActionHandler(setAddress, setDisabledState)
  return (
    // modal = True will mess up Chonky's own popup window
    <Dialog modal={false}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="flex flex-col h-[600px] md:max-w-[900px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
          <AddressBar
            className="px-2 py-1 w-1/1 rounded border-1"
            currentAddress={address}
            setCurrentAddress={setAddress}
          />
        </DialogHeader>
        <FullFileBrowser
          ref={fileBrowserRef}
          files={
            queryResult.isError
              ? []
              : queryResult.isSuccess
                ? queryResult.data
                : [null]
          }
          folderChain={folderChain}
          onFileAction={handleFileAction}
          iconComponent={ChonkyIconFA as any}
        />
        <DialogFooter>
          <DialogClose asChild>
            <Button onClick={onClickHandler} disabled={disabled}>
              Add To List
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export const VFS = ({
  title,
  triggerText,
  description,
  multiple,
  dirOnly,
  addSelectedFiles,
}: VFSProps) => {
  return (
    <BaseVFS
      title={title}
      description={description}
      multiple={multiple}
      dirOnly={dirOnly}
      addSelectedFiles={addSelectedFiles}
    >
	  <TooltipInfo contentText="Select .bin data files for conversion">
      <Button className="w-full px-4 py-2 rounded-full bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 shadow-sm transition" >
        <p className="overflow-hidden">{triggerText}</p>
      </Button>
	  </TooltipInfo>
    </BaseVFS>
  )
}
