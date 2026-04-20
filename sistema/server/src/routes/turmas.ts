import { Router, Request, Response } from 'express';
import { TurmaService } from '../services/TurmaService';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  res.json(TurmaService.listar());
});

router.post('/', (req: Request, res: Response) => {
  const { topico, ano, semestre } = req.body as { topico: unknown; ano: unknown; semestre: unknown };

  if (typeof topico !== 'string' || typeof ano !== 'number' || typeof semestre !== 'number') {
    res.status(422).json({ erro: 'Campos topico (string), ano (number) e semestre (number) são obrigatórios.' });
    return;
  }

  const resultado = TurmaService.criar({ topico, ano, semestre });
  if (!resultado.ok) {
    res.status(resultado.status).json({ erro: resultado.erro });
    return;
  }
  res.status(201).json(resultado.turma);
});

router.get('/:id', (req: Request, res: Response) => {
  const resultado = TurmaService.buscarComAlunos(String(req.params.id));
  if (!resultado) {
    res.status(404).json({ erro: 'Turma não encontrada.' });
    return;
  }
  res.json(resultado);
});

router.put('/:id', (req: Request, res: Response) => {
  const resultado = TurmaService.atualizar(String(req.params.id), req.body as Record<string, unknown>);
  if (!resultado.ok) {
    res.status(resultado.status).json({ erro: resultado.erro });
    return;
  }
  res.json(resultado.turma);
});

router.delete('/:id', (req: Request, res: Response) => {
  const resultado = TurmaService.remover(String(req.params.id));
  if (!resultado.ok) {
    res.status(resultado.status).json({ erro: resultado.erro });
    return;
  }
  res.json(resultado.turma);
});

router.put('/:id/alunos', (req: Request, res: Response) => {
  const { alunoIds } = req.body as { alunoIds: unknown };
  if (!Array.isArray(alunoIds) || !alunoIds.every((x) => typeof x === 'string')) {
    res.status(422).json({ erro: 'alunoIds deve ser um array de strings.' });
    return;
  }

  const resultado = TurmaService.atualizarAlunos(String(req.params.id), alunoIds);
  if (!resultado.ok) {
    res.status(resultado.status).json({ erro: resultado.erro });
    return;
  }
  res.json(resultado.turma);
});

export default router;
