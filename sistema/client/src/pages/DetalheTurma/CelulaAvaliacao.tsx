import { useEffect, useState } from 'react'
import { avaliacoesApi } from '../../services/api'
import { CONCEITOS, type Conceito } from '../../types'

interface Props {
  turmaId: string
  alunoId: string
  metaId: string
  valorAtual: Conceito | undefined
}

type Status = 'idle' | 'salvando' | 'sucesso' | 'erro'

const CLASSE_POR_STATUS: Partial<Record<Status, string>> = {
  sucesso: 'celula-sucesso',
  erro: 'celula-erro',
}

export function CelulaAvaliacao({ turmaId, alunoId, metaId, valorAtual }: Props) {
  const [pendente, setPendente] = useState<Conceito | '' | null>(null)
  const [status, setStatus] = useState<Status>('idle')

  const valor = pendente !== null ? pendente : (valorAtual ?? '')

  // Quando o pai re-faz fetch e traz valorAtual atualizado, descarta o estado otimista
  useEffect(() => { setPendente(null) }, [valorAtual])

  useEffect(() => {
    if (status !== 'sucesso') return
    const id = setTimeout(() => setStatus('idle'), 1200)
    return () => clearTimeout(id)
  }, [status])

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const novo = e.target.value as Conceito | ''
    setPendente(novo)
    if (!novo) return

    setStatus('salvando')
    try {
      await avaliacoesApi.salvar(turmaId, { alunoId, metaId, conceito: novo })
      // pendente mantido: exibe o valor salvo até o pai re-fazer fetch
      setStatus('sucesso')
    } catch {
      setPendente(null) // reverte para valorAtual
      setStatus('erro')
    }
  }

  return (
    <td className={`celula-avaliacao ${CLASSE_POR_STATUS[status] ?? ''}`}>
      <select value={valor} onChange={handleChange} disabled={status === 'salvando'}>
        <option value="">—</option>
        {CONCEITOS.map(c => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
    </td>
  )
}
