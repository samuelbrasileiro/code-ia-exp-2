import { useMemo, useState } from 'react'
import { turmasApi } from '../../services/api'
import type { Aluno } from '../../types'

interface Props {
  turmaId: string
  alunosMatriculados: Aluno[]
  todosAlunos: Aluno[]
  onAtualizar: () => void
}

export function MatriculaAlunos({ turmaId, alunosMatriculados, todosAlunos, onAtualizar }: Props) {
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const idsSelecionados = useMemo(
    () => new Set(alunosMatriculados.map(a => a.id)),
    [alunosMatriculados]
  )

  async function toggleAluno(alunoId: string) {
    const novosIds = idsSelecionados.has(alunoId)
      ? [...idsSelecionados].filter(id => id !== alunoId)
      : [...idsSelecionados, alunoId]

    setSalvando(true)
    setErro(null)
    try {
      await turmasApi.atualizarAlunos(turmaId, novosIds)
      onAtualizar()
    } catch {
      setErro('Erro ao atualizar matrículas.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <section className="matricula-section">
      <h2>Alunos Matriculados</h2>
      {erro && <p className="campo-erro">{erro}</p>}
      <ul className="matricula-lista">
        {todosAlunos.map(aluno => (
          <li key={aluno.id}>
            <label>
              <input
                type="checkbox"
                checked={idsSelecionados.has(aluno.id)}
                onChange={() => toggleAluno(aluno.id)}
                disabled={salvando}
              />
              {aluno.nome} ({aluno.cpf})
            </label>
          </li>
        ))}
      </ul>
    </section>
  )
}
