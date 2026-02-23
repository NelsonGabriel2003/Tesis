import { Router } from 'express'
import {
  getAllConfig,
  getPointsConfig,
  getMembershipConfig,
  getWhatsappConfig,
  getConfigByKey,
  updateConfig,
  updateManyConfig,
  createConfig
} from '../controllers/config.controller.js'
import { verifyToken, verifyAdmin } from '../middlewares/index.js'

const router = Router()

// Rutas públicas (para que el frontend pueda leer configuraciones)
router.get('/points', getPointsConfig)
router.get('/membership', getMembershipConfig)
router.get('/whatsapp', getWhatsappConfig)

// Rutas protegidas (solo admin)
router.get('/', verifyToken, verifyAdmin, getAllConfig)
router.get('/:key', verifyToken, verifyAdmin, getConfigByKey)
router.put('/:key', verifyToken, verifyAdmin, updateConfig)
router.put('/', verifyToken, verifyAdmin, updateManyConfig)
router.post('/', verifyToken, verifyAdmin, createConfig)

export default router
