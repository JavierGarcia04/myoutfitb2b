# 🚀 Guía de Configuración - Outfit Completer

## Paso 1: Base de Datos PostgreSQL

### Opción A: Docker (Local)

1. Inicia Docker Desktop
2. Ejecuta:
```bash
docker run --name outfit-postgres \
  -e POSTGRES_USER=outfit \
  -e POSTGRES_PASSWORD=outfit_dev_password \
  -e POSTGRES_DB=outfit_completer \
  -p 5432:5432 \
  -d postgres:15
```

El connection string es:
```
postgresql://outfit:outfit_dev_password@localhost:5432/outfit_completer
```

### Opción B: Supabase (Cloud - Recomendado para producción)

1. Ve a https://supabase.com y crea cuenta
2. Crea nuevo proyecto
3. Ve a Settings → Database
4. Copia "Connection string (URI)"
5. Actualiza el archivo `.env`

---

## Paso 2: Configurar Variables de Entorno

Edita el archivo `.env`:

```env
# Base de Datos
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"

# Shopify (se configuran automáticamente)
SHOPIFY_API_KEY=""
SHOPIFY_API_SECRET=""

# API de IA (opcional para empezar)
AI_API_URL=""
AI_API_KEY=""
```

---

## Paso 3: Ejecutar Migraciones

```bash
cd "C:\Users\javij\Documents\myoutfit-landing-page\app shopify\outfit-completer"
npx prisma migrate dev --name init
```

---

## Paso 4: Vincular con Shopify Partners

```bash
npm run config:link
```

Selecciona tu organización y crea una nueva app o usa una existente.

---

## Paso 5: Crear Tienda de Desarrollo

1. Ve a https://partners.shopify.com
2. Clic en "Stores" → "Add store"
3. Selecciona "Development store"
4. Llena los datos y crea la tienda

---

## Paso 6: Ejecutar la App

```bash
npm run dev
```

Esto:
- Inicia el servidor Remix
- Crea un túnel (ngrok/cloudflare) para webhooks
- Abre la URL de instalación

---

## Paso 7: Instalar en la Tienda

1. Copia la URL que aparece en la terminal
2. Pégala en el navegador
3. Selecciona tu tienda de desarrollo
4. Clic en "Install app"

---

## 🧪 Probar Funcionalidades

### En el Admin de Shopify:
- Dashboard principal con estado
- Sincronizar productos manualmente
- Ver analytics (vacío al inicio)

### APIs (para probar con curl/Postman):
```bash
# Obtener recomendaciones
GET /api/recommendations?shop=tu-tienda.myshopify.com&product_id=123

# Trackear evento
POST /api/track
{
  "shop": "tu-tienda.myshopify.com",
  "event_type": "click",
  "product_id": "123",
  "recommended_product_id": "456",
  "recommendation_id": "rec_123"
}
```

---

## ❓ Problemas Comunes

### Error de conexión a BD
- Verifica que PostgreSQL esté corriendo
- Revisa el DATABASE_URL en .env

### Error de autenticación Shopify
- Ejecuta `shopify auth logout` y vuelve a intentar
- Verifica que tienes permisos en Partners

### Webhooks no llegan
- El túnel debe estar activo (npm run dev lo hace automáticamente)
- Verifica la URL en Shopify Partners → App → Webhooks

