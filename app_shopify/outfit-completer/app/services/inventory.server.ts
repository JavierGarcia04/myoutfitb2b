// =============================================================================
// INVENTORY SERVICE - Sincronización de productos e inventario
// =============================================================================

import db from "../db.server";
import type { ShopifyProduct, ShopifyVariant, ShopifyInventoryLevel } from "../types/shopify";
import {
  getStoreIdByShopifyDomain,
  syncProductToSupabase,
  deleteProductFromSupabase,
  updateStoreCatalogSize,
  logCatalogSync,
  validateShopSubscription,
} from "./supabase.server";

/**
 * Convierte el ID numérico de Shopify al formato GID
 */
function toShopifyGid(type: string, id: number | string): string {
  return `gid://shopify/${type}/${id}`;
}

/**
 * Parsea los tags de Shopify (string separado por comas) a array
 */
function parseTags(tags: string): string[] {
  if (!tags) return [];
  return tags.split(",").map((tag) => tag.trim()).filter(Boolean);
}

/**
 * Convierte array de tags a JSON string para SQLite
 */
function tagsToJson(tags: string[]): string {
  return JSON.stringify(tags);
}

/**
 * Parsea JSON string de tags a array
 */
function tagsFromJson(tagsJson: string | null): string[] {
  if (!tagsJson) return [];
  try {
    return JSON.parse(tagsJson);
  } catch {
    return [];
  }
}

/**
 * Extrae metadatos de categorización de los tags del producto
 */
function extractMetadataFromTags(tags: string[]): {
  category?: string;
  subcategory?: string;
  color?: string;
  style?: string;
  season?: string;
  gender?: string;
} {
  const metadata: Record<string, string> = {};
  
  for (const tag of tags) {
    const [key, value] = tag.split(":").map((s) => s.trim());
    if (key && value) {
      metadata[key.toLowerCase()] = value;
    }
  }
  
  return {
    category: metadata["category"],
    subcategory: metadata["subcategory"],
    color: metadata["color"],
    style: metadata["style"],
    season: metadata["season"],
    gender: metadata["gender"],
  };
}

// =============================================================================
// SHOP MANAGEMENT
// =============================================================================

/**
 * Obtiene o crea el registro de la tienda
 */
export async function getOrCreateShop(shopDomain: string): Promise<string> {
  let shop = await db.shop.findUnique({
    where: { shopDomain },
    select: { id: true },
  });
  
  if (!shop) {
    shop = await db.shop.create({
      data: { shopDomain },
      select: { id: true },
    });
  }
  
  return shop.id;
}

/**
 * Actualiza el estado de sincronización de la tienda
 */
export async function updateSyncStatus(
  shopId: string,
  status: "PENDING" | "SYNCING" | "SYNCED" | "ERROR"
): Promise<void> {
  await db.shop.update({
    where: { id: shopId },
    data: {
      syncStatus: status,
      lastSyncAt: status === "SYNCED" ? new Date() : undefined,
    },
  });
}

// =============================================================================
// PRODUCT SYNC
// =============================================================================

/**
 * Sincroniza un producto desde el webhook de Shopify (local + Supabase)
 */
