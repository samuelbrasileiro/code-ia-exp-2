import { FilaEmailEntrada } from '../types';
import { readJson, writeJson } from './JsonRepository';

const FILE = 'filaEmail.json';

export const FilaEmailRepository = {
  findAll(): FilaEmailEntrada[] {
    return readJson<FilaEmailEntrada>(FILE);
  },

  findByAlunoEData(alunoId: string, data: string): FilaEmailEntrada | undefined {
    return this.findAll().find((e) => e.alunoId === alunoId && e.data === data);
  },

  findNaoEnviadosPorData(data: string): FilaEmailEntrada[] {
    return this.findAll().filter((e) => e.data === data && !e.enviado);
  },

  hasPendentes(): boolean {
    return this.findAll().some((e) => !e.enviado);
  },

  ultimoEnvio(): string | null {
    const enviados = this.findAll()
      .filter((e) => e.enviado && e.enviadoEm)
      .map((e) => e.enviadoEm as string);
    if (enviados.length === 0) return null;
    return enviados.reduce((a, b) => (a > b ? a : b));
  },

  save(entrada: FilaEmailEntrada): void {
    const all = this.findAll();
    const index = all.findIndex((e) => e.alunoId === entrada.alunoId && e.data === entrada.data);
    if (index >= 0) {
      all[index] = entrada;
    } else {
      all.push(entrada);
    }
    writeJson(FILE, all);
  },
};
