import { createFileRoute } from '@tanstack/react-router'

import { useState } from 'react'

import type { FileData } from '@aperturerobotics/chonky'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { VFS } from '@/components/VFS'

export const Route = createFileRoute('/')({
  component: App,
})

const ROOT_FOLDER = '/home'

export function FileTable({
  selectedFiles,
  removeFile,
}: {
  selectedFiles: Array<string>
  removeFile: (file: string) => void
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Path</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className="flex flex-col">
        {selectedFiles.map((item) => (
          <TableRow key={item}>
            <TableCell>
              <button className="w-full" onClick={() => removeFile(item)}>
                {item}
              </button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default function App() {
  const [selectedFiles, setSelectedFile] = useState<Array<FileData>>([])
  const addSelectedFiles = (files: Array<FileData>) => {
    const currIDs = new Set(selectedFiles.map((item) => item.id))
    const filesToAdd = files.filter((item) => !currIDs.has(item.id))
    setSelectedFile([...selectedFiles, ...filesToAdd])
  }
  console.log(selectedFiles)
  return (
    <VFS
      title="Select Offload Data"
      description="Select files or folders to offload to project"
      triggerText="Select Offload Data"
      multiple={true}
      dirOnly={false}
      baseAddr={ROOT_FOLDER}
      addSelectedFiles={addSelectedFiles}
    />
  )
}

// export function AppTest() {
//   const [srcFiles, setSrcFiles] = useState<Set<string>>(new Set())
//   const [dstFolder, setDst] = useState<string>('')
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     const formData = new FormData()
//     for (const f of srcFiles) formData.append('src_files', f)
//     formData.append('site', dstFolder)
//     try {
//       const response = await fetch(OFFLOAD_URL, {
//         method: 'POST',
//         body: formData,
//       })

//       if (!response.ok) {
//         throw new Error('Failed to submit data')
//       }

//       const result = await response.json()
//       console.log('Success:', result)
//     } catch (err) {
//       console.error('Error:', err)
//     }
//   }

//   // Handlers for updating source files and destination folder
//   const updateSrcFiles = (files: Set<string>) => {
//     setSrcFiles(prev => {
//       return new Set([...prev, ...files])
//     })
//   }
//   const removeSrcFile = (file: string) => {
//     setSrcFiles(prev => {
//       return new Set([...prev].filter(item => item != file))
//     })
//   }
//   const setDstFolder = (files: Set<string>) => {
//     const array = [...files]
//     console.log(array)
//     if (array.length != 1) setDst('')
//     else setDst(array[0])
//   }
//   const removeDstFile = () => {
//     setDst('')
//   }
//   return (
//     <div className="flex gap-x-4 h-11/12">
//       <div className="form-panel p-6 rounded-lg border-2 h-fit">
//         <div className="col-span-1 flex flex-col gap-y-4">
//           <h2 className="text-2xl font-bold mx-4 my-3">Data Offload</h2>
//           <div className="mt-5 mb-12 flex flex-col gap-y-4">
//             <SelectSourceFilesVFS setSelectedFile={updateSrcFiles} />
//             <SelectDstFolderVFS setSelectedFile={setDstFolder} />
//           </div>
//           <form id="offload-form" onSubmit={handleSubmit}>
//             <input
//               name="src_files"
//               hidden
//               type="select"
//               multiple
//               value={[...srcFiles]}
//             />
//             <input name="site" hidden type="text" value={dstFolder} />
//           </form>
//           <Button form="offload-form" type="submit">
//             Submit
//           </Button>
//         </div>
//       </div>
//       <div className="flex-grow-1 rounded-lg border-2 h-10/12 max-w-[800px]">
//         <Tabs defaultValue="src" className="rounded-t-lg h-full">
//           <TabsList>
//             <TabsTrigger className="text-lg" value="src">
//               Source Data
//             </TabsTrigger>
//             <TabsTrigger className="text-lg" value="dst">
//               Destination Folder
//             </TabsTrigger>
//           </TabsList>
//           <TabsContent value="src" className="p-4 overflow-y-auto">
//             <FileTable
//               selectedFiles={[...srcFiles]}
//               removeFile={removeSrcFile}
//             />
//           </TabsContent>
//           <TabsContent value="dst" className="p-4 overflow-y-auto">
//             <FileTable selectedFiles={[dstFolder]} removeFile={removeDstFile} />
//           </TabsContent>
//         </Tabs>
//       </div>
//     </div>
//   )
// }
