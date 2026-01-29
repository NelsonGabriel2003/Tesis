/**
 * Utilidad para manejar transacciones de base de datos
 * Permite ejecutar multiples operaciones de forma atomica
 */

import { pool } from '../config/database.js'

/**
 * Ejecuta una funcion dentro de una transaccion de base de datos
 * Si ocurre un error, hace rollback automaticamente
 *
 * @param {Function} callback - Funcion que recibe el cliente de la transaccion
 * @returns {Promise} - Resultado de la funcion callback
 *
 * @example
 * const resultado = await conTransaccion(async (cliente) => {
 *   await cliente.query('INSERT INTO usuarios ...')
 *   await cliente.query('INSERT INTO historial ...')
 *   return { exito: true }
 * })
 */
export const conTransaccion = async (callback) => {
  const cliente = await pool.connect()

  try {
    await cliente.query('BEGIN')
    const resultado = await callback(cliente)
    await cliente.query('COMMIT')
    return resultado
  } catch (error) {
    await cliente.query('ROLLBACK')
    throw error
  } finally {
    cliente.release()
  }
}

/**
 * Registra un cambio en el historial dentro de una transaccion
 *
 * @param {Object} cliente - Cliente de la transaccion
 * @param {Object} datos - Datos del historial
 */
export const registrarHistorial = async (cliente, datos) => {
  const {
    tabla_afectada,
    registro_id,
    accion,
    valores_anteriores = null,
    valores_nuevos = null,
    campos_modificados = null,
    usuario_id = null,
    direccion_ip = null,
    agente_usuario = null,
    descripcion = null
  } = datos

  const result = await cliente.query(
    `INSERT INTO historial
      (tabla_afectada, registro_id, accion, valores_anteriores, valores_nuevos,
       campos_modificados, usuario_id, direccion_ip, agente_usuario, descripcion)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`,
    [
      tabla_afectada,
      registro_id,
      accion,
      valores_anteriores ? JSON.stringify(valores_anteriores) : null,
      valores_nuevos ? JSON.stringify(valores_nuevos) : null,
      campos_modificados ? campos_modificados.join(',') : null,
      usuario_id,
      direccion_ip,
      agente_usuario,
      descripcion
    ]
  )
  return result.rows[0]
}

/**
 * Obtiene los campos que fueron modificados entre dos objetos
 *
 * @param {Object} anterior - Objeto con valores anteriores
 * @param {Object} nuevo - Objeto con valores nuevos
 * @returns {Array} - Lista de campos modificados
 */
export const obtenerCamposModificados = (anterior, nuevo) => {
  const camposModificados = []

  for (const campo in nuevo) {
    if (anterior[campo] !== nuevo[campo]) {
      camposModificados.push(campo)
    }
  }

  return camposModificados
}

export default {
  conTransaccion,
  registrarHistorial,
  obtenerCamposModificados
}
