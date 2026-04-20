import { Link, useLocation } from 'react-router-dom'

export function Navbar() {
  const { pathname } = useLocation()

  return (
    <nav className="navbar">
      <span className="navbar-brand">Gestão de Alunos</span>
      <div className="navbar-links">
        <Link to="/alunos" className={pathname.startsWith('/alunos') ? 'active' : ''}>
          Alunos
        </Link>
        <Link to="/turmas" className={pathname.startsWith('/turmas') ? 'active' : ''}>
          Turmas
        </Link>
      </div>
    </nav>
  )
}
