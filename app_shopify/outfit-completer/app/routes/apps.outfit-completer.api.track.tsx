// =============================================================================
// App Proxy Route: /apps/outfit-completer/api/track
// Handles analytics tracking from the storefront via App Proxy
// =============================================================================

import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import db from "../db.server";

const responseHeaders = {
  "Content-Type": "application/json",
};

interface TrackEventBody {
  eventType: string;
  productId?: string;
  productHandle?: string;
  variantId?: string;
  position?: number;
  timestamp?: string;
  url?: string;
  referrer?: string;
}

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const body = await request.json() as TrackEventBody;
    const url = new URL(request.url);
    const shop = url.searchParams.get("shop") || url.hostname;

    // Find shop
    const shopRecord = await db.shop.findUnique({
      where: { shopDomain: shop },
    });

    if (!shopRecord) {
      // Silent fail - don't break storefront for tracking
      return json({ success: true }, { headers: responseHeaders });
    }

    // Map event type to our enum-like values
    let eventType: string;
    switch (body.eventType) {
      case "widget_impression":
        eventType = "WIDGET_IMPRESSION";
        break;
      case "product_click":
        eventType = "RECOMMENDATION_CLICK";
        break;
      case "add_to_cart":
        eventType = "ADD_TO_CART";
        break;
      default:
        eventType = body.eventType?.toUpperCase() || "UNKNOWN";
    }

    // Create analytics event
    await db.analyticsEvent.create({
      data: {
        shopId: shopRecord.id,
        eventType,
        productId: body.productId || null,
        metadata: JSON.stringify({
          productHandle: body.productHandle,
          variantId: body.variantId,
          position: body.position,
          url: body.url,
          referrer: body.referrer,
          timestamp: body.timestamp,
        }),
      },
    });

    return json({ success: true }, { headers: responseHeaders });
  } catch (error) {
    console.error("[App Proxy] track error:", error);
    // Always return success for tracking - don't break UX
    return json({ success: true }, { headers: responseHeaders });
  }
}

// Handle OPTIONS for CORS preflight (shouldn't be needed with proxy but just in case)
export async function loader() {
  return json({ success: true }, { headers: responseHeaders });
}


