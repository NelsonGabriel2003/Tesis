import { StaffModel } from '../models/index.js'

const StaffController = {
  // GET /api/staff - Obtener todo el personal
  getAll: async (req, res) => {
    try {
      const staff = await StaffModel.findAll(true)
      res.json({
        success: true,
        data: staff.map(s => ({
          id: s.id,
          name: s.name,
          phone: s.phone,
          email: s.email,
          role: s.role,
          isOnShift: s.is_on_shift,
          telegramLinked: !!s.telegram_chat_id,
          telegramUsername: s.telegram_username,
          linkCode: s.link_code,
          linkCodeExpires: s.link_code_expires,
          createdAt: s.created_at
        }))
      })
    } catch (error) {
      console.error('Error:', error)
      res.status(500).json({ success: false, message: 'Error al obtener personal' })
    }
  },

  // GET /api/staff/:id - Obtener un miembro del staff
  getById: async (req, res) => {
    try {
      const { id } = req.params
      const staff = await StaffModel.findById(id)

      if (!staff) {
        return res.status(404).json({ success: false, message: 'Personal no encontrado' })
      }

      res.json({
        success: true,
        data: {
          id: staff.id,
          name: staff.name,
          phone: staff.phone,
          email: staff.email,
          role: staff.role,
          isOnShift: staff.is_on_shift,
          telegramLinked: !!staff.telegram_chat_id,
          telegramUsername: staff.telegram_username,
          linkCode: staff.link_code,
          linkCodeExpires: staff.link_code_expires
        }
      })
    } catch (error) {
      console.error('Error:', error)
      res.status(500).json({ success: false, message: 'Error al obtener personal' })
    }
  },

  // POST /api/staff - Crear nuevo personal
  create: async (req, res) => {
    try {
      const { name, phone, email, role } = req.body
      if (!name) {
        return res.status(400).json({ success: false, message: 'El nombre es requerido' })
      }

      const staff = await StaffModel.create({ name, phone, email, role })
      res.status(201).json({ success: true, data: staff, message: 'Personal creado' })
    } catch (error) {
      console.error('Error:', error)
      res.status(500).json({ success: false, message: 'Error al crear personal' })
    }
  },

  // PUT /api/staff/:id - Actualizar personal
  update: async (req, res) => {
    try {
      const { id } = req.params
      const staffData = req.body

      const staff = await StaffModel.update(id, staffData)
      if (!staff) {
        return res.status(404).json({ success: false, message: 'Personal no encontrado' })
      }

      res.json({ success: true, data: staff, message: 'Personal actualizado' })
    } catch (error) {
      console.error('Error:', error)
      res.status(500).json({ success: false, message: 'Error al actualizar personal' })
    }
  },

  // POST /api/staff/:id/generate-code - Generar código de vinculación
  generateLinkCode: async (req, res) => {
    try {
      const { id } = req.params
      const staff = await StaffModel.findById(id)

      if (!staff) {
        return res.status(404).json({ success: false, message: 'Personal no encontrado' })
      }

      if (staff.telegram_chat_id) {
        return res.status(400).json({
          success: false,
          message: 'Este personal ya tiene Telegram vinculado'
        })
      }

      const updated = await StaffModel.generateLinkCode(id)

      res.json({
        success: true,
        data: {
          name: updated.name,
          linkCode: updated.link_code,
          expiresAt: updated.link_code_expires
        },
        message: `Código generado: ${updated.link_code} (válido por 24 horas)`
      })
    } catch (error) {
      console.error('Error:', error)
      res.status(500).json({ success: false, message: 'Error al generar código' })
    }
  },

  // DELETE /api/staff/:id/telegram - Desvincular Telegram
  unlinkTelegram: async (req, res) => {
    try {
      const { id } = req.params
      const staff = await StaffModel.findById(id)

      if (!staff) {
        return res.status(404).json({ success: false, message: 'Personal no encontrado' })
      }

      if (!staff.telegram_chat_id) {
        return res.status(400).json({ success: false, message: 'No tiene Telegram vinculado' })
      }

      await StaffModel.unlinkTelegram(id)
      res.json({ success: true, message: 'Telegram desvinculado correctamente' })
    } catch (error) {
      console.error('Error:', error)
      res.status(500).json({ success: false, message: 'Error al desvincular' })
    }
  },

  // PUT /api/staff/:id/shift - Cambiar estado de turno
  toggleShift: async (req, res) => {
    try {
      const { id } = req.params
      const { isOnShift } = req.body
      const staff = await StaffModel.findById(id)

      if (!staff) {
        return res.status(404).json({ success: false, message: 'Personal no encontrado' })
      }

      const updatedStaff = await StaffModel.setShiftStatus(id, isOnShift)
      res.json({
        success: true,
        data: updatedStaff,
        message: isOnShift ? 'Turno iniciado' : 'Turno finalizado'
      })
    } catch (error) {
      console.error('Error:', error)
      res.status(500).json({ success: false, message: 'Error al cambiar turno' })
    }
  },

  // GET /api/staff/on-shift - Obtener personal en turno
  getOnShift: async (req, res) => {
    try {
      const staff = await StaffModel.findOnShift()
      res.json({ success: true, data: staff })
    } catch (error) {
      console.error('Error:', error)
      res.status(500).json({ success: false, message: 'Error' })
    }
  },

  // DELETE /api/staff/:id - Eliminar (desactivar) personal
  delete: async (req, res) => {
    try {
      const { id } = req.params
      const staff = await StaffModel.delete(id)

      if (!staff) {
        return res.status(404).json({ success: false, message: 'Personal no encontrado' })
      }

      res.json({ success: true, message: 'Personal eliminado' })
    } catch (error) {
      console.error('Error:', error)
      res.status(500).json({ success: false, message: 'Error al eliminar' })
    }
  }
}

export const staffController = StaffController
