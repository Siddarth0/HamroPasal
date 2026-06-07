import { Router } from 'express';
import { quote } from './shipping.controller';

const router = Router();

// Public: storefront can estimate shipping before login / checkout.
router.post('/quote', quote);

export default router;
