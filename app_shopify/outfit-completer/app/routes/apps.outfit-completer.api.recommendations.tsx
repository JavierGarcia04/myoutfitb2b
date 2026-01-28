// =============================================================================
// App Proxy Route: /apps/outfit-completer/api/recommendations
// This route handles requests from the storefront via App Proxy
// =============================================================================

import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import db from "../db.server";

// Headers for storefront responses (no CORS needed for same-origin proxy)
const responseHeaders = {
  "Content-Type": "application/json",
  "Cache-Control": "public, max-age=300",
};

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  
  // Get parameters
  const shop = url.searchParams.get("shop");
  const productId = url.searchParams.get("product_id");
  const limit = parseInt(url.searchParams.get("limit") || "4");

  if (!shop || !productId) {
    return json(
      { 
        success: false, 
        error: "Missing required parameters: shop and product_id" 
      },
      { status: 400, headers: responseHeaders }
    );
  }

  try {
    // First, try to get AI-generated recommendations from our database
    const recommendation = await db.outfitRecommendation.findFirst({
      where: {
        sourceProductId: productId,
        shop: {
          shopDomain: shop,
        },
        isActive: true,
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                variants: {
                  take: 1,
                  where: {
                    inventoryQuantity: { gt: 0 },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (recommendation && recommendation.items.length > 0) {
      return json({
        success: true,
        data: {
          id: recommendation.id,
          outfit_name: recommendation.outfitName,
          outfit_description: recommendation.outfitDescription,
          products: recommendation.items.slice(0, limit).map((item) => ({
            id: item.product.id,
            shopify_product_id: item.product.shopifyProductId,
            title: item.product.title,
            handle: item.product.handle,
            vendor: item.product.vendor,
            image_url: item.product.featuredImageUrl,
            price: item.product.variants[0]?.price || 0,
            compare_at_price: item.product.variants[0]?.compareAtPrice,
            variant_id: item.product.variants[0]?.shopifyVariantId,
            match_reason: item.matchReason,
          })),
        },
      }, { headers: responseHeaders });
    }

    // Fallback: Get related products from same type/vendor
    const sourceProduct = await db.product.findFirst({
      where: {
        shopifyProductId: productId,
        shop: {
          shopDomain: shop,
        },
      },
    });

    if (sourceProduct) {
      const relatedProducts = await db.product.findMany({
        where: {
          shopId: sourceProduct.shopId,
          id: { not: sourceProduct.id },
          status: "ACTIVE",
          OR: [
            { productType: sourceProduct.productType },
            { vendor: sourceProduct.vendor },
          ],
        },
        include: {
          variants: {
            take: 1,
            where: {
              inventoryQuantity: { gt: 0 },
            },
          },
        },
        take: limit,
      });

      if (relatedProducts.length > 0) {
        return json({
          success: true,
          data: {
            id: `fallback_${productId}`,
            outfit_name: "You May Also Like",
            outfit_description: "Products that complement your selection",
            products: relatedProducts.map((p) => ({
              id: p.id,
              shopify_product_id: p.shopifyProductId,
              title: p.title,
              handle: p.handle,
              vendor: p.vendor,
              image_url: p.featuredImageUrl,
              price: p.variants[0]?.price || 0,
              compare_at_price: p.variants[0]?.compareAtPrice,
              variant_id: p.variants[0]?.shopifyVariantId,
              match_reason: "Related product",
            })),
          },
        }, { headers: responseHeaders });
      }
    }

    // No recommendations available
    return json({
      success: true,
      data: null,
      message: "No recommendations available",
    }, { headers: responseHeaders });

  } catch (error) {
    console.error("[App Proxy] recommendations error:", error);
    return json(
      { 
        success: false, 
        error: "Failed to fetch recommendations" 
      },
      { status: 500, headers: responseHeaders }
    );
  }
}


