import { useEffect, useState } from 'react'
import type { Aluno, Turma } from '../../types'

type DadosTurma = Omit<Turma, 'id' | 'avaliacoes'>

interface Props {
  inicial?: Turma
  todosAlunos: Aluno[]
  salvando: boolean
  erroServidor?: string
  onSalvar: (dados: DadosTurma) => void
  onCancelar: () => void
}

const ANO_ATUAL = new Date().getFullYear()

export function TurmaForm({ inicial, todosAlunos, salvando, erroServidor, onSalvar, onCancelar }: Props) {
  const [topico, setTopico] = useState(inicial?.topico ?? '')
  const [ano, setAno] = useState(inicial?.ano ?? ANO_ATUAL)
  const [semestre, setSemestre] = useState(inicial?.semestre ?? 1)
  const [alunoIds, setAlunoIds] = useState<string[]>(inicial?.alunoIds ?? [])
  const [tocado, setTocado] = useState({ topico: false })

  useEffect(() => {
    setTopico(inicial?.topico ?? '')
    setAno(inicial?.ano ?? ANO_ATUAL)
    setSemestre(inicial?.semestre ?? 1)
    setAlunoIds(inicial?.alunoIds ?? [])
    setTocado({ topico: false })
  }, [inicial])

  const errTopico = tocado.topico && !topico.trim() ? 'Tópico é obrigatório.' : ''
  const invalido = !topico.trim()

  function toggleAluno(id: string) {
    setAlunoIds(ids =>
      ids.includes(id) ? ids.filter(i => i !== id) : [...ids, id]
    )
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (invalido) return
    onSalvar({ topico: topico.trim(), ano, semestre, alunoIds })
  }

  return (
    <form className="form-card" onSubmit={handleSubmit} noValidate>
      <div className="form-field">
        <label htmlFor="topico">Tópico</label>
        <input
          id="topico"
          value={topico}
          onChange={e => setTopico(e.target.value)}
          onBlur={() => setTocado(t => ({ ...t, topico: true }))}
          disabled={salvando}
        />
        {errTopico && <span className="campo-erro">{errTopico}</span>}
      </div>

      <div className="form-field">
        <label htmlFor="ano">Ano</label>
        <input
          id="ano"
          type="number"
          min={2000}
          max={2100}
          value={ano}
          onChange={e => setAno(Number(e.target.value))}
          disabled={salvando}
        />
      </div>

      <div className="form-field">
        <label htmlFor="semestre">Semestre</label>
        <select
          id="semestre"
          value={semestre}
          onChange={e => setSemestre(Number(e.target.value))}
          disabled={salvando}
        >
          <option value={1}>1</option>
          <option value={2}>2</option>
        </select>
      </div>

      {todosAlunos.length > 0 && (
        <div className="form-field">
          <label>Alunos matriculados</label>
          <ul className="matricula-lista">
            {todosAlunos.map(aluno => (
              <li key={aluno.id}>
                <label>
                  <input
                    type="checkbox"
                    checked={alunoIds.includes(aluno.id)}
                    onChange={() => toggleAluno(aluno.id)}
                    disabled={salvando}
                  />
                  {aluno.nome} ({aluno.cpf})
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}

      {erroServidor && <p className="campo-erro">{erroServidor}</p>}

      <div className="form-acoes">
        <button type="submit" disabled={invalido || salvando}>
          {salvando ? 'Salvando…' : 'Salvar'}
        </button>
        <button type="button" onClick={onCancelar} disabled={salvando}>
          Cancelar
        </button>
      </div>
    </form>
  )
}
