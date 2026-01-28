// =============================================================================
// RECOMMENDATION SERVICE - Integración con API de IA externa
// =============================================================================

import db from "../db.server";
import type { AIRecommendationResponse, AIRequestPayload } from "../types/shopify";
import { getAvailableProducts, getProductByShopifyId } from "./inventory.server";

// Configuración de la API de IA
const AI_API_URL = process.env.AI_API_URL || "https://api.tu-ia.com/v1/recommend";
const AI_API_KEY = process.env.AI_API_KEY || "";
const AI_API_TIMEOUT_MS = parseInt(process.env.AI_API_TIMEOUT_MS || "5000", 10);
const CACHE_TTL_SECONDS = parseInt(process.env.RECOMMENDATION_CACHE_TTL_SECONDS || "3600", 10);

// =============================================================================
// TIPOS PÚBLICOS
// =============================================================================

export interface OutfitRecommendation {
  id: string;
  outfitName: string | null;
  outfitDescription: string | null;
  confidence: number | null;
  products: Array<{
    id: string;
    shopifyProductId: string;
    variantId: string | null;
    title: string;
    handle: string;
    featuredImageUrl: string | null;
    price: string;
    matchReason: string | null;
  }>;
}

// =============================================================================
// FUNCIONES PRINCIPALES
// =============================================================================

/**
 * Obtiene recomendaciones de outfit para un producto
 * Primero busca en cache, si no existe o expiró, llama a la API de IA
 */
export async function getOutfitRecommendations(
  shopId: string,
  mainProductId: string,
  options?: {
    maxItems?: number;
    forceRefresh?: boolean;
  }
): Promise<OutfitRecommendation | null> {
  const { maxItems = 4, forceRefresh = false } = options || {};
  
  // 1. Buscar en cache si no se fuerza refresh
  if (!forceRefresh) {
    const cached = await getCachedRecommendation(shopId, mainProductId);
    if (cached) {
      console.log(`[RecommendationService] Cache hit for product ${mainProductId}`);
      return cached;
    }
  }
  
  // 2. Obtener datos del producto principal
  const mainProduct = await db.product.findFirst({
    where: { id: mainProductId, shopId },
    include: {
      variants: {
        where: { availableForSale: true },
        take: 1,
      },
    },
  });
  
  if (!mainProduct) {
    console.error(`[RecommendationService] Main product not found: ${mainProductId}`);
    return null;
  }
  
  // 3. Obtener productos disponibles para recomendar
  const availableProducts = await getAvailableProducts(shopId);
  
  // Filtrar el producto principal de las opciones
  const candidateProducts = availableProducts.filter(
    (p) => p.id !== mainProductId
  );
  
  if (candidateProducts.length === 0) {
    console.log(`[RecommendationService] No candidate products available`);
    return null;
  }
  
  // 4. Llamar a la API de IA
  const aiResponse = await callAIApi({
    main_product: {
      id: mainProduct.id,
      title: mainProduct.title,
      product_type: mainProduct.productType,
      category: mainProduct.category,
      subcategory: mainProduct.subcategory,
      color: mainProduct.color,
      style: mainProduct.style,
      tags: mainProduct.tags,
      images: (mainProduct.images as string[]) || [],
    },
    available_products: candidateProducts.map((p) => ({
      id: p.id,
      title: p.title,
      product_type: p.productType,
      category: p.category,
      color: p.color,
      style: p.style,
      tags: p.tags,
      in_stock: p.inStock,
      image_url: p.featuredImageUrl,
    })),
    preferences: {
      max_items: maxItems,
      include_same_category: false,
    },
  });
  
  if (!aiResponse.success || aiResponse.recommendations.length === 0) {
    console.error(`[RecommendationService] AI API error: ${aiResponse.error}`);
    // Fallback: usar recomendaciones basadas en categoría similar
    return await getFallbackRecommendations(shopId, mainProduct, candidateProducts, maxItems);
  }
  
  // 5. Guardar en cache y retornar
  const recommendation = await saveRecommendation(
    shopId,
    mainProductId,
    aiResponse,
    aiResponse.recommendations.slice(0, maxItems)
  );
  
  return recommendation;
}

/**
 * Obtiene recomendaciones por el ID de Shopify del producto
 * (Usado por el frontend/storefront)
 */
export async function getRecommendationsByShopifyProductId(
  shopDomain: string,
  shopifyProductId: string
): Promise<OutfitRecommendation | null> {
  // Obtener el shop
  const shop = await db.shop.findUnique({
    where: { shopDomain },
    select: { id: true },
  });
  
  if (!shop) {
    console.error(`[RecommendationService] Shop not found: ${shopDomain}`);
    return null;
  }
  
  // Obtener el producto por su ID de Shopify
  const product = await getProductByShopifyId(shop.id, shopifyProductId);
  
  if (!product) {
    console.error(`[RecommendationService] Product not found: ${shopifyProductId}`);
    return null;
  }
  
  return getOutfitRecommendations(shop.id, product.id);
}

// =============================================================================
// FUNCIONES DE CACHE
// =============================================================================

/**
 * Busca una recomendación cacheada que no haya expirado
 */
async function getCachedRecommendation(
  shopId: string,
  mainProductId: string
): Promise<OutfitRecommendation | null> {
  const cached = await db.outfitRecommendation.findFirst({
    where: {
      shopId,
      mainProductId,
      expiresAt: { gt: new Date() },
    },
    include: {
      items: {
        include: {
          product: {
            include: {
              variants: {
                where: { availableForSale: true },
                take: 1,
                select: { id: true, shopifyVariantId: true, price: true },
              },
            },
          },
        },
        orderBy: { position: "asc" },
      },
    },
  });
  
  if (!cached) return null;
  
  // Verificar que todos los productos recomendados aún tengan stock
  const validItems = cached.items.filter(
    (item) => item.product.variants.length > 0
  );
  
  if (validItems.length === 0) {
    // Cache inválido, eliminar
    await db.outfitRecommendation.delete({ where: { id: cached.id } });
    return null;
  }
  
  return {
    id: cached.id,
    outfitName: cached.outfitName,
    outfitDescription: cached.outfitDescription,
    confidence: cached.confidence,
    products: validItems.map((item) => ({
      id: item.product.id,
      shopifyProductId: item.product.shopifyProductId,
      variantId: item.product.variants[0]?.shopifyVariantId || null,
      title: item.product.title,
      handle: item.product.handle,
      featuredImageUrl: item.product.featuredImageUrl,
      price: item.product.variants[0]?.price.toString() || "0",
      matchReason: item.matchReason,
    })),
  };
}

/**
 * Guarda una nueva recomendación en la base de datos
 */
async function saveRecommendation(
  shopId: string,
  mainProductId: string,
  aiResponse: AIRecommendationResponse,
  recommendations: AIRecommendationResponse["recommendations"]
): Promise<OutfitRecommendation> {
  // Eliminar recomendaciones anteriores para este producto
  await db.outfitRecommendation.deleteMany({
    where: { shopId, mainProductId },
  });
  
  // Crear nueva recomendación
  const recommendation = await db.outfitRecommendation.create({
    data: {
      shopId,
      mainProductId,
      outfitName: aiResponse.outfit_name,
      outfitDescription: aiResponse.outfit_description,
      confidence: aiResponse.confidence,
      expiresAt: new Date(Date.now() + CACHE_TTL_SECONDS * 1000),
      items: {
        create: recommendations.map((rec, index) => ({
          productId: rec.product_id,
          position: index,
          matchReason: rec.match_reason,
        })),
      },
    },
    include: {
      items: {
        include: {
          product: {
            include: {
              variants: {
                where: { availableForSale: true },
                take: 1,
                select: { id: true, shopifyVariantId: true, price: true },
              },
            },
          },
        },
        orderBy: { position: "asc" },
      },
    },
  });
  
  return {
    id: recommendation.id,
    outfitName: recommendation.outfitName,
    outfitDescription: recommendation.outfitDescription,
    confidence: recommendation.confidence,
    products: recommendation.items.map((item) => ({
      id: item.product.id,
      shopifyProductId: item.product.shopifyProductId,
      variantId: item.product.variants[0]?.shopifyVariantId || null,
      title: item.product.title,
      handle: item.product.handle,
      featuredImageUrl: item.product.featuredImageUrl,
      price: item.product.variants[0]?.price.toString() || "0",
      matchReason: item.matchReason,
    })),
  };
}

// =============================================================================
// API DE IA
// =============================================================================

/**
 * Llama a la API de IA externa con timeout y manejo de errores
 */
async function callAIApi(payload: AIRequestPayload): Promise<AIRecommendationResponse> {
  // Si no hay API key configurada, retornar error
  if (!AI_API_KEY) {
    console.warn("[RecommendationService] AI API key not configured");
    return {
      success: false,
      recommendations: [],
      error: "AI API not configured",
    };
  }
  
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), AI_API_TIMEOUT_MS);
  
  try {
    const response = await fetch(AI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${AI_API_KEY}`,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    
    clearTimeout(timeout);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[RecommendationService] AI API error: ${response.status} - ${errorText}`);
      return {
        success: false,
        recommendations: [],
        error: `API error: ${response.status}`,
      };
    }
    
    const data = await response.json() as AIRecommendationResponse;
    return {
      ...data,
      success: true,
    };
  } catch (error) {
    clearTimeout(timeout);
    
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        console.error("[RecommendationService] AI API timeout");
        return {
          success: false,
          recommendations: [],
          error: "API timeout",
        };
      }
      console.error(`[RecommendationService] AI API error: ${error.message}`);
      return {
        success: false,
        recommendations: [],
        error: error.message,
      };
    }
    
    return {
      success: false,
      recommendations: [],
      error: "Unknown error",
    };
  }
}

// =============================================================================
// FALLBACK (cuando la IA falla)
// =============================================================================

/**
 * Genera recomendaciones basadas en reglas simples cuando la IA no está disponible
 */
async function getFallbackRecommendations(
  shopId: string,
  mainProduct: {
    id: string;
    productType: string | null;
    category: string | null;
    color: string | null;
    style: string | null;
  },
  candidates: Awaited<ReturnType<typeof getAvailableProducts>>,
  maxItems: number
): Promise<OutfitRecommendation | null> {
  console.log("[RecommendationService] Using fallback recommendations");
  
  // Estrategia simple: buscar productos de diferente categoría pero mismo estilo
  let scored = candidates.map((product) => {
    let score = 0;
    
    // Preferir productos de diferente tipo/categoría
    if (product.productType !== mainProduct.productType) score += 2;
    if (product.category !== mainProduct.category) score += 2;
    
    // Bonus por mismo estilo
    if (product.style && product.style === mainProduct.style) score += 3;
    
    // Bonus por colores complementarios (simplificado)
    if (product.color && mainProduct.color) {
      // Aquí podrías implementar lógica de colores complementarios
      score += 1;
    }
    
    return { product, score };
  });
  
  // Ordenar por score y tomar los mejores
  scored.sort((a, b) => b.score - a.score);
  const topProducts = scored.slice(0, maxItems);
  
  if (topProducts.length === 0) return null;
  
  // Obtener datos completos de los productos seleccionados
  const productDetails = await db.product.findMany({
    where: {
      id: { in: topProducts.map((p) => p.product.id) },
    },
    include: {
      variants: {
        where: { availableForSale: true },
        take: 1,
        select: { price: true },
      },
    },
  });
  
  // Crear mapa para mantener el orden
  const productMap = new Map(productDetails.map((p) => [p.id, p]));
  
  // Guardar en cache
  await db.outfitRecommendation.deleteMany({
    where: { shopId, mainProductId: mainProduct.id },
  });
  
  const recommendation = await db.outfitRecommendation.create({
    data: {
      shopId,
      mainProductId: mainProduct.id,
      outfitName: "Completa tu look",
      outfitDescription: "Productos que combinan con tu selección",
      confidence: 0.5, // Confianza baja para fallback
      expiresAt: new Date(Date.now() + (CACHE_TTL_SECONDS / 2) * 1000), // Menos cache para fallback
      items: {
        create: topProducts.map((item, index) => ({
          productId: item.product.id,
          position: index,
          matchReason: "Estilo similar",
        })),
      },
    },
  });
  
  return {
    id: recommendation.id,
    outfitName: recommendation.outfitName,
    outfitDescription: recommendation.outfitDescription,
    confidence: recommendation.confidence,
    products: topProducts
      .map((item) => {
        const product = productMap.get(item.product.id);
        if (!product) return null;
        return {
          id: product.id,
          shopifyProductId: product.shopifyProductId,
          variantId: product.variants[0]?.shopifyVariantId || null,
          title: product.title,
          handle: product.handle,
          featuredImageUrl: product.featuredImageUrl,
          price: product.variants[0]?.price.toString() || "0",
          matchReason: "Estilo similar",
        };
      })
      .filter((p): p is NonNullable<typeof p> => p !== null),
  };
}

/**
 * Invalida el cache de recomendaciones para un producto
 * (Llamar cuando el inventario cambia significativamente)
 */
export async function invalidateRecommendationCache(
  shopId: string,
  productId?: string
): Promise<void> {
  if (productId) {
    // Invalidar recomendaciones que incluyen este producto
    await db.outfitRecommendation.updateMany({
      where: {
        shopId,
        OR: [
          { mainProductId: productId },
          { items: { some: { productId } } },
        ],
      },
      data: {
        expiresAt: new Date(), // Expirar inmediatamente
      },
    });
  } else {
    // Invalidar todas las recomendaciones de la tienda
    await db.outfitRecommendation.updateMany({
      where: { shopId },
      data: { expiresAt: new Date() },
    });
  }
}

