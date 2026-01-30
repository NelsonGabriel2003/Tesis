import TelegramBot from 'node-telegram-bot-api'
import { telegram as config } from '../config/index.js'
import { PersonalModel, SesionTelegramModel, PedidoModel, UsuarioModel, MovimientoModel, CanjeModel } from '../models/index.js'

class TelegramService {
  constructor() {
    this.bot = null
    this.isInitialized = false
    this.useWebhook = process.env.TELEGRAM_USE_WEBHOOK === 'true'
  }

  /**
   * Inicializa el bot de Telegram
   * - En producción (Railway): usa Webhook
   * - En desarrollo (local): usa Polling
   */
  initialize() {
    if (!config.botToken) {
      console.log('⚠️ TELEGRAM_BOT_TOKEN no configurado. Bot deshabilitado.')
      return
    }

    if (this.useWebhook) {
      // Modo Webhook para producción
      this.bot = new TelegramBot(config.botToken, { webHook: false })
      this.isInitialized = true
      this.setupHandlers() // Configurar handlers para procesar mensajes
      this.setupWebhook()
      console.log('✅ Telegram Bot inicializado en modo WEBHOOK')
    } else {
      // Modo Polling para desarrollo local
      this.bot = new TelegramBot(config.botToken, { polling: true })
      this.isInitialized = true
      this.setupHandlers()
      console.log('✅ Telegram Bot inicializado en modo POLLING')
    }
  }

  /**
   * Configura el webhook con Telegram
   */
  async setupWebhook() {
    const webhookUrl = process.env.TELEGRAM_WEBHOOK_URL

    if (!webhookUrl) {
      console.error('❌ TELEGRAM_WEBHOOK_URL no configurado')
      return
    }

    try {
      // Registrar el webhook con Telegram
      await this.bot.setWebHook(webhookUrl)
      console.log(`✅ Webhook registrado: ${webhookUrl}`)

      // Verificar el estado del webhook
      const info = await this.bot.getWebHookInfo()
      console.log('📡 Webhook Info:', {
        url: info.url,
        pending_update_count: info.pending_update_count,
        last_error_message: info.last_error_message || 'Sin errores'
      })
    } catch (error) {
      console.error('❌ Error configurando webhook:', error.message)
    }
  }

  /**
   * Procesa updates recibidos via webhook
   * @param {Object} update - Update de Telegram
   */
  processUpdate(update) {
    if (!this.bot || !this.isInitialized) {
      console.log('⚠️ Bot no inicializado, ignorando update')
      return
    }

    // Procesar el update manualmente
    this.bot.processUpdate(update)
  }

  /**
   * Elimina el webhook (útil para cambiar a polling)
   */
  async removeWebhook() {
    if (!this.bot) return

    try {
      await this.bot.deleteWebHook()
      console.log('✅ Webhook eliminado')
    } catch (error) {
      console.error('❌ Error eliminando webhook:', error.message)
    }
  }

  setupHandlers() {
    if (!this.bot) return

    this.bot.onText(/\/start/, (msg) => this.handleStart(msg))
    this.bot.onText(/\/vincular$/, (msg) => this.handleLinkNoCode(msg))
    this.bot.onText(/\/vincular (.+)/, (msg, match) => this.handleLink(msg, match[1]))
    this.bot.onText(/\/micuenta/, (msg) => this.handleMiCuenta(msg))
    this.bot.onText(/\/turno/, (msg) => this.handleShiftOn(msg))
    this.bot.onText(/\/descanso/, (msg) => this.handleShiftOff(msg))
    this.bot.onText(/\/estado/, (msg) => this.handleStatus(msg))
    this.bot.onText(/\/pedidos/, (msg) => this.handleListOrders(msg))
    this.bot.onText(/\/validar$/, (msg) => this.manejarValidarSinCodigo(msg))
    this.bot.onText(/\/validar (.+)/, (msg, match) => this.manejarValidarCanje(msg, match[1]))

    this.bot.on('callback_query', (query) => this.handleCallback(query))
    this.bot.on('contact', (msg) => this.handleContact(msg))
  }

