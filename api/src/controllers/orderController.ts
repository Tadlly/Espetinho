import { Request, Response, NextFunction } from 'express';
import prisma from '../prismaClient';
import { Prisma, Order as PrismaOrder } from '@prisma/client'; // PrismaOrder para clareza
import * as qs from 'qs'; // Para o tipo ParsedQs

// --- Interfaces para o Payload da Requisição (Entrada) ---
interface OrderItemInput {
  productId: number;
  name: string;
  quantity: number;
  price: number;
}
interface CustomerDetailsInput {
  name: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
}
interface CreateOrderPayload {
  customerDetails: CustomerDetailsInput;
  items: OrderItemInput[];
  totalAmount: number;
  paymentMethod: string;
  orderNotes?: string;
}

// --- Tipos para a Resposta da API (Saída) ---
interface OrderItemResponse {
  productName: string;
  quantity: number;
  priceAtOrder: number;
}
interface FullOrderResponseData extends PrismaOrder { // Usar o tipo PrismaOrder diretamente
    items: OrderItemResponse[]; // E sobrescrever/adicionar 'items' com nosso formato desejado
}
interface SuccessResponse {
  success: true;
  message: string;
  order: FullOrderResponseData; // Usando o tipo mais completo aqui
}
interface ErrorResponse {
  success: false;
  message: string;
  details?: Record<string, unknown> | string; // 'details' agora é mais específico
  code?: string;
}
type ApiResponse = SuccessResponse | ErrorResponse;

// --- Tipagem da Requisição do Express ---
type TypedRequestBody<TReqBody> = Request<
  Record<string, string>, // P (Params): Objeto com chaves e valores string para parâmetros de rota.
  ApiResponse,           // ResBody: Nossa união de tipos de resposta.
  TReqBody,              // ReqBody: O tipo específico do corpo da requisição.
  qs.ParsedQs            // ReqQuery: Tipo para query strings parseadas pela bibl. 'qs'.
>;

export const createOrderController = async (
  req: TypedRequestBody<CreateOrderPayload>, 
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const { 
      customerDetails, 
      items, 
      totalAmount, 
      paymentMethod, 
      orderNotes 
    } = req.body;

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

    const newOrderFromDb = await prisma.order.create({
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
      include: { // O include aqui define o que o `newOrderFromDb` conterá.
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
    const responseOrderData: FullOrderResponseData = {
        ...newOrderFromDb, // Todas as propriedades de Order
        items: newOrderFromDb.items.map(item => ({ // Mapeia para o formato de OrderItemResponse
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

  } catch (e: unknown) {
    next(e); 
  }
};
export const getAllProductsController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { // Opcional: ordenar os produtos
        category: 'asc', // Por categoria
        name: 'asc',     // Depois por nome
      }
    });

    if (!products || products.length === 0) {
      // Considerar se isso é um erro 404 ou apenas um array vazio é aceitável
      res.status(200).json({ success: true, message: 'Nenhum produto encontrado.', products: [] });
      return;
    }

    res.status(200).json({ success: true, products });

  } catch (e: unknown) {
    console.error('Erro ao buscar produtos:', e);
    next(e); // Passa o erro para o middleware de erro centralizado
  }
};