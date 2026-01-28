// =============================================================================
// API: /api/recommendations
// Endpoint público para obtener recomendaciones de outfit
// Consumido por el Theme Extension (App Block) en el storefront
// =============================================================================

import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { getRecommendationsByShopifyProductId } from "../services/recommendation.server";
import {
  trackWidgetImpression,
  trackRecommendationView,
} from "../services/analytics.server";

// Headers CORS para permitir llamadas desde el storefront
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Cache-Control": "public, max-age=300", // Cache 5 minutos en CDN
};

// Preflight CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  
  // Parámetros requeridos
  const shopDomain = url.searchParams.get("shop");
  const productId = url.searchParams.get("product_id");
  
  // Parámetros opcionales
  const sessionId = url.searchParams.get("session_id");
  const trackImpression = url.searchParams.get("track") !== "false";

  // Validar parámetros
  if (!shopDomain) {
    return json(
      { error: "Missing required parameter: shop" },
      { status: 400, headers: corsHeaders }
    );
  }

  if (!productId) {
    return json(
      { error: "Missing required parameter: product_id" },
      { status: 400, headers: corsHeaders }
    );
  }

  try {
    // Track impresión del widget
    if (trackImpression) {
      await trackWidgetImpression(shopDomain, productId, sessionId || undefined);
    }

    // Obtener recomendaciones
    const recommendations = await getRecommendationsByShopifyProductId(
      shopDomain,
      productId
    );

    if (!recommendations) {
      return json(
        { 
          success: true,
          data: null,
          message: "No recommendations available for this product"
        },
        { headers: corsHeaders }
      );
    }

    // Track vista de recomendaciones
    if (trackImpression) {
      await trackRecommendationView(
        shopDomain,
        productId,
        recommendations.id,
        sessionId || undefined
      );
    }

    return json(
      {
        success: true,
        data: {
          id: recommendations.id,
          outfit_name: recommendations.outfitName,
          outfit_description: recommendations.outfitDescription,
          products: recommendations.products.map((p) => ({
            id: p.id,
            shopify_product_id: p.shopifyProductId,
            variant_id: p.variantId,
            title: p.title,
            handle: p.handle,
            image_url: p.featuredImageUrl,
            price: p.price,
            match_reason: p.matchReason,
          })),
        },
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("[API] recommendations error:", error);
    
    return json(
      { 
        success: false,
        error: "Failed to fetch recommendations",
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

