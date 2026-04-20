import { useCallback, useEffect, useState } from 'react'
import { alunosApi, avaliacoesApi, metasApi, turmasApi } from '../services/api'
import type { Aluno, Avaliacao, Meta, Turma } from '../types'

interface DetalheTurmaState {
  turma: Turma | null
  alunos: Aluno[]
  metas: Meta[]
  avaliacoes: Avaliacao[]
  loading: boolean
  error: string | null
}

export function useDetalheTurma(turmaId: string) {
  const [state, setState] = useState<DetalheTurmaState>({
    turma: null,
    alunos: [],
    metas: [],
    avaliacoes: [],
    loading: true,
    error: null,
  })

  const fetch = useCallback(async () => {
    setState(s => ({ ...s, loading: true, error: null }))
    try {
      const [turma, metas, avaliacoes, todosAlunos] = await Promise.all([
        turmasApi.buscar(turmaId),
        metasApi.listar(),
        avaliacoesApi.listar(turmaId),
        alunosApi.listar(),
      ])
      const alunos = todosAlunos.filter(a => turma.alunoIds.includes(a.id))
      setState({ turma, alunos, metas, avaliacoes, loading: false, error: null })
    } catch {
      setState(s => ({ ...s, loading: false, error: 'Erro ao carregar dados da turma.' }))
    }
  }, [turmaId])

  useEffect(() => { fetch() }, [fetch])

  return { ...state, refetch: fetch }
}
