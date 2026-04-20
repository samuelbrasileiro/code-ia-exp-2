import { Router, Request, Response } from 'express';
import { FilaEmailRepository } from '../repositories/FilaEmailRepository';
import { EmailService } from '../services/EmailService';
import { dataHoje } from '../utils/date';
import { createLogger } from '../utils/logger';

const logger = createLogger('EmailRoute');
const router = Router();

router.get('/status', (_req: Request, res: Response) => {
  const pendentes = FilaEmailRepository.hasPendentes();
  const ultimoEnvio = FilaEmailRepository.ultimoEnvio();
  logger.debug('Status consultado', { pendentes, ultimoEnvio })
  res.json({ pendentes, ultimoEnvio });
});

router.post('/disparar', async (_req: Request, res: Response) => {
  const data = dataHoje();
  logger.info(`Disparo manual solicitado para a data ${data}`)
  try {
    await EmailService.processarFilaDiaria(data);
    const ultimoEnvio = FilaEmailRepository.ultimoEnvio();
    res.json({ mensagem: `E-mails do dia ${data} processados.`, ultimoEnvio });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    logger.error('Falha no disparo manual', { message })
    res.status(500).json({ erro: 'Falha ao processar fila de e-mails.' });
  }
});

export default router;
