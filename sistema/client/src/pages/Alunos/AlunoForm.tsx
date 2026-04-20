import { useEffect, useState } from 'react'
import type { Aluno } from '../../types'

const CPF_REGEX = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type Campos = Pick<Aluno, 'nome' | 'cpf' | 'email'>
type Tocado = Record<keyof Campos, boolean>

interface Props {
  inicial?: Aluno
  salvando: boolean
  erroServidor?: string
  onSalvar: (dados: Omit<Aluno, 'id'>) => void
  onCancelar: () => void
}

function camposIniciais(a?: Aluno): Campos {
  return { nome: a?.nome ?? '', cpf: a?.cpf ?? '', email: a?.email ?? '' }
}

const tocadoFalso: Tocado = { nome: false, cpf: false, email: false }

export function AlunoForm({ inicial, salvando, erroServidor, onSalvar, onCancelar }: Props) {
  const [campos, setCampos] = useState<Campos>(() => camposIniciais(inicial))
  const [tocado, setTocado] = useState<Tocado>(tocadoFalso)

  useEffect(() => {
    setCampos(camposIniciais(inicial))
    setTocado(tocadoFalso)
  }, [inicial])

  const errNome = tocado.nome && !campos.nome.trim() ? 'Nome é obrigatório.' : ''
  const errCpf = tocado.cpf && !CPF_REGEX.test(campos.cpf) ? 'CPF deve estar no formato 000.000.000-00.' : ''
  const errEmail = tocado.email && !EMAIL_REGEX.test(campos.email) ? 'E-mail inválido.' : ''
  const invalido = !campos.nome.trim() || !CPF_REGEX.test(campos.cpf) || !EMAIL_REGEX.test(campos.email)

  function set(campo: keyof Campos) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setCampos(c => ({ ...c, [campo]: e.target.value }))
  }

  function blur(campo: keyof Campos) {
    return () => setTocado(t => ({ ...t, [campo]: true }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (invalido) return
    onSalvar({ nome: campos.nome.trim(), cpf: campos.cpf, email: campos.email.trim() })
  }

  return (
    <form className="form-card" onSubmit={handleSubmit} noValidate>
      <div className="form-field">
        <label htmlFor="nome">Nome</label>
        <input
          id="nome"
          value={campos.nome}
          onChange={set('nome')}
          onBlur={blur('nome')}
          disabled={salvando}
        />
        {errNome && <span className="campo-erro">{errNome}</span>}
      </div>

      <div className="form-field">
        <label htmlFor="cpf">CPF</label>
        <input
          id="cpf"
          value={campos.cpf}
          placeholder="000.000.000-00"
          onChange={set('cpf')}
          onBlur={blur('cpf')}
          disabled={salvando}
        />
        {errCpf && <span className="campo-erro">{errCpf}</span>}
      </div>

      <div className="form-field">
        <label htmlFor="email">E-mail</label>
        <input
          id="email"
          type="email"
          value={campos.email}
          onChange={set('email')}
          onBlur={blur('email')}
          disabled={salvando}
        />
        {errEmail && <span className="campo-erro">{errEmail}</span>}
      </div>

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
