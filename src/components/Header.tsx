import { Link } from '@tanstack/react-router'
import { useRouter } from '@tanstack/react-router'
import { TooltipInfo } from './TooltipInfo'



export default function Header() {
  
  const router = useRouter();
  const pathname = router.state.location.pathname;

  // const isProjectPage = pathname === '/project';
  console.log(pathname);

  return (
    <header >
      <nav className="flex flex-col ">
	   
        <TooltipInfo contentText="Return to project list...">
          <div className="px-2 font-bold justify-center text-xl w-full px-4 py-2 rounded-md border border-gray-300 text-gray-700 bg-white">
            <Link className="px-2 font-bold justify-center" to="/project">Phenomate Data Processing</Link> 
          </div>
	    </TooltipInfo>
		<nav className="flex flex-row ">
		  <button className="w-full px-4 py-2 rounded-full bg-grey-50 text-grey-700 border border-grey-200 hover:bg-grey-100 shadow-sm transition" 
		            onClick={() => router.history.back()}>← Back</button>
		
		  <button className="w-full px-4 py-2 rounded-full bg-grey-50 text-grey-700 border border-grey-200 hover:bg-grey-100 shadow-sm transition" 
		            onClick={() => router.history.forward()}>Forward →</button>

      </nav>
	  </nav>
    </header>
	
	
  )
} 
