/**
 * Personal Model
 * Consultas a la base de datos para personal del bar
 */

import { query } from '../config/database.js'
import { conTransaccion, registrarHistorial } from '../utils/transaccion.js'

/**
 * Genera un codigo aleatorio de 6 caracteres
 */
const generarCodigo = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let codigo = ''
  for (let i = 0; i < 6; i++) {
    codigo += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return codigo
}

const PersonalModel = {
  /**
   * Buscar personal por ID
   */
  buscarPorId: async (id) => {
    const result = await query(
      `SELECT * FROM personal WHERE id = $1`,
      [id]
    )
    return result.rows[0]
  },

  /**
   * Buscar personal por Telegram chat ID
   */
  buscarPorTelegramChatId: async (chatId) => {
    const result = await query(
      `SELECT * FROM personal WHERE telegram_chat_id = $1 AND activo = true`,
      [chatId]
    )
    return result.rows[0]
  },

  /**
   * Buscar personal por codigo de vinculacion
   */
  buscarPorCodigoVinculacion: async (codigo) => {
    const result = await query(
      `SELECT * FROM personal
       WHERE codigo_vinculacion = $1
       AND activo = true
       AND (codigo_vinculacion_expira IS NULL OR codigo_vinculacion_expira > CURRENT_TIMESTAMP)`,
      [codigo.toUpperCase()]
    )
    return result.rows[0]
  },

  /**
   * Obtener todo el personal
   */
  obtenerTodos: async (soloActivos = true) => {
    const whereClause = soloActivos ? 'WHERE activo = true' : ''
    const result = await query(
      `SELECT id, nombre, telefono, correo, rol, telegram_chat_id, telegram_username,
              activo, en_turno, codigo_vinculacion, codigo_vinculacion_expira
       FROM personal ${whereClause} ORDER BY nombre`
    )
    return result.rows
  },

  /**
   * Obtener personal en turno
   */
  obtenerEnTurno: async () => {
    const result = await query(
      `SELECT * FROM personal
       WHERE activo = true AND en_turno = true AND telegram_chat_id IS NOT NULL`
    )
    return result.rows
  },

  /**
   * Crear personal con registro en historial
   */
  crear: async (datosPersonal, usuarioId = null, infoSolicitud = {}) => {
    const { nombre, telefono, correo, rol } = datosPersonal

    return await conTransaccion(async (cliente) => {
      const result = await cliente.query(
        `INSERT INTO personal (nombre, telefono, correo, rol)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [nombre, telefono, correo, rol || 'mesero']
      )

      const nuevoPersonal = result.rows[0]

      await registrarHistorial(cliente, {
        tabla_afectada: 'personal',
        registro_id: nuevoPersonal.id,
        accion: 'INSERTAR',
        valores_nuevos: datosPersonal,
        usuario_id: usuarioId,
        direccion_ip: infoSolicitud.ip,
        agente_usuario: infoSolicitud.userAgent,
        descripcion: `Personal ${nombre} registrado`
      })

      return nuevoPersonal
    })
  },

  /**
   * Actualizar personal
   */
  actualizar: async (id, datosPersonal) => {
    const { nombre, telefono, correo, rol, activo } = datosPersonal
    const result = await query(
      `UPDATE personal SET
        nombre = COALESCE($2, nombre),
        telefono = COALESCE($3, telefono),
        correo = COALESCE($4, correo),
        rol = COALESCE($5, rol),
        activo = COALESCE($6, activo)
       WHERE id = $1
       RETURNING *`,
      [id, nombre, telefono, correo, rol, activo]
    )
    return result.rows[0]
  },

  /**
   * Generar codigo de vinculacion
   */
  generarCodigoVinculacion: async (id) => {
    const codigo = generarCodigo()
    const result = await query(
      `UPDATE personal SET
        codigo_vinculacion = $2,
        codigo_vinculacion_expira = CURRENT_TIMESTAMP + INTERVAL '24 hours'
       WHERE id = $1
       RETURNING *`,
      [id, codigo]
    )
    return result.rows[0]
  },

  /**
   * Limpiar codigo de vinculacion
   */
  limpiarCodigoVinculacion: async (id) => {
    const result = await query(
      `UPDATE personal SET
        codigo_vinculacion = NULL,
        codigo_vinculacion_expira = NULL
       WHERE id = $1
       RETURNING *`,
      [id]
    )
    return result.rows[0]
  },

  /**
   * Vincular con Telegram
   */
  vincularTelegram: async (id, chatId, username) => {
    const result = await query(
      `UPDATE personal SET
        telegram_chat_id = $2,
        telegram_username = $3,
        codigo_vinculacion = NULL,
        codigo_vinculacion_expira = NULL
       WHERE id = $1
       RETURNING *`,
      [id, chatId, username]
    )
    return result.rows[0]
  },

  /**
   * Desvincular Telegram
   */
  desvincularTelegram: async (id) => {
    const result = await query(
      `UPDATE personal SET
        telegram_chat_id = NULL,
        telegram_username = NULL,
        en_turno = false
       WHERE id = $1
       RETURNING *`,
      [id]
    )
    return result.rows[0]
  },

  /**
   * Establecer estado de turno
   */
  establecerEstadoTurno: async (id, enTurno) => {
    const result = await query(
      `UPDATE personal SET
        en_turno = $2,
        ultima_actividad = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id, enTurno]
    )
    return result.rows[0]
  },

  /**
   * Actualizar ultima actividad
   */
  actualizarUltimaActividad: async (id) => {
    await query(
      `UPDATE personal SET ultima_actividad = CURRENT_TIMESTAMP WHERE id = $1`,
      [id]
    )
  },

  /**
   * Eliminar personal (soft delete)
   */
  eliminar: async (id) => {
    const result = await query(
      `UPDATE personal SET activo = false WHERE id = $1 RETURNING *`,
      [id]
    )
    return result.rows[0]
  }
}

export default PersonalModel
