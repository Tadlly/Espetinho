// backend/src/prismaClient.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  // log: ['query', 'info', 'warn', 'error'], // Descomente para ver logs detalhados do Prisma
});

export default prisma;