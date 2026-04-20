import { Given, When, Then } from '@cucumber/cucumber';
import { strict as assert } from 'assert';
import { AppWorld, BASE_URL } from '../support/world';
import { criarAluno, criarTurma, matricular, definirAvaliacao, metaIdByNome } from '../support/api';

interface Avaliacao {
  alunoId: string;
  metaId: string;
  conceito: string;
  atualizadoEm: string;
}

Given('que {string} está matriculado na turma {string}', async function (
  this: AppWorld,
  alunoNome: string,
  topico: string,
) {
  if (!this.alunoIds[alunoNome]) {
    const email = `${alunoNome.toLowerCase().replace(/\s+/g, '.')}@test.com`;
    await criarAluno(this, alunoNome, '123.456.789-09', email);
  }
  if (!this.turmaIds[topico]) {
    await criarTurma(this, topico, 2024, 1);
  }
  await matricular(this, this.turmaIds[topico], alunoNome);
});

Given('{string} tem conceito {string} na meta {string} da turma {string}', async function (
  this: AppWorld,
  alunoNome: string,
  conceito: string,
  metaNome: string,
  topico: string,
) {
  const turmaId = this.turmaIds[topico];
  const alunoId = this.alunoIds[alunoNome];
  assert.ok(turmaId, `Turma "${topico}" não encontrada`);
  assert.ok(alunoId, `Aluno "${alunoNome}" não encontrado`);
  const metaId = await metaIdByNome(metaNome);
  const res = await definirAvaliacao(turmaId, alunoId, metaId, conceito);
  assert.ok(res.ok, `Falha ao definir avaliação: ${res.status}`);
});

When('o professor define o conceito {string} para {string} na meta {string} da turma {string}', async function (
  this: AppWorld,
  conceito: string,
  alunoNome: string,
  metaNome: string,
  topico: string,
) {
  const turmaId = this.turmaIds[topico];
  const alunoId = this.alunoIds[alunoNome];
  assert.ok(turmaId, `Turma "${topico}" não encontrada`);
  assert.ok(alunoId, `Aluno "${alunoNome}" não encontrado`);
  const metaId = await metaIdByNome(metaNome);
  const res = await definirAvaliacao(turmaId, alunoId, metaId, conceito);
  this.lastStatus = res.status;
});

When('o professor altera o conceito de {string} na meta {string} da turma {string} para {string}', async function (
  this: AppWorld,
  alunoNome: string,
  metaNome: string,
  topico: string,
  novoConceito: string,
) {
  const turmaId = this.turmaIds[topico];
  const alunoId = this.alunoIds[alunoNome];
  assert.ok(turmaId, `Turma "${topico}" não encontrada`);
  assert.ok(alunoId, `Aluno "${alunoNome}" não encontrado`);
  const metaId = await metaIdByNome(metaNome);
  const res = await definirAvaliacao(turmaId, alunoId, metaId, novoConceito);
  this.lastStatus = res.status;
});

When('o professor tenta definir o conceito {string} para {string} na meta {string} da turma {string}', async function (
  this: AppWorld,
  conceito: string,
  alunoNome: string,
  metaNome: string,
  topico: string,
) {
  const turmaId = this.turmaIds[topico];
  const alunoId = this.alunoIds[alunoNome];
  assert.ok(turmaId, `Turma "${topico}" não encontrada`);
  assert.ok(alunoId, `Aluno "${alunoNome}" não encontrado`);
  const metaId = await metaIdByNome(metaNome);
  const res = await definirAvaliacao(turmaId, alunoId, metaId, conceito);
  this.lastStatus = res.status;
});

Then('a tabela da turma {string} deve exibir {string} para {string} na coluna {string}', async function (
  this: AppWorld,
  topico: string,
  conceito: string,
  alunoNome: string,
  metaNome: string,
) {
  const turmaId = this.turmaIds[topico];
  assert.ok(turmaId, `Turma "${topico}" não encontrada`);
  const res = await fetch(`${BASE_URL}/turmas/${turmaId}/avaliacoes`);
  const avaliacoes = (await res.json()) as Avaliacao[];
  const alunoId = this.alunoIds[alunoNome];
  const metaId = await metaIdByNome(metaNome);
  const avaliacao = avaliacoes.find((av) => av.alunoId === alunoId && av.metaId === metaId);
  assert.ok(avaliacao, `Avaliação de "${alunoNome}" na meta "${metaNome}" não encontrada`);
  assert.equal(
    avaliacao.conceito,
    conceito,
    `Esperava "${conceito}", encontrou "${avaliacao.conceito}"`,
  );
});
