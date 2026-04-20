import { Conceito, Avaliacao, CONCEITOS_VALIDOS } from '../types';
import { TurmaRepository } from '../repositories/TurmaRepository';
import { FilaEmailRepository } from '../repositories/FilaEmailRepository';
import { MetaService } from './MetaService';
import { dataHoje } from '../utils/date';
import { createLogger } from '../utils/logger';

const logger = createLogger('AvaliacaoService');

export type ResultadoAvaliacao =
  | { ok: true; avaliacao: Avaliacao }
  | { ok: false; status: 404 | 422; erro: string };

export const AvaliacaoService = {
  listarPorTurma(turmaId: string): Avaliacao[] | null {
    const turma = TurmaRepository.findById(turmaId);
    if (!turma) return null;
    return turma.avaliacoes;
  },

  salvar(turmaId: string, alunoId: string, metaId: string, conceito: Conceito): ResultadoAvaliacao {
    const turma = TurmaRepository.findById(turmaId);
    if (!turma) return { ok: false, status: 404, erro: 'Turma não encontrada.' };

    if (!turma.alunoIds.includes(alunoId)) {
      return { ok: false, status: 422, erro: 'Aluno não matriculado nesta turma.' };
    }
    if (!MetaService.findById(metaId)) {
      return { ok: false, status: 422, erro: 'Meta não encontrada.' };
    }
    if (!(CONCEITOS_VALIDOS as readonly string[]).includes(conceito)) {
      return { ok: false, status: 422, erro: `Conceito inválido. Use: ${CONCEITOS_VALIDOS.join(', ')}.` };
    }

    const avaliacao: Avaliacao = { alunoId, metaId, conceito, atualizadoEm: new Date().toISOString() };

    const avaliacoes = turma.avaliacoes.filter(
      (a) => !(a.alunoId === alunoId && a.metaId === metaId)
    );
    avaliacoes.push(avaliacao);
    TurmaRepository.save({ ...turma, avaliacoes });

    logger.debug(`Avaliação salva`, { turmaId, alunoId, metaId, conceito })
    this.registrarFilaEmail(alunoId, turmaId, metaId, conceito);

    return { ok: true, avaliacao };
  },

  registrarFilaEmail(alunoId: string, turmaId: string, metaId: string, conceito: string): void {
    const data = dataHoje();
    const jaExistia = FilaEmailRepository.findByAlunoEData(alunoId, data) !== undefined
    const entrada = FilaEmailRepository.findByAlunoEData(alunoId, data) ?? {
      alunoId,
      data,
      mudancas: [],
      enviado: false,
    };

    const mudancas = entrada.mudancas.filter(
      (m) => !(m.turmaId === turmaId && m.metaId === metaId)
    );
    mudancas.push({ turmaId, metaId, conceito });

    const foiReaberta = entrada.enviado
    FilaEmailRepository.save({ ...entrada, mudancas, enviado: false })

    if (!jaExistia) {
      logger.info(`Nova entrada na fila de e-mail para aluno ${alunoId} na data ${data}`)
    } else if (foiReaberta) {
      logger.info(`Fila reaberta para aluno ${alunoId} — nova mudança após envio anterior`, { turmaId, metaId, conceito })
    } else {
      logger.debug(`Fila de e-mail atualizada para aluno ${alunoId}`, { turmaId, metaId, conceito, totalMudancas: mudancas.length })
    }
  },
};
