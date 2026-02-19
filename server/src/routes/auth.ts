import { Router } from 'express';
import {
  login,
  register,
  getMe,
  getUsers,
  toggleUserActive,
} from '../controllers/authController';
import { authMiddleware, requireRole } from '../middleware/auth';
import { loginValidation, registerValidation } from '../middleware/validators';

const router = Router();

// Públicas
router.post('/login', loginValidation, login);

// Protegidas
router.get('/me', authMiddleware, getMe);

// Solo admin
router.post(
  '/register',
  authMiddleware,
  requireRole('admin'),
  registerValidation,
  register
);
router.get('/users', authMiddleware, requireRole('admin'), getUsers);
router.patch(
  '/users/:id/toggle',
  authMiddleware,
  requireRole('admin'),
  toggleUserActive
);

export default router;
