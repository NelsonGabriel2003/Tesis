import { StaffModel } from '../models/index.js'

const StaffController = {
  getAll: async (req, res) => {
    try {
      const staff = await StaffModel.findAll(true)
      res.json({ success: true, data: staff })
    } catch (error) {
      console.error('Error:', error)
      res.status(500).json({ success: false, message: 'Error al obtener personal' })
    }
  },

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

  toggleShift: async (req, res) => {
    try {
      const { id } = req.params
      const { isOnShift } = req.body
      const staff = await StaffModel.findById(id)

      if (!staff) {
        return res.status(404).json({ success: false, message: 'Personal no encontrado' })
      }

      const updatedStaff = await StaffModel.setShiftStatus(id, isOnShift)
      res.json({ success: true, data: updatedStaff, message: isOnShift ? 'Turno iniciado' : 'Turno finalizado' })
    } catch (error) {
      console.error('Error:', error)
      res.status(500).json({ success: false, message: 'Error al cambiar turno' })
    }
  },

  getOnShift: async (req, res) => {
    try {
      const staff = await StaffModel.findOnShift()
      res.json({ success: true, data: staff })
    } catch (error) {
      console.error('Error:', error)
      res.status(500).json({ success: false, message: 'Error' })
    }
  }
}

export const staffController = StaffController