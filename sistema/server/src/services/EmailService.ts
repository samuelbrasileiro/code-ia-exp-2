import nodemailer from 'nodemailer';
import { AlunoRepository } from '../repositories/AlunoRepository';
import { TurmaRepository } from '../repositories/TurmaRepository';
import { MetaService } from './MetaService';
import { FilaEmailRepository } from '../repositories/FilaEmailRepository';
import { createLogger } from '../utils/logger';

const logger = createLogger('EmailService');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST ?? 'smtp.ethereal.email',
  port: parseInt(process.env.EMAIL_PORT ?? '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER ?? '',
    pass: process.env.EMAIL_PASS ?? '',
  },
});

// Verifica a conexão SMTP ao inicializar
transporter.verify((err) => {
  if (err) {
    logger.error('Falha na verificação SMTP', { message: err.message })
  } else {
    logger.info('Conexão SMTP verificada com sucesso')
  }
})

function montarCorpoEmail(
  nomeAluno: string,
  mudancas: { turmaId: string; metaId: string; conceito: string }[]
): string {
  const linhas = mudancas.map((m) => {
    const turma = TurmaRepository.findById(m.turmaId);
    const meta = MetaService.findById(m.metaId);
    const nomeTurma = turma ? `${turma.topico} (${turma.ano}/${turma.semestre})` : m.turmaId;
    const nomeMeta = meta ? meta.nome : m.metaId;
    return `  - ${nomeTurma} — ${nomeMeta}: ${m.conceito}`;
  });

  return `Olá ${nomeAluno},\n\nSuas avaliações foram atualizadas hoje:\n\n${linhas.join('\n')}\n\nAtt,\nSistema de Avaliações`;
}

export const EmailService = {
  async enviarDigesteDiario(alunoId: string, data: string): Promise<void> {
    const entrada = FilaEmailRepository.findByAlunoEData(alunoId, data);

    if (!entrada) {
      logger.debug(`Nenhuma entrada na fila para aluno ${alunoId} na data ${data}`)
      return;
    }
    if (entrada.enviado) {
      logger.debug(`E-mail já enviado para aluno ${alunoId} na data ${data}, ignorando`)
      return;
    }
    if (entrada.mudancas.length === 0) {
      logger.warn(`Entrada na fila sem mudanças para aluno ${alunoId} na data ${data}`)
      return;
    }

    const aluno = AlunoRepository.findById(alunoId);
    if (!aluno) {
      logger.error(`Aluno ${alunoId} não encontrado, não é possível enviar e-mail`)
      return;
    }

    logger.info(`Enviando digest para ${aluno.nome} <${aluno.email}>`, {
      mudancas: entrada.mudancas.length,
      data,
    })

    try {
      const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM ?? 'sistema@avaliacoes.local',
        to: aluno.email,
        subject: `Suas avaliações do dia ${data}`,
        text: montarCorpoEmail(aluno.nome, entrada.mudancas),
      });

      logger.info(`E-mail enviado com sucesso para ${aluno.email}`, { messageId: info.messageId })
      FilaEmailRepository.save({ ...entrada, enviado: true, enviadoEm: new Date().toISOString() });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      logger.error(`Falha ao enviar e-mail para ${aluno.email}`, { message })
      throw err;
    }
  },

  async processarFilaDiaria(data: string): Promise<void> {
    const pendentes = FilaEmailRepository.findNaoEnviadosPorData(data);

    if (pendentes.length === 0) {
      logger.info(`Nenhum e-mail pendente para a data ${data}`)
      return;
    }

    logger.info(`Processando ${pendentes.length} e-mail(s) pendente(s) para ${data}`)

    const resultados = await Promise.allSettled(
      pendentes.map((e) => this.enviarDigesteDiario(e.alunoId, data))
    );

    const falhas = resultados.filter((r) => r.status === 'rejected')
    if (falhas.length > 0) {
      logger.error(`${falhas.length} e-mail(s) falharam de ${pendentes.length}`)
    } else {
      logger.info(`Todos os ${pendentes.length} e-mail(s) processados com sucesso`)
    }
  },
};
