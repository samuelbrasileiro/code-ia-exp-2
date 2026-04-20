import { Aluno } from '../types';
import { readJson, writeJson } from './JsonRepository';

const FILE = 'alunos.json';

export const AlunoRepository = {
  findAll(): Aluno[] {
    return readJson<Aluno>(FILE);
  },

  findById(id: string): Aluno | undefined {
    return this.findAll().find((a) => a.id === id);
  },

  findByCpf(cpf: string): Aluno | undefined {
    return this.findAll().find((a) => a.cpf === cpf);
  },

  save(aluno: Aluno): void {
    const all = this.findAll();
    const index = all.findIndex((a) => a.id === aluno.id);
    if (index >= 0) {
      all[index] = aluno;
    } else {
      all.push(aluno);
    }
    writeJson(FILE, all);
  },

  delete(id: string): boolean {
    const all = this.findAll();
    const filtered = all.filter((a) => a.id !== id);
    if (filtered.length === all.length) return false;
    writeJson(FILE, filtered);
    return true;
  },
};
