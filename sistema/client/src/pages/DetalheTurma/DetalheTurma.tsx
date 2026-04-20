import { useNavigate, useParams } from 'react-router-dom'
import { ErroMensagem } from '../../components/ErroMensagem'
import { Spinner } from '../../components/Spinner'
import { useDetalheTurma } from '../../hooks/useDetalheTurma'
import { TabelaAvaliacoes } from './TabelaAvaliacoes'

export function DetalheTurma() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { turma, alunos, metas, avaliacoes, loading, error } = useDetalheTurma(id ?? '')

  if (loading) return <Spinner />
  if (error || !turma) return <ErroMensagem mensagem={error ?? 'Turma não encontrada.'} />

  return (
    <div className="pagina">
      <button className="btn-voltar" onClick={() => navigate('/turmas')}>
        ← Voltar
      </button>

      <h1>{turma.topico}</h1>
      <p className="turma-meta">
        {turma.ano} — {turma.semestre}º semestre
      </p>

      <TabelaAvaliacoes
        turmaId={turma.id}
        alunos={alunos}
        metas={metas}
        avaliacoes={avaliacoes}
      />
    </div>
  )
}
