import crypto from 'crypto';
import { Aluno } from '../types';
import { AlunoRepository } from '../repositories/AlunoRepository';
import { TurmaRepository } from '../repositories/TurmaRepository';

function validarCpf(cpf: string): boolean {
  if (!/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(cpf)) return false;
  const digits = cpf.replace(/\D/g, '');
  if (/^(\d)\1+$/.test(digits)) return false;

  const calc = (limit: number): number => {
    let sum = 0;
    for (let i = 0; i < limit; i++) sum += parseInt(digits[i]) * (limit + 1 - i);
    const rem = (sum * 10) % 11;
    return rem === 10 ? 0 : rem;
  };

  return calc(9) === parseInt(digits[9]) && calc(10) === parseInt(digits[10]);
}

function validarEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export type CriarAlunoInput = Omit<Aluno, 'id'>;
export type AtualizarAlunoInput = Partial<CriarAlunoInput>;

export type ResultadoAluno =
  | { ok: true; aluno: Aluno }
  | { ok: false; status: 404 | 409 | 422; erro: string };

export const AlunoService = {
  listar(): Aluno[] {
    return AlunoRepository.findAll();
  },

  criar(input: CriarAlunoInput): ResultadoAluno {
    if (!input.nome.trim()) {
      return { ok: false, status: 422, erro: 'Nome é obrigatório.' };
    }
    if (!validarCpf(input.cpf)) {
      return { ok: false, status: 422, erro: 'CPF inválido. Use o formato 000.000.000-00 com dígitos verificadores corretos.' };
    }
    if (!validarEmail(input.email)) {
      return { ok: false, status: 422, erro: 'E-mail inválido.' };
    }

    const todos = AlunoRepository.findAll();
    if (todos.some((a) => a.cpf === input.cpf)) {
      return { ok: false, status: 409, erro: 'Já existe um aluno com este CPF.' };
    }

    const aluno: Aluno = { id: crypto.randomUUID(), ...input };
    AlunoRepository.save(aluno);
    return { ok: true, aluno };
  },

  atualizar(id: string, input: AtualizarAlunoInput): ResultadoAluno {
    const todos = AlunoRepository.findAll();
    const existente = todos.find((a) => a.id === id);
    if (!existente) return { ok: false, status: 404, erro: 'Aluno não encontrado.' };

    if (input.cpf !== undefined) {
      if (!validarCpf(input.cpf)) {
        return { ok: false, status: 422, erro: 'CPF inválido. Use o formato 000.000.000-00 com dígitos verificadores corretos.' };
      }
      if (todos.some((a) => a.cpf === input.cpf && a.id !== id)) {
        return { ok: false, status: 409, erro: 'Já existe um aluno com este CPF.' };
      }
    }
    if (input.email !== undefined && !validarEmail(input.email)) {
      return { ok: false, status: 422, erro: 'E-mail inválido.' };
    }

    const atualizado: Aluno = { ...existente, ...input };
    AlunoRepository.save(atualizado);
    return { ok: true, aluno: atualizado };
  },

  remover(id: string): ResultadoAluno {
    const aluno = AlunoRepository.findById(id);
    if (!aluno) return { ok: false, status: 404, erro: 'Aluno não encontrado.' };

    const matriculado = TurmaRepository.findAll().some((t) => t.alunoIds.includes(id));
    if (matriculado) {
      return { ok: false, status: 422, erro: 'Não é possível remover aluno matriculado em uma turma.' };
    }

    AlunoRepository.delete(id);
    return { ok: true, aluno };
  },
};
