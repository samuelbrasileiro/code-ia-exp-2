import axios from 'axios'
import type { Aluno, Avaliacao, Meta, Turma } from '../types'

const http = axios.create({ baseURL: '/api' })

export const alunosApi = {
  listar: () => http.get<Aluno[]>('/alunos').then(r => r.data),
  criar: (dados: Omit<Aluno, 'id'>) => http.post<Aluno>('/alunos', dados).then(r => r.data),
  atualizar: (id: string, dados: Omit<Aluno, 'id'>) =>
    http.put<Aluno>(`/alunos/${id}`, dados).then(r => r.data),
  remover: (id: string) => http.delete(`/alunos/${id}`),
}

export const turmasApi = {
  listar: () => http.get<Turma[]>('/turmas').then(r => r.data),
  criar: (dados: Omit<Turma, 'id' | 'alunoIds' | 'avaliacoes'>) =>
    http.post<Turma>('/turmas', dados).then(r => r.data),
  buscar: (id: string) => http.get<Turma>(`/turmas/${id}`).then(r => r.data),
  atualizar: (id: string, dados: Omit<Turma, 'id' | 'alunoIds' | 'avaliacoes'>) =>
    http.put<Turma>(`/turmas/${id}`, dados).then(r => r.data),
  remover: (id: string) => http.delete(`/turmas/${id}`),
  atualizarAlunos: (id: string, alunoIds: string[]) =>
    http.put<Turma>(`/turmas/${id}/alunos`, { alunoIds }).then(r => r.data),
}

export const avaliacoesApi = {
  listar: (turmaId: string) =>
    http.get<Avaliacao[]>(`/turmas/${turmaId}/avaliacoes`).then(r => r.data),
  salvar: (turmaId: string, avaliacao: { alunoId: string; metaId: string; conceito: string }) =>
    http.put<Avaliacao>(`/turmas/${turmaId}/avaliacoes`, avaliacao).then(r => r.data),
}

export const metasApi = {
  listar: () => http.get<Meta[]>('/metas').then(r => r.data),
}
