import 'dotenv/config';
import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import alunosRouter from './routes/alunos';
import metasRouter from './routes/metas';
import turmasRouter from './routes/turmas';
import avaliacoesRouter from './routes/avaliacoes';
import emailRouter from './routes/email';
import { iniciarJobEmailDiario } from './jobs/emailDiario';
import { createLogger } from './utils/logger';

const logger = createLogger('HTTP');
const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors());
app.use(express.json());

app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now()
  res.on('finish', () => {
    const ms = Date.now() - start
    const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info'
    logger[level](`${req.method} ${req.path} → ${res.statusCode} (${ms}ms)`)
  })
  next()
})

app.use('/api/alunos', alunosRouter);
app.use('/api/metas', metasRouter);
app.use('/api/turmas', turmasRouter);
app.use('/api/turmas/:id/avaliacoes', avaliacoesRouter);
app.use('/api/email', emailRouter);

app.use((_req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada.' });
});

iniciarJobEmailDiario();

app.listen(PORT, () => {
  const log = createLogger('SERVER')
  log.info(`Servidor rodando na porta ${PORT}`)
  log.info(`SMTP configurado: ${process.env.EMAIL_HOST ?? '(não definido)'}:${process.env.EMAIL_PORT ?? '(não definido)'}`)
  log.info(`EMAIL_USER: ${process.env.EMAIL_USER ?? '(não definido)'}`)
  log.info(`EMAIL_FROM: ${process.env.EMAIL_FROM ?? '(não definido)'}`)
});

export default app;
