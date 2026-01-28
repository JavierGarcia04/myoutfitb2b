// =============================================================================
// WEBHOOK: products/delete
// Se dispara cuando se elimina un producto en Shopify
// =============================================================================

import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { deleteProduct } from "../services/inventory.server";
import { invalidateRecommendationCache } from "../services/recommendation.server";
import db from "../db.server";

interface ProductDeletePayload {
  id: number;
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, topic, payload } = await authenticate.webhook(request);

  console.log(`[Webhook] Received ${topic} from ${shop}`);

  if (!payload) {
    console.error("[Webhook] products/delete: No payload received");
    return new Response("No payload", { status: 400 });
  }

  try {
    const { id: productId } = payload as unknown as ProductDeletePayload;
    
    // Marcar el producto como eliminado
    await deleteProduct(shop, productId);

    // Invalidar todas las recomendaciones que incluían este producto
    const shopRecord = await db.shop.findUnique({
      where: { shopDomain: shop },
      select: { id: true },
    });

    if (shopRecord) {
      const product = await db.product.findFirst({
        where: {
          shopId: shopRecord.id,
          shopifyProductId: `gid://shopify/Product/${productId}`,
        },
        select: { id: true },
      });

      if (product) {
        await invalidateRecommendationCache(shopRecord.id, product.id);
      }
    }

    console.log(`[Webhook] products/delete: Deleted product ${productId} for ${shop}`);
    
    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("[Webhook] products/delete error:", error);
    return new Response("Error processing webhook", { status: 200 });
  }
};

