import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BotaoEnviarEmails } from '../../components/BotaoEnviarEmails'
import { ErroMensagem } from '../../components/ErroMensagem'
import { Spinner } from '../../components/Spinner'
import { useAlunos } from '../../hooks/useAlunos'
import { useEmailStatus } from '../../hooks/useEmailStatus'
import { useTurmas } from '../../hooks/useTurmas'
import { turmasApi } from '../../services/api'
import { extractMensagem } from '../../services/apiErrors'
import type { Turma } from '../../types'
import { TurmaForm } from './TurmaForm'

type DadosTurma = Omit<Turma, 'id' | 'avaliacoes'>
type Modo = { tipo: 'lista' } | { tipo: 'nova' } | { tipo: 'editar'; turma: Turma }

export function Turmas() {
  const { data: turmas, loading, error, refetch } = useTurmas()
  const { data: todosAlunos } = useAlunos()
  const { status: emailStatus, refetch: refetchEmail } = useEmailStatus()
  const [modo, setModo] = useState<Modo>({ tipo: 'lista' })
  const [salvando, setSalvando] = useState(false)
  const [erroServidor, setErroServidor] = useState<string | undefined>()

  async function handleSalvar({ alunoIds, ...metadados }: DadosTurma) {
    setSalvando(true)
    setErroServidor(undefined)
    try {
      if (modo.tipo === 'nova') {
        const nova = await turmasApi.criar(metadados)
        await turmasApi.atualizarAlunos(nova.id, alunoIds)
      } else if (modo.tipo === 'editar') {
        await Promise.all([
          turmasApi.atualizar(modo.turma.id, metadados),
          turmasApi.atualizarAlunos(modo.turma.id, alunoIds),
        ])
      }
      await refetch()
      setModo({ tipo: 'lista' })
    } catch (e: unknown) {
      setErroServidor(extractMensagem(e) ?? 'Erro ao salvar turma.')
    } finally {
      setSalvando(false)
    }
  }

  async function handleRemover(turma: Turma) {
    if (!confirm(`Remover turma "${turma.topico}"?`)) return
    try {
      await turmasApi.remover(turma.id)
      await refetch()
    } catch (e: unknown) {
      alert(extractMensagem(e) ?? 'Erro ao remover turma.')
    }
  }

  function handleEmailEnviado(ultimoEnvio: string | null) {
    refetchEmail()
    // se o servidor retornou ultimoEnvio atualizado, aplica otimisticamente
    if (emailStatus && ultimoEnvio) {
      // refetch já vai buscar o estado real
    }
  }

  if (loading) return <Spinner />
  if (error) return <ErroMensagem mensagem={error} />

  if (modo.tipo !== 'lista') {
    return (
      <div className="pagina">
        <h1>{modo.tipo === 'nova' ? 'Nova Turma' : 'Editar Turma'}</h1>
        <TurmaForm
          inicial={modo.tipo === 'editar' ? modo.turma : undefined}
          todosAlunos={todosAlunos}
          salvando={salvando}
          erroServidor={erroServidor}
          onSalvar={handleSalvar}
          onCancelar={() => { setModo({ tipo: 'lista' }); setErroServidor(undefined) }}
        />
      </div>
    )
  }

  return (
    <div className="pagina">
      <div className="pagina-cabecalho">
        <h1>Turmas</h1>
        <button onClick={() => { setModo({ tipo: 'nova' }); setErroServidor(undefined) }}>
          + Nova Turma
        </button>
      </div>

      {turmas.length === 0 ? (
        <p className="lista-vazia">Nenhuma turma cadastrada.</p>
      ) : (
        <table className="tabela">
          <thead>
            <tr>
              <th>Tópico</th>
              <th>Ano</th>
              <th>Semestre</th>
              <th>Alunos</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {turmas.map(turma => (
              <tr key={turma.id}>
                <td>
                  <Link to={`/turmas/${turma.id}`}>{turma.topico}</Link>
                </td>
                <td>{turma.ano}</td>
                <td>{turma.semestre}</td>
                <td>{turma.alunoIds.length}</td>
                <td className="acoes-celula">
                  <button onClick={() => { setModo({ tipo: 'editar', turma }); setErroServidor(undefined) }}>
                    Editar
                  </button>
                  <button className="btn-perigo" onClick={() => handleRemover(turma)}>
                    Remover
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <BotaoEnviarEmails status={emailStatus} onEnviado={handleEmailEnviado} />
    </div>
  )
}
