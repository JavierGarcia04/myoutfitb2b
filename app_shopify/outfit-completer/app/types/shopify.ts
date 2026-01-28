// =============================================================================
// TIPOS - Estructuras de datos de Shopify Webhooks
// =============================================================================

/**
 * Producto de Shopify (payload del webhook)
 */
export interface ShopifyProduct {
  id: number;
  title: string;
  handle: string;
  body_html: string | null;
  vendor: string | null;
  product_type: string | null;
  tags: string;
  status: "active" | "draft" | "archived";
  published_at: string | null;
  created_at: string;
  updated_at: string;
  variants: ShopifyVariant[];
  images: ShopifyImage[];
  image: ShopifyImage | null;
}

/**
 * Variante de producto de Shopify
 */
export interface ShopifyVariant {
  id: number;
  product_id: number;
  title: string;
  sku: string | null;
  barcode: string | null;
  price: string;
  compare_at_price: string | null;
  option1: string | null;
  option2: string | null;
  option3: string | null;
  inventory_item_id: number;
  inventory_quantity: number;
  image_id: number | null;
  created_at: string;
  updated_at: string;
}

/**
 * Imagen de producto de Shopify
 */
export interface ShopifyImage {
  id: number;
  product_id: number;
  src: string;
  alt: string | null;
  position: number;
  width: number;
  height: number;
}

/**
 * Nivel de inventario de Shopify (webhook payload)
 */
export interface ShopifyInventoryLevel {
  inventory_item_id: number;
  location_id: number;
  available: number | null;
  updated_at: string;
}

/**
 * Orden de Shopify (para tracking de conversiones)
 */
export interface ShopifyOrder {
  id: number;
  order_number: number;
  total_price: string;
  line_items: ShopifyLineItem[];
  created_at: string;
  note_attributes: Array<{ name: string; value: string }>;
}

/**
 * Item de línea de una orden
 */
export interface ShopifyLineItem {
  id: number;
  product_id: number;
  variant_id: number;
  title: string;
  quantity: number;
  price: string;
}

/**
 * Headers de webhook de Shopify para validación HMAC
 */
export interface ShopifyWebhookHeaders {
  "x-shopify-topic": string;
  "x-shopify-hmac-sha256": string;
  "x-shopify-shop-domain": string;
  "x-shopify-api-version": string;
  "x-shopify-webhook-id": string;
}

/**
 * Respuesta de la API de IA externa
 */
export interface AIRecommendationResponse {
  success: boolean;
  outfit_name?: string;
  outfit_description?: string;
  confidence?: number;
  recommendations: AIRecommendedProduct[];
  error?: string;
}

/**
 * Producto recomendado por la IA
 */
export interface AIRecommendedProduct {
  product_id: string; // ID interno de nuestro sistema
  shopify_product_id: string;
  match_reason: string;
  score: number;
}

/**
 * Payload para enviar a la API de IA
 */
export interface AIRequestPayload {
  main_product: {
    id: string;
    title: string;
    product_type: string | null;
    category: string | null;
    subcategory: string | null;
    color: string | null;
    style: string | null;
    tags: string[];
    images: string[];
  };
  available_products: Array<{
    id: string;
    title: string;
    product_type: string | null;
    category: string | null;
    color: string | null;
    style: string | null;
    tags: string[];
    in_stock: boolean;
    image_url: string | null;
  }>;
  preferences?: {
    max_items?: number;
    include_same_category?: boolean;
    price_range?: { min: number; max: number };
  };
}

