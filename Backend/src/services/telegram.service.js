import TelegramBot from 'node-telegram-bot-api'
import { telegram as config } from '../config/index.js'
import { StaffModel, TelegramSessionModel, OrderModel, UserModel, TransactionModel,RedemptionModel } from '../models/index.js'

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

    await TelegramSessionModel.create({
      chatId: chatId.toString(),
      telegramUserId: msg.from.id.toString(),
      username: msg.from.username,
      firstName
    })

    // Verificar si ya está vinculado como usuario
    const usuarioVinculado = await UserModel.findByTelegramChatId(chatId.toString())
    if (usuarioVinculado) {
      await this.sendMessage(chatId, `
🎉 *Hola ${usuarioVinculado.name}!*

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
    const usuarioVinculado = await UserModel.findByTelegramChatId(chatId.toString())
    if (usuarioVinculado) {
      await this.sendMessage(chatId, `
✅ *Ya estás vinculado*

Cuenta: ${usuarioVinculado.email}
Puntos: ${usuarioVinculado.current_points || 0}
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
      usuario = await UserModel.findByPhone(variante)
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
    const resultado = await UserModel.vincularTelegramConBono(
      usuario.phone,
      chatId.toString(),
      PUNTOS_BONUS
    )

    if (resultado) {
      await this.sendMessage(chatId, `
🎉 *Cuenta vinculada exitosamente!*

${resultado.name}, ahora puedes:
• Recibir códigos de recuperación
• Recibir notificaciones de pedidos

🎁 *+${PUNTOS_BONUS} puntos agregados a tu cuenta!*

Puntos actuales: ${resultado.current_points}
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
    const existingStaff = await StaffModel.findByTelegramChatId(chatId.toString())
    if (existingStaff) {
      await this.sendMessage(chatId, `
⚠️ Ya estás vinculado como *${existingStaff.name}*

Usa /estado para ver tu información.
      `, { parse_mode: 'Markdown' })
      return
    }

    // Buscar staff por código
    const staff = await StaffModel.findByLinkCode(code.trim())

    if (!staff) {
      await this.sendMessage(chatId, `
❌ *Código inválido o expirado*

Verifica el código e intenta de nuevo.
Si el problema persiste, pide un nuevo código al administrador.
      `, { parse_mode: 'Markdown' })
      return
    }

    // Vincular
    await StaffModel.linkTelegram(staff.id, chatId.toString(), msg.from.username)
    await TelegramSessionModel.linkToStaff(chatId.toString(), staff.id)

    await this.sendMessage(chatId, `
✅ *¡Vinculación exitosa!*

Bienvenido/a *${staff.name}*
Tu cuenta ha sido vinculada correctamente.

Usa /turno para iniciar tu turno y recibir pedidos.
    `, { parse_mode: 'Markdown' })
  }

  async handleShiftOn(msg) {
    const chatId = msg.chat.id
    const staff = await StaffModel.findByTelegramChatId(chatId.toString())

    if (!staff) {
      await this.sendMessage(chatId, '❌ No estás vinculado. Usa /vincular primero.')
      return
    }

    await StaffModel.setShiftStatus(staff.id, true)
    await this.sendMessage(chatId, `✅ *Turno Iniciado*\n\n${staff.name}, recibirás pedidos. 💪`, { parse_mode: 'Markdown' })
  }

  async handleShiftOff(msg) {
    const chatId = msg.chat.id
    const staff = await StaffModel.findByTelegramChatId(chatId.toString())

    if (!staff) {
      await this.sendMessage(chatId, '❌ No estás vinculado.')
      return
    }

    await StaffModel.setShiftStatus(staff.id, false)
    await this.sendMessage(chatId, `😴 *Turno Finalizado*\n\n¡Descansa! 👋`, { parse_mode: 'Markdown' })
  }

  async handleStatus(msg) {
    const chatId = msg.chat.id
    const staff = await StaffModel.findByTelegramChatId(chatId.toString())

    if (!staff) {
      await this.sendMessage(chatId, '❌ No estás vinculado.')
      return
    }

    const status = staff.is_on_shift ? '🟢 En turno' : '🔴 Fuera de turno'
    await this.sendMessage(chatId, `📊 *Estado*\n\n👤 ${staff.name}\n${status}`, { parse_mode: 'Markdown' })
  }

  async handleListOrders(msg) {
    const chatId = msg.chat.id
    const pendingOrders = await OrderModel.findPending()

    if (pendingOrders.length === 0) {
      await this.sendMessage(chatId, '✨ No hay pedidos pendientes.')
      return
    }

    let message = `📋 *Pedidos Pendientes (${pendingOrders.length})*\n\n`
    pendingOrders.slice(0, 5).forEach(order => {
      message += `• #${order.order_code} - Mesa ${order.table_number || 'N/A'} - $${order.total}\n`
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
    const empleado = await StaffModel.findByTelegramChatId(chatId.toString())
    if (!empleado) {
      await this.sendMessage(chatId, '❌ No estás vinculado. Usa /vincular primero.')
      return
    }

    // Buscar el canje por código
    const canje = await RedemptionModel.findByCode(codigo.trim().toUpperCase())

    if (!canje) {
      await this.sendMessage(chatId, `
❌ *Código no encontrado*

El código \`${codigo.toUpperCase()}\` no existe o es inválido.
Verifica que el cliente te muestre el código correcto.
      `, { parse_mode: 'Markdown' })
      return
    }

    // Formatear fecha
    const fechaCanje = new Date(canje.created_at).toLocaleDateString('es-EC', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })

    // Determinar estado y emoji
    const esUsado = canje.status === 'used'
    const estadoTexto = esUsado ? '✅ Usado' : '⏳ Pendiente'

    if (esUsado) {
      const fechaUso = new Date(canje.used_at).toLocaleDateString('es-EC', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
      
      await this.sendMessage(chatId, `
⚠️ *CANJE YA UTILIZADO*

🎫 Código: \`${canje.redemption_code}\`
🏆 Recompensa: ${canje.reward_name}
👤 Cliente: ${canje.user_name}
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

🎫 Código: \`${canje.redemption_code}\`
🏆 Recompensa: *${canje.reward_name}*
👤 Cliente: ${canje.user_name}
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
    const empleado = await StaffModel.findByTelegramChatId(chatId.toString())
    if (!empleado) {
      await this.bot.answerCallbackQuery(query.id, { text: '❌ No autorizado' })
      return
    }

    // Marcar canje como usado
    const canjeActualizado = await RedemptionModel.markAsUsed(parseInt(canjeId))

    if (!canjeActualizado) {
      await this.bot.answerCallbackQuery(query.id, { text: '❌ Error: Canje no encontrado o ya usado' })
      return
    }

    // Obtener datos del canje para el mensaje
    const canje = await RedemptionModel.findById(parseInt(canjeId))

    await this.bot.answerCallbackQuery(query.id, { text: '✅ Canje procesado' })

    // Actualizar mensaje
    await this.bot.editMessageText(`
✅ *CANJE COMPLETADO*

🏆 ${canje.reward_name}
👤 Entregado a: ${canje.user_name || 'Cliente'}
👨‍💼 Procesado por: ${empleado.name}
📅 ${new Date().toLocaleDateString('es-EC')}

El código ya no es válido.
    `, {
      chat_id: chatId,
      message_id: mensajeId,
      parse_mode: 'Markdown'
    })

    // Actualizar actividad del empleado
    await StaffModel.updateLastActivity(empleado.id)
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

    const staff = await StaffModel.findByTelegramChatId(chatId.toString())
    if (!staff) {
      await this.bot.answerCallbackQuery(query.id, { text: '❌ No autorizado' })
      return
    }

    const [action, orderId] = data.split('_')
    const order = await OrderModel.findById(parseInt(orderId))

    if (!order) {
      await this.bot.answerCallbackQuery(query.id, { text: '❌ Pedido no encontrado' })
      return
    }

    let responseText = ''
    let newStatus = ''

    switch (action) {
      case 'approve':
        newStatus = 'approved'
        responseText = '✅ Aprobado'
        await OrderModel.updateStatus(order.id, newStatus, staff.id)
        break

      case 'reject':
        newStatus = 'rejected'
        responseText = '❌ Rechazado'
        await OrderModel.updateStatus(order.id, newStatus, staff.id, { rejectionReason: 'Rechazado por staff' })
        break

      case 'preparing':
        newStatus = 'preparing'
        responseText = '🍳 Preparando'
        await OrderModel.updateStatus(order.id, newStatus, staff.id)
        break

      case 'complete':
        newStatus = 'completed'
        responseText = '🎉 Completado'
        await OrderModel.updateStatus(order.id, newStatus, staff.id, { pointsEarned: order.points_to_earn })

        if (order.user_id) {
          await UserModel.addPoints(order.user_id, order.points_to_earn)
          await TransactionModel.create({
            userId: order.user_id,
            type: 'earned',
            points: order.points_to_earn,
            description: `Compra - Pedido #${order.order_code}`,
            referenceType: 'order',
            referenceId: order.id
          })
        }
        break

      case 'deliver':
        newStatus = 'delivered'
        responseText = '📦 Entregado'
        await OrderModel.updateStatus(order.id, newStatus, staff.id)
        break
    }

    await this.bot.answerCallbackQuery(query.id, { text: responseText })
    await this.updateOrderMessage(chatId, messageId, order, newStatus, staff.name)
    await StaffModel.updateLastActivity(staff.id)
  }

  async sendOrderAlert(order, items) {
    if (!this.isInitialized) return null

    const staffOnShift = await StaffModel.findOnShift()
    if (staffOnShift.length === 0) {
      console.log('⚠️ No hay staff en turno')
      return null
    }

    const itemsList = items.map(item => 
      `• ${item.quantity}x ${item.product_name} ($${item.item_total})`
    ).join('\n')

    const message = `
🆕 *NUEVO PEDIDO #${order.order_code}*

👤 ${order.user_name || 'Cliente'}
🪑 Mesa: ${order.table_number || 'N/A'}

📋 *PRODUCTOS:*
${itemsList}

💰 Total: $${order.total}
⭐ Puntos: +${order.points_to_earn}
${order.notes ? `\n📝 ${order.notes}` : ''}
    `

    const keyboard = {
      inline_keyboard: [[
        { text: '✅ Aprobar', callback_data: `approve_${order.id}` },
        { text: '❌ Rechazar', callback_data: `reject_${order.id}` }
      ]]
    }

    let sentMessageId = null
    for (const staff of staffOnShift) {
      try {
        const sent = await this.sendMessage(staff.telegram_chat_id, message, {
          parse_mode: 'Markdown',
          reply_markup: keyboard
        })
        if (sent && !sentMessageId) sentMessageId = sent.message_id
      } catch (error) {
        console.error(`Error enviando a ${staff.name}:`, error.message)
      }
    }

    return sentMessageId
  }

  async updateOrderMessage(chatId, messageId, order, newStatus, staffName) {
    const emoji = config.statusEmoji[newStatus] || '📋'
    const statusText = newStatus.toUpperCase()

    const message = `${emoji} *PEDIDO ${statusText}*\n\n#${order.order_code}\nPor: ${staffName}`

    let keyboard = null
    if (newStatus === 'approved') {
      keyboard = { inline_keyboard: [[{ text: '🍳 Preparando', callback_data: `preparing_${order.id}` }]] }
    } else if (newStatus === 'preparing') {
      keyboard = { inline_keyboard: [[{ text: '🎉 Completado', callback_data: `complete_${order.id}` }]] }
    } else if (newStatus === 'completed') {
      keyboard = { inline_keyboard: [[{ text: '📦 Entregado', callback_data: `deliver_${order.id}` }]] }
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
}

const telegramService = new TelegramService()
export default telegramService