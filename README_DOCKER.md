# 🚀 Docker Setup - Instrucciones Finales

## ✅ Archivos Creados

### Docker
- ✅ `Dockerfile` - Multi-stage build optimizado para CPU antiguo
- ✅ `docker-compose.yml` - Orquestación de PostgreSQL + Frontend
- ✅ `.dockerignore` - Optimización de contexto de build

### Ya Configurados
- ✅ `next.config.js` - Sin static generation, compatible con CPU antiguo
- ✅ `prisma/schema.prisma` - Binary targets para Debian
- ✅ `src/app/page.js` - Dynamic rendering
- ✅ `src/app/sitemap.js` - Error handling para DB
- ✅ `src/app/login/page.js` - Suspense wrapper

---

## 📋 Checklist Pre-Build

### 1. Verificar archivo `.env`

Debe contener COMO MÍNIMO:

```env
# PostgreSQL
POSTGRES_USER=matete
POSTGRES_PASSWORD=matete123
POSTGRES_DB=matete_db
POSTGRES_PORT=5432

# Database URL (para desarrollo local, Docker usará otra)
DATABASE_URL="postgresql://matete:matete123@localhost:5432/matete_db"

# Next.js
NEXT_PUBLIC_API_URL="http://localhost:3000"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="tu-secret-key-aqui"

# MercadoPago
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY="TEST-xxx"
MERCADOPAGO_ACCESS_TOKEN="TEST-xxx"

# App
APP_PORT=3000
```

### 2. Verificar que estás en el directorio correcto

```bash
pwd
# Debe mostrar: ~/matete o similar
ls
# Debe mostrar: docker-compose.yml, Dockerfile, package.json, etc.
```

---

## 🏗️ Build en Servidor (Primera Vez)

### Paso 1: Limpiar cualquier build anterior

```bash
# Detener contenedores si existen
docker-compose down

# Limpiar imágenes y cache antiguos (OPCIONAL pero recomendado)
docker system prune -a -f
```

### Paso 2: Construir imágenes

```bash
# Build SIN cache (primera vez o cuando cambies Dockerfile)
docker-compose build --no-cache

# Build CON cache (builds subsecuentes)
# docker-compose build
```

**⏱️ Tiempo esperado en CPU Pentium T4200:**
- Primera vez: 10-15 minutos
- Con cache: 4-6 minutos

### Paso 3: Iniciar servicios

```bash
docker-compose up -d
```

### Paso 4: Ver logs

```bash
# Ver todos los logs
docker-compose logs -f

# Ver solo logs del frontend
docker-compose logs -f frontend

# Ver solo logs de postgres
docker-compose logs -f postgres
```

---

## ✅ Verificación de Build Exitoso

### Logs esperados:

#### PostgreSQL:
```
matete_postgres | PostgreSQL init process complete; ready for start up.
matete_postgres | database system is ready to accept connections
```

#### Frontend:
```
matete_frontend | 🔄 Esperando a que PostgreSQL esté listo...
matete_frontend | 📦 Aplicando migraciones de Prisma...
matete_frontend | Prisma schema loaded from ./prisma/schema.prisma
matete_frontend | ✔ Generated Prisma Client
matete_frontend | 🌱 Ejecutando seed de base de datos...
matete_frontend | 🚀 Iniciando servidor Next.js...
matete_frontend | ▲ Next.js 15.5.7
matete_frontend | - Local:        http://localhost:3000
matete_frontend | ✓ Ready in Xms
```

### Verificar que está corriendo:

```bash
# Ver estado de contenedores
docker-compose ps

# Debe mostrar:
# NAME               STATUS           PORTS
# matete_frontend    Up X minutes     0.0.0.0:3000->3000/tcp
# matete_postgres    Up X minutes     0.0.0.0:5432->5432/tcp
```

### Probar la aplicación:

```bash
# Desde el servidor
curl http://localhost:3000

# Desde tu navegador (si tienes IP pública)
http://TU-IP-SERVIDOR:3000
```

---

## 🛠️ Comandos Útiles

### Ver estado
```bash
docker-compose ps
```

### Ver logs en tiempo real
```bash
docker-compose logs -f frontend
```

### Reiniciar solo el frontend
```bash
docker-compose restart frontend
```

### Detener todo
```bash
docker-compose down
```

### Detener y eliminar volúmenes (⚠️ BORRA DATOS DE DB)
```bash
docker-compose down -v
```