  async handleStart(msg) {
    const chatId = msg.chat.id
    const firstName = msg.from.first_name || 'Usuario'

    await SesionTelegramModel.crear({
      chat_id: chatId.toString(),
      telegram_user_id: msg.from.id.toString(),
      username: msg.from.username,
      nombre: firstName
    })

    // Verificar si ya está vinculado como usuario
    const usuarioVinculado = await UsuarioModel.buscarPorTelegramChatId(chatId.toString())
    if (usuarioVinculado) {
      await this.sendMessage(chatId, `
🎉 *Hola ${usuarioVinculado.nombre}!*

Tu cuenta ya está vinculada.
Recibirás códigos de recuperación y notificaciones aquí.
      `, { parse_mode: 'Markdown' })
      return
    }

    await this.sendMessage(chatId, `
🍺 *Bienvenido a Bounty!*

Hola ${firstName}, soy el bot oficial.

*Para clientes:*
/micuenta - Vincula tu cuenta y gana 50 puntos

*Para staff:*
/vincular CODIGO - Vincular cuenta de empleado
    `, { parse_mode: 'Markdown' })
  }

  async handleMiCuenta(msg) {
    const chatId = msg.chat.id

    // Verificar si ya está vinculado
    const usuarioVinculado = await UsuarioModel.buscarPorTelegramChatId(chatId.toString())
    if (usuarioVinculado) {
      await this.sendMessage(chatId, `
✅ *Ya estás vinculado*

Cuenta: ${usuarioVinculado.correo}
Puntos: ${usuarioVinculado.puntos_actuales || 0}
      `, { parse_mode: 'Markdown' })
      return
    }

    // Solicitar número de teléfono
    await this.sendMessage(chatId, `
📱 *Vincula tu cuenta*

Para vincular tu cuenta y ganar *50 puntos*, comparte tu número de teléfono.

Debe ser el mismo número que registraste en la app.
    `, {
      parse_mode: 'Markdown',
      reply_markup: {
        keyboard: [[{
          text: '📱 Compartir mi número',
          request_contact: true
        }]],
        resize_keyboard: true,
        one_time_keyboard: true
      }
    })
  }

  async handleContact(msg) {
    const chatId = msg.chat.id
    const contact = msg.contact

    if (!contact || !contact.phone_number) {
      await this.sendMessage(chatId, '❌ No se pudo obtener tu número.')
      return
    }

    // Normalizar número (quitar + y espacios)
    let phone = contact.phone_number.replace(/[\s+\-]/g, '')

    // Si empieza con código de país, intentar también sin él
    const variantes = [phone]
    if (phone.startsWith('593')) variantes.push(phone.substring(3))
    if (phone.startsWith('0')) variantes.push(phone.substring(1))
    if (!phone.startsWith('0')) variantes.push('0' + phone)

    let usuario = null
    for (const variante of variantes) {
      usuario = await UsuarioModel.buscarPorTelefono(variante)
      if (usuario) break
    }

    if (!usuario) {
      await this.sendMessage(chatId, `
❌ *Número no encontrado*

El número ${contact.phone_number} no está registrado en nuestra app.

Asegúrate de usar el mismo número con el que te registraste.
      `, {
        parse_mode: 'Markdown',
        reply_markup: { remove_keyboard: true }
      })
      return
    }

    if (usuario.telegram_chat_id) {
      await this.sendMessage(chatId, `
⚠️ *Cuenta ya vinculada*

Esta cuenta ya tiene Telegram vinculado.
      `, {
        parse_mode: 'Markdown',
        reply_markup: { remove_keyboard: true }
      })
      return
    }

    // Vincular y dar puntos
    const PUNTOS_BONUS = 50
    const resultado = await UsuarioModel.vincularTelegramConBono(
      usuario.telefono,
      chatId.toString(),
      PUNTOS_BONUS
    )

    if (resultado) {
      await this.sendMessage(chatId, `
🎉 *Cuenta vinculada exitosamente!*

${resultado.nombre}, ahora puedes:
• Recibir códigos de recuperación
• Recibir notificaciones de pedidos

🎁 *+${PUNTOS_BONUS} puntos agregados a tu cuenta!*

Puntos actuales: ${resultado.puntos_actuales}
      `, {
        parse_mode: 'Markdown',
        reply_markup: { remove_keyboard: true }
      })
    } else {
      await this.sendMessage(chatId, '❌ Error al vincular. Intenta de nuevo.', {
        reply_markup: { remove_keyboard: true }
      })
    }
  }

