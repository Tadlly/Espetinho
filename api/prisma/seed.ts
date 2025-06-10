// backend/prisma/seed.ts
import { PrismaClient, Product } from '@prisma/client';

const prisma = new PrismaClient();

const productsData: Omit<Product, 'id' | 'orderItems'>[] = [ // Omit 'id' e 'orderItems' que são gerados/relacionais
  { name: 'Espeto de Frango', description: 'Frango na brasa, macio e suculento.', price: 8, category: 'Espetos', imageUrl: null },
  { name: 'Espeto de Carne', description: 'Carne bovina nobre, tempero especial.', price: 8, category: 'Espetos', imageUrl: null },
  { name: 'Espeto de Linguiça', description: 'Linguiça artesanal toscana, sabor autêntico.', price: 8, category: 'Espetos', imageUrl: null },
  { name: 'Espeto de Porco', description: 'Porco temperado na perfeição.', price: 8, category: 'Espetos', imageUrl: null },
  { name: 'Espeto de Língua', description: 'Língua bovina macia, com queijo derretido.', price: 8, category: 'Espetos', imageUrl: null },
  { name: 'Espeto de Queijo', description: 'Queijo coalho na brasa, crocante por fora.', price: 8, category: 'Espetos', imageUrl: null },
  { name: 'Baião de Dois', description: 'Tradicional arroz e feijão com carne seca e queijo coalho.', price: 8, category: 'Acompanhamentos', imageUrl: null },
  { name: 'Maria Isabel', description: 'Delicioso arroz com carne de sol desfiada e temperos regionais.', price: 8, category: 'Acompanhamentos', imageUrl: null },
  { name: 'Coca-Cola 1L', description: 'Refrigerante Coca-Cola gelado, garrafa de 1 litro.', price: 8, category: 'Bebidas', imageUrl: null },
  { name: 'Guaraná 1L', description: 'Refrigerante Guaraná Antarctica, garrafa de 1 litro.', price: 8, category: 'Bebidas', imageUrl: null },
  { name: 'Coca-Cola Latinha', description: 'Coca-Cola em lata 350ml.', price: 5, category: 'Bebidas', imageUrl: null },
  { name: 'Guaraná Latinha', description: 'Guaraná Antarctica em lata 350ml.', price: 5, category: 'Bebidas', imageUrl: null }
];

async function main() {
  console.log(`Iniciando o processo de seeding...`);

  // Opcional: Limpar dados existentes da tabela Product antes de popular
  // await prisma.orderItem.deleteMany({}); // Se houver OrderItems, precisam ser deletados primeiro por causa da relação
  // await prisma.product.deleteMany({});
  // console.log('Produtos existentes foram deletados.');

  for (const pData of productsData) {
    const product = await prisma.product.create({
      data: pData,
    });
    console.log(`Criado produto com id: <span class="math-inline">{product.id} (</span>{product.name})`);
  }
  console.log(`Seeding finalizado.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });