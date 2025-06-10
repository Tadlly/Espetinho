"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllProductsController = exports.createOrderController = void 0;
const prismaClient_1 = __importDefault(require("../prismaClient"));
const createOrderController = async (req, res, next) => {
    try {
        const { customerDetails, items, totalAmount, paymentMethod, orderNotes } = req.body;
        // Validações
        if (!customerDetails?.name || !customerDetails?.email || !customerDetails?.phone) {
            res.status(400).json({ success: false, message: 'Dados do cliente incompletos (nome, email, telefone são obrigatórios).' });
            return;
        }
        if (!items || items.length === 0) {
            res.status(400).json({ success: false, message: 'O carrinho não pode estar vazio.' });
            return;
        }
        // Adicione mais validações robustas aqui
        if (typeof totalAmount !== 'number' || totalAmount <= 0) {
            res.status(400).json({ success: false, message: 'Valor total inválido.' });
            return;
        }
        if (!paymentMethod) {
            res.status(400).json({ success: false, message: 'Método de pagamento não especificado.' });
            return;
        }
        const newOrderFromDb = await prismaClient_1.default.order.create({
            data: {
                customerName: customerDetails.name,
                customerEmail: customerDetails.email,
                customerPhone: customerDetails.phone,
                customerAddress: customerDetails.address,
                customerCity: customerDetails.city,
                totalAmount: totalAmount,
                paymentMethod: paymentMethod,
                orderNotes: orderNotes,
                status: "Recebido",
                items: {
                    create: items.map(item => ({
                        productId: item.productId,
                        productName: item.name,
                        quantity: item.quantity,
                        priceAtOrder: item.price,
                    })),
                },
            },
            include: {
                items: {
                    select: {
                        productName: true,
                        quantity: true,
                        priceAtOrder: true,
                        // Não precisamos do product.id ou order.id aqui para a resposta ao cliente,
                        // mas poderiam ser incluídos se necessário para outras lógicas.
                    }
                }
            }
        });
        // O tipo de newOrderFromDb com include.items.select já é quase o que queremos.
        // PrismaOrder & { items: Array<{ productName: string; quantity: number; priceAtOrder: number; }> }
        // Isso já deve ser compatível com FullOrderResponseData se PrismaOrder tiver todos os outros campos.
        // Se FullOrderResponseData for exatamente PrismaOrder mais o items formatado, o cast pode não ser necessário,
        // ou um simples `as FullOrderResponseData` se o TypeScript não inferir automaticamente.
        // Para ser explícito e garantir a forma, podemos reconstruir ou validar:
        const responseOrderData = {
            ...newOrderFromDb, // Todas as propriedades de Order
            items: newOrderFromDb.items.map(item => ({
                productName: item.productName,
                quantity: item.quantity,
                priceAtOrder: item.priceAtOrder
            }))
        };
        console.log(`Pedido ${responseOrderData.id} criado com sucesso para ${responseOrderData.customerName}.`);
        res.status(201).json({
            success: true,
            message: 'Pedido criado com sucesso!',
            order: responseOrderData // responseOrderData agora é do tipo FullOrderResponseData
        });
    }
    catch (e) {
        next(e);
    }
};
exports.createOrderController = createOrderController;
const getAllProductsController = async (req, res, next) => {
    try {
        const products = await prismaClient_1.default.product.findMany({
            orderBy: {
                category: 'asc', // Por categoria
                name: 'asc', // Depois por nome
            }
        });
        if (!products || products.length === 0) {
            // Considerar se isso é um erro 404 ou apenas um array vazio é aceitável
            res.status(200).json({ success: true, message: 'Nenhum produto encontrado.', products: [] });
            return;
        }
        res.status(200).json({ success: true, products });
    }
    catch (e) {
        console.error('Erro ao buscar produtos:', e);
        next(e); // Passa o erro para o middleware de erro centralizado
    }
};
exports.getAllProductsController = getAllProductsController;
