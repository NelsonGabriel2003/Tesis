/**
 * ForgotPasswordPage Component
 * Página de recuperación de contraseña con flujo de 3 pasos
 * Diseño minimalista con animaciones
 */

import { ArrowLeft, Mail, KeyRound, Lock, Check, Eye, EyeOff, Loader2 } from 'lucide-react'
import { usePasswordResetController } from '../../controllers/auth/usePasswordResetController'

const ForgotPasswordPage = () => {
  const {
    step,
    STEPS,
    email,
    code,
    newPassword,
    confirmPassword,
    showPassword,
    loading,
    error,
    maskedEmail,
    countdown,
    codeInputRefs,
    setEmail,
    setNewPassword,
    setConfirmPassword,
    setShowPassword,
    handleRequestCode,
    handleCodeChange,
    handleCodeKeyDown,
    handleCodePaste,
    handleVerifyCode,
    handleResendCode,
    handleResetPassword,
    handleBack,
    handleGoToLogin
  } = usePasswordResetController()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Card principal */}
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden">

          {/* Header con progreso */}
          <div className="bg-gradient-to-r from-violet-500 to-purple-600 p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              {step !== STEPS.EMAIL && step !== STEPS.SUCCESS && (
                <button
                  onClick={handleBack}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <ArrowLeft size={18} />
                </button>
              )}
              <h1 className="text-xl font-semibold">
                {step === STEPS.SUCCESS ? 'Listo!' : 'Recuperar cuenta'}
              </h1>
            </div>

            {/* Indicador de pasos */}
            {step !== STEPS.SUCCESS && (
              <div className="flex gap-2">
                {[STEPS.EMAIL, STEPS.CODE, STEPS.PASSWORD].map((s, i) => (
                  <div
                    key={s}
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      i <= [STEPS.EMAIL, STEPS.CODE, STEPS.PASSWORD].indexOf(step)
                        ? 'bg-white'
                        : 'bg-white/30'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Contenido */}
          <div className="p-6">

            {/* Error */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm animate-shake">
                {error}
              </div>
            )}

            {/* Step 1: Email */}
            {step === STEPS.EMAIL && (
              <form onSubmit={handleRequestCode} className="space-y-4 animate-fadeIn">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-8 h-8 text-violet-600" />
                  </div>
                  <p className="text-slate-600">
                    Ingresa tu email y te enviaremos un código de verificación
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full py-3 px-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-medium rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Enviar código
                      <Mail size={18} />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Step 2: Código */}
            {step === STEPS.CODE && (
              <form onSubmit={handleVerifyCode} className="space-y-4 animate-fadeIn">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <KeyRound className="w-8 h-8 text-violet-600" />
                  </div>
                  <p className="text-slate-600">
                    Enviamos un código de 6 dígitos a
                  </p>
                  <p className="font-medium text-slate-800">{maskedEmail}</p>
                </div>

                {/* Inputs del código */}
                <div
                  className="flex justify-center gap-2"
                  onPaste={handleCodePaste}
                >
                  {code.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (codeInputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleCodeChange(index, e.target.value)}
                      onKeyDown={(e) => handleCodeKeyDown(index, e)}
                      className="w-12 h-14 text-center text-xl font-bold rounded-xl border-2 border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all"
                    />
                  ))}
                </div>

                {/* Reenviar código */}
                <div className="text-center">
                  {countdown > 0 ? (
                    <p className="text-sm text-slate-500">
                      Reenviar código en <span className="font-medium text-violet-600">{countdown}s</span>
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendCode}
                      disabled={loading}
                      className="text-sm text-violet-600 hover:text-violet-700 font-medium transition-colors"
                    >
                      Reenviar código
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || code.some(d => !d)}
                  className="w-full py-3 px-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-medium rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Verificar código
                      <Check size={18} />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Step 3: Nueva contraseña */}
            {step === STEPS.PASSWORD && (
              <form onSubmit={handleResetPassword} className="space-y-4 animate-fadeIn">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Lock className="w-8 h-8 text-violet-600" />
                  </div>
                  <p className="text-slate-600">
                    Crea una nueva contraseña para tu cuenta
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Nueva contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      required
                      minLength={6}
                      className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Confirmar contraseña
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repite la contraseña"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all"
                  />
                </div>

                {/* Indicador de coincidencia */}
                {confirmPassword && (
                  <p className={`text-sm ${newPassword === confirmPassword ? 'text-green-600' : 'text-red-500'}`}>
                    {newPassword === confirmPassword ? '✓ Las contraseñas coinciden' : '✗ Las contraseñas no coinciden'}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading || newPassword.length < 6 || newPassword !== confirmPassword}
                  className="w-full py-3 px-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-medium rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Cambiar contraseña
                      <Lock size={18} />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Step 4: Éxito */}
            {step === STEPS.SUCCESS && (
              <div className="text-center animate-fadeIn">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-scaleIn">
                  <Check className="w-10 h-10 text-green-600" />
                </div>

                <h2 className="text-xl font-semibold text-slate-800 mb-2">
                  Contraseña actualizada
                </h2>
                <p className="text-slate-600 mb-6">
                  Ya puedes iniciar sesión con tu nueva contraseña
                </p>

                <button
                  onClick={handleGoToLogin}
                  className="w-full py-3 px-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-medium rounded-xl hover:opacity-90 transition-all"
                >
                  Ir a iniciar sesión
                </button>
              </div>
            )}

          </div>
        </div>

        {/* Link para volver al login */}
        {step !== STEPS.SUCCESS && (
          <p className="text-center mt-6 text-slate-600">
            ¿Recordaste tu contraseña?{' '}
            <button
              onClick={handleGoToLogin}
              className="text-violet-600 hover:text-violet-700 font-medium transition-colors"
            >
              Iniciar sesión
            </button>
          </p>
        )}

      </div>

      {/* Estilos para animaciones */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.4s ease-out;
        }

        .animate-shake {
          animation: shake 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

export default ForgotPasswordPage