### Ejecutar comandos dentro del contenedor
```bash
# Shell del frontend
docker-compose exec frontend sh

# Shell de postgres
docker-compose exec postgres psql -U matete -d matete_db
```

### Aplicar migraciones manualmente
```bash
docker-compose exec frontend npx prisma migrate deploy
```

### Ejecutar seed manualmente
```bash
docker-compose exec frontend npx prisma db seed
```

---

## 🐛 Resolución de Problemas

### Error: "SIGILL"
- ✅ Dockerfile usa `node:16-bullseye-slim`
- ✅ `next.config.js` tiene `swcMinify: false`
- ✅ `next.config.js` tiene `outputFileTracing: false`

Si persiste: CPU demasiado antiguo, necesitas servidor más moderno.

### Error: "404 Not Found" repositorios Debian
- ✅ Verifica que Dockerfile use `node:16-bullseye-slim` (NO buster)

### Error: "Can't reach database server"
- Verifica que postgres esté corriendo: `docker-compose ps`
- Verifica logs de postgres: `docker-compose logs postgres`
- Verifica que healthcheck pase: debe decir "healthy"

### Error: "OpenSSL not found"
- ✅ Dockerfile ya instala OpenSSL en todas las stages

### Build muy lento
- ✅ Normal en CPU de 2008
- Espera pacientemente 10-15 minutos
- Builds subsecuentes serán más rápidos con cache

### Aplicación no responde
```bash
# Ver si el puerto está en uso
netstat -tulpn | grep 3000

# Reiniciar el frontend
docker-compose restart frontend
```

---

## 🔄 Actualizaciones Futuras

### Cuando actualices código:

#### Sin cambios en dependencias:
```bash
docker-compose build
docker-compose up -d
```

#### Con cambios en dependencias (package.json):
```bash
docker-compose build --no-cache
docker-compose up -d
```

#### Con cambios en schema de Prisma:
```bash
# En desarrollo local primero:
npx prisma migrate dev --name nombre_migracion

# Luego en servidor:
docker-compose build
docker-compose up -d
# Migraciones se aplicarán automáticamente
```

---

## 📊 Monitoreo

### Ver uso de recursos
```bash
docker stats
```

### Ver tamaño de imágenes
```bash
docker images
```

### Ver tamaño de volúmenes
```bash
docker volume ls
docker volume inspect matete_postgres_data
```

---

## 🎯 Próximos Pasos Recomendados

1. **Configurar backup de BD:**
   ```bash
   docker-compose exec postgres pg_dump -U matete matete_db > backup.sql
   ```

2. **Configurar logrotate** para logs de Docker

3. **Configurar nginx** como reverse proxy (para dominio)

4. **Configurar SSL** con Let's Encrypt

5. **Considerar actualizar servidor** a hardware más moderno (2015+)

---

## 💰 Alternativas de Hosting

Si el CPU antiguo da problemas:

### Cloud Moderno (Recomendado)
- **Oracle Cloud Free Tier:** GRATIS, ARM moderno
- **Hetzner Cloud:** €4/mes, mucho más rápido  
- **DigitalOcean:** $6/mes, confiable

### Ventajas:
- 5-10x más rápido
- Node.js 20+ sin problemas
- Todas las optimizaciones funcionando
- Mejor soporte y uptime

---

## ✅ Checklist Final

- [ ] `.env` tiene todas las variables necesarias
- [ ] `docker-compose.yml` existe en directorio raíz
- [ ] `Dockerfile` existe en directorio raíz
- [ ] Ejecutaste `docker-compose build --no-cache`
- [ ] Ejecutaste `docker-compose up -d`
- [ ] Verificaste logs sin errores
- [ ] Aplicación responde en puerto 3000
- [ ] Base de datos tiene datos (después de seed)

---

## 🆘 Si Todo Falla

1. **Subir logs completos:**
   ```bash
   docker-compose logs > logs.txt
   ```

2. **Verificar versión de Docker:**
   ```bash
   docker --version
   docker-compose --version
   ```

3. **Contactar soporte** con:
   - Salida de `docker-compose ps`
   - Logs completos
   - Especificaciones del servidor
   - Versiones de Docker

---

**¡Buena suerte! Con CPU de 2008, ten paciencia. El build tomará su tiempo pero DEBE funcionar.**
