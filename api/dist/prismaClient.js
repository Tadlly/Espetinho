"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/prismaClient.ts
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient({
// log: ['query', 'info', 'warn', 'error'], // Descomente para ver logs detalhados do Prisma
});
exports.default = prisma;
