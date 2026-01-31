/**
 * Usuario Model
 * Consultas a la base de datos para usuarios
 */

import { query } from '../config/database.js'
import { conTransaccion, registrarHistorial, obtenerCamposModificados } from '../utils/transaccion.js'

/**
 * Calcular nivel de membresía basado en puntos y umbrales de BD
 * @param {number} puntosTotales - Puntos totales del usuario
 * @returns {string} - Nivel de membresía (bronce, plata, oro, platino)
 */
const calcularNivelMembresia = async (puntosTotales) => {
  // Obtener umbrales desde la BD
  const result = await query(
    `SELECT clave, valor FROM configuracion_negocio 
     WHERE clave IN ('umbral_plata', 'umbral_oro', 'umbral_platino')`
  )
  
  // Valores por defecto si no existen en BD
  const umbrales = {
    plata: 500,
    oro: 1500,
    platino: 5000
  }
  
  result.rows.forEach(row => {
    if (row.clave === 'umbral_plata') umbrales.plata = parseInt(row.valor)
    if (row.clave === 'umbral_oro') umbrales.oro = parseInt(row.valor)
    if (row.clave === 'umbral_platino') umbrales.platino = parseInt(row.valor)
  })
  
  // Determinar nivel
  if (puntosTotales >= umbrales.platino) return 'platino'
  if (puntosTotales >= umbrales.oro) return 'oro'
  if (puntosTotales >= umbrales.plata) return 'plata'
  return 'bronce'
}

