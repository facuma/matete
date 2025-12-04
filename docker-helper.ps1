# Script de ayuda para Docker Compose
# Ejecutar con: .\docker-helper.ps1 [comando]

param(
    [Parameter(Position=0)]
    [string]$Command = "help"
)

function Show-Help {
    Write-Host "==================================" -ForegroundColor Cyan
    Write-Host "Docker Helper - Matete Website" -ForegroundColor Cyan
    Write-Host "==================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Comandos disponibles:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  start       " -NoNewline -ForegroundColor Green
    Write-Host "- Iniciar todos los contenedores"
    Write-Host "  stop        " -NoNewline -ForegroundColor Green
    Write-Host "- Detener todos los contenedores"
    Write-Host "  restart     " -NoNewline -ForegroundColor Green
    Write-Host "- Reiniciar todos los contenedores"
    Write-Host "  rebuild     " -NoNewline -ForegroundColor Green
    Write-Host "- Reconstruir y reiniciar contenedores"
    Write-Host "  logs        " -NoNewline -ForegroundColor Green
    Write-Host "- Ver logs de todos los servicios"
    Write-Host "  logs-app    " -NoNewline -ForegroundColor Green
    Write-Host "- Ver logs solo del frontend"
    Write-Host "  logs-db     " -NoNewline -ForegroundColor Green
    Write-Host "- Ver logs solo de PostgreSQL"
    Write-Host "  status      " -NoNewline -ForegroundColor Green
    Write-Host "- Ver estado de los contenedores"
    Write-Host "  shell       " -NoNewline -ForegroundColor Green
    Write-Host "- Abrir shell en el contenedor del frontend"
    Write-Host "  db-shell    " -NoNewline -ForegroundColor Green
    Write-Host "- Abrir shell de PostgreSQL"
    Write-Host "  migrate     " -NoNewline -ForegroundColor Green
    Write-Host "- Ejecutar migraciones de Prisma"
    Write-Host "  seed        " -NoNewline -ForegroundColor Green
    Write-Host "- Ejecutar seed de la base de datos"
    Write-Host "  clean       " -NoNewline -ForegroundColor Green
    Write-Host "- Detener y eliminar todo (incluyendo volúmenes)"
    Write-Host "  help        " -NoNewline -ForegroundColor Green
    Write-Host "- Mostrar esta ayuda"
    Write-Host ""
    Write-Host "Ejemplo: .\docker-helper.ps1 start" -ForegroundColor Gray
    Write-Host ""
}

function Start-Containers {
    Write-Host "🚀 Iniciando contenedores..." -ForegroundColor Cyan
    docker-compose up -d
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Contenedores iniciados correctamente" -ForegroundColor Green
        Write-Host ""
        Write-Host "Frontend disponible en: http://localhost:3000" -ForegroundColor Yellow
        Write-Host "PostgreSQL disponible en: localhost:5432" -ForegroundColor Yellow
    }
}

function Stop-Containers {
    Write-Host "🛑 Deteniendo contenedores..." -ForegroundColor Cyan
    docker-compose down
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Contenedores detenidos" -ForegroundColor Green
    }
}

function Restart-Containers {
    Write-Host "🔄 Reiniciando contenedores..." -ForegroundColor Cyan
    docker-compose restart
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Contenedores reiniciados" -ForegroundColor Green
    }
}

function Rebuild-Containers {
    Write-Host "🔨 Reconstruyendo contenedores..." -ForegroundColor Cyan
    docker-compose up -d --build
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Contenedores reconstruidos e iniciados" -ForegroundColor Green
    }
}

function Show-Logs {
    Write-Host "📋 Mostrando logs (Ctrl+C para salir)..." -ForegroundColor Cyan
    docker-compose logs -f
}

function Show-AppLogs {
    Write-Host "📋 Mostrando logs del frontend (Ctrl+C para salir)..." -ForegroundColor Cyan
    docker-compose logs -f frontend
}

function Show-DbLogs {
    Write-Host "📋 Mostrando logs de PostgreSQL (Ctrl+C para salir)..." -ForegroundColor Cyan
    docker-compose logs -f postgres
}

function Show-Status {
    Write-Host "📊 Estado de los contenedores:" -ForegroundColor Cyan
    Write-Host ""
    docker-compose ps
}

function Open-Shell {
    Write-Host "🐚 Abriendo shell en el contenedor del frontend..." -ForegroundColor Cyan
    docker-compose exec frontend sh
}

function Open-DbShell {
    Write-Host "🐘 Abriendo shell de PostgreSQL..." -ForegroundColor Cyan
    docker-compose exec postgres psql -U matete -d matete_db
}

function Run-Migrate {
    Write-Host "🔄 Ejecutando migraciones de Prisma..." -ForegroundColor Cyan
    docker-compose exec frontend npx prisma migrate deploy
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Migraciones ejecutadas correctamente" -ForegroundColor Green
    }
}

function Run-Seed {
    Write-Host "🌱 Ejecutando seed de la base de datos..." -ForegroundColor Cyan
    docker-compose exec frontend npx prisma db seed
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Seed ejecutado correctamente" -ForegroundColor Green
    }
}

function Clean-All {
    Write-Host "⚠️  ADVERTENCIA: Esto eliminará todos los contenedores y volúmenes (incluyendo datos de la BD)" -ForegroundColor Red
    $confirm = Read-Host "¿Estás seguro? (s/N)"
    if ($confirm -eq "s" -or $confirm -eq "S") {
        Write-Host "🧹 Limpiando todo..." -ForegroundColor Cyan
        docker-compose down -v
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Todo limpio" -ForegroundColor Green
        }
    } else {
        Write-Host "❌ Operación cancelada" -ForegroundColor Yellow
    }
}

# Ejecutar comando
switch ($Command.ToLower()) {
    "start" { Start-Containers }
    "stop" { Stop-Containers }
    "restart" { Restart-Containers }
    "rebuild" { Rebuild-Containers }
    "logs" { Show-Logs }
    "logs-app" { Show-AppLogs }
    "logs-db" { Show-DbLogs }
    "status" { Show-Status }
    "shell" { Open-Shell }
    "db-shell" { Open-DbShell }
    "migrate" { Run-Migrate }
    "seed" { Run-Seed }
    "clean" { Clean-All }
    "help" { Show-Help }
    default {
        Write-Host "❌ Comando no reconocido: $Command" -ForegroundColor Red
        Write-Host ""
        Show-Help
    }
}
