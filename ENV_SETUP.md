# Variables de entorno necesarias para Docker

Agrega estas variables adicionales a tu archivo `.env`:

```env
# ======================================
# Variables de PostgreSQL para Docker
# ======================================
POSTGRES_USER=matete
POSTGRES_PASSWORD=matete123
POSTGRES_DB=matete_db
POSTGRES_PORT=5432

# Puerto de la aplicación
APP_PORT=3000

# ======================================
# DATABASE_URL para desarrollo local (ya la tienes)
# ======================================
DATABASE_URL="postgresql://matete:matete123@localhost:5432/matete_db"

# ======================================
# IMPORTANTE: Cuando uses Docker, la DATABASE_URL cambia
# ======================================
# Para Docker Compose, el host debe ser "postgres" en lugar de "localhost"
# El docker-compose.yml ya configura esto automáticamente usando las variables POSTGRES_*
# Por lo tanto, NO necesitas cambiar tu DATABASE_URL en .env

# ======================================
# Variables que ya tienes (mantenerlas igual)
# ======================================
NEXT_PUBLIC_API_URL="http://localhost:3000"
NEXTAUTH_SECRET="matete-super-secret-key-change-in-production-2024"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY="TEST-691a824c-b4af-4866-aae0-c6930187face"
MERCADOPAGO_ACCESS_TOKEN="TEST-135853091045933-120216-8c8dc923ec84a82e9f31798d649d983b-288469805"
```

## ¿Por qué dos configuraciones de base de datos?

- **Desarrollo local** (fuera de Docker): usa `localhost` → `DATABASE_URL="postgresql://matete:matete123@localhost:5432/matete_db"`
- **Docker Compose**: usa `postgres` (nombre del servicio) → El docker-compose automáticamente configura esto

El `docker-compose.yml` construye la `DATABASE_URL` dinámicamente usando las variables `POSTGRES_*`, así que tu archivo `.env` puede mantener `localhost` para desarrollo local.

## Archivo .env completo recomendado

Tu archivo `.env` debería verse así:

```env
# PostgreSQL
POSTGRES_USER=matete
POSTGRES_PASSWORD=matete123
POSTGRES_DB=matete_db
POSTGRES_PORT=5432

# Database URL para desarrollo local
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
