/**
 * Resend Configuration
 * Servicio de envío de emails para recuperación de contraseña
 */

import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// Email desde donde se envían los correos
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'

/**
 * Enviar código de recuperación de contraseña
 */
export const sendPasswordResetCode = async (to, code, userName) => {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: 'Código de recuperación de contraseña',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
          <div style="max-width: 400px; margin: 0 auto; background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">

            <h1 style="color: #1a1a1a; font-size: 24px; margin: 0 0 8px 0; text-align: center;">
              Recupera tu cuenta
            </h1>

            <p style="color: #666; font-size: 14px; margin: 0 0 32px 0; text-align: center;">
              Hola${userName ? ` ${userName}` : ''}, usa este código para restablecer tu contraseña
            </p>

            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
              <span style="font-size: 36px; font-weight: bold; color: white; letter-spacing: 8px; font-family: monospace;">
                ${code}
              </span>
            </div>

            <p style="color: #999; font-size: 12px; text-align: center; margin: 0 0 16px 0;">
              Este código expira en <strong>10 minutos</strong>
            </p>

            <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">

            <p style="color: #999; font-size: 11px; text-align: center; margin: 0;">
              Si no solicitaste este código, ignora este mensaje.<br>
              Tu cuenta está segura.
            </p>

          </div>
        </body>
        </html>
      `
    })

    if (error) {
      console.error('Error enviando email:', error)
      return { success: false, error }
    }

    console.log('Email enviado:', data?.id)
    return { success: true, data }

  } catch (error) {
    console.error('Error en Resend:', error)
    return { success: false, error }
  }
}

export default resend
