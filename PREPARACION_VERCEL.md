# 🔧 Preparación Local para Vercel

## 📋 Checklist Pre-Deploy

Antes de subir a Vercel, verifica que tu proyecto esté configurado correctamente:

### ✅ Configuraciones Necesarias

- [x] **`next.config.js`** - Tiene `output: 'standalone'`
- [x] **`package.json`** - Scripts correctos
- [x] **`prisma/schema.prisma`** - Schema actualizado
- [x] **`.env.example`** - Plantilla de Supabase
- [x] **`.gitignore`** - Ignora `.env`

### 📄 Archivos que DEBEN estar en Git

```
✅ package.json
✅ package-lock.json
✅ next.config.js
✅ prisma/schema.prisma
✅ .env.example (plantilla, SIN secretos)
✅ Tu código (src/, components/, etc.)
```

### 🚫 Archivos que NO deben estar en Git

```
❌ .env (secretos locales)
❌ .env.local
❌ node_modules/
❌ .next/
❌ docker-compose.yml (ya no se usa)
❌ Dockerfile (ya no se usa)
```

---

## 🚀 Crear Repositorio Git

### Si NO tienes Git inicializado:

```bash
# Iniciar repo
git init

# Agregar archivos
git add .

# Primer commit
git commit -m "Preparado para Vercel + Supabase"
```

### Si YA tienes Git:

```bash
# Ver estado
git status

# Agregar cambios
git add .

# Commit
git commit -m "Migrado a Supabase, preparado para Vercel"
```

---

## 📤 Subir a GitHub

### Opción A: Crear repo en GitHub Web

1. Ve a [github.com/new](https://github.com/new)
2. **Repository name:** `matete` o `matete-website`
3. **Visibility:** Private (recomendado)
4. **NO inicializar** con README, .gitignore, etc.
5. Click **"Create repository"**

### Conectar y Push:

```bash
# Agregar remote
git remote add origin https://github.com/TU-USUARIO/matete.git

# Push
git branch -M main
git push -u origin main
```

### Opción B: Usar GitHub CLI

```bash
# Crear repo automáticamente
gh repo create matete --private --source=. --push
```

---

## ✅ Verificación Pre-Deploy

### 1. Verifica .gitignore

Asegúrate que `.gitignore` incluye:

```
# dependencies
/node_modules

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env
.env*.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

# docker (ya no usado)
docker-compose.yml
Dockerfile
.dockerignore
```

### 2. Verifica package.json

Debe tener estos scripts:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "prisma generate && next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

### 3. Test build local (opcional)

```bash
# Asegúrate que build funciona
npm run build
```

Si hay errores, corrígelos antes de deploy.

---

## 🎯 Siguiente Paso

Ahora estás listo para:

1. **Crear proyecto en Supabase** (si no lo hiciste)
2. **Aplicar migraciones:** `npx prisma migrate deploy`
3. **Importar en Vercel**

Sigue la guía en `MIGRACION_SUPABASE_VERCEL.md` → Paso 6.

---

## 🆘 Problemas Comunes

### "git push" rechazado
```bash
# Forzar push (solo si es repo nuevo)
git push -u origin main --force
```

### Archivo muy grande
```bash
# Ver archivos grandes
git ls-files --stage | sort -k4 -n -r | head -20

# Si encuentras algo en .git, limpiar history
git filter-branch --tree-filter 'rm -rf node_modules' HEAD
```

### .env en git por error
```bash
# Eliminar de git (mantener local)
git rm --cached .env
git commit -m "Remove .env from git"
git push
```
