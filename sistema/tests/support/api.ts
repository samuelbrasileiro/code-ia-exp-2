import { AppWorld, BASE_URL } from './world';

export async function criarAluno(
  world: AppWorld,
  nome: string,
  cpf: string,
  email: string,
): Promise<string> {
  const res = await fetch(`${BASE_URL}/alunos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome, cpf, email }),
  });
  if (!res.ok) throw new Error(`Falha ao criar aluno ${nome}: ${res.status}`);
  const aluno = (await res.json()) as { id: string };
  world.alunoIds[nome] = aluno.id;
  return aluno.id;
}

export async function criarTurma(
  world: AppWorld,
  topico: string,
  ano: number,
  semestre: number,
): Promise<string> {
  const res = await fetch(`${BASE_URL}/turmas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topico, ano, semestre }),
  });
  if (!res.ok) throw new Error(`Falha ao criar turma ${topico}: ${res.status}`);
  const turma = (await res.json()) as { id: string };
  world.turmaIds[topico] = turma.id;
  world.currentTurmaId = turma.id;
  return turma.id;
}

export async function matricular(
  world: AppWorld,
  turmaId: string,
  alunoNome: string,
): Promise<void> {
  const alunoId = world.alunoIds[alunoNome];
  if (!alunoId) throw new Error(`Aluno não encontrado no world: ${alunoNome}`);

  const turmaRes = await fetch(`${BASE_URL}/turmas/${turmaId}`);
  const turma = (await turmaRes.json()) as { alunoIds: string[] };
  const novosIds = [...new Set([...turma.alunoIds, alunoId])];

  const res = await fetch(`${BASE_URL}/turmas/${turmaId}/alunos`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ alunoIds: novosIds }),
  });
  if (!res.ok) throw new Error(`Falha ao matricular ${alunoNome}: ${res.status}`);
}

export async function definirAvaliacao(
  turmaId: string,
  alunoId: string,
  metaId: string,
  conceito: string,
): Promise<Response> {
  return fetch(`${BASE_URL}/turmas/${turmaId}/avaliacoes`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ alunoId, metaId, conceito }),
  });
}

export async function metaIdByNome(nome: string): Promise<string> {
  const res = await fetch(`${BASE_URL}/metas`);
  const metas = (await res.json()) as { id: string; nome: string }[];
  const meta = metas.find((m) => m.nome === nome);
  if (!meta) throw new Error(`Meta não encontrada: ${nome}`);
  return meta.id;
}

export function dataHoje(): string {
  return new Date().toISOString().split('T')[0];
}
