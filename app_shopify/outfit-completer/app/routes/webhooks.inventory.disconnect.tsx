// =============================================================================
// WEBHOOK: inventory_levels/disconnect
// Se dispara cuando un item de inventario se desconecta de una ubicación
// =============================================================================

import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import db from "../db.server";

interface InventoryDisconnectPayload {
  inventory_item_id: number;
  location_id: number;
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, topic, payload } = await authenticate.webhook(request);

  console.log(`[Webhook] Received ${topic} from ${shop}`);

  if (!payload) {
    console.error("[Webhook] inventory/disconnect: No payload received");
    return new Response("No payload", { status: 400 });
  }

  try {
    const data = payload as unknown as InventoryDisconnectPayload;
    
    const shopifyInventoryItemId = `gid://shopify/InventoryItem/${data.inventory_item_id}`;
    const shopifyLocationId = `gid://shopify/Location/${data.location_id}`;
    
    // Eliminar el registro de inventario para esta ubicación
    await db.inventoryLevel.deleteMany({
      where: {
        shopifyInventoryItemId,
        shopifyLocationId,
      },
    });

    console.log(
      `[Webhook] inventory/disconnect: Item ${data.inventory_item_id} ` +
      `disconnected from location ${data.location_id}`
    );
    
    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("[Webhook] inventory/disconnect error:", error);
    return new Response("Error processing webhook", { status: 200 });
  }
};

