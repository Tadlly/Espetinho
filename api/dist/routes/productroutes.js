"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/routes/productRoutes.ts
const express_1 = require("express");
const productController_1 = require("../controllers/productController");
const router = (0, express_1.Router)();
router.get('/products', productController_1.getAllProductsController);
exports.default = router;
