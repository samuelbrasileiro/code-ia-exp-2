import express from 'express';
import cors from 'cors';
import alunosRouter from './routes/alunos';
import metasRouter from './routes/metas';
import turmasRouter from './routes/turmas';
import avaliacoesRouter from './routes/avaliacoes';
import emailRouter from './routes/email';
import { iniciarJobEmailDiario } from './jobs/emailDiario';

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors());
app.use(express.json());

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
  process.stdout.write(`Servidor rodando na porta ${PORT}\n`);
});

export default app;
