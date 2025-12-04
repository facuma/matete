# Guía de uso de Docker Compose

## Configuración actualizada

El `docker-compose.yml` ha sido actualizado para incluir:

1. **PostgreSQL** (`postgres`): Base de datos principal
2. **Frontend Next.js** (`frontend`): Aplicación web con Next.js

## Variables de entorno necesarias

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Base de datos PostgreSQL
POSTGRES_USER=matete
POSTGRES_PASSWORD=matete123
POSTGRES_DB=matete_db
POSTGRES_PORT=5432

# URL de conexión a la base de datos
DATABASE_URL="postgresql://matete:matete123@localhost:5432/matete_db"

# Next.js
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-change-this-in-production

# MercadoPago (opcional)
NEXT_PUBLIC_MP_PUBLIC_KEY=your-mercadopago-public-key
MP_ACCESS_TOKEN=your-mercadopago-access-token

# Puerto de la aplicación
APP_PORT=3000
```

## Comandos disponibles

### Iniciar todos los servicios
```bash
docker-compose up -d
```

### Ver logs de todos los servicios
```bash
docker-compose logs -f
```

### Ver logs solo del frontend
```bash
docker-compose logs -f frontend
```

### Ver logs solo de PostgreSQL
```bash
docker-compose logs -f postgres
```

### Detener todos los servicios
```bash
docker-compose down
```

### Detener y eliminar volúmenes (⚠️ borrará datos de la BD)
```bash
docker-compose down -v
```

### Reconstruir los contenedores
```bash
docker-compose up -d --build
```

### Ejecutar comandos en el contenedor del frontend
```bash
# Acceder a la shell del contenedor
docker-compose exec frontend sh

# Ejecutar migraciones de Prisma
docker-compose exec frontend npx prisma migrate deploy

# Ver el estado de migraciones
docker-compose exec frontend npx prisma migrate status

# Seed de la base de datos
docker-compose exec frontend npx prisma db seed
```

### Ejecutar comandos en PostgreSQL
```bash
# Acceder a psql
docker-compose exec postgres psql -U matete -d matete_db

# Crear backup de la base de datos
docker-compose exec postgres pg_dump -U matete matete_db > backup.sql

# Restaurar backup
docker-compose exec -T postgres psql -U matete matete_db < backup.sql
```

## Cambios principales

### Servicio `postgres` (antes `db`)
- Renombrado para mayor claridad
- Usa variables de entorno desde archivo `.env`
- Red personalizada `matete_network`
- Política de reinicio `unless-stopped`

### Servicio `frontend` (antes `app`)
- Renombrado para mayor claridad
- Variables de entorno completas para Next.js y NextAuth
- Ejecuta migraciones automáticamente al inicio
- Healthcheck de base de datos antes de iniciar
- Red personalizada `matete_network`

## Orden de inicio

1. **postgres**: Se inicia primero
2. **frontend**: Espera a que postgres esté healthy antes de iniciar
   - Ejecuta `prisma migrate deploy`
   - Ejecuta `prisma db seed`
   - Inicia el servidor Next.js

## Acceso a los servicios

- **Frontend**: http://localhost:3000
- **PostgreSQL**: localhost:5432
  - Usuario: `matete` (o el configurado en `.env`)
  - Contraseña: `matete123` (o la configurada en `.env`)
  - Base de datos: `matete_db` (o la configurada en `.env`)

## Solución de problemas

### El frontend no se conecta a la base de datos
Verifica que la variable `DATABASE_URL` use `postgres` como host (no `localhost`):
```
DATABASE_URL="postgresql://matete:matete123@postgres:5432/matete_db"
```

### Las migraciones fallan
Ejecuta manualmente:
```bash
docker-compose exec frontend npx prisma migrate deploy
```

### Quiero reiniciar desde cero
```bash
# Detener y eliminar todo
docker-compose down -v

# Iniciar nuevamente
docker-compose up -d
```

### Ver el estado de los contenedores
```bash
docker-compose ps
```
