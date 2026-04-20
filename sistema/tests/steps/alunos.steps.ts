import { Given, When, Then } from '@cucumber/cucumber';
import { strict as assert } from 'assert';
import { AppWorld, BASE_URL } from '../support/world';
import { criarAluno } from '../support/api';

interface Aluno {
  id: string;
  nome: string;
  cpf: string;
  email: string;
}

Given('que não existe aluno com CPF {string}', async function (this: AppWorld, cpf: string) {
  const res = await fetch(`${BASE_URL}/alunos`);
  const alunos = (await res.json()) as Aluno[];
  const existente = alunos.find((a) => a.cpf === cpf);
  if (existente) {
    await fetch(`${BASE_URL}/alunos/${existente.id}`, { method: 'DELETE' });
  }
});

Given('que existe um aluno com nome {string} e CPF {string}', async function (
  this: AppWorld,
  nome: string,
  cpf: string,
) {
  const email = `${nome.toLowerCase().replace(/\s+/g, '.')}@test.com`;
  await criarAluno(this, nome, cpf, email);
});

When('o professor cadastra um aluno com nome {string}, CPF {string} e email {string}', async function (
  this: AppWorld,
  nome: string,
  cpf: string,
  email: string,
) {
  const res = await fetch(`${BASE_URL}/alunos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome, cpf, email }),
  });
  this.lastStatus = res.status;
  if (res.ok) {
    const aluno = (await res.json()) as Aluno;
    this.alunoIds[nome] = aluno.id;
  }
});

When('o professor tenta cadastrar um aluno com CPF {string}', async function (
  this: AppWorld,
  cpf: string,
) {
  const res = await fetch(`${BASE_URL}/alunos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome: 'Teste', cpf, email: 'teste@test.com' }),
  });
  this.lastStatus = res.status;
});

When('o professor tenta cadastrar um aluno com email {string}', async function (
  this: AppWorld,
  email: string,
) {
  const res = await fetch(`${BASE_URL}/alunos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome: 'Teste', cpf: '123.456.789-09', email }),
  });
  this.lastStatus = res.status;
});

When('o professor altera o nome de {string} para {string}', async function (
  this: AppWorld,
  nomeAtual: string,
  novoNome: string,
) {
  const id = this.alunoIds[nomeAtual];
  assert.ok(id, `Aluno ${nomeAtual} não encontrado no world`);
  const res = await fetch(`${BASE_URL}/alunos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome: novoNome }),
  });
  this.lastStatus = res.status;
  if (res.ok) {
    const aluno = (await res.json()) as Aluno;
    this.alunoIds[novoNome] = aluno.id;
    delete this.alunoIds[nomeAtual];
  }
});

When('o professor remove o aluno {string}', async function (this: AppWorld, nome: string) {
  const id = this.alunoIds[nome];
  assert.ok(id, `Aluno ${nome} não encontrado no world`);
  const res = await fetch(`${BASE_URL}/alunos/${id}`, { method: 'DELETE' });
  this.lastStatus = res.status;
});

When('o professor consulta a lista de alunos', async function (this: AppWorld) {
  const res = await fetch(`${BASE_URL}/alunos`);
  this.lastStatus = res.status;
});

Then('o aluno {string} deve aparecer na lista de alunos', async function (
  this: AppWorld,
  nome: string,
) {
  const res = await fetch(`${BASE_URL}/alunos`);
  const alunos = (await res.json()) as Aluno[];
  assert.ok(
    alunos.some((a) => a.nome === nome),
    `Aluno "${nome}" não encontrado na lista`,
  );
});

Then('{string} não deve aparecer na lista de alunos', async function (
  this: AppWorld,
  nome: string,
) {
  const res = await fetch(`${BASE_URL}/alunos`);
  const alunos = (await res.json()) as Aluno[];
  assert.ok(
    !alunos.some((a) => a.nome === nome),
    `Aluno "${nome}" ainda aparece na lista`,
  );
});

Then('o sistema deve retornar erro de validação', function (this: AppWorld) {
  assert.equal(this.lastStatus, 422, `Esperava status 422, recebeu ${this.lastStatus}`);
});
