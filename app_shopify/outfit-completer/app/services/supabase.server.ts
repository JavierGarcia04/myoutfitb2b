// =============================================================================
// SUPABASE SERVICE - Conexión con la base de datos central de MyOutfit
// =============================================================================

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import db from "../db.server";

// Credenciales de Supabase
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://tdzglepfyqnteatmtfna.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkemdsZXBmeXFudGVhdG10Zm5hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0NzA1MjUsImV4cCI6MjA4NDA0NjUyNX0.qzWiJNAG1rX-kMBhEzjxhf9FqhRJVQsOakn8SersF1I';

// Cliente de Supabase
let supabaseClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient) {
    // Usar service key si está disponible, sino usar anon key
    const key = SUPABASE_SERVICE_KEY || SUPABASE_ANON_KEY;
    if (!key) {
      throw new Error('SUPABASE_SERVICE_KEY or SUPABASE_ANON_KEY is required');
    }
    supabaseClient = createClient(SUPABASE_URL, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return supabaseClient;
}

// =============================================================================
// TIPOS
// =============================================================================

export interface ApiKeyValidation {
  is_valid: boolean;
  store_id: string | null;
  store_name: string | null;
  subscription_status: string | null;
  subscription_plan: string | null;
  max_products: number;
  max_api_requests: number;
  api_requests_this_month: number;
  expires_at: string | null;
}

export interface ShopifyProductSync {
  shopify_product_id: string;
  title: string;
  handle?: string;
  description?: string;
  product_type?: string;
  vendor?: string;
  tags?: string[];
  category?: string;
  subcategory?: string;
  color?: string;
  style?: string;
  season?: string;
  gender?: string;
  featured_image_url?: string;
  images?: string[];
  status?: string;
  min_price?: number;
  max_price?: number;
  total_inventory?: number;
  available_for_sale?: boolean;
  published_at?: string;
  shopify_created_at?: string;
  shopify_updated_at?: string;
}

export interface ShopifyVariantSync {
  shopify_variant_id: string;
  title?: string;
  sku?: string;
  barcode?: string;
  option1?: string;
  option2?: string;
  option3?: string;
  price: number;
  compare_at_price?: number;
  total_inventory?: number;
  available_for_sale?: boolean;
  image_url?: string;
}

export interface AnalyticsEventSync {
  event_type: string;
  product_id?: string;
  recommended_product_id?: string;
  recommendation_id?: string;
  session_id?: string;
  user_agent?: string;
  country?: string;
  metadata?: Record<string, unknown>;
  revenue?: number;
}

// =============================================================================
// CONFIGURACIÓN DE LA TIENDA
// =============================================================================

// Cache en memoria para API key de la tienda
const shopApiKeyCache = new Map<string, { apiKey: string; validation: ApiKeyValidation; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

/**
 * Limpia el caché de API keys para forzar recarga de datos
 */
export function clearApiKeyCache(): void {
  shopApiKeyCache.clear();
}

/**
 * Obtiene la API key configurada para una tienda Shopify (usa RPC para bypasear RLS)
 */
export async function getShopApiKey(shopDomain: string): Promise<string | null> {
  const supabase = getSupabaseClient();
  
  console.log(`[SupabaseService] getShopApiKey - Looking for domain: "${shopDomain}"`);
  
  // Usar función RPC que bypasea RLS
  const { data, error } = await supabase.rpc('get_store_by_shopify_domain', {
    p_shopify_domain: shopDomain,
  });
  
  if (error) {
    console.log(`[SupabaseService] getShopApiKey - Error: ${error.message}`);
    return null;
  }
  
  if (!data || data.length === 0) {
    console.log(`[SupabaseService] getShopApiKey - No data found for domain: "${shopDomain}"`);
    return null;
  }
  
  console.log(`[SupabaseService] getShopApiKey - Found store: "${data[0].store_name}"`);
  return data[0].api_key;
}

/**
 * Obtiene el store_id de Supabase a partir del dominio de Shopify (usa RPC para bypasear RLS)
 */
export async function getStoreIdByShopifyDomain(shopifyDomain: string): Promise<string | null> {
  const supabase = getSupabaseClient();
  
  // Usar función RPC que bypasea RLS
  const { data, error } = await supabase.rpc('get_store_by_shopify_domain', {
    p_shopify_domain: shopifyDomain,
  });
  
  if (error || !data || data.length === 0) {
    console.log(`[SupabaseService] getStoreIdByShopifyDomain - Not found for: "${shopifyDomain}"`);
    return null;
  }
  
  console.log(`[SupabaseService] getStoreIdByShopifyDomain - Found store ID: ${data[0].store_id}`);
  return data[0].store_id;
}

// =============================================================================
// VALIDACIÓN DE API KEY
// =============================================================================

/**
 * Valida una API key y devuelve información de la tienda
 */
export async function validateApiKey(apiKey: string): Promise<ApiKeyValidation | null> {
  // Verificar cache primero
  const cached = shopApiKeyCache.get(apiKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.validation;
  }
  
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .rpc('validate_api_key', { p_api_key: apiKey });
  
  if (error) {
    console.error('[SupabaseService] Error validating API key:', error);
    return null;
  }
  
  if (!data || data.length === 0) {
    return null;
  }
  
  const validation = data[0] as ApiKeyValidation;
  
  // Guardar en cache
  shopApiKeyCache.set(apiKey, {
    apiKey,
    validation,
    timestamp: Date.now(),
  });
  
  return validation;
}

/**
 * Valida la API key de una tienda Shopify y verifica si puede usar el servicio
 */
export async function validateShopSubscription(shopDomain: string): Promise<{
  isValid: boolean;
  storeId: string | null;
  reason?: string;
  limits?: {
    maxProducts: number;
    maxApiRequests: number;
    currentRequests: number;
  };
}> {
  // Buscar la API key de la tienda
  const apiKey = await getShopApiKey(shopDomain);
  
  if (!apiKey) {
    return {
      isValid: false,
      storeId: null,
      reason: 'No API key configured for this store. Please configure your MyOutfit API key in the app settings.',
    };
  }
  
  const validation = await validateApiKey(apiKey);
  
  if (!validation) {
    return {
      isValid: false,
      storeId: null,
      reason: 'Invalid API key. Please check your MyOutfit API key in the app settings.',
    };
  }
  
  if (!validation.is_valid) {
    return {
      isValid: false,
      storeId: validation.store_id,
      reason: 'Your subscription has expired or is inactive. Please renew your subscription at myoutfit.app',
    };
  }
  
  // Verificar límites de requests
  if (validation.api_requests_this_month >= validation.max_api_requests) {
    return {
      isValid: false,
      storeId: validation.store_id,
      reason: 'API request limit reached for this month. Please upgrade your plan.',
      limits: {
        maxProducts: validation.max_products,
        maxApiRequests: validation.max_api_requests,
        currentRequests: validation.api_requests_this_month,
      },
    };
  }
  
  return {
    isValid: true,
    storeId: validation.store_id,
    limits: {
      maxProducts: validation.max_products,
      maxApiRequests: validation.max_api_requests,
      currentRequests: validation.api_requests_this_month,
    },
  };
}

/**
 * Vincula una tienda Shopify con una tienda en Supabase usando la API key
 */
export async function linkShopifyStore(
  apiKey: string,
  shopifyDomain: string,
  shopifyShopId?: string
): Promise<{ success: boolean; storeId?: string; error?: string }> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .rpc('link_shopify_store', {
      p_api_key: apiKey,
      p_shopify_domain: shopifyDomain,
      p_shopify_shop_id: shopifyShopId || null,
    });
  
  if (error) {
    console.error('[SupabaseService] Error linking store:', error);
    return { success: false, error: error.message };
  }
  
  if (!data || data.length === 0) {
    return { success: false, error: 'No response from database' };
  }
  
  const result = data[0];
  
  if (!result.success) {
    return { success: false, error: result.message };
  }
  
  // Limpiar cache
  shopApiKeyCache.clear();
  
  return { success: true, storeId: result.store_id };
}

/**
 * Incrementa el contador de requests API
 */
export async function incrementApiRequests(storeId: string): Promise<void> {
  const supabase = getSupabaseClient();
  
  await supabase.rpc('increment_api_requests', { p_store_id: storeId });
}

// =============================================================================
// SINCRONIZACIÓN DE PRODUCTOS
// =============================================================================

/**
 * Sincroniza un producto con Supabase usando la función RPC (bypasea RLS)
 */
export async function syncProductToSupabase(
  storeId: string,
  product: ShopifyProductSync
): Promise<{ success: boolean; productId?: string; error?: string }> {
  const supabase = getSupabaseClient();
  
  try {
    // Usar la función RPC que bypasea RLS
    const { data, error } = await supabase.rpc('sync_product_from_shopify', {
      p_store_id: storeId,
      p_external_id: product.shopify_product_id,
      p_name: product.title,
      p_description: product.description || null,
      p_category: product.category || product.product_type || null,
      p_subcategory: product.subcategory || null,
      p_price: product.min_price || 0,
      p_currency: 'EUR',
      p_image_url: product.featured_image_url || null,
      p_product_url: product.handle ? `https://your-store.myshopify.com/products/${product.handle}` : null,
      p_color: product.color || null,
      p_style: product.style || null,
      p_season: product.season || null,
      p_stock_quantity: product.total_inventory || 0,
      p_is_active: product.status === 'active' && product.available_for_sale !== false,
    });
    
    if (error) {
      console.error('[SupabaseService] Error syncing product:', error);
      return { success: false, error: error.message };
    }
    
    console.log(`[SupabaseService] Synced product: ${product.title}`);
    return { success: true, productId: data?.product_id };
    
  } catch (error) {
    console.error('[SupabaseService] Error syncing product:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Elimina (desactiva) un producto de Supabase
 */
export async function deleteProductFromSupabase(
  storeId: string,
  shopifyProductId: string
): Promise<{ success: boolean; deletedCount?: number; newCatalogSize?: number; error?: string }> {
  const supabase = getSupabaseClient();
  
  // Usar función RPC que bypasea RLS y actualiza catalog_size automáticamente
  const { data, error } = await supabase.rpc('delete_product_from_shopify', {
    p_store_id: storeId,
    p_external_id: shopifyProductId,
  });
  
  if (error) {
    console.error('[SupabaseService] Error deleting product:', error);
    return { success: false, error: error.message };
  }
  
  console.log(`[SupabaseService] Deleted product. Count: ${data?.deleted_count}, New catalog size: ${data?.new_catalog_size}`);
  return { 
    success: true, 
    deletedCount: data?.deleted_count,
    newCatalogSize: data?.new_catalog_size 
  };
}

/**
 * Actualiza el catalog_size de la tienda
 */
export async function updateStoreCatalogSize(storeId: string): Promise<void> {
  const supabase = getSupabaseClient();
  
  // Contar productos activos
  const { count, error } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('store_id', storeId)
    .eq('is_active', true);
  
  if (!error && count !== null) {
    await supabase
      .from('stores')
      .update({ 
        catalog_size: count,
        last_sync_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', storeId);
  }
}

// =============================================================================
// SINCRONIZACIÓN DE ANALYTICS
// =============================================================================

/**
 * Sincroniza un evento de analytics con Supabase usando RPC (bypasea RLS)
 */
export async function syncAnalyticsEvent(
  storeId: string,
  event: AnalyticsEventSync
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseClient();
  
  try {
    // Mapear el tipo de evento al formato de la landing page
    const eventTypeMap: Record<string, string> = {
      'WIDGET_IMPRESSION': 'view',
      'RECOMMENDATION_VIEW': 'view',
      'RECOMMENDATION_CLICK': 'click',
      'ADD_TO_CART': 'click',
      'PURCHASE': 'conversion',
    };
    
    const mappedEventType = eventTypeMap[event.event_type] || event.event_type.toLowerCase();
    
    // Usar la función RPC que bypasea RLS
    const { error } = await supabase.rpc('sync_widget_event', {
      p_store_id: storeId,
      p_event_type: mappedEventType,
      p_session_id: event.session_id || null,
      p_user_agent: event.user_agent || null,
      p_metadata: {
        original_event_type: event.event_type,
        product_id: event.product_id,
        recommended_product_id: event.recommended_product_id,
        recommendation_id: event.recommendation_id,
        country: event.country,
        revenue: event.revenue,
        ...event.metadata,
      },
    });
    
    if (error) {
      throw error;
    }
    
    // Actualizar daily_analytics según el tipo de evento
    // IMPORTANTE: Solo WIDGET_IMPRESSION cuenta como view (no RECOMMENDATION_VIEW para evitar duplicados)
    if (event.event_type === 'PURCHASE' && event.revenue) {
      await updateDailyAnalytics(storeId, 'conversion', event.revenue);
    } else if (event.event_type === 'RECOMMENDATION_CLICK' || event.event_type === 'ADD_TO_CART') {
      await updateDailyAnalytics(storeId, 'click');
    } else if (event.event_type === 'WIDGET_IMPRESSION') {
      // Solo contar WIDGET_IMPRESSION como view, no RECOMMENDATION_VIEW
      await updateDailyAnalytics(storeId, 'view');
    }
    // RECOMMENDATION_VIEW no incrementa el contador (ya se contó con WIDGET_IMPRESSION)
    
    return { success: true };
    
  } catch (error) {
    console.error('[SupabaseService] Error syncing analytics event:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Actualiza las estadísticas diarias usando RPC (bypasea RLS)
 */
async function updateDailyAnalytics(
  storeId: string,
  eventType: 'view' | 'click' | 'conversion',
  revenue?: number
): Promise<void> {
  const supabase = getSupabaseClient();
  
  try {
    const { data, error } = await supabase.rpc('increment_daily_analytics', {
      p_store_id: storeId,
      p_event_type: eventType,
      p_revenue: revenue || 0,
    });
    
    if (error) {
      console.error('[SupabaseService] Error updating daily analytics:', error);
    } else {
      console.log(`[SupabaseService] Updated daily analytics: ${eventType}`, data);
    }
  } catch (err) {
    console.error('[SupabaseService] Exception updating daily analytics:', err);
  }
}

/**
 * Registra una sincronización de catálogo
 */
export async function logCatalogSync(
  storeId: string,
  syncType: 'full' | 'incremental' | 'webhook',
  stats: { added: number; updated: number; deleted: number },
  status: 'completed' | 'failed',
  errorMessage?: string
): Promise<void> {
  const supabase = getSupabaseClient();
  
  await supabase
    .from('catalog_syncs')
    .insert({
      store_id: storeId,
      sync_type: syncType,
      products_added: stats.added,
      products_updated: stats.updated,
      products_deleted: stats.deleted,
      status,
      error_message: errorMessage,
      completed_at: new Date().toISOString(),
    });
}

// =============================================================================
// UTILIDADES
// =============================================================================

/**
 * Verifica si Supabase está configurado y accesible
 */
export async function isSupabaseConfigured(): Promise<boolean> {
  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from('stores').select('id').limit(1);
    return !error;
  } catch {
    return false;
  }
}

// =============================================================================
// SINCRONIZACIÓN MASIVA DE INVENTARIO Y ESTADÍSTICAS
// =============================================================================

interface BulkSyncResult {
  success: boolean;
  productsSync: { synced: number; failed: number };
  analyticsSync: { synced: number; failed: number };
  error?: string;
}

/**
 * Sincroniza todos los productos de una tienda Shopify a Supabase
 */
export async function syncAllProductsToSupabase(
  shopDomain: string,
  storeId: string
): Promise<{ synced: number; failed: number }> {
  const supabase = getSupabaseClient();
  let synced = 0;
  let failed = 0;

  try {
    // Obtener la tienda de Prisma
    const shop = await db.shop.findUnique({
      where: { shopDomain },
      include: {
        products: {
          where: { status: "ACTIVE" },
          include: { variants: true },
        },
      },
    });

    if (!shop) {
      console.error(`[SupabaseService] Shop not found: ${shopDomain}`);
      return { synced: 0, failed: 0 };
    }

    console.log(`[SupabaseService] Syncing ${shop.products.length} products to Supabase...`);

    for (const product of shop.products) {
      try {
        // Calcular precio mínimo y máximo
        const prices = product.variants.map((v) => v.price);
        const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
        
        // Calcular inventario total
        const totalInventory = product.variants.reduce(
          (sum, v) => sum + v.totalInventory,
          0
        );

        // Usar función RPC que bypasea RLS
        const { data, error: productError } = await supabase.rpc('sync_product_from_shopify', {
          p_store_id: storeId,
          p_external_id: product.shopifyProductId,
          p_name: product.title,
          p_description: product.description,
          p_category: product.category || product.productType,
          p_subcategory: product.subcategory,
          p_price: minPrice,
          p_currency: shop.currency,
          p_image_url: product.featuredImageUrl,
          p_product_url: product.handle ? `https://${shopDomain}/products/${product.handle}` : null,
          p_color: product.color,
          p_style: product.style,
          p_season: product.season,
          p_stock_quantity: totalInventory,
          p_is_active: product.status === "ACTIVE" && totalInventory > 0,
        });

        if (productError) {
          console.error(`[SupabaseService] Error syncing product ${product.title}:`, productError);
          failed++;
        } else {
          synced++;
        }
      } catch (err) {
        console.error(`[SupabaseService] Error processing product ${product.title}:`, err);
        failed++;
      }
    }
    
    console.log(`[SupabaseService] Products sync complete: ${synced} synced, ${failed} failed`);
    return { synced, failed };

  } catch (error) {
    console.error('[SupabaseService] Error in bulk product sync:', error);
    return { synced, failed };
  }
}

/**
 * Sincroniza todas las estadísticas de una tienda a Supabase
 */
export async function syncAllAnalyticsToSupabase(
  shopDomain: string,
  storeId: string
): Promise<{ synced: number; failed: number }> {
  const supabase = getSupabaseClient();
  let synced = 0;
  let failed = 0;

  try {
    // Obtener la tienda de Prisma con sus eventos de analytics
    const shop = await db.shop.findUnique({
      where: { shopDomain },
      include: {
        analyticsEvents: {
          orderBy: { createdAt: 'desc' },
          take: 1000, // Limitar a los últimos 1000 eventos
        },
      },
    });

    if (!shop) {
      return { synced: 0, failed: 0 };
    }

    console.log(`[SupabaseService] Syncing ${shop.analyticsEvents.length} analytics events to Supabase...`);

    // Agrupar eventos por día para daily_analytics
    const dailyStats = new Map<string, { views: number; clicks: number; conversions: number; revenue: number }>();

    for (const event of shop.analyticsEvents) {
      const date = event.createdAt.toISOString().split('T')[0];
      const stats = dailyStats.get(date) || { views: 0, clicks: 0, conversions: 0, revenue: 0 };

      // Mapear tipos de eventos
      const eventType = event.eventType.toUpperCase();
      if (eventType.includes('VIEW') || eventType.includes('IMPRESSION')) {
        stats.views++;
      } else if (eventType.includes('CLICK') || eventType.includes('ADD_TO_CART')) {
        stats.clicks++;
      } else if (eventType.includes('PURCHASE') || eventType.includes('CONVERSION')) {
        stats.conversions++;
        // Extraer revenue si existe en metadata
        try {
          const metadata = event.metadata ? JSON.parse(event.metadata) : {};
          if (metadata.revenue) {
            stats.revenue += Number(metadata.revenue);
          }
        } catch {}
      }

      dailyStats.set(date, stats);
    }

    // Insertar/actualizar daily_analytics usando RPC
    for (const [date, stats] of dailyStats.entries()) {
      try {
        // Usar función RPC que bypasea RLS
        const { error } = await supabase.rpc('sync_daily_analytics', {
          p_store_id: storeId,
          p_date: date,
          p_total_views: stats.views,
          p_total_clicks: stats.clicks,
          p_total_conversions: stats.conversions,
          p_revenue: stats.revenue,
        });

        if (error) {
          console.error(`[SupabaseService] Error syncing analytics for ${date}:`, error);
          failed++;
        } else {
          synced++;
        }
      } catch (err) {
        console.error(`[SupabaseService] Error processing analytics for ${date}:`, err);
        failed++;
      }
    }

    console.log(`[SupabaseService] Analytics sync complete: ${synced} days synced, ${failed} failed`);
    return { synced, failed };

  } catch (error) {
    console.error('[SupabaseService] Error in bulk analytics sync:', error);
    return { synced, failed };
  }
}

/**
 * Sincroniza todo el inventario y estadísticas de una tienda a Supabase
 */
export async function bulkSyncToSupabase(
  shopDomain: string,
  storeId: string
): Promise<BulkSyncResult> {
  console.log(`[SupabaseService] Starting bulk sync for ${shopDomain}...`);
  
  try {
    const [productsResult, analyticsResult] = await Promise.all([
      syncAllProductsToSupabase(shopDomain, storeId),
      syncAllAnalyticsToSupabase(shopDomain, storeId),
    ]);

    return {
      success: true,
      productsSync: productsResult,
      analyticsSync: analyticsResult,
    };
  } catch (error) {
    console.error('[SupabaseService] Bulk sync error:', error);
    return {
      success: false,
      productsSync: { synced: 0, failed: 0 },
      analyticsSync: { synced: 0, failed: 0 },
      error: String(error),
    };
  }
}
