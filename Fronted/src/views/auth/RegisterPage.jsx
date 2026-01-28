/**
 * RegisterPage Component
 * Página completa de registro que conecta el Controller con la View
 */

import RegisterForm from './RegisterForm'
import { useRegisterController } from '../../controllers/auth/useRegisterController'

const RegisterPage = () => {
  const {
    formData,
    showPassword,
    showConfirmPassword,
    status,
    fieldErrors,
    handleInputChange,
    togglePassword,
    toggleConfirmPassword,
    handleSubmit,
    goToLogin
  } = useRegisterController()

  return (
    <div className="grid min-h-screen place-content-center bg-surface-secondary px-4 py-5 md:px-8 md:py-10">
      <div className="container max-h-[1000px] w-full max-w-[1200px] rounded-[20px] bg-surface-primary md:grid md:grid-cols-2">
        
        {/* Banner (lado izquierdo en registro) */}
        <div className="relative hidden bg-primary md:block">
          <img
            src="/images/form-banner.png"
            alt="form banner"
            width={720}
            height={720}
            className="h-full w-full object-cover"
          />

          <div className="absolute left-0 top-1/2 mx-10 -translate-y-1/2 bg-white/20 px-11 py-[60px] text-white backdrop-blur-[30px]">
            <h2 className="mb-5 text-3xl font-semibold">
              ¡Únete a nuestra comunidad! 🎊
            </h2>
            <p>
              Regístrate y comienza a acumular puntos con cada visita. 
              Canjea por increíbles recompensas y disfruta de beneficios exclusivos.
            </p>
          </div>
        </div>

        {/* Formulario */}
        <RegisterForm
          formData={formData}
          showPassword={showPassword}
          showConfirmPassword={showConfirmPassword}
          status={status}
          fieldErrors={fieldErrors}
          onInputChange={handleInputChange}
          onTogglePassword={togglePassword}
          onToggleConfirmPassword={toggleConfirmPassword}
          onSubmit={handleSubmit}
          onGoToLogin={goToLogin}
        />
      </div>
    </div>
  )
}

export default RegisterPage
