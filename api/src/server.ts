import express, { Request, Response, NextFunction, Express } from 'express'; // Mudança: Application para Express
import cors from 'cors';
import dotenv from 'dotenv';

// É crucial que dotenv.config() seja chamado o mais cedo possível
dotenv.config(); 

// Importar suas rotas
import orderRoutes from './routes/orderRoutes';
import productRoutes from './routes/productroutes';

// Usar o tipo Express para a instância da aplicação
const app: Express = express(); 

// Definir a porta. Se process.env.PORT existir, converter para número. Senão, usar 3001.
// app.listen do Express lida bem com string ou número, mas ser explícito com número é bom.
const PORT: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

// === Middlewares ===
app.use(cors()); // Para desenvolvimento, pode ser aberto. Em produção, configure origens específicas.
app.use(express.json()); // Para parsear JSON no corpo das requisições
app.use(express.urlencoded({ extended: true })); // Para parsear dados de formulário URL-encoded

// === Rotas ===
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({ message: 'API do Espetinho Picoense está no ar! 🍢♨️' });
});

// Montar as Rotas da API
app.use('/api', orderRoutes); // Endpoints de pedido serão prefixados com /api (ex: POST /api/orders)
app.use('/api', productRoutes); // Endpoints de produto serão prefixados com /api (ex: GET /api/products)

// === Middleware de Tratamento de Erros Genérico (deve ser o último middleware) ===
// Importe Prisma se for checar erros específicos dele aqui
import { Prisma } from '@prisma/client'; 

interface ErrorResponsePayload {
  success: false;
  message: string;
  details?: Record<string, unknown> | string;
  code?: string;
}

app.use((err: Error, req: Request, res: Response<ErrorResponsePayload>, next: NextFunction) => {
  console.error("ERRO CAPTURADO PELO MIDDLEWARE:", err);

  let statusCode = 500;
  let responseMessage = 'Ops! Algo deu terrivelmente errado no nosso servidor.';
  let errorCode: string | undefined = undefined;
  let errorDetailsForClient: Record<string, unknown> | string | undefined = undefined;

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    statusCode = 400;
    responseMessage = `Erro de banco de dados.`;
    errorCode = err.code;
    if (err.meta && typeof err.meta === 'object') { // Checagem para garantir que meta é um objeto
        errorDetailsForClient = err.meta as Record<string, unknown>;
    }

    if (err.code === 'P2002') { // Unique constraint failed
      const target = err.meta?.target;
      const targetString = Array.isArray(target) ? target.join(', ') : String(target || 'campo desconhecido');
      responseMessage = `Erro: Conflito de dados. Já existe um registro com o(s) campo(s): ${targetString}.`;
    } else if (err.code === 'P2025') { // Record to update or delete not found
      responseMessage = `Erro: Um registro necessário para a operação não foi encontrado. ${ (err.meta?.cause as string) || ''}`;
    } else {
      responseMessage = err.message.split('\n').pop()?.trim() || 'Falha na operação do banco de dados.';
    }
  } else if (err instanceof Error) { // Erro genérico do JavaScript
    responseMessage = err.message;
    // Em desenvolvimento, você pode querer enviar mais detalhes:
    // if (process.env.NODE_ENV === 'development') {
    //   errorDetailsForClient = err.stack; // Cuidado ao expor stack trace
    // }
  } else { // Caso o erro não seja uma instância de Error
    responseMessage = 'Ocorreu um erro inesperado e não padronizado.';
    if (typeof err === 'string' || typeof err === 'number' || typeof err === 'boolean') {
        errorDetailsForClient = String(err);
    }
  }

  const responsePayload: ErrorResponsePayload = {
    success: false,
    message: responseMessage,
  };

  if (errorCode) responsePayload.code = errorCode;
  if (errorDetailsForClient) responsePayload.details = errorDetailsForClient;

  res.status(statusCode).json(responsePayload);
});


// === Inicialização do Servidor ===
app.listen(PORT, () => {
  console.log(`Backend do Espetinho Picoense rodando em http://localhost:${PORT} 🚀`);
});