# Sistema de Puntos y Fidelización - Documentación

## Descripción General

Sistema de fidelización para un bar que permite a los clientes acumular puntos por sus compras y canjearlos por recompensas. El sistema está desarrollado en **React 19 + Vite** siguiendo el patrón **MVC adaptado para frontend**.

---

## Arquitectura MVC

El proyecto sigue una arquitectura MVC adaptada para React:

```
src/
├── models/          → Datos, estados iniciales y constantes
├── controllers/     → Custom Hooks con lógica de negocio
├── services/        → Llamadas a API (mock sin BD por ahora)
├── views/           → Componentes de página y presentación
├── components/      → Componentes UI reutilizables
└── routes/          → Configuración de rutas
```

---

## Módulos Implementados

### 1. Módulo Menu (`/menu`)

**Propósito:** Mostrar el catálogo de productos del bar con sus precios y puntos que otorgan.

**Archivos:**
```
src/
├── models/menu/
│   └── menuModel.js           # Datos mock del menú, categorías
├── controllers/menu/
│   └── useMenuController.js   # Lógica del menú y carrito
├── services/menu/
│   └── menuServices.js        # Funciones de API mock
└── views/menu/
    ├── MenuPage.jsx           # Página principal
    ├── MenuCategories.jsx     # Filtro de categorías
    ├── MenuList.jsx           # Lista de productos
    ├── MenuOrderSummary.jsx   # Resumen del pedido
    └── index.js               # Barrel export
```

**Características:**
- Catálogo de productos con categorías (Bebidas, Cócteles, Snacks, Promos)
- Búsqueda de productos
- Carrito de compras con contador
- Muestra puntos que gana el cliente por producto
- Cálculo automático de total y puntos acumulados

**Datos Mock:**
- 8 productos con precios desde $5.50 hasta $14.00
- Puntos por producto: 10-35 puntos

---

### 2. Módulo Servicios (`/servicios`)

**Propósito:** Mostrar servicios adicionales del bar que requieren o premian con puntos.

**Archivos:**
```
src/
├── models/servicios/
│   └── serviciosModel.js           # Datos mock de servicios
├── controllers/servicios/
│   └── useServiciosController.js   # Lógica de servicios
├── services/servicios/
│   └── serviciosServices.js        # Funciones de API mock
└── views/servicios/
    ├── ServiciosPage.jsx           # Página principal
    ├── ServiciosList.jsx           # Lista de servicios
    ├── ServicioModal.jsx           # Modal de reserva
    └── index.js                    # Barrel export
```

**Características:**
- Lista de servicios con categorías (Reservas, Eventos, Entretenimiento, VIP, Delivery)
- Indica puntos requeridos para acceder al servicio
- Indica puntos que gana al usar el servicio
- Modal de detalle con opción de reservar
- Validación de puntos suficientes

**Servicios Disponibles:**
| Servicio | Puntos Requeridos | Puntos Ganados |
|----------|-------------------|----------------|
| Reserva de Mesa | 0 | 50 |
| Cumpleaños VIP | 500 | 100 |
| Karaoke Privado | 300 | 75 |
| DJ Request | 50 | 10 |
| Área VIP | 1000 | 200 |
| Delivery | 0 | 25 |
| Clase Coctelería | 200 | 100 |
| Estacionamiento VIP | 150 | 30 |

---

### 3. Módulo Perfil (`/perfil`)

**Propósito:** Mostrar información del cliente, sus puntos, nivel de membresía y estadísticas.

**Archivos:**
```
src/
├── models/perfil/
│   └── perfilModel.js           # Datos del usuario, niveles
├── controllers/perfil/
│   └── usePerfilController.js   # Lógica del perfil
├── services/perfil/
│   └── perfilServices.js        # Funciones de API mock
└── views/perfil/
    ├── PerfilPage.jsx           # Página principal
    ├── PerfilHeader.jsx         # Cabecera con avatar y nivel
    ├── PerfilInfo.jsx           # Tab de información personal
    ├── PerfilPoints.jsx         # Tab de historial de puntos
    ├── PerfilStats.jsx          # Tab de estadísticas
    └── index.js                 # Barrel export
```

**Características:**
- Información personal editable
- Muestra nivel de membresía actual
- Barra de progreso al siguiente nivel
- Historial de movimientos de puntos
- Estadísticas de uso (visitas, gasto total, favorito)
- Sistema de logros/badges

