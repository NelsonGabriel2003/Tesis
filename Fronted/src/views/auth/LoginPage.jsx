/**
 * LoginPage Component
 * Página completa de login que conecta el Controller con la View
 */

import LoginForm from './LoginForm'
import { useAuthController } from '../../controllers/auth/useAuthController'
import { ParticlesBanner } from '../../components/ui'

const LoginPage = () => {
  const {
    formData,
    showPassword,
    status,
    fieldErrors,
    limiteCampos,
    handleInputChange,
    togglePassword,
    handleSubmit
  } = useAuthController()

  return (
    <div className="relative grid min-h-screen place-content-center bg-surface-secondary px-4 py-5 md:px-8 md:py-10">
      {/* Partículas de fondo en móvil */}
      <ParticlesBanner soloFondo className="bg-cyan-600 md:hidden" />

      <div className="relative z-10 container w-full max-w-[1200px] overflow-hidden rounded-[20px] bg-slate-50/95 backdrop-blur-sm md:bg-slate-50 md:grid md:grid-cols-2">

        {/* Formulario */}
        <LoginForm
          formData={formData}
          showPassword={showPassword}
          status={status}
          fieldErrors={fieldErrors}
          limiteCampos={limiteCampos}
          onInputChange={handleInputChange}
          onTogglePassword={togglePassword}
          onSubmit={handleSubmit}
        />

        {/* Banner con partículas - solo desktop */}
        <ParticlesBanner className="hidden bg-cyan-600 md:flex" />
      </div>
    </div>
  )
}

export default LoginPage