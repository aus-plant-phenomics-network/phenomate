import { Link } from '@tanstack/react-router'
import { useRouter } from '@tanstack/react-router'
import { TooltipInfo } from './TooltipInfo'


export default function Header() {
  
  const router = useRouter();
  const pathname = router.state.location.pathname;

  const isProjectPage = pathname === '/project';
  

    console.log(pathname);



  
  return (
    isProjectPage ? (
    <header className="p-2 flex gap-2 bg-white text-black justify-between mb-3">
      <nav className="flex flex-row">
	   
        <TooltipInfo contentText="Return to project list...">
          <div className="px-2 font-bold text-xl w-full px-4 py-2 rounded-full border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200">
            <Link to="/project">Phenomate Data Processing</Link> 
          </div>
	    </TooltipInfo>

      </nav>
    </header>
	
	)  : (
		<header className="p-2 flex gap-2 bg-white text-black justify-between mb-3">
          <nav className="flex flex-row">

          <div className="px-2 font-bold text-xl w-full px-4 py-2 rounded-full border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200">
            <Link to="/project">Phenomate Data Processing</Link> 
          </div>

      </nav>
    </header>
	)
  )
} 
