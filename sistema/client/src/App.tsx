import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { DetalheTurma } from './pages/DetalheTurma/DetalheTurma'
import { Alunos } from './pages/Alunos/Alunos'
import { Turmas } from './pages/Turmas/Turmas'
import './index.css'

export default function App() {
  return (
    <Router>
      <Navbar />
      <main className="conteudo">
        <Routes>
          <Route path="/" element={<Navigate to="/alunos" replace />} />
          <Route path="/alunos" element={<Alunos />} />
          <Route path="/turmas" element={<Turmas />} />
          <Route path="/turmas/:id" element={<DetalheTurma />} />
        </Routes>
      </main>
    </Router>
  )
}
