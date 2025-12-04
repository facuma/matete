# 🚀 Pasos para usar Docker Compose

## 📋 Paso 1: Actualizar tu archivo .env

Agrega estas líneas a tu archivo `.env` existente:

```env
# Variables adicionales para Docker
POSTGRES_USER=matete
POSTGRES_PASSWORD=matete123
POSTGRES_DB=matete_db
POSTGRES_PORT=5432
APP_PORT=3000
```

**Tu archivo .env completo debería verse así:**

```env
# PostgreSQL
POSTGRES_USER=matete
POSTGRES_PASSWORD=matete123
POSTGRES_DB=matete_db
POSTGRES_PORT=5432

# Database URL para desarrollo local (sin Docker)
DATABASE_URL="postgresql://matete:matete123@localhost:5432/matete_db"

# Next.js
NEXT_PUBLIC_API_URL="http://localhost:3000"
NEXTAUTH_SECRET="matete-super-secret-key-change-in-production-2024"
NEXTAUTH_URL="http://localhost:3000"

# MercadoPago
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY="TEST-691a824c-b4af-4866-aae0-c6930187face"
MERCADOPAGO_ACCESS_TOKEN="TEST-135853091045933-120216-8c8dc923ec84a82e9f31798d649d983b-288469805"

# App
APP_PORT=3000
```

---

## 🎯 Paso 2: Iniciar los contenedores

### Opción A: Usando el script helper (recomendado)

```powershell
.\docker-helper.ps1 start
```

### Opción B: Usando docker-compose directamente

```powershell
docker-compose up -d
```

---

## 🔍 Paso 3: Verificar que todo funciona

### Ver el estado de los contenedores:

```powershell
.\docker-helper.ps1 status
# o
docker-compose ps
```

Deberías ver algo como:

```
NAME                COMMAND                  SERVICE     STATUS
matete_frontend     "/bin/sh -c 'npx pri…"   frontend    running
matete_postgres     "docker-entrypoint.s…"   postgres    running
```

### Ver los logs del frontend:

```powershell
.\docker-helper.ps1 logs-app
# o
docker-compose logs -f frontend
```

---

## 🌐 Paso 4: Acceder a la aplicación

- **Frontend**: http://localhost:3000
- **PostgreSQL**: localhost:5432
  - Usuario: `matete`
  - Contraseña: `matete123`
  - Base de datos: `matete_db`

---

## 🛠️ Comandos útiles

| Comando | Descripción |
|---------|-------------|
| `.\docker-helper.ps1 start` | Iniciar contenedores |
| `.\docker-helper.ps1 stop` | Detener contenedores |
| `.\docker-helper.ps1 restart` | Reiniciar contenedores |
| `.\docker-helper.ps1 rebuild` | Reconstruir e iniciar |
| `.\docker-helper.ps1 logs` | Ver todos los logs |
| `.\docker-helper.ps1 logs-app` | Ver logs del frontend |
| `.\docker-helper.ps1 logs-db` | Ver logs de PostgreSQL |
| `.\docker-helper.ps1 status` | Ver estado |
| `.\docker-helper.ps1 shell` | Shell en el frontend |
| `.\docker-helper.ps1 db-shell` | Shell de PostgreSQL |
| `.\docker-helper.ps1 migrate` | Ejecutar migraciones |
| `.\docker-helper.ps1 seed` | Ejecutar seed |
| `.\docker-helper.ps1 clean` | Limpiar todo ⚠️ |

---

## 🔧 Solución de problemas

### ❌ Error: "port is already allocated"

Si el puerto 3000 o 5432 ya está en uso:

1. **Detén el proceso que lo está usando**
2. O **cambia el puerto en .env**:
   ```env
   APP_PORT=3001
   POSTGRES_PORT=5433
   ```

### ❌ Error en las migraciones

Ejecuta manualmente:

```powershell
.\docker-helper.ps1 migrate
```

### ❌ Quiero empezar de cero

```powershell
.\docker-helper.ps1 clean
.\docker-helper.ps1 start
```

---

## 🔄 Diferencia entre desarrollo local y Docker

### Desarrollo local (sin Docker):
- Ejecutas: `npm run dev`
- PostgreSQL: instalado localmente
- DATABASE_URL: `postgresql://matete:matete123@localhost:5432/matete_db`

### Con Docker:
- Ejecutas: `docker-compose up -d`
- PostgreSQL: en contenedor
- DATABASE_URL: configurada automáticamente por docker-compose
- Acceso: http://localhost:3000

**Puedes usar ambas formas**, solo asegúrate de:
- Si usas desarrollo local, PostgreSQL debe estar corriendo localmente
- Si usas Docker, ejecuta `docker-compose up -d`

---

## 📚 Más documentación

- `DOCKER_COMPOSE_GUIDE.md` - Guía completa de docker-compose
- `ENV_SETUP.md` - Explicación detallada de variables de entorno
- `DOCKER_SETUP.md` - Documentación original de Docker
