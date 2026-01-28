// =============================================================================
// WEBHOOK: products/create
// Se dispara cuando se crea un nuevo producto en Shopify
// =============================================================================

import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { syncProduct } from "../services/inventory.server";
import type { ShopifyProduct } from "../types/shopify";

export const action = async ({ request }: ActionFunctionArgs) => {
  // Autenticar y validar el webhook (incluye verificación HMAC)
  const { shop, topic, payload } = await authenticate.webhook(request);

  console.log(`[Webhook] Received ${topic} from ${shop}`);

  if (!payload) {
    console.error("[Webhook] products/create: No payload received");
    return new Response("No payload", { status: 400 });
  }

  try {
    // El payload viene como objeto, tiparlo correctamente
    const productData = payload as unknown as ShopifyProduct;
    
    // Sincronizar el producto con nuestra base de datos
    await syncProduct(shop, productData);

    console.log(`[Webhook] products/create: Synced product "${productData.title}" for ${shop}`);
    
    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("[Webhook] products/create error:", error);
    
    // Retornar 200 para evitar reintentos de Shopify en errores de lógica
    // Solo retornar 500 si queremos que Shopify reintente
    return new Response("Error processing webhook", { status: 200 });
  }
};

