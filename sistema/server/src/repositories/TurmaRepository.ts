import { Turma } from '../types';
import { readJson, writeJson } from './JsonRepository';

const FILE = 'turmas.json';

export const TurmaRepository = {
  findAll(): Turma[] {
    return readJson<Turma>(FILE);
  },

  findById(id: string): Turma | undefined {
    return this.findAll().find((t) => t.id === id);
  },

  save(turma: Turma): void {
    const all = this.findAll();
    const index = all.findIndex((t) => t.id === turma.id);
    if (index >= 0) {
      all[index] = turma;
    } else {
      all.push(turma);
    }
    writeJson(FILE, all);
  },

  delete(id: string): boolean {
    const all = this.findAll();
    const filtered = all.filter((t) => t.id !== id);
    if (filtered.length === all.length) return false;
    writeJson(FILE, filtered);
    return true;
  },
};
