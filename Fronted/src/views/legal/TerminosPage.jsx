const secciones = [
  {
    titulo: '1. Aceptacion de los Terminos',
    contenido: 'Al registrarte y utilizar la aplicacion Bounty Bar, aceptas estos terminos y condiciones en su totalidad. Si no estas de acuerdo con alguno de estos terminos, no deberas registrarte ni utilizar la aplicacion.'
  },
  {
    titulo: '2. Descripcion del Servicio',
    contenido: 'Bounty Bar es un sistema de gestion de clientes y promociones para el establecimiento, que incluye funcionalidades de fidelizacion mediante acumulacion de puntos, canje de recompensas y acceso a promociones exclusivas.'
  },
  {
    titulo: '3. Registro y Cuenta',
    contenido: 'Para utilizar el servicio debes crear una cuenta proporcionando informacion veraz y actualizada. Eres responsable de mantener la confidencialidad de tu cuenta y contraseña. Cada cuenta es personal e intransferible. El uso de datos falsos puede resultar en la suspension de la cuenta.'
  },
  {
    titulo: '4. Programa de Puntos y Fidelizacion',
    contenido: 'Los puntos se acumulan segun las compras realizadas en el establecimiento. Los puntos no tienen valor monetario y no pueden ser transferidos, vendidos o intercambiados por dinero. Bounty Bar se reserva el derecho de modificar el valor de los puntos, las recompensas disponibles y las condiciones de canje en cualquier momento.'
  },
  {
    titulo: '5. Canje de Recompensas',
    contenido: 'Las recompensas estan sujetas a disponibilidad. El canje se realizara unicamente en el establecimiento y requiere la presentacion de la cuenta activa. Los puntos canjeados no son reembolsables.'
  },
  {
    titulo: '6. Proteccion de Datos Personales',
    contenido: 'Tus datos personales seran tratados conforme a la Ley Organica de Proteccion de Datos Personales del Ecuador (LOPDP). Recopilamos nombre, correo electronico y telefono unicamente para la gestion del servicio. No compartiremos tu informacion con terceros sin tu consentimiento. Puedes solicitar la eliminacion de tus datos en cualquier momento.'
  },
  {
    titulo: '7. Uso Aceptable',
    contenido: 'Te comprometes a no utilizar la aplicacion para actividades fraudulentas, no intentar manipular el sistema de puntos, no crear multiples cuentas y no interferir con el funcionamiento del servicio.'
  },
  {
    titulo: '8. Suspension y Cancelacion',
    contenido: 'Bounty Bar se reserva el derecho de suspender o cancelar cuentas que violen estos terminos, presenten actividad sospechosa o permanezcan inactivas por mas de 12 meses. Los puntos acumulados se perderan en caso de cancelacion por incumplimiento.'
  },
  {
    titulo: '9. Limitacion de Responsabilidad',
    contenido: 'Bounty Bar no sera responsable por interrupciones del servicio, perdida de datos por causas ajenas a nuestro control, ni por el uso indebido de la cuenta por parte del usuario.'
  },
  {
    titulo: '10. Modificaciones',
    contenido: 'Nos reservamos el derecho de modificar estos terminos en cualquier momento. Los cambios seran notificados a traves de la aplicacion. El uso continuado del servicio despues de las modificaciones constituye la aceptacion de los nuevos terminos.'
  }
]

const TerminosModal = ({ abierto, onCerrar }) => {
  if (!abierto) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={onCerrar}>
      <div className="fixed inset-0 bg-black/50" />
      <div
        className="relative z-10 max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl font-serif"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-black">Terminos y Condiciones</h1>
          <button
            onClick={onCerrar}
            className="text-2xl font-bold text-black hover:opacity-60"
          >
            X
          </button>
        </div>

        <p className="mb-6 text-sm text-black">Ultima actualizacion: Febrero 2026</p>

        <div className="space-y-5">
          {secciones.map((seccion) => (
            <div key={seccion.titulo}>
              <h2 className="mb-1 text-base font-bold text-black">{seccion.titulo}</h2>
              <p className="text-sm text-black leading-relaxed">{seccion.contenido}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 border-t border-black/20 pt-4">
          <p className="text-sm font-bold text-black">
            Al crear una cuenta en Bounty Bar, confirmas que has leido y aceptas estos terminos y condiciones.
          </p>
        </div>
      </div>
    </div>
  )
}

export default TerminosModal
