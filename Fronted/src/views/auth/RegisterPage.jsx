/**
 * RegisterPage Component
 * Página completa de registro que conecta el Controller con la View
 */

import RegisterForm from './RegisterForm'
import { useRegisterController } from '../../controllers/auth/useRegisterController'
import { ParticlesBanner } from '../../components/ui'

const RegisterPage = () => {
  const {
    formData,
    showPassword,
    showConfirmPassword,
    status,
    fieldErrors,
    limiteCampos,
    aceptaTerminos,
    handleInputChange,
    togglePassword,
    toggleConfirmPassword,
    toggleTerminos,
    handleSubmit,
    goToLogin
  } = useRegisterController()

  return (
    <div className="relative grid min-h-screen place-content-center bg-surface-secondary px-4 py-5 md:px-8 md:py-10">
      {/* Partículas de fondo en móvil */}
      <ParticlesBanner soloFondo className="bg-cyan-600 md:hidden" />

      <div className="relative z-10 container w-full max-w-[1200px] overflow-hidden rounded-[20px] bg-slate-50/95 backdrop-blur-sm md:bg-slate-50 md:grid md:grid-cols-2">

        {/* Banner con partículas - solo desktop */}
        <ParticlesBanner className="hidden bg-cyan-600 md:flex" />

        {/* Formulario */}
        <RegisterForm
          formData={formData}
          showPassword={showPassword}
          showConfirmPassword={showConfirmPassword}
          status={status}
          fieldErrors={fieldErrors}
          limiteCampos={limiteCampos}
          aceptaTerminos={aceptaTerminos}
          onInputChange={handleInputChange}
          onTogglePassword={togglePassword}
          onToggleConfirmPassword={toggleConfirmPassword}
          onToggleTerminos={toggleTerminos}
          onSubmit={handleSubmit}
          onGoToLogin={goToLogin}
        />
      </div>
    </div>
  )
}

export default RegisterPage
