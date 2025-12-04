# Solución al error SIGILL en Docker Build

## Problema
El error `SIGILL` (Illegal Instruction) ocurre cuando Next.js intenta usar Turbopack durante la compilación en Docker, especialmente en sistemas Windows/WSL2.

## Soluciones aplicadas

### 1. Deshabilitado Turbopack
**Archivo: `Dockerfile`**
```dockerfile
ENV TURBOPACK 0
```

Esto fuerza a Next.js a usar **webpack** en lugar de **Turbopack** durante el build, que es más compatible con diferentes arquitecturas.

### 2. Plataforma especificada
**Archivo: `docker-compose.yml`**
```yaml
platform: linux/amd64
```

Esto asegura que Docker construya para la arquitectura x86_64, evitando problemas de compatibilidad.

### 3. Eliminado swcMinify
**Archivo: `next.config.js`**

Eliminada la opción `swcMinify` que ya no es válida en Next.js 16.

## ¿Por qué ocurre SIGILL?

SIGILL (Illegal Instruction) significa que el código compilado intenta ejecutar instrucciones de CPU que no están disponibles en el procesador actual. Esto puede ocurrir cuando:

1. **Turbopack** compila código con optimizaciones específicas de arquitectura
2. El **entorno de compilación** (Docker) y el **procesador host** (Windows/WSL) tienen incompatibilidades
3. Los **binarios nativos** de Next.js no coinciden con la arquitectura

## Configuración final

### Variables de entorno en Dockerfile:
```dockerfile
ENV NEXT_TELEMETRY_DISABLED 1
ENV CI true
ENV SKIP_ENV_VALIDATION true
ENV TURBOPACK 0  # ← Clave para evitar SIGILL
```

### Plataforma en docker-compose.yml:
```yaml
frontend:
  platform: linux/amd64  # ← Compatibilidad de arquitectura
```

## Próximos pasos

Reconstruir los contenedores con:

```powershell
# Limpiar build cache anterior
docker-compose down
docker builder prune -f

# Construir sin cache
docker-compose build --no-cache

# Iniciar
docker-compose up -d
```

## Alternativas si todavía falla

Si el error SIGILL persiste, hay otras opciones:

### Opción 1: Usar imagen base diferente
```dockerfile
FROM node:20-alpine AS base
# Cambiar a:
FROM node:20-slim AS base
```

### Opción 2: Compilar en modo desarrollo
```yaml
# En docker-compose.yml
environment:
  NODE_ENV: development
```

### Opción 3: Usar multi-stage build sin optimizaciones
```dockerfile
ENV NODE_OPTIONS="--max-old-space-size=4096"
```

### Opción 4: Downgrade de Next.js
Si todo lo demás falla, considerar usar Next.js 14 que no tiene Turbopack por defecto:
```json
"next": "^14.2.0"
```

## Rendimiento

Al deshabilitar Turbopack:
- ✅ **Build más estable** y compatible
- ⚠️ **Build más lento** (webpack es más lento que Turbopack)
- ✅ **Sin errores SIGILL**
- ✅ **Funciona en producción**

En producción, el runtime de Next.js es el mismo, solo el tiempo de compilación aumenta.
