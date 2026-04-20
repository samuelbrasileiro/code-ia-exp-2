export const CONCEITOS_VALIDOS = ['MANA', 'MPA', 'MA'] as const;
export type Conceito = (typeof CONCEITOS_VALIDOS)[number];

export interface Aluno {
  id: string;
  nome: string;
  cpf: string;
  email: string;
}

export interface Meta {
  id: string;
  nome: string;
}

export interface Avaliacao {
  alunoId: string;
  metaId: string;
  conceito: Conceito;
  atualizadoEm: string;
}

export interface Turma {
  id: string;
  topico: string;
  ano: number;
  semestre: number;
  alunoIds: string[];
  avaliacoes: Avaliacao[];
}

export interface FilaEmailEntrada {
  alunoId: string;
  data: string;
  mudancas: { turmaId: string; metaId: string; conceito: string }[];
  enviado: boolean;
}
