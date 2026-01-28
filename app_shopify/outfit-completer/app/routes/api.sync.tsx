// =============================================================================
// API: /api/sync
// Endpoint para sincronización manual de productos
// Solo accesible desde el admin (autenticado)
// =============================================================================

import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { getOrCreateShop, updateSyncStatus } from "../services/inventory.server";
import db from "../db.server";

// GET: Obtener estado de sincronización
export async function loader({ request }: LoaderFunctionArgs) {
  const { session } = await authenticate.admin(request);
  
  const shop = await db.shop.findUnique({
    where: { shopDomain: session.shop },
    select: {
      syncStatus: true,
      lastSyncAt: true,
      _count: {
        select: {
          products: { where: { status: "ACTIVE" } },
        },
      },
    },
  });

  return json({
    syncStatus: shop?.syncStatus || "PENDING",
    lastSyncAt: shop?.lastSyncAt?.toISOString() || null,
    productCount: shop?._count.products || 0,
  });
}

// POST: Iniciar sincronización completa
export async function action({ request }: ActionFunctionArgs) {
  const { session, admin } = await authenticate.admin(request);

  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  const shopId = await getOrCreateShop(session.shop);

  try {
    // Marcar como sincronizando
    await updateSyncStatus(shopId, "SYNCING");

    // Obtener todos los productos de Shopify usando GraphQL
    let hasNextPage = true;
    let cursor: string | null = null;
    let syncedCount = 0;

    while (hasNextPage) {
      const query = `
        query GetProducts($first: Int!, $after: String) {
          products(first: $first, after: $after) {
            pageInfo {
              hasNextPage
              endCursor
            }
            edges {
              node {
                id
                title
                handle
                descriptionHtml
                vendor
                productType
                tags
                status
                publishedAt
                createdAt
                updatedAt
                featuredImage {
                  url
                }
                images(first: 10) {
                  edges {
                    node {
                      url
                    }
                  }
                }
                variants(first: 100) {
                  edges {
                    node {
                      id
                      title
                      sku
                      barcode
                      price
                      compareAtPrice
                      selectedOptions {
                        name
                        value
                      }
                      inventoryQuantity
                      inventoryItem {
                        id
                      }
                      image {
                        url
                      }
                    }
                  }
                }
              }
            }
          }
        }
      `;

      const response = await admin.graphql(query, {
        variables: {
          first: 50,
          after: cursor,
        },
      });

      const data = await response.json();
      
      if (data.errors) {
        console.error("[Sync] GraphQL errors:", data.errors);
        throw new Error("GraphQL query failed");
      }

      const products = data.data?.products;
      
      if (!products) {
        break;
      }

      // Procesar cada producto
      for (const edge of products.edges) {
        const node = edge.node;
        await syncProductFromGraphQL(shopId, node);
        syncedCount++;
      }

      hasNextPage = products.pageInfo.hasNextPage;
      cursor = products.pageInfo.endCursor;

      // Pequeña pausa para evitar rate limits
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // Marcar sincronización como completa
    await updateSyncStatus(shopId, "SYNCED");

    return json({
      success: true,
      message: `Synced ${syncedCount} products`,
      syncedCount,
    });
  } catch (error) {
    console.error("[Sync] Error:", error);
    await updateSyncStatus(shopId, "ERROR");
    
    return json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Sync failed" 
      },
      { status: 500 }
    );
  }
}

