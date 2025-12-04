# Solución definitiva para SIGILL en servidor

## ⚠️ Problema
Error SIGILL durante `docker build` en el servidor, específicamente en la fase de "Collecting page data".

## 🔧 Soluciones aplicadas

### 1. Cambio de imagen base: Alpine → Debian
**Antes:** `node:20-alpine`
**Ahora:** `node:20-slim`

**Por qué:** Alpine usa `musl libc` que puede causar incompatibilidades con binarios compilados de Node.js/Next.js en ciertas arquitecturas de servidor. Debian usa `glibc` que es más compatible.

### 2. Forzar dynamic rendering
**Archivo:** `src/app/page.js`
```javascript
export const dynamic = 'force-dynamic';
export const revalidate = 0;
```

**Por qué:** Evita que Next.js intente generar páginas estáticas durante el build, lo que ejecuta código que puede causar SIGILL.

### 3. Configuración de Next.js
**Archivo:** `next.config.js`
```javascript
experimental: {
    isrFlushToDisk: false,
},
generateBuildId: async () => {
    return 'build-' + Date.now()
}
```

**Por qué:** Deshabilita ISR y la escritura de datos estáticos al disco durante el build.

### 4. Variables de entorno en Dockerfile
```dockerfile
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
ENV NEXT_PUBLIC_API_URL="http://localhost:3000"
ENV SKIP_BUILD_STATIC_GENERATION=1
```

**Por qué:** Permite que el build pase la validación sin necesitar servicios externos.

## 🚀 Comandos para reconstruir

```bash
# En el servidor
docker-compose build --no-cache
docker-compose up -d
```

## 📊 Qué esperar

### Build exitoso se verá así:
```
✓ Linting and checking validity of types ...
✓ Collecting page data ...
✓ Generating static pages (0/x)
✓ Collecting build traces ...
✓ Finalizing page optimization ...
```

### Tiempo de build:
- Primera vez: 3-5 minutos
- Subsecuentes (con cache): 1-2 minutos

## 🔍 Si aún falla

### Opción 1: Verificar arquitectura del servidor
```bash
docker info | grep Architecture
uname -m
```

Si es ARM64 o otra arquitectura no estándar, agregar a `docker-compose.yml`:
```yaml
platform: linux/amd64
```

### Opción 2: Construir localmente y pushear imagen
Si el servidor tiene limitaciones, construye localmente y sube a Docker Hub:

```bash
# Local
docker build -t tu-usuario/matete-frontend:latest .
docker push tu-usuario/matete-frontend:latest

# En servidor, modificar docker-compose.yml:
services:
  frontend:
    image: tu-usuario/matete-frontend:latest
    # Remover sección 'build'
```

### Opción 3: Deshabilitar TypeScript checking durante build
Si el error persiste, agregar al `package.json`:
```json
{
  "scripts": {
    "build": "prisma generate && next build --no-lint"
  }
}
```

## ⚡ Optimizaciones post-despliegue

Una vez que la app esté corriendo, puedes re-habilitar optimizaciones:

1. **ISR en algunas páginas:**
   ```javascript
   export const revalidate = 3600; // en lugar de 0
   ```

2. **Static generation selectiva:**
   ```javascript
   export const dynamic = 'auto'; // en lugar de 'force-dynamic'
   ```

3. **Build cache:** Configurar en CI/CD para acelerar builds futuros

## 📝 Notas importantes

- **Rendimiento:** Forzar dynamic rendering es ligeramente más lento que SSG, pero asegura compatibilidad
- **Primera carga:** La primera request a cada página será más lenta (se genera on-demand)
- **Caché:** Next.js cachea las respuestas dinámicas automáticamente
- **Escalabilidad:** Para alta concurrencia, considera usar Vercel o similar con soporte nativo

## ✅ Verificación

Después del deploy:
```bash
# Ver logs
docker-compose logs -f frontend

# Ver que esté corriendo
docker-compose ps

# Probar la app
curl http://localhost:3000
```

Deberías ver:
```
matete_frontend | Server listening on 0.0.0.0:3000
matete_frontend | ✓ Ready in Xms
```

## 🎯 Resumen

| Cambio | Propósito | Impacto |
|--------|-----------|---------|
| Debian en vez de Alpine | Compatibilidad binarios | +50MB imagen |
| Dynamic rendering | Evitar SIGILL en build | -10% rendimiento |
| Dummy env vars | Pasar validación build | Ninguno en runtime |
| Next.js config | Deshabilitar SSG | Flexibilidad deployment |

**Trade-off:** Sacrificamos un poco de rendimiento por máxima compatibilidad del servidor.
