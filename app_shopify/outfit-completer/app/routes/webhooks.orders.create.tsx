// =============================================================================
// WEBHOOK: orders/create
// Se dispara cuando se crea una orden - usado para tracking de conversiones
// =============================================================================

import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { trackPurchase } from "../services/analytics.server";
import type { ShopifyOrder } from "../types/shopify";
import db from "../db.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, topic, payload } = await authenticate.webhook(request);

  console.log(`[Webhook] Received ${topic} from ${shop}`);

  if (!payload) {
    console.error("[Webhook] orders/create: No payload received");
    return new Response("No payload", { status: 400 });
  }

  try {
    const orderData = payload as unknown as ShopifyOrder;
    
    // Buscar atributos de nota que indiquen productos de recomendación
    // El frontend debería agregar estos atributos cuando el usuario
    // agrega un producto recomendado al carrito
    const recommendationAttr = orderData.note_attributes?.find(
      (attr) => attr.name === "_outfit_recommendation"
    );

    if (recommendationAttr) {
      // Parsear la información de recomendación
      try {
        const recData = JSON.parse(recommendationAttr.value) as {
          mainProductId: string;
          recommendedProductIds: string[];
        };

        // Registrar evento de compra para cada producto recomendado que fue comprado
        const purchasedProductIds = orderData.line_items.map(
          (item) => `gid://shopify/Product/${item.product_id}`
        );

        const shopRecord = await db.shop.findUnique({
          where: { shopDomain: shop },
          select: { id: true },
        });

        if (shopRecord) {
          // Encontrar productos recomendados que fueron comprados
          const matchedProducts = await db.product.findMany({
            where: {
              shopId: shopRecord.id,
              shopifyProductId: { in: purchasedProductIds },
            },
            select: { id: true, shopifyProductId: true },
          });

          for (const product of matchedProducts) {
            if (recData.recommendedProductIds.includes(product.shopifyProductId)) {
              await trackPurchase(
                shop,
                recData.mainProductId,
                product.id,
                {
                  orderId: orderData.id,
                  orderNumber: orderData.order_number,
                  totalPrice: orderData.total_price,
                }
              );
            }
          }
        }

        console.log(
          `[Webhook] orders/create: Tracked purchase conversion for order #${orderData.order_number}`
        );
      } catch (parseError) {
        console.error("[Webhook] Error parsing recommendation attribute:", parseError);
      }
    }
    
    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("[Webhook] orders/create error:", error);
    return new Response("Error processing webhook", { status: 200 });
  }
};

