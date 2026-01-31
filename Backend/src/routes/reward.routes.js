/**
 * Reward Routes
 * Rutas para recompensas y canjes
 */

import { Router } from 'express'
import {
  getRewards,
  getRewardById,
  redeemReward,
  getMyRedemptions,
  validateRedemptionCode,
  useRedemptionCode,
  getCategories,
  createReward,
  updateReward,
  getPendingRedemptions
} from '../controllers/reward.controller.js'
import { verifyToken, requireRole } from '../middlewares/index.js'

const router = Router()

// Rutas públicas
router.get('/', getRewards)
router.get('/categories', getCategories)

// Canjes pendientes (Admin) - ANTES de /:id para evitar conflictos
router.get('/pending', verifyToken, requireRole('admin'), getPendingRedemptions)

router.get('/:id', getRewardById)

// Rutas protegidas (Usuario autenticado)
router.post('/:id/redeem', verifyToken, redeemReward)
router.get('/user/my-redemptions', verifyToken, getMyRedemptions)

// Rutas para empleados/admin (validar códigos)
router.get('/validate/:code', verifyToken, validateRedemptionCode)
router.post('/use/:code', verifyToken, useRedemptionCode)

// Rutas protegidas (Admin)
router.post('/', verifyToken, requireRole('admin'), createReward)
router.put('/:id', verifyToken, requireRole('admin'), updateReward)

export default router