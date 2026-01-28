// =============================================================================
// WEBHOOK: products/update
// Se dispara cuando se actualiza un producto en Shopify
// =============================================================================

import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { syncProduct } from "../services/inventory.server";
import { invalidateRecommendationCache } from "../services/recommendation.server";
import type { ShopifyProduct } from "../types/shopify";
import db from "../db.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, topic, payload } = await authenticate.webhook(request);

  console.log(`[Webhook] Received ${topic} from ${shop}`);

  if (!payload) {
    console.error("[Webhook] products/update: No payload received");
    return new Response("No payload", { status: 400 });
  }

  try {
    const productData = payload as unknown as ShopifyProduct;
    
    // Sincronizar el producto actualizado
    await syncProduct(shop, productData);

    // Invalidar cache de recomendaciones si el producto cambió significativamente
    // (cambios en categoría, tipo, estado, etc.)
    const shopRecord = await db.shop.findUnique({
      where: { shopDomain: shop },
      select: { id: true },
    });

    if (shopRecord) {
      const product = await db.product.findFirst({
        where: {
          shopId: shopRecord.id,
          shopifyProductId: `gid://shopify/Product/${productData.id}`,
        },
        select: { id: true },
      });

      if (product) {
        await invalidateRecommendationCache(shopRecord.id, product.id);
      }
    }

    console.log(`[Webhook] products/update: Updated product "${productData.title}" for ${shop}`);
    
    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("[Webhook] products/update error:", error);
    return new Response("Error processing webhook", { status: 200 });
  }
};

