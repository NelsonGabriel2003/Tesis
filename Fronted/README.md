# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh


# Sistema de Puntos - Frontend

Sistema de gestión de puntos desarrollado como proyecto de tesis.

## Tecnologías

- React 19.2.0
- Vite 7.2.2
- Tailwind CSS 4.1.17
- Lucide React (iconos)
- ESLint

## Requisitos Previos

- Node.js (versión 18 o superior)
- npm o yarn

## Instalación

1. Clonar el repositorio:

```bash
git clone <url-del-repositorio>
cd <Tesis>
```

2. Navegar a la carpeta del frontend:

```bash
cd Fronted
```

3. Instalar las dependencias:

```bash
npm install
```

## Ejecución

### Modo desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### Crear build de producción

```bash
npm run build
```

### Previsualizar build de producción

```bash
npm run preview
```

### Ejecutar linter

```bash
npm run lint
```

## Estructura del Proyecto

```
Fronted/
├── node_modules/
├── public/
├── src/
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── package-lock.json
├── tailwind.config.ts
├── vite.config.js
└── README.md
```

## Autor

Nelson Allauca

## Licencia

Este proyecto es parte de un trabajo de tesis y su uso está restringido a fines académicos.