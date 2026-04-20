import { Given, When, Then } from '@cucumber/cucumber';
import { strict as assert } from 'assert';
import { AppWorld } from '../support/world';
import { criarAluno, criarTurma, matricular, definirAvaliacao, metaIdByNome, dataHoje } from '../support/api';

Given('que {string} está matriculado nas turmas {string} e {string} com email {string}', async function (
  this: AppWorld,
  alunoNome: string,
  topico1: string,
  topico2: string,
  email: string,
) {
  await criarAluno(this, alunoNome, '123.456.789-09', email);
  const turma1Id = await criarTurma(this, topico1, 2024, 1);
  const turma2Id = await criarTurma(this, topico2, 2024, 2);
  await matricular(this, turma1Id, alunoNome);
  await matricular(this, turma2Id, alunoNome);
});

Given('que {string} está matriculado na turma {string} com email {string}', async function (
  this: AppWorld,
  alunoNome: string,
  topico: string,
  email: string,
) {
  await criarAluno(this, alunoNome, '123.456.789-09', email);
  const turmaId = await criarTurma(this, topico, 2024, 1);
  await matricular(this, turmaId, alunoNome);
});

Given('já existe uma entrada na fila de email marcada como enviada para {string} hoje', function (
  this: AppWorld,
  alunoNome: string,
) {
  const alunoId = this.alunoIds[alunoNome];
  assert.ok(alunoId, `Aluno "${alunoNome}" não encontrado no world`);
  this.escreverFilaEmail([
    {
      alunoId,
      data: dataHoje(),
      mudancas: [],
      enviado: true,
      enviadoEm: new Date().toISOString(),
    },
  ]);
});

When('o professor altera a avaliação de {string} em {string} na meta {string} para {string}', async function (
  this: AppWorld,
  alunoNome: string,
  topico: string,
  metaNome: string,
  conceito: string,
) {
  const turmaId = this.turmaIds[topico];
  const alunoId = this.alunoIds[alunoNome];
  assert.ok(turmaId, `Turma "${topico}" não encontrada`);
  assert.ok(alunoId, `Aluno "${alunoNome}" não encontrado`);
  const metaId = await metaIdByNome(metaNome);
  const res = await definirAvaliacao(turmaId, alunoId, metaId, conceito);
  this.lastStatus = res.status;
  assert.ok(res.ok, `Falha ao definir avaliação: ${res.status}`);
});

Then('deve haver exatamente 1 entrada na fila de email para {string} hoje', function (
  this: AppWorld,
  alunoNome: string,
) {
  const alunoId = this.alunoIds[alunoNome];
  assert.ok(alunoId, `Aluno "${alunoNome}" não encontrado no world`);
  const fila = this.lerFilaEmail();
  const hoje = dataHoje();
  const entradas = fila.filter((e) => e.alunoId === alunoId && e.data === hoje);
  assert.equal(entradas.length, 1, `Esperava 1 entrada na fila, encontrou ${entradas.length}`);
});

Then('essa entrada deve conter {int} mudança', function (this: AppWorld, quantidade: number) {
  const fila = this.lerFilaEmail();
  const entrada = fila.find((e) => e.data === dataHoje());
  assert.ok(entrada, 'Nenhuma entrada na fila encontrada para hoje');
  assert.equal(
    entrada.mudancas.length,
    quantidade,
    `Esperava ${quantidade} mudança(s), encontrou ${entrada.mudancas.length}`,
  );
});

Then('essa entrada deve conter {int} mudanças', function (this: AppWorld, quantidade: number) {
  const fila = this.lerFilaEmail();
  const entrada = fila.find((e) => e.data === dataHoje());
  assert.ok(entrada, 'Nenhuma entrada na fila encontrada para hoje');
  assert.equal(
    entrada.mudancas.length,
    quantidade,
    `Esperava ${quantidade} mudança(s), encontrou ${entrada.mudancas.length}`,
  );
});