  async handleLinkNoCode(msg) {
    const chatId = msg.chat.id
    await this.sendMessage(chatId, `
❌ *Código requerido*

Para vincular tu cuenta necesitas un código.
Pídelo al administrador del bar.

Uso: \`/vincular CODIGO\`
    `, { parse_mode: 'Markdown' })
  }

  async handleLink(msg, code) {
    const chatId = msg.chat.id

    // Verificar si ya está vinculado
    const personalExistente = await PersonalModel.buscarPorTelegramChatId(chatId.toString())
    if (personalExistente) {
      await this.sendMessage(chatId, `
⚠️ Ya estás vinculado como *${personalExistente.nombre}*

Usa /estado para ver tu información.
      `, { parse_mode: 'Markdown' })
      return
    }

    // Buscar personal por código
    const personal = await PersonalModel.buscarPorCodigoVinculacion(code.trim())

    if (!personal) {
      await this.sendMessage(chatId, `
❌ *Código inválido o expirado*

Verifica el código e intenta de nuevo.
Si el problema persiste, pide un nuevo código al administrador.
      `, { parse_mode: 'Markdown' })
      return
    }

    // Vincular
    await PersonalModel.vincularTelegram(personal.id, chatId.toString(), msg.from.username)
    await SesionTelegramModel.vincularAPersonal(chatId.toString(), personal.id)

    await this.sendMessage(chatId, `
✅ *¡Vinculación exitosa!*

Bienvenido/a *${personal.nombre}*
Tu cuenta ha sido vinculada correctamente.

Usa /turno para iniciar tu turno y recibir pedidos.
    `, { parse_mode: 'Markdown' })
  }

  async handleShiftOn(msg) {
    const chatId = msg.chat.id
    const personal = await PersonalModel.buscarPorTelegramChatId(chatId.toString())

    if (!personal) {
      await this.sendMessage(chatId, '❌ No estás vinculado. Usa /vincular primero.')
      return
    }

    await PersonalModel.establecerEstadoTurno(personal.id, true)
    await this.sendMessage(chatId, `✅ *Turno Iniciado*\n\n${personal.nombre}, recibirás pedidos. 💪`, { parse_mode: 'Markdown' })
  }

  async handleShiftOff(msg) {
    const chatId = msg.chat.id
    const personal = await PersonalModel.buscarPorTelegramChatId(chatId.toString())

    if (!personal) {
      await this.sendMessage(chatId, '❌ No estás vinculado.')
      return
    }

    await PersonalModel.establecerEstadoTurno(personal.id, false)
    await this.sendMessage(chatId, `😴 *Turno Finalizado*\n\n¡Descansa! 👋`, { parse_mode: 'Markdown' })
  }

  async handleStatus(msg) {
    const chatId = msg.chat.id
    const personal = await PersonalModel.buscarPorTelegramChatId(chatId.toString())

    if (!personal) {
      await this.sendMessage(chatId, '❌ No estás vinculado.')
      return
    }

    const status = personal.en_turno ? '🟢 En turno' : '🔴 Fuera de turno'
    await this.sendMessage(chatId, `📊 *Estado*\n\n👤 ${personal.nombre}\n${status}`, { parse_mode: 'Markdown' })
  }

