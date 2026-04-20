import { World, IWorldOptions, setWorldConstructor } from '@cucumber/cucumber';
import path from 'path';
import fs from 'fs';

export const TEST_PORT = process.env.TEST_PORT ?? '3002';
export const BASE_URL = `http://localhost:${TEST_PORT}/api`;
export const TEST_DATA_DIR = path.resolve(__dirname, '../data');

export interface FilaEmailEntrada {
  alunoId: string;
  data: string;
  mudancas: { turmaId: string; metaId: string; conceito: string }[];
  enviado: boolean;
  enviadoEm?: string;
}

export interface TurmaDetalhada {
  id: string;
  topico: string;
  ano: number;
  semestre: number;
  alunoIds: string[];
  avaliacoes: { alunoId: string; metaId: string; conceito: string; atualizadoEm: string }[];
  alunos: { id: string; nome: string; cpf: string; email: string }[];
}

export class AppWorld extends World {
  alunoIds: Record<string, string> = {};
  turmaIds: Record<string, string> = {};
  currentTurmaId: string | null = null;
  lastStatus: number = 0;
  lastTurma: TurmaDetalhada | null = null;

  constructor(options: IWorldOptions) {
    super(options);
  }

  lerFilaEmail(): FilaEmailEntrada[] {
    try {
      const raw = fs.readFileSync(path.join(TEST_DATA_DIR, 'filaEmail.json'), 'utf-8');
      return JSON.parse(raw) as FilaEmailEntrada[];
    } catch {
      return [];
    }
  }

  escreverFilaEmail(fila: FilaEmailEntrada[]): void {
    fs.writeFileSync(path.join(TEST_DATA_DIR, 'filaEmail.json'), JSON.stringify(fila, null, 2), 'utf-8');
  }
}

setWorldConstructor(AppWorld);
