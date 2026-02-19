# SIF-TUC — Sistema de Información Fluvial de la Policía de Tucumán

Sistema web con mapa interactivo de la provincia de Tucumán para registrar y visualizar hechos fluviales policiales. Cada hecho carga **2 puntos de referencia** en el mapa: punto de ingreso al agua y punto de hallazgo/rescate.

## Stack Tecnológico

| Capa          | Tecnología                                |
| ------------- | ----------------------------------------- |
| Frontend      | React 18 + TypeScript + Vite              |
| Mapa          | Leaflet + OpenStreetMap                   |
| Backend       | Node.js + Express + TypeScript            |
| Base de datos | PostgreSQL 15 + PostGIS                   |
| Autenticación | JWT con roles (admin, operador, consulta) |

## Datos registrados por hecho

- **Carátula**: Rescate / Fallecimiento por ahogamiento / Hallazgo de cuerpo humano (N.N.)
- **Unidad Regional**: URN, URS, URE, URO
- **Jurisdicción**
- **Lugar del hecho**
- **Fecha del hecho**
- **Fecha del habido**
- **Víctima**
- **Sexo**
- **Edad**
- **Punto 1** (ingreso al agua) — coordenada en mapa
- **Punto 2** (hallazgo/rescate) — coordenada en mapa

## Inicio rápido

### Requisitos

- Node.js 18+
- PostgreSQL 15+ con extensión PostGIS
- npm o yarn

### Instalación

```bash
# Clonar repositorio
git clone https://github.com/desarrolloramon829-spec/SIF-DIC.git
cd SIF-TUC

# Instalar dependencias del servidor
cd server && npm install

# Instalar dependencias del cliente
cd ../client && npm install

# Configurar variables de entorno
cp ../server/.env.example ../server/.env
# Editar .env con datos de conexión a PostgreSQL

# Ejecutar migraciones
cd ../server && npm run migrate

# Iniciar en modo desarrollo
npm run dev          # servidor (puerto 3001)
cd ../client && npm run dev  # cliente (puerto 5173)
```

### Docker (opcional)

```bash
docker-compose up -d   # PostgreSQL + PostGIS en puerto 5432
```

## Estructura del proyecto

```
SIF-TUC/
├── client/          # React + Vite (frontend)
├── server/          # Node.js + Express (API REST)
├── database/        # Scripts SQL y migraciones
├── docker-compose.yml
└── README.md
```

## Roles de usuario

| Rol      | Permisos                            |
| -------- | ----------------------------------- |
| Admin    | CRUD completo + gestión de usuarios |
| Operador | Crear y editar hechos               |
| Consulta | Solo visualizar mapa y datos        |