**Niveles de Membresía:**
| Nivel | Puntos Mínimos | Beneficios |
|-------|----------------|------------|
| Bronce | 0 | 1 punto por $1 |
| Plata | 500 | 1.5 puntos por $1, 5% cumpleaños |
| Oro | 1500 | 2 puntos por $1, 10% cumpleaños, reserva prioritaria |
| Platino | 5000 | 3 puntos por $1, 20% cumpleaños, VIP, estacionamiento |

---

### 4. Módulo Canje (`/canje`)

**Propósito:** Permitir al cliente canjear sus puntos por recompensas.

**Archivos:**
```
src/
├── models/canje/
│   └── canjeModel.js           # Recompensas disponibles
├── controllers/canje/
│   └── useCanjeController.js   # Lógica de canje
├── services/canje/
│   └── canjeServices.js        # Funciones de API mock
└── views/canje/
    ├── CanjePage.jsx           # Página principal
    ├── CanjeList.jsx           # Lista de recompensas
    ├── CanjeModal.jsx          # Modal de confirmación
    └── index.js                # Barrel export
```

**Características:**
- Catálogo de recompensas canjeables
- Categorías (Bebidas, Comida, Descuentos, Experiencias)
- Búsqueda de recompensas
- Indicador de stock disponible
- Badge de "Popular" en recompensas destacadas
- Modal de confirmación con código de canje
- Validación de puntos suficientes

**Recompensas Disponibles:**
| Recompensa | Costo (puntos) | Categoría |
|------------|----------------|-----------|
| Cerveza Gratis | 100 | Bebidas |
| Cóctel Premium | 200 | Bebidas |
| Nachos con Todo | 150 | Comida |
| Alitas x6 | 180 | Comida |
| 10% Descuento | 250 | Descuentos |
| 25% Descuento | 500 | Descuentos |
| Mesa VIP 1 hora | 800 | Experiencias |
| Fiesta Cumpleaños | 1500 | Experiencias |

---

## Rutas del Sistema

| Ruta | Componente | Descripción |
|------|------------|-------------|
| `/login` | LoginPage | Inicio de sesión |
| `/main` | MainPage | Dashboard principal |
| `/menu` | MenuPage | Catálogo de productos |
| `/servicios` | ServiciosPage | Servicios del bar |
| `/perfil` | PerfilPage | Perfil del usuario |
| `/canje` | CanjePage | Canjear puntos |

---

## Flujo del Sistema de Puntos

```
1. Cliente compra en el menú
   ↓
2. Por cada producto se acumulan puntos
   (ej: Cerveza = 10 pts, Cóctel = 15 pts)
   ↓
3. Los puntos se suman al saldo del cliente
   ↓
4. Al acumular puntos, el cliente sube de nivel
   (Bronce → Plata → Oro → Platino)
   ↓
5. Puede canjear puntos por recompensas
   (bebidas gratis, descuentos, experiencias)
   ↓
6. Genera código de canje para usar en el bar
```

---

## Datos Mock (Usuario de Ejemplo)

```javascript
{
  name: 'Juan Pérez',
  email: 'juan.perez@email.com',
  membershipLevel: 'gold',
  points: {
    current: 1250,  // Puntos disponibles para canjear
    total: 3500     // Puntos totales acumulados (determina nivel)
  }
}
```

---

## Cómo Ejecutar

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Construir para producción
npm run build
```

---

## Próximos Pasos (Integración con Backend)

1. **Reemplazar datos mock** por llamadas reales a la API
2. **Implementar autenticación** con ProtectedRoute
3. **Conectar con base de datos** para:
   - Usuarios y sus puntos
   - Productos del menú
   - Historial de transacciones
   - Canjes realizados
4. **Agregar validaciones** de lado servidor
5. **Implementar notificaciones** push para promociones

---

## Tecnologías Utilizadas

- **React 19.2.0** - Librería UI
- **Vite 7.2.2** - Build tool
- **React Router DOM 7.9.6** - Enrutamiento
- **Tailwind CSS 4.1.17** - Estilos
- **Lucide React 0.554.0** - Iconos

---

## Autor

Sistema desarrollado como parte del proyecto de tesis para un sistema de fidelización de bar.
