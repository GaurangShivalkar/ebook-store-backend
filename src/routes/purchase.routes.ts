// src/routes/purchase.routes.ts
import { Router } from 'express';
import { simulatePurchase, setupProducts, getProducts } from '../controllers/purchase.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// Route to simulate buying a product (Protected)
router.post('/', protect, simulatePurchase);

// Routes to get/create dummy products
router.get('/products', getProducts);
router.post('/products/setup', setupProducts); // A helper to create products

export default router;