import { Router, Request, Response } from 'express';
import { AlunoService } from '../services/AlunoService';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  res.json(AlunoService.listar());
});

router.post('/', (req: Request, res: Response) => {
  const { nome, cpf, email } = req.body as { nome: unknown; cpf: unknown; email: unknown };

  if (typeof nome !== 'string' || typeof cpf !== 'string' || typeof email !== 'string') {
    res.status(422).json({ erro: 'Campos nome, cpf e email são obrigatórios.' });
    return;
  }

  const resultado = AlunoService.criar({ nome, cpf, email });
  if (!resultado.ok) {
    res.status(resultado.status).json({ erro: resultado.erro });
    return;
  }
  res.status(201).json(resultado.aluno);
});

router.put('/:id', (req: Request, res: Response) => {
  const resultado = AlunoService.atualizar(String(req.params.id), req.body as Record<string, unknown>);
  if (!resultado.ok) {
    res.status(resultado.status).json({ erro: resultado.erro });
    return;
  }
  res.json(resultado.aluno);
});

router.delete('/:id', (req: Request, res: Response) => {
  const resultado = AlunoService.remover(String(req.params.id));
  if (!resultado.ok) {
    res.status(resultado.status).json({ erro: resultado.erro });
    return;
  }
  res.json(resultado.aluno);
});

export default router;
