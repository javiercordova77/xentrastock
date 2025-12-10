#!/bin/bash

# Script para rollback fácil y seguro
# Uso: ./rollback.sh

echo "🔄 XENTRASTOCK - Herramienta de Rollback"
echo "======================================"
echo ""

# Mostrar estado actual
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 Rama actual: $CURRENT_BRANCH"
echo "📊 Estado del repositorio:"
git status --short
echo ""

# Mostrar opciones
echo "Selecciona el tipo de rollback:"
echo "1) 🔄 Deshacer cambios no guardados (git reset --hard)"
echo "2) 🔄 Deshacer último commit (mantener cambios)"
echo "3) 🔄 Deshacer último commit (eliminar cambios)"
echo "4) 🔄 Ver y seleccionar respaldo específico"
echo "5) 🔄 Cambiar a rama main (segura)"
echo "6) 🔄 Ver últimos commits"
echo "0) ❌ Cancelar"
echo ""

read -p "Ingresa tu opción (0-6): " option

case $option in
    1)
        echo "⚠️  Esto eliminará TODOS los cambios no guardados"
        read -p "¿Estás seguro? (y/N): " confirm
        if [[ $confirm == [yY] ]]; then
            git reset --hard HEAD
            echo "✅ Cambios no guardados eliminados"
        else
            echo "❌ Operación cancelada"
        fi
        ;;
    2)
        echo "🔄 Deshaciendo último commit (manteniendo cambios)..."
        git reset --soft HEAD~1
        echo "✅ Último commit deshecho, cambios mantenidos"
        ;;
    3)
        echo "⚠️  Esto eliminará el último commit Y sus cambios"
        read -p "¿Estás seguro? (y/N): " confirm
        if [[ $confirm == [yY] ]]; then
            git reset --hard HEAD~1
            echo "✅ Último commit eliminado completamente"
        else
            echo "❌ Operación cancelada"
        fi
        ;;
    4)
        echo "📋 Respaldos disponibles:"
        git tag -l | grep -E "(backup|stable|v[0-9])" | tail -10
        echo ""
        read -p "Ingresa el nombre del respaldo: " backup_name
        if git show-ref --tags --verify --quiet "refs/tags/$backup_name"; then
            git checkout -b "restore-$(date +%Y%m%d-%H%M%S)" "$backup_name"
            echo "✅ Restaurado desde: $backup_name"
        else
            echo "❌ Respaldo no encontrado: $backup_name"
        fi
        ;;
    5)
        echo "🔄 Cambiando a rama main..."
        git checkout main
        git pull origin main
        echo "✅ Ahora en rama main (actualizada)"
        ;;
    6)
        echo "📋 Últimos 10 commits:"
        git log --oneline -10
        ;;
    0)
        echo "❌ Operación cancelada"
        ;;
    *)
        echo "❌ Opción inválida"
        ;;
esac