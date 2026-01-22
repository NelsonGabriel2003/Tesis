/**
 * Search Routes
 * Rutas para búsqueda global
 */

import { Router } from 'express'
import { globalSearch } from '../controllers/search.controller.js'

const router = Router()

// Búsqueda global (pública - no requiere auth)
router.get('/', globalSearch)

export default router
