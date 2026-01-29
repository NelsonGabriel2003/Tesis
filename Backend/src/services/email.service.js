/**
 * Email Service
 * Envío de correos usando Resend
 */

import { Resend } from 'resend'

class EmailService {
  constructor() {
    this.resend = null
    this.remitente = process.env.EMAIL_FROM || 'onboarding@resend.dev'
  }

  inicializar() {
    const apiKey = process.env.RESEND_API_KEY

    if (!apiKey) {
      return
    }

    this.resend = new Resend(apiKey)
  }

  /**
   * Enviar código de recuperación de contraseña
   */
  async enviarCodigoRecuperacion(email, nombre, codigo, minutosExpiracion) {
    if (!this.resend) {
      throw new Error('Servicio de email no configurado')
    }

    const { data, error } = await this.resend.emails.send({
      from: this.remitente,
      to: email,
      subject: 'Tu código secreto ha llegado',
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #ffffff;">

          <div style="background: linear-gradient(135deg, #7A5AF8 0%, #9333ea 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
            <img src="https://media.giphy.com/media/3o7btPCcdNniyf0ArS/giphy.gif" width="150" height="150" alt="Locked" style="border-radius: 12px;">
            <h1 style="color: #ffffff; margin: 20px 0 0 0; font-size: 24px;">Hey ${nombre || 'amigo'}!</h1>
          </div>

          <div style="padding: 30px; background-color: #ffffff;">

            <p style="font-size: 16px; color: #374151; line-height: 1.6;">
              Parece que olvidaste tu contraseña... No te preocupes, nos pasa a todos!
            </p>

            <p style="font-size: 16px; color: #374151; line-height: 1.6;">
              Aqui esta tu codigo magico para recuperar el acceso:
            </p>

            <div style="background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); padding: 25px; text-align: center; border-radius: 12px; margin: 25px 0; border: 2px dashed #7A5AF8;">
              <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #7A5AF8; font-family: 'Courier New', monospace;">
                ${codigo}
              </span>
            </div>

            <div style="text-align: center; margin: 20px 0;">
              <img src="https://media.giphy.com/media/3o7TKTDn976rzVgky4/giphy.gif" width="100" height="100" alt="Clock" style="border-radius: 8px;">
              <p style="color: #ef4444; font-weight: bold; margin: 10px 0;">
                Tienes ${minutosExpiracion} minutos antes de que expire
              </p>
            </div>

            <p style="font-size: 14px; color: #6b7280; line-height: 1.6;">
              Si no fuiste tu quien solicito esto, simplemente ignora este email.
            </p>

          </div>

          <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 12px 12px; border-top: 1px solid #e5e7eb;">
            <img src="https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif" width="80" height="80" alt="Party" style="border-radius: 8px;">
            <p style="color: #9ca3af; font-size: 12px; margin: 10px 0 0 0;">
              Nos vemos pronto en la fiesta!
            </p>
          </div>

        </div>
      `
    })

    if (error) {
      throw new Error(error.message)
    }

    return data
  }

  /**
   * Enviar confirmación de cambio de contraseña
   */
  async enviarConfirmacionCambio(email, nombre) {
    if (!this.resend) return

    await this.resend.emails.send({
      from: this.remitente,
      to: email,
      subject: 'Contraseña actualizada con exito!',
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #ffffff;">

          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
            <img src="https://media.giphy.com/media/3oz8xAFtqoOUUrsh7W/giphy.gif" width="150" height="150" alt="Success" style="border-radius: 12px;">
            <h1 style="color: #ffffff; margin: 20px 0 0 0; font-size: 24px;">Lo lograste, ${nombre || 'crack'}!</h1>
          </div>

          <div style="padding: 30px; background-color: #ffffff; text-align: center;">

            <p style="font-size: 18px; color: #374151; line-height: 1.6;">
              Tu contraseña ha sido actualizada correctamente
            </p>

            <img src="https://media.giphy.com/media/3o6Zt6KHxJTbXCnSvu/giphy.gif" width="200" height="150" alt="Thumbs up" style="border-radius: 12px; margin: 20px 0;">

            <p style="font-size: 14px; color: #6b7280; line-height: 1.6;">
              Ya puedes iniciar sesion con tu nueva contraseña.
            </p>

            <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="color: #92400e; font-size: 14px; margin: 0;">
                Si no realizaste este cambio, contacta con soporte inmediatamente.
              </p>
            </div>

          </div>

          <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 12px 12px; border-top: 1px solid #e5e7eb;">
            <img src="https://media.giphy.com/media/l0MYC0LajbaPoEADu/giphy.gif" width="100" height="80" alt="Cheers" style="border-radius: 8px;">
            <p style="color: #9ca3af; font-size: 12px; margin: 10px 0 0 0;">
              Te esperamos para la proxima fiesta!
            </p>
          </div>

        </div>
      `
    })
  }
}

const emailService = new EmailService()
export default emailService
