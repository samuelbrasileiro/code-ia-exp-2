import nodemailer from 'nodemailer';
import { AlunoRepository } from '../repositories/AlunoRepository';
import { TurmaRepository } from '../repositories/TurmaRepository';
import { MetaService } from './MetaService';
import { FilaEmailRepository } from '../repositories/FilaEmailRepository';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST ?? 'smtp.ethereal.email',
  port: parseInt(process.env.EMAIL_PORT ?? '587'),
  auth: {
    user: process.env.EMAIL_USER ?? '',
    pass: process.env.EMAIL_PASS ?? '',
  },
});

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
    if (!entrada || entrada.enviado || entrada.mudancas.length === 0) return;

    const aluno = AlunoRepository.findById(alunoId);
    if (!aluno) return;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM ?? 'sistema@avaliacoes.local',
      to: aluno.email,
      subject: `Suas avaliações do dia ${data}`,
      text: montarCorpoEmail(aluno.nome, entrada.mudancas),
    });

    FilaEmailRepository.save({ ...entrada, enviado: true });
  },

  async processarFilaDiaria(data: string): Promise<void> {
    const pendentes = FilaEmailRepository.findNaoEnviadosPorData(data);
    await Promise.allSettled(pendentes.map((e) => this.enviarDigesteDiario(e.alunoId, data)));
  },
};
