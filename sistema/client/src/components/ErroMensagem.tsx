interface Props {
  mensagem: string
}

export function ErroMensagem({ mensagem }: Props) {
  return <p className="erro-mensagem" role="alert">{mensagem}</p>
}