export async function syncProduct(
  shopDomain: string,
  productData: ShopifyProduct
): Promise<void> {
  const shopId = await getOrCreateShop(shopDomain);
  const shopifyProductId = toShopifyGid("Product", productData.id);
  const tags = parseTags(productData.tags);
  const metadata = extractMetadataFromTags(tags);
  
  const statusMap: Record<string, string> = {
    active: "ACTIVE",
    draft: "DRAFT",
    archived: "ARCHIVED",
  };
  
  // 1. Guardar en base de datos local (SQLite/Prisma)
  const product = await db.product.upsert({
    where: {
      shopId_shopifyProductId: {
        shopId,
        shopifyProductId,
      },
    },
    create: {
      shopId,
      shopifyProductId,
      title: productData.title,
      handle: productData.handle,
      description: productData.body_html,
      productType: productData.product_type,
      vendor: productData.vendor,
      tags: tagsToJson(tags),
      category: metadata.category,
      subcategory: metadata.subcategory,
      color: metadata.color,
      style: metadata.style,
      season: metadata.season,
      gender: metadata.gender,
      featuredImageUrl: productData.image?.src,
      images: JSON.stringify(productData.images.map((img) => img.src)),
      status: statusMap[productData.status] || "ACTIVE",
      publishedAt: productData.published_at ? new Date(productData.published_at) : null,
      shopifyCreatedAt: new Date(productData.created_at),
      shopifyUpdatedAt: new Date(productData.updated_at),
    },
    update: {
      title: productData.title,
      handle: productData.handle,
      description: productData.body_html,
      productType: productData.product_type,
      vendor: productData.vendor,
      tags: tagsToJson(tags),
      category: metadata.category,
      subcategory: metadata.subcategory,
      color: metadata.color,
      style: metadata.style,
      season: metadata.season,
      gender: metadata.gender,
      featuredImageUrl: productData.image?.src,
      images: JSON.stringify(productData.images.map((img) => img.src)),
      status: statusMap[productData.status] || "ACTIVE",
      publishedAt: productData.published_at ? new Date(productData.published_at) : null,
      shopifyUpdatedAt: new Date(productData.updated_at),
    },
  });
  
  await syncVariants(product.id, productData.variants, productData.images);
  
  console.log(`[InventoryService] Synced product to local DB: ${productData.title} (${shopifyProductId})`);
  
  // 2. Sincronizar con Supabase (base de datos central)
  try {
    console.log(`[InventoryService] Looking for Supabase store with domain: "${shopDomain}"`);
    const supabaseStoreId = await getStoreIdByShopifyDomain(shopDomain);
    console.log(`[InventoryService] Supabase store ID found: ${supabaseStoreId || 'NOT FOUND'}`);
    
    if (supabaseStoreId) {
      // Calcular precios min/max de variantes
      const prices = productData.variants.map((v) => parseFloat(v.price));
      const totalInventory = productData.variants.reduce(
        (sum, v) => sum + (v.inventory_quantity || 0),
        0
      );
      
      const syncResult = await syncProductToSupabase(supabaseStoreId, {
        shopify_product_id: shopifyProductId,
        title: productData.title,
        handle: productData.handle,
        description: productData.body_html ?? undefined,
        product_type: productData.product_type ?? undefined,
        vendor: productData.vendor ?? undefined,
        tags,
        category: metadata.category,
        subcategory: metadata.subcategory,
        color: metadata.color,
        style: metadata.style,
        season: metadata.season,
        gender: metadata.gender,
        featured_image_url: productData.image?.src,
        images: productData.images.map((img) => img.src),
        status: productData.status,
        min_price: prices.length > 0 ? Math.min(...prices) : 0,
        max_price: prices.length > 0 ? Math.max(...prices) : 0,
        total_inventory: totalInventory,
        available_for_sale: totalInventory > 0,
        published_at: productData.published_at ?? undefined,
        shopify_created_at: productData.created_at,
        shopify_updated_at: productData.updated_at,
      });
      
      // La función RPC ya actualiza catalog_size automáticamente
      console.log(`[InventoryService] Synced product to Supabase: ${productData.title}. Result:`, syncResult);
    }
  } catch (supabaseError) {
    // No fallar si Supabase no está disponible
    console.warn(`[InventoryService] Could not sync to Supabase:`, supabaseError);
  }
}

/**
 * Sincroniza las variantes de un producto
 */
async function syncVariants(
  productId: string,
  variants: ShopifyVariant[],
  images: { id: number; src: string }[]
): Promise<void> {
  const imageMap = new Map(images.map((img) => [img.id, img.src]));
  
  for (const variant of variants) {
    const shopifyVariantId = toShopifyGid("ProductVariant", variant.id);
    
    await db.productVariant.upsert({
      where: {
        productId_shopifyVariantId: {
          productId,
          shopifyVariantId,
        },
      },
      create: {
        productId,
        shopifyVariantId,
        title: variant.title,
        sku: variant.sku,
        barcode: variant.barcode,
        option1: variant.option1,
        option2: variant.option2,
        option3: variant.option3,
        price: parseFloat(variant.price),
        compareAtPrice: variant.compare_at_price ? parseFloat(variant.compare_at_price) : null,
        totalInventory: variant.inventory_quantity,
        availableForSale: variant.inventory_quantity > 0,
        imageUrl: variant.image_id ? imageMap.get(variant.image_id) : null,
      },
      update: {
        title: variant.title,
        sku: variant.sku,
        barcode: variant.barcode,
        option1: variant.option1,
        option2: variant.option2,
        option3: variant.option3,
        price: parseFloat(variant.price),
        compareAtPrice: variant.compare_at_price ? parseFloat(variant.compare_at_price) : null,
        totalInventory: variant.inventory_quantity,
        availableForSale: variant.inventory_quantity > 0,
        imageUrl: variant.image_id ? imageMap.get(variant.image_id) : null,
      },
    });
  }
}

/**
 * Marca un producto como eliminado (local + Supabase)
 */
export async function deleteProduct(
  shopDomain: string,
  productId: number
): Promise<void> {
  const shopId = await getOrCreateShop(shopDomain);
  const shopifyProductId = toShopifyGid("Product", productId);
  
  // 1. Marcar como eliminado en base de datos local
  await db.product.updateMany({
    where: {
      shopId,
      shopifyProductId,
    },
    data: {
      status: "DELETED",
    },
  });
  
  console.log(`[InventoryService] Deleted product locally: ${shopifyProductId}`);
  
  // 2. Sincronizar eliminación con Supabase (la RPC actualiza catalog_size automáticamente)
  try {
    console.log(`[InventoryService] Looking for Supabase store with domain: "${shopDomain}"`);
    const supabaseStoreId = await getStoreIdByShopifyDomain(shopDomain);
    console.log(`[InventoryService] Supabase store ID: ${supabaseStoreId || 'NOT FOUND'}`);
    
    if (supabaseStoreId) {
      const result = await deleteProductFromSupabase(supabaseStoreId, shopifyProductId);
      // La función RPC ya actualiza catalog_size automáticamente
      console.log(`[InventoryService] Deleted product from Supabase: ${shopifyProductId}. Result:`, result);
    } else {
      console.log(`[InventoryService] No Supabase store found for domain: ${shopDomain}`);
    }
  } catch (supabaseError) {
    console.warn(`[InventoryService] Could not delete from Supabase:`, supabaseError);
  }
}

// =============================================================================
// INVENTORY SYNC
// =============================================================================

/**
 * Actualiza el nivel de inventario desde webhook
 */
export async function updateInventoryLevel(
  shopDomain: string,
  inventoryData: ShopifyInventoryLevel
): Promise<void> {
  const shopifyInventoryItemId = toShopifyGid("InventoryItem", inventoryData.inventory_item_id);
  
  const existingLevel = await db.inventoryLevel.findFirst({
    where: { shopifyInventoryItemId },
    include: { variant: true },
  });
  
  if (existingLevel) {
    await db.inventoryLevel.update({
      where: { id: existingLevel.id },
      data: {
        available: inventoryData.available ?? 0,
        shopifyUpdatedAt: new Date(inventoryData.updated_at),
      },
    });
    
    await recalculateVariantInventory(existingLevel.variantId);
    
    console.log(
      `[InventoryService] Updated inventory: ${inventoryData.available} units`
    );
  }
}

/**
 * Recalcula el inventario total de una variante
 */
async function recalculateVariantInventory(variantId: string): Promise<void> {
  const result = await db.inventoryLevel.aggregate({
    where: { variantId },
    _sum: { available: true },
  });
  
  const totalInventory = result._sum.available ?? 0;
  
  await db.productVariant.update({
    where: { id: variantId },
    data: {
      totalInventory,
      availableForSale: totalInventory > 0,
    },
  });
}

// =============================================================================
// BULK SYNC
// =============================================================================

/**
 * Obtiene todos los productos activos con inventario disponible
 */
export async function getAvailableProducts(shopId: string): Promise<
  Array<{
    id: string;
    shopifyProductId: string;
    title: string;
    productType: string | null;
    category: string | null;
    color: string | null;
    style: string | null;
    tags: string[];
    featuredImageUrl: string | null;
    inStock: boolean;
    minPrice: number;
    maxPrice: number;
  }>
> {
  const products = await db.product.findMany({
    where: {
      shopId,
      status: "ACTIVE",
      variants: {
        some: {
          availableForSale: true,
        },
      },
    },
    include: {
      variants: {
        where: { availableForSale: true },
        select: { price: true, totalInventory: true },
      },
    },
  });
  
  return products.map((product) => {
    const prices = product.variants.map((v) => v.price);
    return {
      id: product.id,
      shopifyProductId: product.shopifyProductId,
      title: product.title,
      productType: product.productType,
      category: product.category,
      color: product.color,
      style: product.style,
      tags: tagsFromJson(product.tags),
      featuredImageUrl: product.featuredImageUrl,
      inStock: product.variants.some((v) => v.totalInventory > 0),
      minPrice: prices.length > 0 ? Math.min(...prices) : 0,
      maxPrice: prices.length > 0 ? Math.max(...prices) : 0,
    };
  });
}

/**
 * Obtiene un producto por su ID de Shopify
 */
export async function getProductByShopifyId(
  shopId: string,
  shopifyProductId: string
): Promise<{
  id: string;
  title: string;
  productType: string | null;
  category: string | null;
  subcategory: string | null;
  color: string | null;
  style: string | null;
  tags: string[];
  images: string | null;
  featuredImageUrl: string | null;
} | null> {
  const normalizedId = shopifyProductId.startsWith("gid://")
    ? shopifyProductId
    : toShopifyGid("Product", shopifyProductId);
  
  const product = await db.product.findFirst({
    where: {
      shopId,
      shopifyProductId: normalizedId,
      status: "ACTIVE",
    },
    select: {
      id: true,
      title: true,
      productType: true,
      category: true,
      subcategory: true,
      color: true,
      style: true,
      tags: true,
      images: true,
      featuredImageUrl: true,
    },
  });
  
  if (!product) return null;
  
  return {
    ...product,
    tags: tagsFromJson(product.tags),
  };
}
