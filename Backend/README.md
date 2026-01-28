# 🍺 Backend - Sistema de Fidelización

API REST para el sistema de fidelización de bar desarrollado con **Node.js**, **Express** y **PostgreSQL**.

## 📁 Estructura del Proyecto

```
Backend/
├── src/
│   ├── config/          # Configuración (DB, JWT)
│   ├── controllers/     # Lógica de endpoints
│   ├── middlewares/     # Auth, errores
│   ├── models/          # Consultas a BD
│   ├── routes/          # Definición de rutas
│   └── app.js           # Entry point
├── database/
│   ├── migrations/      # Creación de tablas
│   └── seeds/           # Datos iniciales
├── .env.example         # Variables de entorno
└── package.json
```

## 🚀 Instalación

### 1. Instalar dependencias

```bash
cd Backend
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
```

Edita `.env` con tus credenciales de PostgreSQL:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fidelizacion_db
DB_USER=postgres
DB_PASSWORD=tu_password
JWT_SECRET=tu_secreto_super_seguro
```

### 3. Crear base de datos en PostgreSQL

```sql
CREATE DATABASE fidelizacion_db;
```

### 4. Ejecutar migraciones y seeds

```bash
# Crear tablas
npm run migrate

# Insertar datos de prueba
npm run seed

# O ambos juntos
npm run setup
```

### 5. Iniciar el servidor

```bash
# Desarrollo (con hot reload)
npm run dev

# Producción
npm start
```

El servidor estará en: `http://localhost:3000`

---

## 📡 Endpoints de la API

### Auth

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/register` | Registrar usuario |
| POST | `/api/auth/login` | Iniciar sesión |
| GET | `/api/auth/me` | Obtener perfil (🔒) |
| PUT | `/api/auth/me` | Actualizar perfil (🔒) |

### Productos (Menú)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/products` | Listar productos |
| GET | `/api/products/categories` | Listar categorías |
| GET | `/api/products/search?q=` | Buscar productos |
| GET | `/api/products/:id` | Obtener producto |
| POST | `/api/products` | Crear producto (🔒 Admin) |
| PUT | `/api/products/:id` | Actualizar producto (🔒 Admin) |

### Recompensas (Canje)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/rewards` | Listar recompensas |
| GET | `/api/rewards/categories` | Listar categorías |
| GET | `/api/rewards/:id` | Obtener recompensa |
| POST | `/api/rewards/:id/redeem` | Canjear recompensa (🔒) |
| GET | `/api/rewards/user/my-redemptions` | Mis canjes (🔒) |
| GET | `/api/rewards/validate/:code` | Validar código (🔒) |
| POST | `/api/rewards/use/:code` | Usar código (🔒) |

### Servicios

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/services` | Listar servicios |
| GET | `/api/services/categories` | Listar categorías |
| GET | `/api/services/:id` | Obtener servicio |
| POST | `/api/services/:id/book` | Reservar servicio (🔒) |

### Perfil

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/profile` | Mi perfil completo (🔒) |
| GET | `/api/profile/transactions` | Historial de puntos (🔒) |
| GET | `/api/profile/transactions/summary` | Resumen de puntos (🔒) |
| GET | `/api/profile/stats` | Estadísticas (🔒) |
| GET | `/api/profile/levels` | Niveles de membresía (🔒) |

> 🔒 = Requiere autenticación (Token JWT)

---

## 🔐 Autenticación

La API usa **JWT (JSON Web Tokens)**. Incluye el token en el header:

```
Authorization: Bearer <tu_token>
```

---

## 👤 Usuarios de Prueba

| Email | Password | Rol | Nivel |
|-------|----------|-----|-------|
| admin@bar.com | 123456 | Admin | Platino |
| juan@email.com | 123456 | User | Oro |
| maria@email.com | 123456 | User | Plata |

---

## 📝 Ejemplos de Uso

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "juan@email.com", "password": "123456"}'
```

### Obtener productos

```bash
curl http://localhost:3000/api/products
```

### Canjear recompensa

```bash
curl -X POST http://localhost:3000/api/rewards/1/redeem \
  -H "Authorization: Bearer <token>"
```

---

## 🗄️ Base de Datos

### Tablas

- **users** - Usuarios del sistema
- **products** - Productos del menú
- **rewards** - Recompensas canjeables
- **services** - Servicios del bar
- **transactions** - Historial de puntos
- **redemptions** - Canjes realizados

### Niveles de Membresía

| Nivel | Puntos Mínimos | Multiplicador |
|-------|----------------|---------------|
| Bronce | 0 | 1x |
| Plata | 500 | 1.5x |
| Oro | 1,500 | 2x |
| Platino | 5,000 | 3x |

---

## 🛠️ Scripts Disponibles

```bash
npm run dev      # Desarrollo con nodemon
npm start        # Producción
npm run migrate  # Crear tablas
npm run seed     # Datos iniciales
npm run setup    # migrate + seed
```

---

## 📄 Licencia

ISC - Proyecto de Tesis
