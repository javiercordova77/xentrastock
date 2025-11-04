#!/bin/bash

# 🔒 Script de Restauración Rápida - XentraStock 3.0
# Restaura el sistema al punto de diseño perfecto

echo "🔒 Iniciando restauración al punto de diseño perfecto..."

# Hash del commit de restauración
RESTORE_COMMIT="a98c6744253d9a9d262dfbd4d51ec2c21e2c3f71"

# Verificar si estamos en el directorio correcto
if [ ! -f "PUNTO_RESTAURACION.md" ]; then
    echo "❌ Error: Este script debe ejecutarse desde el directorio raíz de XentraStock"
    exit 1
fi

echo "⚠️  ADVERTENCIA: Esta operación restaurará el sistema al estado del 1 de noviembre de 2025"
echo "   - Navegación vertical original de XentraStock 3.0"
echo "   - Inventario con datos reales de ColchonesW"
echo "   - Todos los servicios funcionando correctamente"
echo ""
read -p "¿Confirma que desea continuar? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Operación cancelada por el usuario"
    exit 1
fi

echo "🛑 Deteniendo servicios..."
./stop-services.sh

echo "📂 Creando respaldo del estado actual..."
BACKUP_BRANCH="backup-antes-restauracion-$(date +%Y%m%d_%H%M%S)"
git branch "$BACKUP_BRANCH" HEAD
echo "✅ Respaldo creado en rama: $BACKUP_BRANCH"

echo "🔄 Restaurando al punto de diseño perfecto..."
git checkout "$RESTORE_COMMIT"

echo "🚀 Iniciando servicios restaurados..."
./start-services.sh

echo ""
echo "✅ ¡Restauración completada exitosamente!"
echo ""
echo "📋 Estado restaurado:"
echo "   - Commit: $RESTORE_COMMIT"
echo "   - Fecha: 1 de noviembre de 2025"
echo "   - Diseño: XentraStock 3.0 - Navegación vertical original"
echo "   - Inventario: Datos reales de ColchonesW API"
echo ""
echo "🔗 Servicios disponibles:"
echo "   - Backend:  http://localhost:3001"
echo "   - Frontend: http://localhost:3000"
echo ""
echo "📁 Su estado anterior se guardó en la rama: $BACKUP_BRANCH"
echo "   Para volver al estado anterior: git checkout $BACKUP_BRANCH"
echo ""
echo "🎯 Sistema restaurado al punto de diseño perfecto"