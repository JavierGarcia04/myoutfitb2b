// =============================================================================
// WEBHOOK: inventory_levels/update
// Se dispara cuando cambian los niveles de inventario
// =============================================================================

import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { updateInventoryLevel } from "../services/inventory.server";
import type { ShopifyInventoryLevel } from "../types/shopify";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, topic, payload } = await authenticate.webhook(request);

  console.log(`[Webhook] Received ${topic} from ${shop}`);

  if (!payload) {
    console.error("[Webhook] inventory/update: No payload received");
    return new Response("No payload", { status: 400 });
  }

  try {
    const inventoryData = payload as unknown as ShopifyInventoryLevel;
    
    // Actualizar nivel de inventario
    await updateInventoryLevel(shop, inventoryData);

    console.log(
      `[Webhook] inventory/update: Updated inventory for item ${inventoryData.inventory_item_id} ` +
      `at location ${inventoryData.location_id}: ${inventoryData.available} units`
    );
    
    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("[Webhook] inventory/update error:", error);
    return new Response("Error processing webhook", { status: 200 });
  }
};

