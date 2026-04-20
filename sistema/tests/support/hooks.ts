import { BeforeAll, AfterAll, Before } from '@cucumber/cucumber';
import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import fs from 'fs';
import { TEST_PORT, TEST_DATA_DIR } from './world';

const SERVER_ROOT = path.resolve(__dirname, '../../server');
let serverProcess: ChildProcess | null = null;

BeforeAll({ timeout: 30000 }, async () => {
  fs.mkdirSync(TEST_DATA_DIR, { recursive: true });

  serverProcess = spawn(process.execPath, ['dist/index.js'], {
    cwd: SERVER_ROOT,
    env: {
      ...process.env,
      DATA_DIR: TEST_DATA_DIR,
      PORT: TEST_PORT,
      DISABLE_EMAIL_JOB: 'true',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  await waitForServer();
});

AfterAll(async () => {
  serverProcess?.kill();
});

Before(async () => {
  for (const fileName of ['alunos.json', 'turmas.json', 'filaEmail.json']) {
    fs.writeFileSync(path.join(TEST_DATA_DIR, fileName), '[]', 'utf-8');
  }
});

async function waitForServer(maxRetries = 40, intervalMs = 500): Promise<void> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const res = await fetch(`http://localhost:${TEST_PORT}/api/alunos`);
      if (res.ok || res.status === 200) return;
    } catch {
      // servidor ainda não está pronto
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error('Servidor de teste não iniciou no tempo esperado');
}
