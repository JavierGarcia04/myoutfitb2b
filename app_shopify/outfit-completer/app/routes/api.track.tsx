// =============================================================================
// API: /api/track
// Endpoint para tracking de eventos de analytics desde el storefront
// =============================================================================

import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  trackRecommendationClick,
  trackAddToCart,
} from "../services/analytics.server";

// Headers CORS
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// Preflight CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

interface TrackEventBody {
  shop: string;
  event_type: "click" | "add_to_cart";
  product_id: string;
  recommended_product_id: string;
  recommendation_id: string;
  session_id?: string;
}

export async function action({ request }: ActionFunctionArgs) {
  // Solo aceptar POST
  if (request.method !== "POST") {
    return json(
      { error: "Method not allowed" },
      { status: 405, headers: corsHeaders }
    );
  }

  try {
    const body = await request.json() as TrackEventBody;

    // Validar campos requeridos
    const requiredFields = [
      "shop",
      "event_type",
      "product_id",
      "recommended_product_id",
      "recommendation_id",
    ];

    for (const field of requiredFields) {
      if (!body[field as keyof TrackEventBody]) {
        return json(
          { error: `Missing required field: ${field}` },
          { status: 400, headers: corsHeaders }
        );
      }
    }

    // Procesar evento según tipo
    switch (body.event_type) {
      case "click":
        await trackRecommendationClick(
          body.shop,
          body.product_id,
          body.recommended_product_id,
          body.recommendation_id,
          body.session_id
        );
        break;

      case "add_to_cart":
        await trackAddToCart(
          body.shop,
          body.product_id,
          body.recommended_product_id,
          body.recommendation_id,
          body.session_id
        );
        break;

      default:
        return json(
          { error: `Unknown event type: ${body.event_type}` },
          { status: 400, headers: corsHeaders }
        );
    }

    return json(
      { success: true },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("[API] track error:", error);
    
    // Siempre retornar 200 para tracking (fire-and-forget)
    return json(
      { success: false },
      { headers: corsHeaders }
    );
  }
}

