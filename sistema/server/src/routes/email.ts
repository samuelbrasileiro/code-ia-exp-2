import { Router, Request, Response } from 'express';
import { EmailService } from '../services/EmailService';
import { dataHoje } from '../utils/date';

const router = Router();

router.post('/disparar', async (_req: Request, res: Response) => {
  const data = dataHoje();
  try {
    await EmailService.processarFilaDiaria(data);
    res.json({ mensagem: `E-mails do dia ${data} processados.` });
  } catch (err) {
    res.status(500).json({ erro: 'Falha ao processar fila de e-mails.' });
  }
});

export default router;
