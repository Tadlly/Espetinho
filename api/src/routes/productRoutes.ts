// backend/src/routes/productRoutes.ts
import { Router } from 'express';
import { getAllProductsController } from '../controllers/productController';

const router = Router();

router.get('/products', getAllProductsController);

export default router;