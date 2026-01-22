 import { UtensilsCrossed, SquareStar, User, Gift,Package,Users } from 'lucide-react';
 // Módulos para USUARIOS
 export const userModules = [
    {
      id: 'menu',
      name: 'Menú',
      description: 'Ver productos disponibles',
      icon: UtensilsCrossed,
      color: 'bg-orange-500',
      route: '/menu'
    },
    {
      id: 'servicios',
      name: 'Servicios',
      description: 'Servicios disponibles',
      icon: SquareStar,
      color: 'bg-blue-500',
      route: '/servicios'
    },
    {
      id: 'perfil',
      name: 'Perfil',
      description: 'Mi información',
      icon: User,
      color: 'bg-green-500',
      route: '/perfil'
    },
    {
      id: 'canje',
      name: 'Canje',
      description: 'Canjear mis puntos',
      icon: Gift,
      color: 'bg-purple-500',
      route: '/canje'
    }
  ]

  //modulos de admin
export const adminModules = [
    {
      id: 'products',
      name: 'Productos',
      description: 'Gestionar menú',
      icon: Package,
      color: 'bg-orange-500',
      route: '/admin?section=products'
    },
    {
      id: 'rewards',
      name: 'Recompensas',
      description: 'Gestionar canjes',
      icon: Gift,
      color: 'bg-purple-500',
      route: '/admin?section=rewards'
    },
    {
      id: 'services',
      name: 'Servicios',
      description: 'Gestionar servicios',
      icon: SquareStar,
      color: 'bg-blue-500',
      route: '/admin?section=services'
    },
    {
      id: 'users',
      name: 'Usuarios',
      description: 'Ver clientes',
      icon: Users,
      color: 'bg-green-500',
      route: '/admin?section=users'
    },
    {
      id: 'staff',
      name: 'Personal',
      description: 'Staff y Telegram',
      icon: User,
      color: 'bg-indigo-500',
      route: '/admin?section=staff'
    }
  ]
