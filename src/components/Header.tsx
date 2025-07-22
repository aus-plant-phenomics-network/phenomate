import { Link } from '@tanstack/react-router'

export default function Header() {
  return (
    <header className="p-2 flex gap-2 bg-white text-black justify-between mb-3">
      <nav className="flex flex-row">
        <div className="px-2 font-bold text-xl">
          <Link to="/project">Phenomate</Link>
        </div>
      </nav>
    </header>
  )
}
