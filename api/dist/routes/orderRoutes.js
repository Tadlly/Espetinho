"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/routes/orderRoutes.ts
const express_1 = require("express");
const orderController_1 = require("../controllers/orderController"); // Criaremos este controller
const router = (0, express_1.Router)();
router.post('/orders', orderController_1.createOrderController);
exports.default = router;
