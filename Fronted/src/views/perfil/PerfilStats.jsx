/**
 * PerfilStats - Estadísticas del usuario
 */

import { useState, useEffect } from 'react'
import { Calendar, DollarSign, Heart, TrendingUp, Gift, Loader } from 'lucide-react'
import { rewardService } from '../../services/admin/adminServices'

const PerfilStats = ({ estadisticas, formatearFecha, puntosUsuario = 0 }) => {
  const [recompensasCercanas, setRecompensasCercanas] = useState([])
  const [cargando, setCargando] = useState(true)

  // Cargar recompensas cercanas al montar
  useEffect(() => {
    const cargarRecompensas = async () => {
      try {
        const todasRecompensas = await rewardService.getAll()

        // Filtrar disponibles y ordenar por cercanía
        const ordenadas = todasRecompensas
          .filter(r => r.isAvailable)
          .map(r => ({
            ...r,
            puedeReclamar: puntosUsuario >= r.pointsCost,
            puntosFaltantes: Math.max(0, r.pointsCost - puntosUsuario)
          }))
          .sort((a, b) => a.puntosFaltantes - b.puntosFaltantes)
          .slice(0, 3)

        setRecompensasCercanas(ordenadas)
      } catch (error) {
        console.error('Error cargando recompensas:', error)
      } finally {
        setCargando(false)
      }
    }

    cargarRecompensas()
  }, [puntosUsuario])

  // Configuración de estadísticas a mostrar
  const itemsEstadisticas = [
    {
      id: 'compras',
      etiqueta: 'Productos comprados',
      valor: estadisticas.totalVisits,
      icono: Calendar,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      id: 'gastado',
      etiqueta: 'Total gastado',
      valor: `$${estadisticas.totalSpent.toFixed(2)}`,
      icono: DollarSign,
      color: 'bg-green-100 text-green-600'
    },
    {
      id: 'favorito',
      etiqueta: 'Favorito',
      valor: estadisticas.favoriteItem,
      icono: Heart,
      color: 'bg-red-100 text-red-600'
    },
    {
      id: 'ultimaCompra',
      etiqueta: 'Última compra',
      valor: formatearFecha(estadisticas.lastVisit),
      icono: TrendingUp,
      color: 'bg-purple-100 text-purple-600'
    }
  ]

  // Obtener emoji según categoría
  const obtenerEmoji = (categoria) => {
    const emojis = {
      'Bebidas': '🍺',
      'Comida': '🍔',
      'Descuentos': '💰',
      'Experiencias': '⭐'
    }
    return emojis[categoria] || '🎁'
  }

  return (
    <div className="space-y-4">
      {/* Grid de estadísticas */}
      <div className="grid grid-cols-2 gap-4">
        {itemsEstadisticas.map((item) => {
          const Icono = item.icono
          return (
            <div
              key={item.id}
              className="rounded-2xl bg-surface-primary p-4 shadow-md"
            >
              <div className={`mb-3 inline-flex rounded-xl ${item.color} p-3`}>
                <Icono size={24} />
              </div>
              <p className="text-sm text-text-muted">{item.etiqueta}</p>
              <p className="mt-1 text-lg font-bold text-text-primary">
                {item.valor}
              </p>
            </div>
          )
        })}
      </div>

      {/* Próximas Recompensas */}
      <div className="rounded-2xl bg-surface-primary p-6 shadow-md">
        <div className="mb-4 flex items-center gap-2">
          <Gift className="text-primary" size={24} />
          <h3 className="text-lg font-semibold text-text-primary">
            Próximas Recompensas
          </h3>
        </div>

        {cargando ? (
          <div className="flex justify-center py-8">
            <Loader className="animate-spin text-primary" size={32} />
          </div>
        ) : recompensasCercanas.length === 0 ? (
          <p className="py-4 text-center text-text-muted">
            No hay recompensas disponibles
          </p>
        ) : (
          <div className="space-y-3">
            {recompensasCercanas.map((recompensa) => (
              <div
                key={recompensa.id}
                className={`flex items-center gap-4 rounded-xl p-4 ${
                  recompensa.puedeReclamar
                    ? 'border border-green-200 bg-green-50'
                    : 'bg-surface-secondary'
                }`}
              >
                <div className="text-3xl">
                  {obtenerEmoji(recompensa.category)}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-text-primary">{recompensa.name}</p>
                  <p className="text-sm text-text-muted">{recompensa.pointsCost} pts</p>
                </div>
                <div className="text-right">
                  {recompensa.puedeReclamar ? (
                    <span className="text-sm font-medium text-green-600">
                      ¡Disponible!
                    </span>
                  ) : (
                    <span className="text-sm text-text-muted">
                      Te faltan {recompensa.puntosFaltantes} pts
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default PerfilStats
