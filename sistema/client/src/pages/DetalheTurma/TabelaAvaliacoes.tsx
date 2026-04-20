import { useMemo } from 'react'
import type { Aluno, Avaliacao, Conceito, Meta } from '../../types'
import { CelulaAvaliacao } from './CelulaAvaliacao'

interface Props {
  turmaId: string
  alunos: Aluno[]
  metas: Meta[]
  avaliacoes: Avaliacao[]
}

export function TabelaAvaliacoes({ turmaId, alunos, metas, avaliacoes }: Props) {
  const avaliacaoMap = useMemo(() => {
    const map = new Map<string, Conceito>()
    for (const a of avaliacoes) map.set(`${a.alunoId}:${a.metaId}`, a.conceito)
    return map
  }, [avaliacoes])

  if (alunos.length === 0) {
    return <p className="lista-vazia">Nenhum aluno matriculado nesta turma.</p>
  }

  return (
    <section className="avaliacoes-section">
      <h2>Avaliações</h2>
      <div className="tabela-scroll">
        <table className="tabela tabela-avaliacoes">
          <thead>
            <tr>
              <th>Aluno</th>
              {metas.map(m => <th key={m.id}>{m.nome}</th>)}
            </tr>
          </thead>
          <tbody>
            {alunos.map(aluno => (
              <tr key={aluno.id}>
                <td>{aluno.nome}</td>
                {metas.map(meta => (
                  <CelulaAvaliacao
                    key={meta.id}
                    turmaId={turmaId}
                    alunoId={aluno.id}
                    metaId={meta.id}
                    valorAtual={avaliacaoMap.get(`${aluno.id}:${meta.id}`)}
                  />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
