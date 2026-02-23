import { useEffect, useMemo, useState } from 'react'
import Particles, { initParticlesEngine } from '@tsparticles/react'
import { loadSlim } from '@tsparticles/slim'

const frases = [
  'Acumula puntos en cada visita',
  'Canjea recompensas exclusivas',
  'Vive las mejores noches',
  'Tu fidelidad tiene premio'
]

let contadorId = 0

const ParticlesBanner = ({ className = '', soloFondo = false }) => {
  const [idUnico] = useState(() => `tsparticles-${contadorId++}`)
  const [listo, setListo] = useState(false)
  const [indiceFrase, setIndiceFrase] = useState(0)
  const [fadeIn, setFadeIn] = useState(true)

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine)
    }).then(() => setListo(true))
  }, [])

  useEffect(() => {
    const intervalo = setInterval(() => {
      setFadeIn(false)
      setTimeout(() => {
        setIndiceFrase((prev) => (prev + 1) % frases.length)
        setFadeIn(true)
      }, 500)
    }, 4000)
    return () => clearInterval(intervalo)
  }, [])

  const opciones = useMemo(() => ({
    fullScreen: { enable: false },
    background: { color: { value: 'transparent' } },
    fpsLimit: 60,
    particles: {
      color: { value: ['#34D399', '#6EE7B7', '#10B981'] },
      move: {
        enable: true,
        speed: { min: 0.2, max: 0.5 },
        direction: 'none',
        random: true,
        straight: false,
        outModes: { default: 'bounce' }
      },
      number: { value: 100, density: { enable: true, area: 800 } },
      opacity: {
        value: { min: 0.15, max: 0.6 },
        animation: { enable: true, speed: 0.3, sync: false, minimumValue: 0.1 }
      },
      size: {
        value: { min: 2, max: 6 },
        animation: { enable: true, speed: 0.5, sync: false, minimumValue: 1 }
      },
      shape: { type: 'circle' }
    }
  }), [])

  if (soloFondo) {
    return (
      <div className={`fixed inset-0 z-0 overflow-hidden ${className}`}>
        {listo && (
          <Particles
            id={idUnico}
            options={opciones}
            className="absolute inset-0"
          />
        )}
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {listo && (
        <Particles
          id={idUnico}
          options={opciones}
          className="absolute inset-0 z-0"
        />
      )}

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-10 text-center text-white">
        <h2 className="mb-4 text-3xl font-semibold">
          Bienvenido a Bounty Bar
        </h2>
        <p
          className={`text-lg transition-opacity duration-500 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}
        >
          {frases[indiceFrase]}
        </p>
      </div>
    </div>
  )
}

export default ParticlesBanner
