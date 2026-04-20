import crypto from 'crypto';
import { Turma } from '../types';
import { TurmaRepository } from '../repositories/TurmaRepository';
import { AlunoRepository } from '../repositories/AlunoRepository';

export type CriarTurmaInput = Omit<Turma, 'id' | 'alunoIds' | 'avaliacoes'>;
export type AtualizarTurmaInput = Partial<CriarTurmaInput>;

export type ResultadoTurma =
  | { ok: true; turma: Turma }
  | { ok: false; status: 404 | 422; erro: string };

function validarCamposTurma(input: Partial<CriarTurmaInput>): string | null {
  if (input.topico !== undefined && !input.topico.trim()) return 'Tópico é obrigatório.';
  if (input.ano !== undefined && (!Number.isInteger(input.ano) || input.ano < 2000)) return 'Ano inválido.';
  if (input.semestre !== undefined && ![1, 2].includes(input.semestre)) return 'Semestre deve ser 1 ou 2.';
  return null;
}

export const TurmaService = {
  listar(): Turma[] {
    return TurmaRepository.findAll();
  },

  buscar(id: string): Turma | undefined {
    return TurmaRepository.findById(id);
  },

  buscarComAlunos(id: string): (Turma & { alunos: ReturnType<typeof AlunoRepository.findAll> }) | null {
    const turma = TurmaRepository.findById(id);
    if (!turma) return null;
    const mapaAlunos = new Map(AlunoRepository.findAll().map((a) => [a.id, a]));
    const alunos = turma.alunoIds.flatMap((aid) => {
      const a = mapaAlunos.get(aid);
      return a ? [a] : [];
    });
    return { ...turma, alunos };
  },

  criar(input: CriarTurmaInput): ResultadoTurma {
    const erro = validarCamposTurma(input);
    if (erro) return { ok: false, status: 422, erro };

    const turma: Turma = {
      id: crypto.randomUUID(),
      ...input,
      alunoIds: [],
      avaliacoes: [],
    };
    TurmaRepository.save(turma);
    return { ok: true, turma };
  },

  atualizar(id: string, input: AtualizarTurmaInput): ResultadoTurma {
    const existente = TurmaRepository.findById(id);
    if (!existente) return { ok: false, status: 404, erro: 'Turma não encontrada.' };

    const erro = validarCamposTurma(input);
    if (erro) return { ok: false, status: 422, erro };

    const atualizada: Turma = { ...existente, ...input };
    TurmaRepository.save(atualizada);
    return { ok: true, turma: atualizada };
  },

  remover(id: string): ResultadoTurma {
    const turma = TurmaRepository.findById(id);
    if (!turma) return { ok: false, status: 404, erro: 'Turma não encontrada.' };
    TurmaRepository.delete(id);
    return { ok: true, turma };
  },

  atualizarAlunos(id: string, alunoIds: string[]): ResultadoTurma {
    const turma = TurmaRepository.findById(id);
    if (!turma) return { ok: false, status: 404, erro: 'Turma não encontrada.' };

    const todosAlunos = new Map(AlunoRepository.findAll().map((a) => [a.id, a]));
    const inexistentes = alunoIds.filter((aid) => !todosAlunos.has(aid));
    if (inexistentes.length > 0) {
      return { ok: false, status: 422, erro: `Alunos não encontrados: ${inexistentes.join(', ')}` };
    }

    const atualizada: Turma = { ...turma, alunoIds };
    TurmaRepository.save(atualizada);
    return { ok: true, turma: atualizada };
  },
};
