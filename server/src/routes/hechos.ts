import { Router } from 'express';
import {
  getHechos,
  getHechoById,
  createHecho,
  updateHecho,
  deleteHecho,
  getStats,
  exportHechos,
} from '../controllers/hechosController';
import { authMiddleware, requireRole } from '../middleware/auth';
import { hechoValidation } from '../middleware/validators';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Estadísticas y exportación (antes de /:id para evitar conflicto)
router.get('/stats', getStats);
router.get('/export', exportHechos);

// Lectura — cualquier rol autenticado
router.get('/', getHechos);
router.get('/:id', getHechoById);

// Escritura — admin y operador
router.post(
  '/',
  requireRole('admin', 'operador'),
  hechoValidation,
  createHecho
);
router.put(
  '/:id',
  requireRole('admin', 'operador'),
  hechoValidation,
  updateHecho
);

// Eliminación — solo admin
router.delete('/:id', requireRole('admin'), deleteHecho);

export default router;
