-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "scope" TEXT,
    "expires" DATETIME,
    "accessToken" TEXT NOT NULL,
    "userId" BIGINT,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT,
    "accountOwner" BOOLEAN NOT NULL DEFAULT false,
    "locale" TEXT,
    "collaborator" BOOLEAN DEFAULT false,
    "emailVerified" BOOLEAN DEFAULT false,
    "refreshToken" TEXT,
    "refreshTokenExpires" DATETIME
);

-- CreateTable
CREATE TABLE "Shop" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shopDomain" TEXT NOT NULL,
    "shopifyShopId" TEXT,
    "name" TEXT,
    "email" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "timezone" TEXT,
    "aiApiKey" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "syncStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "lastSyncAt" DATETIME,
    "installedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uninstalledAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shopId" TEXT NOT NULL,
    "shopifyProductId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "description" TEXT,
    "productType" TEXT,
    "vendor" TEXT,
    "tags" TEXT,
    "category" TEXT,
    "subcategory" TEXT,
    "color" TEXT,
    "style" TEXT,
    "season" TEXT,
    "gender" TEXT,
    "featuredImageUrl" TEXT,
    "images" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "publishedAt" DATETIME,
    "shopifyCreatedAt" DATETIME,
    "shopifyUpdatedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Product_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProductVariant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "shopifyVariantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "sku" TEXT,
    "barcode" TEXT,
    "option1" TEXT,
    "option2" TEXT,
    "option3" TEXT,
    "price" REAL NOT NULL,
    "compareAtPrice" REAL,
    "totalInventory" INTEGER NOT NULL DEFAULT 0,
    "availableForSale" BOOLEAN NOT NULL DEFAULT true,
    "imageUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InventoryLevel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "variantId" TEXT NOT NULL,
    "shopifyInventoryItemId" TEXT NOT NULL,
    "shopifyLocationId" TEXT NOT NULL,
    "available" INTEGER NOT NULL DEFAULT 0,
    "onHand" INTEGER,
    "committed" INTEGER,
    "incoming" INTEGER,
    "updatedAt" DATETIME NOT NULL,
    "shopifyUpdatedAt" DATETIME,
    CONSTRAINT "InventoryLevel_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OutfitRecommendation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shopId" TEXT NOT NULL,
    "mainProductId" TEXT NOT NULL,
    "outfitName" TEXT,
    "outfitDescription" TEXT,
    "confidence" REAL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "OutfitRecommendation_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OutfitRecommendation_mainProductId_fkey" FOREIGN KEY ("mainProductId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OutfitRecommendationItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "recommendationId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "matchReason" TEXT,
    CONSTRAINT "OutfitRecommendationItem_recommendationId_fkey" FOREIGN KEY ("recommendationId") REFERENCES "OutfitRecommendation" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OutfitRecommendationItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AnalyticsEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shopId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "productId" TEXT,
    "recommendedProductId" TEXT,
    "recommendationId" TEXT,
    "metadata" TEXT,
    "sessionId" TEXT,
    "userAgent" TEXT,
    "country" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AnalyticsEvent_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Shop_shopDomain_key" ON "Shop"("shopDomain");

-- CreateIndex
CREATE UNIQUE INDEX "Shop_shopifyShopId_key" ON "Shop"("shopifyShopId");

-- CreateIndex
CREATE UNIQUE INDEX "Product_shopId_shopifyProductId_key" ON "Product"("shopId", "shopifyProductId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariant_productId_shopifyVariantId_key" ON "ProductVariant"("productId", "shopifyVariantId");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryLevel_variantId_shopifyLocationId_key" ON "InventoryLevel"("variantId", "shopifyLocationId");

-- CreateIndex
CREATE UNIQUE INDEX "OutfitRecommendationItem_recommendationId_productId_key" ON "OutfitRecommendationItem"("recommendationId", "productId");
