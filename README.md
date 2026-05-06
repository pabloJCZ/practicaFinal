# BildyApp API

API REST para la digitalización de albaranes (partes de horas y materiales) entre clientes y proveedores.

## Tecnologías

- **Node.js + Express** — Servidor HTTP
- **MongoDB + Mongoose** — Base de datos
- **JWT** — Autenticación
- **Zod** — Validación de datos
- **Socket.IO** — Notificaciones en tiempo real
- **Multer + Cloudinary** — Subida de archivos
- **PDFKit** — Generación de PDFs
- **Sharp** — Optimización de imágenes
- **Swagger/OpenAPI 3.0** — Documentación
- **Jest + Supertest** — Testing
- **Docker + GitHub Actions** — CI/CD

---

## Instalación local

```bash
# 1. Clonar el repositorio
git clone <url-del-repo>
cd bildyapp-api

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores

# 4. Iniciar en modo desarrollo
npm run dev
```

---

## Ejecución con Docker

```bash
# Levantar app + MongoDB
docker compose up --build

# En segundo plano
docker compose up -d --build

# Parar contenedores
docker compose down
```

---

## Ejecutar tests

```bash
# Todos los tests
npm test

# Con cobertura
npm run test:coverage

# Modo watch
npm run test:watch
```

---

## Documentación Swagger

Una vez iniciado el servidor, accede a la documentación interactiva en:

```
http://localhost:3000/api-docs
```

---

## Endpoints principales

### Usuarios
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/user/register` | Registro |
| PUT | `/api/user/validation` | Validar email |
| POST | `/api/user/login` | Login (devuelve JWT) |
| PUT | `/api/user/register` | Datos personales |
| PATCH | `/api/user/company` | Crear/actualizar compañía |
| PATCH | `/api/user/logo` | Subir logo |
| GET | `/api/user` | Datos del usuario |
| DELETE | `/api/user` | Eliminar cuenta |

### Clientes
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/client` | Crear cliente |
| GET | `/api/client` | Listar clientes |
| GET | `/api/client/archived` | Clientes archivados |
| GET | `/api/client/:id` | Obtener cliente |
| PUT | `/api/client/:id` | Actualizar cliente |
| DELETE | `/api/client/:id` | Archivar/eliminar |
| PATCH | `/api/client/:id/restore` | Restaurar |

### Proyectos
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/project` | Crear proyecto |
| GET | `/api/project` | Listar proyectos |
| GET | `/api/project/archived` | Proyectos archivados |
| GET | `/api/project/:id` | Obtener proyecto |
| PUT | `/api/project/:id` | Actualizar proyecto |
| DELETE | `/api/project/:id` | Archivar/eliminar |
| PATCH | `/api/project/:id/restore` | Restaurar |

### Albaranes
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/deliverynote` | Crear albarán |
| GET | `/api/deliverynote` | Listar albaranes |
| GET | `/api/deliverynote/:id` | Obtener albarán |
| GET | `/api/deliverynote/pdf/:id` | Descargar PDF |
| PATCH | `/api/deliverynote/:id/sign` | Firmar albarán |
| DELETE | `/api/deliverynote/:id` | Eliminar albarán |

### Sistema
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/health` | Health check |

---

## Variables de entorno

Ver `.env.example` para la lista completa de variables necesarias.

---

## WebSockets (Socket.IO)

La conexión requiere autenticación JWT:

```javascript
const socket = io('http://localhost:3000', {
  auth: { token: 'TU_JWT_TOKEN' }
});

// Escuchar eventos
socket.on('deliverynote:new', (data) => console.log('Nuevo albarán:', data));
socket.on('deliverynote:signed', (data) => console.log('Albarán firmado:', data));
socket.on('client:new', (data) => console.log('Nuevo cliente:', data));
socket.on('project:new', (data) => console.log('Nuevo proyecto:', data));
```

---

## Estructura del proyecto

```
bildyapp-api/
├── src/
│   ├── config/          # Configuración centralizada
│   ├── controllers/     # Lógica de negocio (MVC)
│   ├── middleware/       # Auth, validación, rate-limit, upload
│   ├── models/          # Esquemas Mongoose
│   ├── routes/          # Definición de rutas + Swagger
│   ├── services/        # Logger, Email, PDF, Storage
│   ├── utils/           # AppError
│   ├── validators/      # Schemas Zod
│   ├── app.js           # Express + Socket.IO
│   └── index.js         # Entry point + graceful shutdown
├── tests/               # Tests de integración (Jest + Supertest)
├── .github/workflows/   # GitHub Actions CI
├── Dockerfile
├── docker-compose.yml
├── api.http             # Ejemplos de peticiones HTTP
└── README.md
```
