import { alunosApi } from '../services/api'
import { useResource } from './useResource'

export function useAlunos() {
  return useResource(alunosApi.listar, 'Erro ao carregar alunos.')
}
