import fs from 'fs';
import path from 'path';

const DATA_DIR = path.resolve(__dirname, '../../data');

function filePath(name: string): string {
  return path.join(DATA_DIR, name);
}

export function readJson<T>(fileName: string): T[] {
  try {
    return JSON.parse(fs.readFileSync(filePath(fileName), 'utf-8')) as T[];
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw new Error(`Falha ao ler ${fileName}`);
  }
}

export function writeJson<T>(fileName: string, data: T[]): void {
  try {
    fs.writeFileSync(filePath(fileName), JSON.stringify(data, null, 2), 'utf-8');
  } catch {
    throw new Error(`Falha ao escrever ${fileName}`);
  }
}
