/**
 * LoginPage Component
 * Página completa de login que conecta el Controller con la View
 */

import LoginForm from './LoginForm'
import { useAuthController } from '../../controllers/auth/useAuthController'

const LoginPage = () => {
  const {
    formData,
    showPassword,
    status,
    handleInputChange,
    togglePassword,
    handleSubmit
  } = useAuthController()

  return (
    <div className="grid min-h-screen place-content-center bg-surface-secondary px-4 py-5 md:px-8 md:py-10">
      <div className="container max-h-[1000px] w-full max-w-[1200px] rounded-[20px] bg-surface-primary md:grid md:grid-cols-2">
        
        {/* Formulario */}
        <LoginForm
          formData={formData}
          showPassword={showPassword}
          status={status}
          onInputChange={handleInputChange}
          onTogglePassword={togglePassword}
          onSubmit={handleSubmit}
        />

        {/* Banner */}
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
              Bienvenido de Vuelta! We're Thrilled to See You Again
            </h2>
            <p>
              Pick up right where you left off and discover what's new since
              your last visit. Your personalized dashboard is waiting.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage