// =============================================================================
// ANALYTICS SERVICE - Tracking de eventos y métricas
// =============================================================================

import db from "../db.server";
import { 
  getStoreIdByShopifyDomain, 
  syncAnalyticsEvent, 
  incrementApiRequests,
  validateShopSubscription 
} from "./supabase.server";

// Event types for analytics
type EventType = 
  | "WIDGET_IMPRESSION"
  | "RECOMMENDATION_VIEW" 
  | "RECOMMENDATION_CLICK"
  | "ADD_TO_CART"
  | "PURCHASE";

// =============================================================================
// TIPOS
// =============================================================================

export interface TrackEventParams {
  shopDomain: string;
  eventType: EventType;
  productId?: string;
  recommendedProductId?: string;
  recommendationId?: string;
  sessionId?: string;
  userAgent?: string;
  country?: string;
  metadata?: Record<string, unknown>;
}

export interface AnalyticsSummary {
  period: string;
  impressions: number;
  views: number;
  clicks: number;
  addToCarts: number;
  purchases: number;
  ctr: number; // Click-through rate
  addToCartRate: number;
  conversionRate: number;
}

export interface ProductPerformance {
  productId: string;
  shopifyProductId: string;
  title: string;
  impressions: number;
  clicks: number;
  addToCarts: number;
  ctr: number;
}

// =============================================================================
// TRACKING DE EVENTOS
// =============================================================================

/**
 * Registra un evento de analytics (local + Supabase)
 */
export async function trackEvent(params: TrackEventParams): Promise<void> {
  const {
    shopDomain,
    eventType,
    productId,
    recommendedProductId,
    recommendationId,
    sessionId,
    userAgent,
    country,
    metadata,
  } = params;
  
  // Obtener el shop ID local
  const shop = await db.shop.findUnique({
    where: { shopDomain },
    select: { id: true },
  });
  
  if (!shop) {
    console.error(`[AnalyticsService] Shop not found: ${shopDomain}`);
    return;
  }
  
  try {
    // 1. Guardar en base de datos local (SQLite/Prisma)
    await db.analyticsEvent.create({
      data: {
        shopId: shop.id,
        eventType,
        productId,
        recommendedProductId,
        recommendationId,
        sessionId,
        userAgent,
        country,
        metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : undefined,
      },
    });
    
    console.log(`[AnalyticsService] Tracked event: ${eventType} for shop ${shopDomain}`);
    
    // 2. Sincronizar con Supabase (base de datos central)
    try {
      const supabaseStoreId = await getStoreIdByShopifyDomain(shopDomain);
      
      if (supabaseStoreId) {
        // Incrementar contador de API requests
        await incrementApiRequests(supabaseStoreId);
        
        // Sincronizar evento
        await syncAnalyticsEvent(supabaseStoreId, {
          event_type: eventType,
          product_id: productId,
          recommended_product_id: recommendedProductId,
          recommendation_id: recommendationId,
          session_id: sessionId,
          user_agent: userAgent,
          country,
          metadata: metadata as Record<string, unknown>,
          revenue: metadata?.revenue as number | undefined,
        });
        
        console.log(`[AnalyticsService] Synced event to Supabase: ${eventType}`);
      }
    } catch (supabaseError) {
      // No fallar si Supabase no está disponible
      console.warn(`[AnalyticsService] Could not sync to Supabase:`, supabaseError);
    }
    
  } catch (error) {
    console.error(`[AnalyticsService] Error tracking event:`, error);
  }
}

/**
 * Registra impresión del widget
 */
export async function trackWidgetImpression(
  shopDomain: string,
  productId: string,
  sessionId?: string
): Promise<void> {
  await trackEvent({
    shopDomain,
    eventType: "WIDGET_IMPRESSION",
    productId,
    sessionId,
  });
}

/**
 * Registra vista de recomendaciones
 */
export async function trackRecommendationView(
  shopDomain: string,
  productId: string,
  recommendationId: string,
  sessionId?: string
): Promise<void> {
  await trackEvent({
    shopDomain,
    eventType: "RECOMMENDATION_VIEW",
    productId,
    recommendationId,
    sessionId,
  });
}

/**
 * Registra clic en producto recomendado
 */
export async function trackRecommendationClick(
  shopDomain: string,
  productId: string,
  recommendedProductId: string,
  recommendationId: string,
  sessionId?: string
): Promise<void> {
  await trackEvent({
    shopDomain,
    eventType: "RECOMMENDATION_CLICK",
    productId,
    recommendedProductId,
    recommendationId,
    sessionId,
  });
}

/**
 * Registra agregar al carrito desde recomendación
 */
export async function trackAddToCart(
  shopDomain: string,
  productId: string,
  recommendedProductId: string,
  recommendationId: string,
  sessionId?: string
): Promise<void> {
  await trackEvent({
    shopDomain,
    eventType: "ADD_TO_CART",
    productId,
    recommendedProductId,
    recommendationId,
    sessionId,
  });
}

/**
 * Registra compra de producto recomendado
 */
export async function trackPurchase(
  shopDomain: string,
  productId: string,
  recommendedProductId: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  await trackEvent({
    shopDomain,
    eventType: "PURCHASE",
    productId,
    recommendedProductId,
    metadata,
  });
}

// =============================================================================
// MÉTRICAS Y REPORTES
// =============================================================================

/**
 * Obtiene resumen de analytics para un período
 */
export async function getAnalyticsSummary(
  shopId: string,
  startDate: Date,
  endDate: Date
): Promise<AnalyticsSummary> {
  const events = await db.analyticsEvent.groupBy({
    by: ["eventType"],
    where: {
      shopId,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    _count: { id: true },
  });
  
  const eventCounts: Record<string, number> = {};
  for (const event of events) {
    eventCounts[event.eventType] = event._count.id;
  }
  
  const impressions = eventCounts["WIDGET_IMPRESSION"] || 0;
  const views = eventCounts["RECOMMENDATION_VIEW"] || 0;
  const clicks = eventCounts["RECOMMENDATION_CLICK"] || 0;
  const addToCarts = eventCounts["ADD_TO_CART"] || 0;
  const purchases = eventCounts["PURCHASE"] || 0;
  
  return {
    period: `${startDate.toISOString().split("T")[0]} - ${endDate.toISOString().split("T")[0]}`,
    impressions,
    views,
    clicks,
    addToCarts,
    purchases,
    ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
    addToCartRate: clicks > 0 ? (addToCarts / clicks) * 100 : 0,
    conversionRate: addToCarts > 0 ? (purchases / addToCarts) * 100 : 0,
  };
}

/**
 * Obtiene métricas de los últimos N días
 */
export async function getRecentAnalytics(
  shopId: string,
  days: number = 30
): Promise<AnalyticsSummary> {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return getAnalyticsSummary(shopId, startDate, endDate);
}

/**
 * Obtiene el rendimiento por producto
 */
export async function getProductPerformance(
  shopId: string,
  startDate: Date,
  endDate: Date,
  limit: number = 10
): Promise<ProductPerformance[]> {
  // Obtener eventos agrupados por producto recomendado
  const clickEvents = await db.analyticsEvent.groupBy({
    by: ["recommendedProductId"],
    where: {
      shopId,
      eventType: "RECOMMENDATION_CLICK",
      recommendedProductId: { not: null },
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    _count: { id: true },
  });
  
  const addToCartEvents = await db.analyticsEvent.groupBy({
    by: ["recommendedProductId"],
    where: {
      shopId,
      eventType: "ADD_TO_CART",
      recommendedProductId: { not: null },
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    _count: { id: true },
  });
  
  // Contar impresiones por producto principal
  const impressionEvents = await db.analyticsEvent.groupBy({
    by: ["productId"],
    where: {
      shopId,
      eventType: "WIDGET_IMPRESSION",
      productId: { not: null },
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    _count: { id: true },
  });
  
  // Crear mapas para lookup
  const clickMap = new Map(
    clickEvents.map((e) => [e.recommendedProductId!, e._count.id])
  );
  const addToCartMap = new Map(
    addToCartEvents.map((e) => [e.recommendedProductId!, e._count.id])
  );
  const impressionMap = new Map(
    impressionEvents.map((e) => [e.productId!, e._count.id])
  );
  
  // Obtener IDs únicos de productos
  const productIds = new Set([
    ...clickMap.keys(),
    ...addToCartMap.keys(),
  ]);
  
  // Obtener detalles de productos
  const products = await db.product.findMany({
    where: {
      id: { in: Array.from(productIds) },
    },
    select: {
      id: true,
      shopifyProductId: true,
      title: true,
    },
  });
  
  // Construir resultado
  const performance: ProductPerformance[] = products.map((product) => {
    const clicks = clickMap.get(product.id) || 0;
    const addToCarts = addToCartMap.get(product.id) || 0;
    const impressions = impressionMap.get(product.id) || 0;
    
    return {
      productId: product.id,
      shopifyProductId: product.shopifyProductId,
      title: product.title,
      impressions,
      clicks,
      addToCarts,
      ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
    };
  });
  
  // Ordenar por clics y limitar
  return performance
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, limit);
}

/**
 * Obtiene datos para gráfico de tendencia diaria
 */
export async function getDailyTrend(
  shopId: string,
  days: number = 30
): Promise<Array<{
  date: string;
  impressions: number;
  clicks: number;
  addToCarts: number;
}>> {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  // Obtener todos los eventos del período
  const events = await db.analyticsEvent.findMany({
    where: {
      shopId,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
      eventType: {
        in: ["WIDGET_IMPRESSION", "RECOMMENDATION_CLICK", "ADD_TO_CART"],
      },
    },
    select: {
      eventType: true,
      createdAt: true,
    },
  });
  
  // Agrupar por día
  const dailyData: Record<string, {
    impressions: number;
    clicks: number;
    addToCarts: number;
  }> = {};
  
  // Inicializar todos los días
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split("T")[0];
    dailyData[dateStr] = { impressions: 0, clicks: 0, addToCarts: 0 };
  }
  
  // Contar eventos
  for (const event of events) {
    const dateStr = event.createdAt.toISOString().split("T")[0];
    if (!dailyData[dateStr]) continue;
    
    switch (event.eventType) {
      case "WIDGET_IMPRESSION":
        dailyData[dateStr].impressions++;
        break;
      case "RECOMMENDATION_CLICK":
        dailyData[dateStr].clicks++;
        break;
      case "ADD_TO_CART":
        dailyData[dateStr].addToCarts++;
        break;
    }
  }
  
  // Convertir a array ordenado
  return Object.entries(dailyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, data]) => ({
      date,
      ...data,
    }));
}

