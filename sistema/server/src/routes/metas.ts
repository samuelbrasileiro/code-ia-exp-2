import { Router, Request, Response } from 'express';
import { MetaService } from '../services/MetaService';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  res.json(MetaService.listar());
});

export default router;
