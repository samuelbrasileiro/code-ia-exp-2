import { useState } from 'react'
import { ErroMensagem } from '../../components/ErroMensagem'
import { Spinner } from '../../components/Spinner'
import { useAlunos } from '../../hooks/useAlunos'
import { alunosApi } from '../../services/api'
import { extractMensagem } from '../../services/apiErrors'
import type { Aluno } from '../../types'
import { AlunoForm } from './AlunoForm'

type Modo = { tipo: 'lista' } | { tipo: 'novo' } | { tipo: 'editar'; aluno: Aluno }

export function Alunos() {
  const { data: alunos, loading, error, refetch } = useAlunos()
  const [modo, setModo] = useState<Modo>({ tipo: 'lista' })
  const [salvando, setSalvando] = useState(false)
  const [erroServidor, setErroServidor] = useState<string | undefined>()

  async function handleSalvar(dados: Omit<Aluno, 'id'>) {
    setSalvando(true)
    setErroServidor(undefined)
    try {
      if (modo.tipo === 'novo') {
        await alunosApi.criar(dados)
      } else if (modo.tipo === 'editar') {
        await alunosApi.atualizar(modo.aluno.id, dados)
      }
      await refetch()
      setModo({ tipo: 'lista' })
    } catch (e: unknown) {
      const msg = extractMensagem(e) ?? 'Erro ao salvar aluno.'
      setErroServidor(msg)
    } finally {
      setSalvando(false)
    }
  }

  async function handleRemover(aluno: Aluno) {
    if (!confirm(`Remover "${aluno.nome}"?`)) return
    try {
      await alunosApi.remover(aluno.id)
      await refetch()
    } catch (e: unknown) {
      alert(extractMensagem(e) ?? 'Erro ao remover aluno.')
    }
  }

  if (loading) return <Spinner />
  if (error) return <ErroMensagem mensagem={error} />

  if (modo.tipo !== 'lista') {
    return (
      <div className="pagina">
        <h1>{modo.tipo === 'novo' ? 'Novo Aluno' : 'Editar Aluno'}</h1>
        <AlunoForm
          inicial={modo.tipo === 'editar' ? modo.aluno : undefined}
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
        <h1>Alunos</h1>
        <button onClick={() => { setModo({ tipo: 'novo' }); setErroServidor(undefined) }}>
          + Novo Aluno
        </button>
      </div>

      {alunos.length === 0 ? (
        <p className="lista-vazia">Nenhum aluno cadastrado.</p>
      ) : (
        <table className="tabela">
          <thead>
            <tr>
              <th>Nome</th>
              <th>CPF</th>
              <th>E-mail</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {alunos.map(aluno => (
              <tr key={aluno.id}>
                <td>{aluno.nome}</td>
                <td>{aluno.cpf}</td>
                <td>{aluno.email}</td>
                <td className="acoes-celula">
                  <button onClick={() => { setModo({ tipo: 'editar', aluno }); setErroServidor(undefined) }}>
                    Editar
                  </button>
                  <button className="btn-perigo" onClick={() => handleRemover(aluno)}>
                    Remover
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