const UsuarioModel = {
  /**
   * Buscar usuario por correo
   */
  buscarPorCorreo: async (correo) => {
    const result = await query(
      'SELECT * FROM usuarios WHERE correo = $1',
      [correo]
    )
    return result.rows[0]
  },

  /**
   * Buscar usuario por ID
   */
  buscarPorId: async (id) => {
    const result = await query(
      `SELECT id, correo, nombre, telefono, rol, nivel_membresia,
              puntos_actuales, puntos_totales, telegram_chat_id
       FROM usuarios WHERE id = $1`,
      [id]
    )
    return result.rows[0]
  },

  /**
   * Crear nuevo usuario con registro en historial
   */
  crear: async (datosUsuario, usuarioCreadorId = null, infoSolicitud = {}) => {
    const { correo, contrasena, nombre, telefono } = datosUsuario

    return await conTransaccion(async (cliente) => {
      // Insertar usuario
      const result = await cliente.query(
        `INSERT INTO usuarios (correo, contrasena, nombre, telefono, nivel_membresia, puntos_actuales, puntos_totales)
         VALUES ($1, $2, $3, $4, 'bronce', 0, 0)
         RETURNING id, correo, nombre, telefono, nivel_membresia, puntos_actuales, puntos_totales`,
        [correo, contrasena, nombre, telefono]
      )

      const nuevoUsuario = result.rows[0]

      // Registrar en historial
      await registrarHistorial(cliente, {
        tabla_afectada: 'usuarios',
        registro_id: nuevoUsuario.id,
        accion: 'INSERTAR',
        valores_anteriores: null,
        valores_nuevos: { correo, nombre, telefono, nivel_membresia: 'bronce' },
        usuario_id: usuarioCreadorId,
        direccion_ip: infoSolicitud.ip,
        agente_usuario: infoSolicitud.userAgent,
        descripcion: `Usuario ${nombre} registrado en el sistema`
      })

      return nuevoUsuario
    })
  },

  /**
   * Actualizar usuario con registro en historial
   */
  actualizar: async (id, datosUsuario, usuarioModificadorId = null, infoSolicitud = {}) => {
    const { nombre, telefono } = datosUsuario

    return await conTransaccion(async (cliente) => {
      // Obtener datos anteriores
      const anteriorResult = await cliente.query(
        'SELECT nombre, telefono FROM usuarios WHERE id = $1',
        [id]
      )
      const anterior = anteriorResult.rows[0]

      // Actualizar
      const result = await cliente.query(
        `UPDATE usuarios
         SET nombre = COALESCE($2, nombre),
             telefono = COALESCE($3, telefono)
         WHERE id = $1
         RETURNING id, correo, nombre, telefono, rol, nivel_membresia, puntos_actuales, puntos_totales`,
        [id, nombre, telefono]
      )

      const usuarioActualizado = result.rows[0]

      // Registrar en historial
      const camposModificados = obtenerCamposModificados(anterior, { nombre, telefono })
      if (camposModificados.length > 0) {
        await registrarHistorial(cliente, {
          tabla_afectada: 'usuarios',
          registro_id: id,
          accion: 'ACTUALIZAR',
          valores_anteriores: anterior,
          valores_nuevos: { nombre, telefono },
          campos_modificados: camposModificados,
          usuario_id: usuarioModificadorId,
          direccion_ip: infoSolicitud.ip,
          agente_usuario: infoSolicitud.userAgent,
          descripcion: `Datos de usuario actualizados`
        })
      }

      return usuarioActualizado
    })
  },

  /**
   * Actualizar puntos del usuario (lee umbrales de BD)
   */
  actualizarPuntos: async (id, puntosActuales, puntosTotales) => {
    // Calcular nivel basado en umbrales de BD
    const nuevoNivel = await calcularNivelMembresia(puntosTotales)
    
    const result = await query(
      `UPDATE usuarios
       SET puntos_actuales = $2,
           puntos_totales = $3,
           nivel_membresia = $4
       WHERE id = $1
       RETURNING id, correo, nombre, rol, nivel_membresia, puntos_actuales, puntos_totales`,
      [id, puntosActuales, puntosTotales, nuevoNivel]
    )
    return result.rows[0]
  },

  /**
   * Agregar puntos al usuario (lee umbrales de BD)
   */
  agregarPuntos: async (id, puntos) => {
    // Primero obtener puntos actuales
    const usuarioResult = await query(
      'SELECT puntos_actuales, puntos_totales FROM usuarios WHERE id = $1',
      [id]
    )
    
    if (usuarioResult.rows.length === 0) return null
    
    const usuario = usuarioResult.rows[0]
    const nuevosPuntosActuales = usuario.puntos_actuales + puntos
    const nuevosPuntosTotales = usuario.puntos_totales + puntos
    
    // Calcular nuevo nivel basado en umbrales de BD
    const nuevoNivel = await calcularNivelMembresia(nuevosPuntosTotales)
    
    const result = await query(
      `UPDATE usuarios
       SET puntos_actuales = $2,
           puntos_totales = $3,
           nivel_membresia = $4
       WHERE id = $1
       RETURNING id, correo, nombre, rol, nivel_membresia, puntos_actuales, puntos_totales`,
      [id, nuevosPuntosActuales, nuevosPuntosTotales, nuevoNivel]
    )
    return result.rows[0]
  },

  /**
   * Restar puntos al usuario (para canjes)
   */
  restarPuntos: async (id, puntos) => {
    const result = await query(
      `UPDATE usuarios
       SET puntos_actuales = puntos_actuales - $2
       WHERE id = $1 AND puntos_actuales >= $2
       RETURNING id, correo, nombre, rol, nivel_membresia, puntos_actuales, puntos_totales`,
      [id, puntos]
    )
    return result.rows[0]
  },

  /**
   * Obtener todos los usuarios (admin)
   */
  obtenerTodos: async (limite = 50, offset = 0) => {
    const result = await query(
      `SELECT id, correo, nombre, telefono, rol, nivel_membresia, puntos_actuales, puntos_totales
       FROM usuarios
       ORDER BY id DESC
       LIMIT $1 OFFSET $2`,
      [limite, offset]
    )
    return result.rows
  },

  /**
   * Guardar codigo de recuperacion de contrasena
   */
  guardarCodigoRecuperacion: async (correo, codigo, minutosExpiracion = 15) => {
    const result = await query(
      `UPDATE usuarios
       SET codigo_recuperacion = $2,
           codigo_recuperacion_expira = NOW() + INTERVAL '${minutosExpiracion} minutes'
       WHERE correo = $1
       RETURNING id, correo, nombre, telefono, telegram_chat_id`,
      [correo, codigo]
    )
    return result.rows[0]
  },

  /**
   * Verificar codigo de recuperacion
   */
  verificarCodigoRecuperacion: async (correo, codigo) => {
    const result = await query(
      `SELECT id, correo, nombre
       FROM usuarios
       WHERE correo = $1
         AND codigo_recuperacion = $2
         AND codigo_recuperacion_expira > NOW()`,
      [correo, codigo]
    )
    return result.rows[0]
  },

  /**
   * Cambiar contrasena y limpiar codigo de recuperacion
   */
  cambiarContrasena: async (correo, nuevaContrasenaHash) => {
    const result = await query(
      `UPDATE usuarios
       SET contrasena = $2,
           codigo_recuperacion = NULL,
           codigo_recuperacion_expira = NULL
       WHERE correo = $1
       RETURNING id, correo, nombre`,
      [correo, nuevaContrasenaHash]
    )
    return result.rows[0]
  },

  /**
   * Limpiar codigo de recuperacion
   */
  limpiarCodigoRecuperacion: async (correo) => {
    await query(
      `UPDATE usuarios
       SET codigo_recuperacion = NULL,
           codigo_recuperacion_expira = NULL
       WHERE correo = $1`,
      [correo]
    )
  },

  /**
   * Vincular Telegram chat ID al usuario
   */
  vincularTelegram: async (usuarioId, telegramChatId) => {
    const result = await query(
      `UPDATE usuarios
       SET telegram_chat_id = $2
       WHERE id = $1
       RETURNING id, correo, nombre, telegram_chat_id`,
      [usuarioId, telegramChatId]
    )
    return result.rows[0]
  },

  /**
   * Buscar usuario por Telegram chat ID
   */
  buscarPorTelegramChatId: async (telegramChatId) => {
    const result = await query(
      `SELECT id, correo, nombre, telefono, telegram_chat_id
       FROM usuarios
       WHERE telegram_chat_id = $1`,
      [telegramChatId]
    )
    return result.rows[0]
  },

  /**
   * Buscar usuario por telefono
   */
  buscarPorTelefono: async (telefono) => {
    const result = await query(
      `SELECT id, correo, nombre, telefono, telegram_chat_id, puntos_actuales
       FROM usuarios
       WHERE telefono = $1`,
      [telefono]
    )
    return result.rows[0]
  },

  /**
   * Vincular Telegram y dar puntos de bonificacion
   */
  vincularTelegramConBono: async (telefono, telegramChatId, puntosBonus) => {
    // Primero obtener usuario actual
    const usuarioResult = await query(
      'SELECT id, puntos_totales FROM usuarios WHERE telefono = $1 AND telegram_chat_id IS NULL',
      [telefono]
    )
    
    if (usuarioResult.rows.length === 0) return null
    
    const usuario = usuarioResult.rows[0]
    const nuevosPuntosTotales = usuario.puntos_totales + puntosBonus
    
    // Calcular nuevo nivel
    const nuevoNivel = await calcularNivelMembresia(nuevosPuntosTotales)
    
    const result = await query(
      `UPDATE usuarios
       SET telegram_chat_id = $2,
           puntos_actuales = puntos_actuales + $3,
           puntos_totales = puntos_totales + $3,
           nivel_membresia = $4
       WHERE telefono = $1
         AND telegram_chat_id IS NULL
       RETURNING id, correo, nombre, telefono, telegram_chat_id, puntos_actuales`,
      [telefono, telegramChatId, puntosBonus, nuevoNivel]
    )
    return result.rows[0]
  },

  /**
   * Verificar si es primer inicio de sesion
   */
  esPrimerLogin: async (usuarioId) => {
    const result = await query(
      `SELECT COUNT(*) as total FROM movimientos_puntos
       WHERE usuario_id = $1 AND tipo = 'ganado'`,
      [usuarioId]
    )
    return parseInt(result.rows[0].total) === 0
  }
}

export default UsuarioModel