  async handleListOrders(msg) {
    const chatId = msg.chat.id
    const pedidosPendientes = await PedidoModel.obtenerPendientes()

    if (pedidosPendientes.length === 0) {
      await this.sendMessage(chatId, '✨ No hay pedidos pendientes.')
      return
    }

    let message = `📋 *Pedidos Pendientes (${pedidosPendientes.length})*\n\n`
    pedidosPendientes.slice(0, 5).forEach(pedido => {
      message += `• #${pedido.codigo_pedido} - Mesa ${pedido.numero_mesa || 'N/A'} - $${pedido.total}\n`
    })

    await this.sendMessage(chatId, message, { parse_mode: 'Markdown' })
  }

  /**
   * Manejar comando /validar sin código
   */
  async manejarValidarSinCodigo(msg) {
    const chatId = msg.chat.id
    await this.sendMessage(chatId, `
❌ *Código requerido*

Para validar un canje necesitas el código.
El cliente debe mostrártelo desde su app.

Uso: \`/validar CODIGO\`

Ejemplo: \`/validar 7X9K2\`
    `, { parse_mode: 'Markdown' })
  }

  /**
   * Manejar comando /validar con código
   */
  async manejarValidarCanje(msg, codigo) {
    const chatId = msg.chat.id

    // Verificar que el empleado esté vinculado
    const empleado = await PersonalModel.buscarPorTelegramChatId(chatId.toString())
    if (!empleado) {
      await this.sendMessage(chatId, '❌ No estás vinculado. Usa /vincular primero.')
      return
    }

    // Buscar el canje por código
    const canje = await CanjeModel.buscarPorCodigo(codigo.trim().toUpperCase())

    if (!canje) {
      await this.sendMessage(chatId, `
❌ *Código no encontrado*

El código \`${codigo.toUpperCase()}\` no existe o es inválido.
Verifica que el cliente te muestre el código correcto.
      `, { parse_mode: 'Markdown' })
      return
    }

    // Formatear fecha
    const fechaCanje = new Date(canje.fecha_canje).toLocaleDateString('es-EC', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })

    // Determinar estado y emoji
    const esUsado = canje.estado === 'usado'
    const estadoTexto = esUsado ? '✅ Usado' : '⏳ Pendiente'

    if (esUsado) {
      const fechaUso = new Date(canje.fecha_uso).toLocaleDateString('es-EC', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })

