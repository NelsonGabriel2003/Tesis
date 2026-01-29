/**
 * Auth Controller
 * Maneja login, registro y autenticacion
 */

import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import UsuarioModel from '../models/usuario.model.js'
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
      message: 'Email y contrasena son requeridos'
    })
  }

  // Buscar usuario por correo
  const usuario = await UsuarioModel.buscarPorCorreo(email)

  if (!usuario) {
    return res.status(401).json({
      success: false,
      message: 'Credenciales invalidas'
    })
  }

  // Verificar contrasena
  const contrasenaValida = await bcrypt.compare(password, usuario.contrasena)

  if (!contrasenaValida) {
    return res.status(401).json({
      success: false,
      message: 'Credenciales invalidas'
    })
  }

  // Generar token JWT
  const token = jwt.sign(
    {
      id: usuario.id,
      email: usuario.correo,
      role: usuario.rol || 'usuario'
    },
    jwtConfig.secret,
    { expiresIn: jwtConfig.expiresIn }
  )

  // Respuesta exitosa (sin incluir contrasena)
  res.json({
    success: true,
    message: 'Login exitoso',
    token,
    user: {
      id: usuario.id,
      email: usuario.correo,
      name: usuario.nombre,
      phone: usuario.telefono,
      role: usuario.rol,
      membershipLevel: usuario.nivel_membresia,
      points: {
        current: usuario.puntos_actuales,
        total: usuario.puntos_totales
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
      message: 'Email, contrasena y nombre son requeridos'
    })
  }

  // Validar formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Formato de email invalido'
    })
  }

  // Validar longitud de contrasena
  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'La contrasena debe tener al menos 6 caracteres'
    })
  }

  // Verificar si el email ya existe
  const usuarioExistente = await UsuarioModel.buscarPorCorreo(email)

  if (usuarioExistente) {
    return res.status(409).json({
      success: false,
      message: 'El email ya esta registrado'
    })
  }

  // Hashear contrasena
  const saltRounds = 10
  const contrasenaHash = await bcrypt.hash(password, saltRounds)

  // Obtener info de la solicitud para historial
  const infoSolicitud = {
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent')
  }

  // Crear usuario
  const nuevoUsuario = await UsuarioModel.crear({
    correo: email,
    contrasena: contrasenaHash,
    nombre: name,
    telefono: phone
  }, null, infoSolicitud)

  // Generar token JWT
  const token = jwt.sign(
    {
      id: nuevoUsuario.id,
      email: nuevoUsuario.correo,
      role: 'usuario'
    },
    jwtConfig.secret,
    { expiresIn: jwtConfig.expiresIn }
  )

  res.status(201).json({
    success: true,
    message: 'Usuario registrado exitosamente',
    token,
    user: {
      id: nuevoUsuario.id,
      email: nuevoUsuario.correo,
      name: nuevoUsuario.nombre,
      phone: nuevoUsuario.telefono,
      membershipLevel: nuevoUsuario.nivel_membresia,
      points: {
        current: nuevoUsuario.puntos_actuales,
        total: nuevoUsuario.puntos_totales
      }
    }
  })
})

/**
 * Obtener perfil del usuario autenticado
 * GET /api/auth/me
 */
const getMe = asyncHandler(async (req, res) => {
  const usuario = await UsuarioModel.buscarPorId(req.user.id)

  if (!usuario) {
    return res.status(404).json({
      success: false,
      message: 'Usuario no encontrado'
    })
  }

  res.json({
    success: true,
    user: {
      id: usuario.id,
      email: usuario.correo,
      name: usuario.nombre,
      phone: usuario.telefono,
      role: usuario.rol,
      membershipLevel: usuario.nivel_membresia,
      points: {
        current: usuario.puntos_actuales,
        total: usuario.puntos_totales
      }
    }
  })
})

/**
 * Actualizar perfil del usuario
 * PUT /api/auth/me
 */
const updateMe = asyncHandler(async (req, res) => {
  const { name, phone } = req.body

  // Obtener info de la solicitud para historial
  const infoSolicitud = {
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent')
  }

  const usuarioActualizado = await UsuarioModel.actualizar(
    req.user.id,
    { nombre: name, telefono: phone },
    req.user.id,
    infoSolicitud
  )

  if (!usuarioActualizado) {
    return res.status(404).json({
      success: false,
      message: 'Usuario no encontrado'
    })
  }

  res.json({
    success: true,
    message: 'Perfil actualizado',
    user: {
      id: usuarioActualizado.id,
      email: usuarioActualizado.correo,
      name: usuarioActualizado.nombre,
      phone: usuarioActualizado.telefono,
      role: usuarioActualizado.rol,
      membershipLevel: usuarioActualizado.nivel_membresia,
      points: {
        current: usuarioActualizado.puntos_actuales,
        total: usuarioActualizado.puntos_totales
      }
    }
  })
})

export { login, register, getMe, updateMe }
