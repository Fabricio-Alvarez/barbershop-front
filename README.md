# BarberShop Web

Aplicación web para consultar disponibilidad, reservar citas de peluquería y administrar la agenda. Está desarrollada con React, TypeScript y Vite.

Incluye un panel público sin autenticación y un panel administrativo protegido. La API backend continúa siendo la fuente de verdad para horarios, validaciones y conflictos de reserva.

## Tecnologías

- React 19.
- TypeScript en modo estricto.
- Vite.
- React Router.
- TanStack Query.
- React Hook Form.
- Zod.
- date-fns y date-fns-tz.
- Lucide React.
- Vitest.
- ESLint y Prettier.

## Funcionalidad

### Panel público

- Consulta semanal de disponibilidad.
- Navegación entre semanas.
- Horarios de lunes a sábado desde las 10:00 a. m.
- Domingo identificado visualmente como cerrado.
- Selección de un turno disponible.
- Formulario con nombre, teléfono, correo opcional y confirmación.
- Validación en tiempo real.
- Manejo de conflictos cuando otro cliente reserva primero.
- Estados de carga, error y confirmación.

### Panel administrativo

- Login mediante JWT.
- Ruta privada protegida.
- Listado y paginación de citas.
- Búsqueda por cliente, teléfono o correo.
- Filtros por fecha y estado.
- Edición de cliente y horario.
- Cancelación de citas.
- Marcado de citas como completadas.
- Cierre automático de sesión al recibir un `401`.

## Arquitectura

```text
.
├── config/
│   └── vite.config.ts          # Configuración de Vite
├── src/
│   ├── api/                    # Cliente HTTP y endpoints
│   ├── auth/                   # Contexto y rutas protegidas
│   ├── components/
│   │   ├── admin/              # Componentes administrativos
│   │   ├── booking/            # Calendario y reserva
│   │   ├── layout/             # Encabezados y estructura
│   │   └── ui/                 # Alertas, modal y spinner
│   ├── config/                 # Variables públicas
│   ├── pages/                  # Páginas de la aplicación
│   ├── types/                  # Contratos TypeScript
│   ├── utils/                  # Conversión de fechas
│   ├── validations/            # Esquemas Zod
│   ├── App.tsx                 # Rutas
│   ├── main.tsx                # Providers y arranque
│   └── styles.css              # Diseño responsivo
├── .env.example
├── index.html
├── package.json
└── vercel.json
```

## Requisitos

- Node.js 20.19 o superior. Se recomienda Node.js 22.
- npm 10 o superior.
- La API BarberShop ejecutándose localmente o desplegada.

## Instalación

Clona el repositorio e instala las dependencias:

```bash
git clone URL_DEL_REPOSITORIO
cd NOMBRE_DEL_REPOSITORIO
npm ci
```

Crea el archivo `.env`:

```bash
cp .env.example .env
```

En PowerShell:

```powershell
Copy-Item .env.example .env
```

Configura las variables:

```dotenv
VITE_API_URL=http://localhost:3000/api/v1
VITE_BUSINESS_NAME="Yaro's Barber"
VITE_BUSINESS_TIMEZONE=America/Costa_Rica
```
