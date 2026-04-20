import { Meta } from '../types';

const METAS_FIXAS: Meta[] = [
  { id: 'requisitos', nome: 'Requisitos' },
  { id: 'testes', nome: 'Testes' },
  { id: 'design', nome: 'Design' },
  { id: 'implementacao', nome: 'Implementação' },
];

export const MetaService = {
  listar(): Meta[] {
    return METAS_FIXAS;
  },

  findById(id: string): Meta | undefined {
    return METAS_FIXAS.find((m) => m.id === id);
  },
};
