#!/bin/bash

# Script para crear respaldo antes de cambios importantes
# Uso: ./create-backup.sh "descripcion-del-respaldo"

if [ -z "$1" ]; then
    echo "❌ Error: Proporciona una descripción del respaldo"
    echo "Uso: ./create-backup.sh 'antes-cambios-inventario'"
    exit 1
fi

BACKUP_NAME="backup-$(date +%Y%m%d-%H%M%S)-$1"
CURRENT_BRANCH=$(git branch --show-current)

echo "🔄 Creando respaldo: $BACKUP_NAME"

# Crear tag del estado actual
git tag -a "$BACKUP_NAME" -m "Respaldo automático: $1 - $(date)"

# Subir tag al remoto
git push origin "$BACKUP_NAME"

echo "✅ Respaldo creado exitosamente: $BACKUP_NAME"
echo "📍 Rama actual: $CURRENT_BRANCH"
echo ""
echo "🔄 Para restaurar este punto más tarde:"
echo "   git checkout $BACKUP_NAME"
echo "   git checkout -b restore-from-backup $BACKUP_NAME"
echo ""
echo "📋 Para ver todos los respaldos:"
echo "   git tag -l | grep backup"