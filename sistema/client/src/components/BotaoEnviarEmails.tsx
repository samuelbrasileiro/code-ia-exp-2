import { useEffect, useState } from 'react'
import { emailApi, type EmailStatus } from '../services/api'

interface Props {
  status: EmailStatus | null
  onEnviado: (ultimoEnvio: string | null) => void
}

type EstadoEnvio = 'idle' | 'enviando' | 'sucesso' | 'erro'

function formatarData(iso: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(iso))
}

export function BotaoEnviarEmails({ status, onEnviado }: Props) {
  const [estado, setEstado] = useState<EstadoEnvio>('idle')
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    if (estado !== 'sucesso' && estado !== 'erro') return
    const id = setTimeout(() => { setEstado('idle'); setErro(null) }, 5000)
    return () => clearTimeout(id)
  }, [estado])

  async function handleClick() {
    setEstado('enviando')
    setErro(null)
    try {
      const res = await emailApi.disparar()
      setEstado('sucesso')
      onEnviado(res.ultimoEnvio)
    } catch {
      setEstado('erro')
      setErro('Falha ao enviar notificações.')
    }
  }

  const temPendentes = status?.pendentes ?? false
  const ultimoEnvio = status?.ultimoEnvio ?? null

  return (
    <div className="enviar-emails">
      <div className="enviar-emails-info">
        {ultimoEnvio ? (
          <span className="enviar-emails-ultimo">
            Último envio: {formatarData(ultimoEnvio)}
          </span>
        ) : (
          <span className="enviar-emails-ultimo">Nenhum e-mail enviado ainda</span>
        )}
        {temPendentes && (
          <span className="enviar-emails-badge">Atualizações pendentes</span>
        )}
      </div>
      <button
        className="btn-enviar-emails"
        onClick={handleClick}
        disabled={!temPendentes || estado === 'enviando'}
        title={!temPendentes ? 'Nenhuma atualização pendente' : undefined}
      >
        {estado === 'enviando' ? 'Enviando…' : 'Enviar notificações por e-mail'}
      </button>
      {estado === 'sucesso' && (
        <span className="enviar-emails-feedback enviar-emails-feedback--sucesso">
          Notificações enviadas com sucesso.
        </span>
      )}
      {erro && (
        <span className="enviar-emails-feedback enviar-emails-feedback--erro">{erro}</span>
      )}
    </div>
  )
}
