/**
 * OrderSummary - Resumen y confirmación del pedido
 */

import { useState } from 'react'
import { FileText, ArrowLeft, Table2 } from 'lucide-react'
import Button from '../../components/ui/Button'
import Select from '../../components/ui/Select'

const OrderSummary = ({
  items,
  cartTotals,
  numeroMesa,
  notas,
  alCambiarMesa,
  alCambiarNotas,
  alEnviar,
  alVolver,
  estaCargando
}) => {
  const [intentoEnviar, setIntentoEnviar] = useState(false)

  // Opciones de mesas disponibles
  const opcionesMesas = [
    { id: '1', nombre: 'Mesa 1' },
    { id: '2', nombre: 'Mesa 2' },
    { id: '3', nombre: 'Mesa 3' },
    { id: '4', nombre: 'Mesa 4' },
    { id: '5', nombre: 'Mesa 5' },
    { id: '6', nombre: 'Mesa 6' },
    { id: '7', nombre: 'Mesa 7' },
    { id: '8', nombre: 'Mesa 8' },
    { id: '9', nombre: 'Mesa 9' },
    { id: '10', nombre: 'Mesa 10' },
    { id: 'barra', nombre: 'Barra' }
  ]

  // Validar si puede enviar
  const puedeEnviar = numeroMesa && numeroMesa.trim() !== ''
  const mostrarError = intentoEnviar && !puedeEnviar

  // Manejar cambio de mesa
  const manejarCambioMesa = (mesaId) => {
    alCambiarMesa(mesaId)
    setIntentoEnviar(false)
  }

  // Manejar envío
  const manejarEnvio = () => {
    if (!puedeEnviar) {
      setIntentoEnviar(true)
      return
    }
    alEnviar()
  }

  return (
    <div className="p-4">
      {/* Botón volver */}
      <Button
        variante="ghost"
        onClick={alVolver}
        className="mb-4 px-0"
      >
        <ArrowLeft size={20} />
        Volver al carrito
      </Button>

      <h2 className="mb-4 font-formal text-lg font-semibold text-text-primary">
        Confirmar Pedido
      </h2>

      {/* Selector de Mesa */}
      <div className="mb-4 rounded-xl bg-surface-primary p-4 shadow-sm">
        <Select
          label="Número de Mesa"
          opciones={opcionesMesas}
          valor={numeroMesa}
          placeholder="Selecciona una mesa"
          onChange={manejarCambioMesa}
          requerido={true}
          error={mostrarError}
          mensajeError="Debes seleccionar una mesa para continuar"
          icono={Table2}
          className="mb-0"
        />
      </div>

      {/* Notas */}
      <div className="mb-4 rounded-xl bg-surface-primary p-4 shadow-sm">
        <label className="mb-2 flex items-center gap-2 font-medium text-input-label">
          <FileText size={18} />
          Notas (opcional)
        </label>
        <textarea
          value={notas}
          onChange={(e) => alCambiarNotas(e.target.value)}
          placeholder="Alguna alergia, celebramos algún momento especial..."
          rows={3}
          className="w-full resize-none rounded-xl border border-input-border bg-surface-primary p-3 text-text-primary placeholder-input-placeholder focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Resumen del pedido */}
      <div className="mb-4 rounded-xl bg-surface-primary p-4 shadow-sm">
        <h3 className="mb-3 font-semibold text-text-primary">Resumen</h3>

        {items.map((item) => (
          <div
            key={item.productId}
            className="flex justify-between border-b border-surface-secondary py-2 text-sm last:border-0"
          >
            <span className="text-text-secondary">
              {item.quantity}x {item.name}
            </span>
            <span className="text-text-primary">
              ${(item.price * item.quantity).toFixed(2)}
            </span>
          </div>
        ))}

        <div className="mt-3 flex justify-between border-t border-surface-secondary pt-3 text-primary">
          <span>Puntos a ganar</span>
          <span className="font-semibold">+{cartTotals.totalPoints} pts</span>
        </div>

        <div className="mt-2 flex justify-between text-lg font-bold text-text-primary">
          <span>Total</span>
          <span>${cartTotals.total.toFixed(2)}</span>
        </div>
      </div>

      {/* Botón confirmar */}
      <Button
        onClick={manejarEnvio}
        variante={puedeEnviar ? 'success' : 'secondary'}
        disabled={!puedeEnviar && !intentoEnviar}
        cargando={estaCargando}
        fullWidth={true}
        className="py-4"
      >
        Confirmar Pedido
      </Button>
    </div>
  )
}

export default OrderSummary
