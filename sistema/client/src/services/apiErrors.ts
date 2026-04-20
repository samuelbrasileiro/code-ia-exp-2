export function extractMensagem(e: unknown): string | undefined {
  if (
    e !== null &&
    typeof e === 'object' &&
    'response' in e &&
    e.response !== null &&
    typeof e.response === 'object' &&
    'data' in e.response &&
    e.response.data !== null &&
    typeof e.response.data === 'object' &&
    'erro' in e.response.data &&
    typeof (e.response.data as Record<string, unknown>).erro === 'string'
  ) {
    return (e.response.data as { erro: string }).erro
  }
  return undefined
}
