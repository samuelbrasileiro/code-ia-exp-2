import { Router, Request, Response } from 'express';
import { AvaliacaoService } from '../services/AvaliacaoService';
import { Conceito } from '../types';

const router = Router({ mergeParams: true });

router.get('/', (req: Request, res: Response) => {
  const avaliacoes = AvaliacaoService.listarPorTurma(String(req.params.id));
  if (avaliacoes === null) {
    res.status(404).json({ erro: 'Turma não encontrada.' });
    return;
  }
  res.json(avaliacoes);
});

router.put('/', (req: Request, res: Response) => {
  const { alunoId, metaId, conceito } = req.body as {
    alunoId: unknown;
    metaId: unknown;
    conceito: unknown;
  };

  if (typeof alunoId !== 'string' || typeof metaId !== 'string' || typeof conceito !== 'string') {
    res.status(422).json({ erro: 'Campos alunoId, metaId e conceito são obrigatórios.' });
    return;
  }

  const resultado = AvaliacaoService.salvar(String(req.params.id), alunoId, metaId, conceito as Conceito);
  if (!resultado.ok) {
    res.status(resultado.status).json({ erro: resultado.erro });
    return;
  }
  res.json(resultado.avaliacao);
});

export default router;
