import { turmasApi } from '../services/api'
import { useResource } from './useResource'

export function useTurmas() {
  return useResource(turmasApi.listar, 'Erro ao carregar turmas.')
}
