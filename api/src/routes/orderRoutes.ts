// backend/src/routes/orderRoutes.ts
import { Router } from 'express';
import { createOrderController } from '../controllers/orderController'; // Criaremos este controller

const router = Router();

router.post('/orders', createOrderController);

export default router;