      await this.sendMessage(chatId, `
⚠️ *CANJE YA UTILIZADO*

🎫 Código: \`${canje.codigo_canje}\`
🏆 Recompensa: ${canje.nombre_recompensa}
👤 Cliente: ${canje.nombre_usuario}
📅 Canjeado: ${fechaCanje}
📅 Usado: ${fechaUso}
📊 Estado: ${estadoTexto}

Este código ya fue procesado anteriormente.
      `, { parse_mode: 'Markdown' })
      return
    }

    // Mostrar información del canje pendiente con botón de confirmar
    const teclado = {
      inline_keyboard: [[
        { text: '✅ Confirmar Entrega', callback_data: `canje_confirmar_${canje.id}` }
      ]]
    }

    await this.sendMessage(chatId, `
🎁 *VALIDACIÓN DE CANJE*

🎫 Código: \`${canje.codigo_canje}\`
🏆 Recompensa: *${canje.nombre_recompensa}*
👤 Cliente: ${canje.nombre_usuario}
📅 Fecha canje: ${fechaCanje}
📊 Estado: ${estadoTexto}

¿Confirmas la entrega de esta recompensa?
    `, {
      parse_mode: 'Markdown',
      reply_markup: teclado
    })
  }

  /**
   * Manejar confirmación de canje
   */
  async manejarConfirmarCanje(query, canjeId) {
    const chatId = query.message.chat.id
    const mensajeId = query.message.message_id

    // Verificar empleado
    const empleado = await PersonalModel.buscarPorTelegramChatId(chatId.toString())
    if (!empleado) {
      await this.bot.answerCallbackQuery(query.id, { text: '❌ No autorizado' })
      return
    }

    // Marcar canje como usado
    const canjeActualizado = await CanjeModel.marcarComoUsado(parseInt(canjeId))

    if (!canjeActualizado) {
      await this.bot.answerCallbackQuery(query.id, { text: '❌ Error: Canje no encontrado o ya usado' })
      return
    }

    // Obtener datos del canje para el mensaje
    const canje = await CanjeModel.buscarPorId(parseInt(canjeId))

    await this.bot.answerCallbackQuery(query.id, { text: '✅ Canje procesado' })

    // Actualizar mensaje
    await this.bot.editMessageText(`
✅ *CANJE COMPLETADO*

🏆 ${canje.nombre_recompensa}
👤 Entregado a: ${canje.nombre_usuario || 'Cliente'}
👨‍💼 Procesado por: ${empleado.nombre}
📅 ${new Date().toLocaleDateString('es-EC')}

El código ya no es válido.
    `, {
      chat_id: chatId,
      message_id: mensajeId,
      parse_mode: 'Markdown'
    })

    // Actualizar actividad del empleado
    await PersonalModel.actualizarUltimaActividad(empleado.id)
  }


  async handleCallback(query) {
    const chatId = query.message.chat.id
    const data = query.data
    const messageId = query.message.message_id


    // Manejar callbacks de canjes
    if (data.startsWith('canje_confirmar_')) {
      const canjeId = data.replace('canje_confirmar_', '')
      await this.manejarConfirmarCanje(query, canjeId)
      return
    }

    const personal = await PersonalModel.buscarPorTelegramChatId(chatId.toString())
    if (!personal) {
      await this.bot.answerCallbackQuery(query.id, { text: '❌ No autorizado' })
      return
    }

    const [action, pedidoId] = data.split('_')
    const pedido = await PedidoModel.buscarPorId(parseInt(pedidoId))

    if (!pedido) {
      await this.bot.answerCallbackQuery(query.id, { text: '❌ Pedido no encontrado' })
      return
    }

    let responseText = ''
    let nuevoEstado = ''

    switch (action) {
      case 'approve':
        nuevoEstado = 'aprobado'
        responseText = '✅ Aprobado'
        await PedidoModel.actualizarEstado(pedido.id, nuevoEstado, personal.id)
        break

      case 'reject':
        nuevoEstado = 'rechazado'
        responseText = '❌ Rechazado'
        await PedidoModel.actualizarEstado(pedido.id, nuevoEstado, personal.id, null, { motivo_rechazo: 'Rechazado por staff' })
        break

      case 'preparing':
        nuevoEstado = 'preparando'
        responseText = '🍳 Preparando'
        await PedidoModel.actualizarEstado(pedido.id, nuevoEstado, personal.id)
        break

      case 'complete':
        nuevoEstado = 'completado'
        responseText = '🎉 Completado'
        await PedidoModel.actualizarEstado(pedido.id, nuevoEstado, personal.id, null, { puntos_ganados: pedido.puntos_a_ganar })

        if (pedido.usuario_id) {
          await UsuarioModel.agregarPuntos(pedido.usuario_id, pedido.puntos_a_ganar)
          await MovimientoModel.crear({
            usuario_id: pedido.usuario_id,
            tipo: 'ganado',
            puntos: pedido.puntos_a_ganar,
            descripcion: `Compra - Pedido #${pedido.codigo_pedido}`,
            tipo_referencia: 'pedido',
            referencia_id: pedido.id
          })
        }
        break

      case 'deliver':
        nuevoEstado = 'entregado'
        responseText = '📦 Entregado'
        await PedidoModel.actualizarEstado(pedido.id, nuevoEstado, personal.id)
        break
    }

    await this.bot.answerCallbackQuery(query.id, { text: responseText })
    await this.updateOrderMessage(chatId, messageId, pedido, nuevoEstado, personal.nombre)
    await PersonalModel.actualizarUltimaActividad(personal.id)
  }

  async sendOrderAlert(pedido, items) {
    if (!this.isInitialized) return null

    const personalEnTurno = await PersonalModel.obtenerEnTurno()
    if (personalEnTurno.length === 0) {
      console.log('⚠️ No hay personal en turno')
      return null
    }

    const itemsList = items.map(item =>
      `• ${item.cantidad}x ${item.nombre_producto} ($${item.total_item})`
    ).join('\n')

    const message = `
🆕 *NUEVO PEDIDO #${pedido.codigo_pedido}*

👤 ${pedido.user_name || 'Cliente'}
🪑 Mesa: ${pedido.numero_mesa || 'N/A'}

📋 *PRODUCTOS:*
${itemsList}

💰 Total: $${pedido.total}
⭐ Puntos: +${pedido.puntos_a_ganar}
${pedido.notas ? `\n📝 ${pedido.notas}` : ''}
    `

    const keyboard = {
      inline_keyboard: [[
        { text: '✅ Aprobar', callback_data: `approve_${pedido.id}` },
        { text: '❌ Rechazar', callback_data: `reject_${pedido.id}` }
      ]]
    }

    let sentMessageId = null
    for (const empleado of personalEnTurno) {
      try {
        const sent = await this.sendMessage(empleado.telegram_chat_id, message, {
          parse_mode: 'Markdown',
          reply_markup: keyboard
        })
        if (sent && !sentMessageId) sentMessageId = sent.message_id
      } catch (error) {
        console.error(`Error enviando a ${empleado.nombre}:`, error.message)
      }
    }

    return sentMessageId
  }

  async updateOrderMessage(chatId, messageId, pedido, nuevoEstado, nombreEmpleado) {
    const emoji = config.statusEmoji[nuevoEstado] || '📋'
    const statusText = nuevoEstado.toUpperCase()

    const message = `${emoji} *PEDIDO ${statusText}*\n\n#${pedido.codigo_pedido}\nPor: ${nombreEmpleado}`

    let keyboard = null
    if (nuevoEstado === 'aprobado') {
      keyboard = { inline_keyboard: [[{ text: '🍳 Preparando', callback_data: `preparing_${pedido.id}` }]] }
    } else if (nuevoEstado === 'preparando') {
      keyboard = { inline_keyboard: [[{ text: '🎉 Completado', callback_data: `complete_${pedido.id}` }]] }
    } else if (nuevoEstado === 'completado') {
      keyboard = { inline_keyboard: [[{ text: '📦 Entregado', callback_data: `deliver_${pedido.id}` }]] }
    }

    try {
      await this.bot.editMessageText(message, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: 'Markdown',
        reply_markup: keyboard
      })
    } catch (error) {
      console.error('Error actualizando mensaje:', error.message)
    }
  }

  async sendMessage(chatId, text, options = {}) {
    if (!this.bot) return null
    try {
      return await this.bot.sendMessage(chatId, text, options)
    } catch (error) {
      console.error('Error enviando mensaje:', error.message)
      return null
    }
  }

  /**
   * Notifica a staff que un pedido fue auto-cancelado por timeout
   */
  async notificarPedidoExpirado(pedido) {
    if (!this.isInitialized || !this.bot) return

    const personalEnTurno = await PersonalModel.obtenerEnTurno()

    const mensaje = `
⏰ *PEDIDO EXPIRADO*

#${pedido.codigo_pedido}
Mesa: ${pedido.numero_mesa || 'N/A'}
Total: $${pedido.total}

❌ Cancelado automáticamente por falta de respuesta.
    `

    // Notificar a todo el personal en turno
    for (const empleado of personalEnTurno) {
      try {
        // Si el empleado tiene el mensaje original, editarlo
        if (pedido.telegram_mensaje_id) {
          try {
            await this.bot.editMessageText(mensaje, {
              chat_id: empleado.telegram_chat_id,
              message_id: parseInt(pedido.telegram_mensaje_id),
              parse_mode: 'Markdown',
              reply_markup: { inline_keyboard: [] }
            })
          } catch (editError) {
            // Si falla la edición, enviar mensaje nuevo
            await this.sendMessage(empleado.telegram_chat_id, mensaje, { parse_mode: 'Markdown' })
          }
        }
      } catch (error) {
        console.error(`Error notificando expiración a ${empleado.nombre}:`, error.message)
      }
    }
  }
}

const telegramService = new TelegramService()
export default telegramService