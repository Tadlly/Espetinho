"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express")); // Mudança: Application para Express
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
// É crucial que dotenv.config() seja chamado o mais cedo possível
dotenv_1.default.config();
// Importar suas rotas
const orderRoutes_1 = __importDefault(require("./routes/orderRoutes"));
const productroutes_1 = __importDefault(require("./routes/productroutes"));
// Usar o tipo Express para a instância da aplicação
const app = (0, express_1.default)();
// Definir a porta. Se process.env.PORT existir, converter para número. Senão, usar 3001.
// app.listen do Express lida bem com string ou número, mas ser explícito com número é bom.
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
// === Middlewares ===
app.use((0, cors_1.default)()); // Para desenvolvimento, pode ser aberto. Em produção, configure origens específicas.
app.use(express_1.default.json()); // Para parsear JSON no corpo das requisições
app.use(express_1.default.urlencoded({ extended: true })); // Para parsear dados de formulário URL-encoded
// === Rotas ===
app.get('/', (req, res) => {
    res.status(200).json({ message: 'API do Espetinho Picoense está no ar! 🍢♨️' });
});
// Montar as Rotas da API
app.use('/api', orderRoutes_1.default); // Endpoints de pedido serão prefixados com /api (ex: POST /api/orders)
app.use('/api', productroutes_1.default); // Endpoints de produto serão prefixados com /api (ex: GET /api/products)
// === Middleware de Tratamento de Erros Genérico (deve ser o último middleware) ===
// Importe Prisma se for checar erros específicos dele aqui
const client_1 = require("@prisma/client");
app.use((err, req, res, next) => {
    console.error("ERRO CAPTURADO PELO MIDDLEWARE:", err);
    let statusCode = 500;
    let responseMessage = 'Ops! Algo deu terrivelmente errado no nosso servidor.';
    let errorCode = undefined;
    let errorDetailsForClient = undefined;
    if (err instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        statusCode = 400;
        responseMessage = `Erro de banco de dados.`;
        errorCode = err.code;
        if (err.meta && typeof err.meta === 'object') { // Checagem para garantir que meta é um objeto
            errorDetailsForClient = err.meta;
        }
        if (err.code === 'P2002') { // Unique constraint failed
            const target = err.meta?.target;
            const targetString = Array.isArray(target) ? target.join(', ') : String(target || 'campo desconhecido');
            responseMessage = `Erro: Conflito de dados. Já existe um registro com o(s) campo(s): ${targetString}.`;
        }
        else if (err.code === 'P2025') { // Record to update or delete not found
            responseMessage = `Erro: Um registro necessário para a operação não foi encontrado. ${err.meta?.cause || ''}`;
        }
        else {
            responseMessage = err.message.split('\n').pop()?.trim() || 'Falha na operação do banco de dados.';
        }
    }
    else if (err instanceof Error) { // Erro genérico do JavaScript
        responseMessage = err.message;
        // Em desenvolvimento, você pode querer enviar mais detalhes:
        // if (process.env.NODE_ENV === 'development') {
        //   errorDetailsForClient = err.stack; // Cuidado ao expor stack trace
        // }
    }
    else { // Caso o erro não seja uma instância de Error
        responseMessage = 'Ocorreu um erro inesperado e não padronizado.';
        if (typeof err === 'string' || typeof err === 'number' || typeof err === 'boolean') {
            errorDetailsForClient = String(err);
        }
    }
    const responsePayload = {
        success: false,
        message: responseMessage,
    };
    if (errorCode)
        responsePayload.code = errorCode;
    if (errorDetailsForClient)
        responsePayload.details = errorDetailsForClient;
    res.status(statusCode).json(responsePayload);
});
// === Inicialização do Servidor ===
app.listen(PORT, () => {
    console.log(`Backend do Espetinho Picoense rodando em http://localhost:${PORT} 🚀`);
});
