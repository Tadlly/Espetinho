// backend/src/controllers/productController.ts
import { Request, Response, NextFunction } from 'express';
import prisma from '../prismaClient';

export const getAllProductsController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const products = await prisma.product.findMany({
      orderBy: [ // <--- MUDANÇA AQUI: AGORA É UM ARRAY
        { category: 'asc' }, // Primeiro critério de ordenação
        { name: 'asc' }      // Segundo critério de ordenação
      ]
    });

    if (!products || products.length === 0) {
      // Mantém a lógica de retornar um array vazio com sucesso se não houver produtos
      res.status(200).json({ success: true, message: 'Nenhum produto cadastrado.', products: [] });
      return;
    }

    res.status(200).json({ success: true, products });

  } catch (e: unknown) {
    console.error('Erro ao buscar produtos:', e); // Log completo do erro no backend
    next(e); // Passa o erro para o middleware de erro centralizado
  }
};