"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllProductsController = void 0;
const prismaClient_1 = __importDefault(require("../prismaClient"));
const getAllProductsController = async (req, res, next) => {
    try {
        const products = await prismaClient_1.default.product.findMany({
            orderBy: [
                { category: 'asc' }, // Primeiro critério de ordenação
                { name: 'asc' } // Segundo critério de ordenação
            ]
        });
        if (!products || products.length === 0) {
            // Mantém a lógica de retornar um array vazio com sucesso se não houver produtos
            res.status(200).json({ success: true, message: 'Nenhum produto cadastrado.', products: [] });
            return;
        }
        res.status(200).json({ success: true, products });
    }
    catch (e) {
        console.error('Erro ao buscar produtos:', e); // Log completo do erro no backend
        next(e); // Passa o erro para o middleware de erro centralizado
    }
};
exports.getAllProductsController = getAllProductsController;
