import express from 'express';
import controller from '../controller/controller.js';
const router = express.Router();

// Get home from the controller and asign it to the '/'
router.get('/', controller);

export default router;