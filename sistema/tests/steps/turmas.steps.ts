import { Given, When, Then } from '@cucumber/cucumber';
import { strict as assert } from 'assert';
import { AppWorld, BASE_URL } from '../support/world';
import { criarAluno, criarTurma, matricular, definirAvaliacao, metaIdByNome } from '../support/api';

interface Turma {
  id: string;
  topico: string;
  ano: number;
  semestre: number;
  alunoIds: string[];
  avaliacoes: { alunoId: string; metaId: string; conceito: string }[];
  alunos?: { id: string; nome: string }[];
}

Given('que existe a turma {string} no ano {int} semestre {int}', async function (
  this: AppWorld,
  topico: string,
  ano: number,
  semestre: number,
) {
  await criarTurma(this, topico, ano, semestre);
});

Given('que a turma {string} tem o aluno {string} com avaliação {string} na meta {string}', async function (
  this: AppWorld,
  topico: string,
  alunoNome: string,
  conceito: string,
  metaNome: string,
) {
  const cpf = '123.456.789-09';
  const email = `${alunoNome.toLowerCase().replace(/\s+/g, '.')}@test.com`;
  await criarAluno(this, alunoNome, cpf, email);
  const turmaId = await criarTurma(this, topico, 2024, 1);
  await matricular(this, turmaId, alunoNome);
  const metaId = await metaIdByNome(metaNome);
  const alunoId = this.alunoIds[alunoNome];
  await definirAvaliacao(turmaId, alunoId, metaId, conceito);
});

When('o professor cria a turma {string} no ano {int} semestre {int}', async function (
  this: AppWorld,
  topico: string,
  ano: number,
  semestre: number,
) {
  const res = await fetch(`${BASE_URL}/turmas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topico, ano, semestre }),
  });
  this.lastStatus = res.status;
  if (res.ok) {
    const turma = (await res.json()) as Turma;
    this.turmaIds[topico] = turma.id;
    this.currentTurmaId = turma.id;
  }
});

When('matricula {string} nessa turma', async function (this: AppWorld, alunoNome: string) {
  assert.ok(this.currentTurmaId, 'Nenhuma turma criada no contexto atual');
  await matricular(this, this.currentTurmaId, alunoNome);
});

When('o professor acessa os dados da turma {string}', async function (
  this: AppWorld,
  topico: string,
) {
  const turmaId = this.turmaIds[topico];
  assert.ok(turmaId, `Turma "${topico}" não encontrada no world`);
  const res = await fetch(`${BASE_URL}/turmas/${turmaId}`);
  this.lastStatus = res.status;
  this.lastTurma = await res.json();
});

When('o professor altera o tópico da turma {string} para {string}', async function (
  this: AppWorld,
  topicoAtual: string,
  novoTopico: string,
) {
  const turmaId = this.turmaIds[topicoAtual];
  assert.ok(turmaId, `Turma "${topicoAtual}" não encontrada no world`);
  const res = await fetch(`${BASE_URL}/turmas/${turmaId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topico: novoTopico }),
  });
  this.lastStatus = res.status;
  if (res.ok) {
    this.turmaIds[novoTopico] = turmaId;
    delete this.turmaIds[topicoAtual];
  }
});

When('o professor remove a turma {string}', async function (this: AppWorld, topico: string) {
  const turmaId = this.turmaIds[topico];
  assert.ok(turmaId, `Turma "${topico}" não encontrada no world`);
  const res = await fetch(`${BASE_URL}/turmas/${turmaId}`, { method: 'DELETE' });
  this.lastStatus = res.status;
});

Then('a turma {string} deve aparecer na lista de turmas', async function (
  this: AppWorld,
  topico: string,
) {
  const res = await fetch(`${BASE_URL}/turmas`);
  const turmas = (await res.json()) as Turma[];
  assert.ok(
    turmas.some((t) => t.topico === topico),
    `Turma "${topico}" não encontrada na lista`,
  );
});

Then('{string} não deve aparecer na lista de turmas', async function (
  this: AppWorld,
  topico: string,
) {
  const res = await fetch(`${BASE_URL}/turmas`);
  const turmas = (await res.json()) as Turma[];
  assert.ok(
    !turmas.some((t) => t.topico === topico),
    `Turma "${topico}" ainda aparece na lista`,
  );
});

Then('a turma deve exibir {string} na sua lista de alunos', async function (
  this: AppWorld,
  alunoNome: string,
) {
  assert.ok(this.currentTurmaId, 'Nenhuma turma no contexto atual');
  const res = await fetch(`${BASE_URL}/turmas/${this.currentTurmaId}`);
  const turma = (await res.json()) as Turma;
  assert.ok(
    turma.alunos?.some((a) => a.nome === alunoNome),
    `Aluno "${alunoNome}" não encontrado na turma`,
  );
});

Then('deve ver {string} com conceito {string} na coluna {string}', async function (
  this: AppWorld,
  alunoNome: string,
  conceito: string,
  metaNome: string,
) {
  assert.ok(this.lastTurma, 'Nenhuma turma carregada no contexto atual');
  const alunoId = this.lastTurma.alunos.find((a) => a.nome === alunoNome)?.id;
  assert.ok(alunoId, `Aluno "${alunoNome}" não encontrado na turma`);
  const metaId = await metaIdByNome(metaNome);
  const avaliacao = this.lastTurma.avaliacoes.find(
    (av) => av.alunoId === alunoId && av.metaId === metaId,
  );
  assert.ok(avaliacao, `Avaliação de "${alunoNome}" na meta "${metaNome}" não encontrada`);
  assert.equal(
    avaliacao.conceito,
    conceito,
    `Esperava "${conceito}", encontrou "${avaliacao.conceito}"`,
  );
});
