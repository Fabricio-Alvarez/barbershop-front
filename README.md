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

- `VITE_API_URL` debe incluir el prefijo `/api/v1`.
- `VITE_BUSINESS_TIMEZONE` debe coincidir con `BUSINESS_TIMEZONE` del backend.
- Las variables de Vite quedan incluidas en el bundle; nunca coloques secretos en ellas.

## Ejecutar en desarrollo

Primero inicia el backend. Después ejecuta:

```bash
npm run dev
```

Abre `http://localhost:5173`.

Rutas disponibles:

| Ruta           | Descripción                  |
| -------------- | ---------------------------- |
| `/`            | Calendario y reserva pública |
| `/admin/login` | Login administrativo         |
| `/admin`       | Panel privado de citas       |

## Scripts

| Comando                | Descripción                                     |
| ---------------------- | ----------------------------------------------- |
| `npm run dev`          | Inicia Vite en desarrollo                       |
| `npm run build`        | Verifica tipos y genera el bundle de producción |
| `npm run preview`      | Sirve localmente el bundle compilado            |
| `npm run lint`         | Ejecuta ESLint sin permitir advertencias        |
| `npm run format`       | Formatea el proyecto con Prettier               |
| `npm run format:check` | Comprueba el formato                            |
| `npm run typecheck`    | Comprueba los tipos TypeScript                  |
| `npm run test`         | Ejecuta las pruebas                             |

## Comunicación con la API

El cliente central se encuentra en `src/api/client.ts`.

- Añade el JWT automáticamente cuando existe una sesión administrativa.
- Convierte respuestas fallidas en errores consistentes.
- Elimina la sesión y notifica a la aplicación cuando recibe HTTP `401`.
- Muestra un error claro cuando la API no está disponible.

TanStack Query administra caché, reintentos, invalidación y actualización de disponibilidad después de crear o editar una cita.

## Autenticación

El token JWT se almacena en `sessionStorage`:

- Se elimina al cerrar la pestaña.
- Se elimina al cerrar sesión.
- Se elimina automáticamente si la API responde `401`.
- Las rutas privadas redirigen a `/admin/login` cuando no existe sesión.

El frontend no contiene credenciales administrativas predeterminadas. El administrador se crea mediante el seed del backend.

## Formularios y validación

React Hook Form se integra con Zod para validar:

- Nombre completo.
- Teléfono.
- Correo opcional.
- Confirmación de datos.
- Credenciales administrativas.
- Edición de citas.

Las mismas reglas relevantes se vuelven a comprobar en el backend. Las validaciones del navegador mejoran la experiencia, pero no sustituyen la validación de la API.

## Zona horaria

Las citas llegan como instantes ISO 8601. `date-fns-tz` las presenta y convierte utilizando `VITE_BUSINESS_TIMEZONE`, independientemente de la zona configurada en el dispositivo del usuario.

Esto es especialmente importante para:

- Mostrar la hora real del negocio.
- Convertir filtros por fecha.
- Editar un horario mediante `datetime-local`.
- Evitar desplazamientos al administrar desde otro país.

## Diseño y accesibilidad

- Interfaz minimalista y responsiva.
- Calendario con scroll horizontal controlado en pantallas pequeñas.
- Estados visuales para disponible, ocupado, seleccionado y cerrado.
- Diálogos con cierre por Escape.
- Etiquetas asociadas a formularios.
- Navegación visible mediante teclado.
- Mensajes con roles `status` y `alert`.
- Compatibilidad con `prefers-reduced-motion`.

## Pruebas y calidad

Antes de publicar cambios ejecuta:

```bash
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run build
```

Las pruebas actuales cubren los helpers utilizados para navegar semanas y representar fechas de calendario de forma estable.

## Build de producción

```bash
npm run build
```

Los archivos optimizados se generan en `dist/`.

Para comprobarlos localmente:

```bash
npm run preview
```

La previsualización se abre en `http://localhost:4173`. El backend debe incluir ese origen en `CORS_ORIGIN` si quieres probar el flujo completo mediante `preview`.

## Despliegue en Vercel

1. Importa este repositorio en Vercel.
2. Selecciona Vite como framework.
3. Install Command: `npm ci`.
4. Build Command: `npm run build`.
5. Output Directory: `dist`.
6. Configura las variables de entorno:

```dotenv
VITE_API_URL=https://TU_API/api/v1
VITE_BUSINESS_NAME=Nombre de tu negocio
VITE_BUSINESS_TIMEZONE=America/Costa_Rica
```

7. Despliega el proyecto.
8. Agrega el dominio final de Vercel a `CORS_ORIGIN` en el backend.

`vercel.json` incluye una reescritura hacia `index.html` para que React Router funcione al abrir directamente `/admin` o `/admin/login`.

## Otros proveedores

El contenido de `dist/` puede publicarse en Netlify, Cloudflare Pages, GitHub Pages con configuración SPA, un bucket estático o un servidor Nginx/Caddy.

Debes garantizar que:

- Todas las rutas desconocidas sirvan `index.html`.
- `VITE_API_URL` se defina antes del build.
- El backend permita el dominio mediante CORS.
- Frontend y backend utilicen HTTPS en producción.

## Solución de problemas

### “No se pudo conectar con el servidor”

Comprueba:

1. Que el backend esté ejecutándose.
2. Que `VITE_API_URL` termine en `/api/v1`.
3. Que `http://localhost:3000/api/v1/health` responda `status: ok`.
4. Que `CORS_ORIGIN` permita el origen del frontend.
5. Que reiniciaste Vite después de modificar `.env`.

### El panel vuelve al login

El JWT pudo expirar o el backend respondió `401`. Inicia sesión nuevamente.

### Las horas no coinciden

Verifica que `VITE_BUSINESS_TIMEZONE` y `BUSINESS_TIMEZONE` tengan el mismo valor.

## Licencia

Este proyecto puede distribuirse bajo la licencia que definas para tu repositorio.