// Función auxiliar para sincronizar producto desde GraphQL
async function syncProductFromGraphQL(
  shopId: string,
  node: {
    id: string;
    title: string;
    handle: string;
    descriptionHtml: string | null;
    vendor: string | null;
    productType: string | null;
    tags: string[];
    status: string;
    publishedAt: string | null;
    createdAt: string;
    updatedAt: string;
    featuredImage: { url: string } | null;
    images: { edges: Array<{ node: { url: string } }> };
    variants: {
      edges: Array<{
        node: {
          id: string;
          title: string;
          sku: string | null;
          barcode: string | null;
          price: string;
          compareAtPrice: string | null;
          selectedOptions: Array<{ name: string; value: string }>;
          inventoryQuantity: number;
          inventoryItem: { id: string };
          image: { url: string } | null;
        };
      }>;
    };
  }
): Promise<void> {
  // Extraer metadatos de los tags
  const metadata = extractMetadataFromTags(node.tags);
  
  // Convertir tags y images a JSON strings para SQLite
  const tagsJson = JSON.stringify(node.tags);
  const imagesJson = JSON.stringify(node.images.edges.map((e) => e.node.url));
  
  // Mapear estado
  const statusMap: Record<string, string> = {
    ACTIVE: "ACTIVE",
    DRAFT: "DRAFT",
    ARCHIVED: "ARCHIVED",
  };

  // Upsert del producto
  const product = await db.product.upsert({
    where: {
      shopId_shopifyProductId: {
        shopId,
        shopifyProductId: node.id,
      },
    },
    create: {
      shopId,
      shopifyProductId: node.id,
      title: node.title,
      handle: node.handle,
      description: node.descriptionHtml,
      productType: node.productType,
      vendor: node.vendor,
      tags: tagsJson,
      category: metadata.category,
      subcategory: metadata.subcategory,
      color: metadata.color,
      style: metadata.style,
      season: metadata.season,
      gender: metadata.gender,
      featuredImageUrl: node.featuredImage?.url,
      images: imagesJson,
      status: statusMap[node.status] || "ACTIVE",
      publishedAt: node.publishedAt ? new Date(node.publishedAt) : null,
      shopifyCreatedAt: new Date(node.createdAt),
      shopifyUpdatedAt: new Date(node.updatedAt),
    },
    update: {
      title: node.title,
      handle: node.handle,
      description: node.descriptionHtml,
      productType: node.productType,
      vendor: node.vendor,
      tags: tagsJson,
      category: metadata.category,
      subcategory: metadata.subcategory,
      color: metadata.color,
      style: metadata.style,
      season: metadata.season,
      gender: metadata.gender,
      featuredImageUrl: node.featuredImage?.url,
      images: imagesJson,
      status: statusMap[node.status] || "ACTIVE",
      publishedAt: node.publishedAt ? new Date(node.publishedAt) : null,
      shopifyUpdatedAt: new Date(node.updatedAt),
    },
  });

  // Sincronizar variantes
  for (const variantEdge of node.variants.edges) {
    const variant = variantEdge.node;
    const options = variant.selectedOptions;
    
    await db.productVariant.upsert({
      where: {
        productId_shopifyVariantId: {
          productId: product.id,
          shopifyVariantId: variant.id,
        },
      },
      create: {
        productId: product.id,
        shopifyVariantId: variant.id,
        title: variant.title,
        sku: variant.sku,
        barcode: variant.barcode,
        option1: options[0]?.value || null,
        option2: options[1]?.value || null,
        option3: options[2]?.value || null,
        price: parseFloat(variant.price),
        compareAtPrice: variant.compareAtPrice ? parseFloat(variant.compareAtPrice) : null,
        totalInventory: variant.inventoryQuantity,
        availableForSale: variant.inventoryQuantity > 0,
        imageUrl: variant.image?.url || null,
      },
      update: {
        title: variant.title,
        sku: variant.sku,
        barcode: variant.barcode,
        option1: options[0]?.value || null,
        option2: options[1]?.value || null,
        option3: options[2]?.value || null,
        price: parseFloat(variant.price),
        compareAtPrice: variant.compareAtPrice ? parseFloat(variant.compareAtPrice) : null,
        totalInventory: variant.inventoryQuantity,
        availableForSale: variant.inventoryQuantity > 0,
        imageUrl: variant.image?.url || null,
      },
    });
  }
}

// Función auxiliar para extraer metadatos de tags
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
