#!/bin/bash

# Script para desplegar Edge Functions de Supabase

echo "🚀 Desplegando Edge Function: crear-usuario"

# Verificar que supabase CLI esté instalado
if ! command -v supabase &> /dev/null; then
    echo "❌ Error: Supabase CLI no está instalado"
    echo "📥 Instálalo desde: https://supabase.com/docs/guides/cli"
    exit 1
fi

# Desplegar la función
supabase functions deploy crear-usuario

if [ $? -eq 0 ]; then
    echo "✅ Edge Function desplegada correctamente"
    echo ""
    echo "📝 No olvides configurar la variable de entorno:"
    echo "   - Nombre: SUPABASE_SERVICE_ROLE_KEY"
    echo "   - Valor: Tu service_role key de Supabase"
    echo ""
    echo "🔗 Ve a: https://supabase.com/dashboard/project/ytamermzvgnnroppqrug/functions"
else
    echo "❌ Error al desplegar la Edge Function"
    exit 1
fi