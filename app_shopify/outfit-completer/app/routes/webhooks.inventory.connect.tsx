// =============================================================================
// WEBHOOK: inventory_levels/connect
// Se dispara cuando un item de inventario se conecta a una ubicación
// =============================================================================

import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";

interface InventoryConnectPayload {
  inventory_item_id: number;
  location_id: number;
  available: number | null;
  updated_at: string;
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, topic, payload } = await authenticate.webhook(request);

  console.log(`[Webhook] Received ${topic} from ${shop}`);

  if (!payload) {
    console.error("[Webhook] inventory/connect: No payload received");
    return new Response("No payload", { status: 400 });
  }

  try {
    const data = payload as unknown as InventoryConnectPayload;
    
    // Cuando se conecta un nuevo inventario a una ubicación,
    // generalmente se maneja en la próxima sincronización completa
    // o cuando se recibe el webhook inventory_levels/update
    console.log(
      `[Webhook] inventory/connect: Item ${data.inventory_item_id} ` +
      `connected to location ${data.location_id}`
    );
    
    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("[Webhook] inventory/connect error:", error);
    return new Response("Error processing webhook", { status: 200 });
  }
};

