/**
 * Auth Controller
 * Maneja login, registro y autenticación
 */

import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import UserModel from '../models/user.model.js'
import jwtConfig from '../config/jwt.js'
import { asyncHandler } from '../middlewares/index.js'

/**
 * Login de usuario
 * POST /api/auth/login
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  // Validar campos requeridos
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email y contraseña son requeridos'
    })
  }

  // Buscar usuario por email
  const user = await UserModel.findByEmail(email)

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Credenciales inválidas'
    })
  }

  // Verificar contraseña
  const isValidPassword = await bcrypt.compare(password, user.password)

  if (!isValidPassword) {
    return res.status(401).json({
      success: false,
      message: 'Credenciales inválidas'
    })
  }

  // Generar token JWT
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role || 'user'
    },
    jwtConfig.secret,
    { expiresIn: jwtConfig.expiresIn }
  )

  // Respuesta exitosa (sin incluir password)
  res.json({
    success: true,
    message: 'Login exitoso',
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
      membershipLevel: user.membership_level,
      points: {
        current: user.current_points,
        total: user.total_points
      }
    }
  })
})

/**
 * Registro de usuario
 * POST /api/auth/register
 */
const register = asyncHandler(async (req, res) => {
  const { email, password, name, phone } = req.body

  // Validar campos requeridos
  if (!email || !password || !name) {
    return res.status(400).json({
      success: false,
      message: 'Email, contraseña y nombre son requeridos'
    })
  }

  // Validar formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Formato de email inválido'
    })
  }

  // Validar longitud de contraseña
  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'La contraseña debe tener al menos 6 caracteres'
    })
  }

  // Verificar si el email ya existe
  const existingUser = await UserModel.findByEmail(email)

  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: 'El email ya está registrado'
    })
  }

  // Hashear contraseña
  const saltRounds = 10
  const hashedPassword = await bcrypt.hash(password, saltRounds)

  // Crear usuario
  const newUser = await UserModel.create({
    email,
    password: hashedPassword,
    name,
    phone
  })

  // Generar token JWT
  const token = jwt.sign(
    {
      id: newUser.id,
      email: newUser.email,
      role: 'user'
    },
    jwtConfig.secret,
    { expiresIn: jwtConfig.expiresIn }
  )

  res.status(201).json({
    success: true,
    message: 'Usuario registrado exitosamente',
    token,
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      phone: newUser.phone,
      membershipLevel: newUser.membership_level,
      points: {
        current: newUser.current_points,
        total: newUser.total_points
      }
    }
  })
})

/**
 * Obtener perfil del usuario autenticado
 * GET /api/auth/me
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await UserModel.findById(req.user.id)

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'Usuario no encontrado'
    })
  }

  res.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      membershipLevel: user.membership_level,
      points: {
        current: user.current_points,
        total: user.total_points
      },
      createdAt: user.created_at
    }
  })
})

/**
 * Actualizar perfil del usuario
 * PUT /api/auth/me
 */
const updateMe = asyncHandler(async (req, res) => {
  const { name, phone } = req.body

  const updatedUser = await UserModel.update(req.user.id, { name, phone })

  if (!updatedUser) {
    return res.status(404).json({
      success: false,
      message: 'Usuario no encontrado'
    })
  }

  res.json({
    success: true,
    message: 'Perfil actualizado',
    user: {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      phone: updatedUser.phone,
      membershipLevel: updatedUser.membership_level,
      points: {
        current: updatedUser.current_points,
        total: updatedUser.total_points
      }
    }
  })
})

export { login, register, getMe, updateMe }
