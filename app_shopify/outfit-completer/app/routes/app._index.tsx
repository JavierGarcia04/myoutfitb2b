// =============================================================================
// DASHBOARD: Home
// Página principal de la app Outfit Completer
// =============================================================================

import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Link as RemixLink } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  Box,
  InlineStack,
  Badge,
  Icon,
  Banner,
  Divider,
} from "@shopify/polaris";
import {
  ChartVerticalFilledIcon,
  SettingsIcon,
  ProductIcon,
  CheckCircleIcon,
  AlertCircleIcon,
} from "@shopify/polaris-icons";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { getRecentAnalytics } from "../services/analytics.server";
import db from "../db.server";

interface LoaderData {
  shop: {
    syncStatus: string;
    lastSyncAt: string | null;
    productCount: number;
    aiConfigured: boolean;
  };
  analytics: {
    impressions: number;
    clicks: number;
    addToCarts: number;
    ctr: number;
  };
  isReady: boolean;
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  let shop = await db.shop.findUnique({
    where: { shopDomain: session.shop },
    select: {
      id: true,
      syncStatus: true,
      lastSyncAt: true,
      aiApiKey: true,
      _count: {
        select: {
          products: { where: { status: "ACTIVE" } },
        },
      },
    },
  });

  // Crear shop si no existe
  if (!shop) {
    shop = await db.shop.create({
      data: { shopDomain: session.shop },
      select: {
        id: true,
        syncStatus: true,
        lastSyncAt: true,
        aiApiKey: true,
        _count: {
          select: {
            products: { where: { status: "ACTIVE" } },
          },
        },
      },
    });
  }

  const analytics = await getRecentAnalytics(shop.id, 7);

  const isReady =
    shop.syncStatus === "SYNCED" &&
    shop._count.products > 0;

  return json<LoaderData>({
    shop: {
      syncStatus: shop.syncStatus,
      lastSyncAt: shop.lastSyncAt?.toISOString() || null,
      productCount: shop._count.products,
      aiConfigured: !!shop.aiApiKey,
    },
    analytics: {
      impressions: analytics.impressions,
      clicks: analytics.clicks,
      addToCarts: analytics.addToCarts,
      ctr: analytics.ctr,
    },
    isReady,
  });
};

export default function Index() {
  const { shop, analytics, isReady } = useLoaderData<typeof loader>();

  return (
    <Page>
      <TitleBar title="Outfit Completer" />
      <BlockStack gap="500">
        {/* Banner de estado */}
        {!isReady && (
          <Banner
            title="Configuración pendiente"
            tone="warning"
            action={{
              content: "Ir a configuración",
              url: "/app/settings",
            }}
          >
            <p>
              Para que el widget funcione correctamente, necesitas sincronizar
              tus productos. Ve a la configuración para iniciar la
              sincronización.
            </p>
          </Banner>
        )}

        {isReady && (
          <Banner
            title="¡Tu app está lista!"
            tone="success"
          >
            <p>
              Outfit Completer está activo y mostrando recomendaciones en tu
              tienda. Revisa las estadísticas para ver el rendimiento.
            </p>
          </Banner>
        )}

        <Layout>
          {/* Estado del sistema */}
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Estado del sistema
                </Text>

                <InlineStack gap="400" wrap={true}>
                  <StatusItem
                    label="Sincronización"
                    status={shop.syncStatus === "SYNCED" ? "success" : "warning"}
                    value={
                      shop.syncStatus === "SYNCED"
                        ? "Completada"
                        : shop.syncStatus === "SYNCING"
                        ? "En progreso..."
                        : "Pendiente"
                    }
                  />

                  <StatusItem
                    label="Productos"
                    status={shop.productCount > 0 ? "success" : "warning"}
                    value={`${shop.productCount} sincronizados`}
                  />

                  <StatusItem
                    label="API de IA"
                    status={shop.aiConfigured ? "success" : "info"}
                    value={shop.aiConfigured ? "Configurada" : "Usando fallback"}
                  />
                </InlineStack>

                {shop.lastSyncAt && (
                  <>
                    <Divider />
                    <Text as="p" variant="bodySm" tone="subdued">
                      Última sincronización:{" "}
                      {new Date(shop.lastSyncAt).toLocaleString()}
                    </Text>
                  </>
                )}
              </BlockStack>
            </Card>
          </Layout.Section>

          {/* Métricas rápidas */}
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <InlineStack align="space-between">
                  <Text as="h2" variant="headingMd">
                    Últimos 7 días
                  </Text>
                  <RemixLink to="/app/analytics">
                    <Button variant="plain">Ver más</Button>
                  </RemixLink>
                </InlineStack>

                <InlineStack gap="400" wrap={true}>
                  <MetricCard
                    label="Impresiones"
                    value={analytics.impressions.toLocaleString()}
                  />
                  <MetricCard
                    label="Clics"
                    value={analytics.clicks.toLocaleString()}
                  />
                  <MetricCard
                    label="Add to Cart"
                    value={analytics.addToCarts.toLocaleString()}
                  />
                  <MetricCard
                    label="CTR"
                    value={`${analytics.ctr.toFixed(1)}%`}
                  />
                </InlineStack>
              </BlockStack>
            </Card>
          </Layout.Section>

          {/* Acciones rápidas */}
          <Layout.Section variant="oneThird">
            <BlockStack gap="500">
              <Card>
                <BlockStack gap="300">
                  <Text as="h2" variant="headingMd">
                    Acciones rápidas
                  </Text>

                  <BlockStack gap="200">
                    <RemixLink to="/app/analytics">
                      <Button
                        fullWidth
                        textAlign="left"
                        icon={<Icon source={ChartVerticalFilledIcon} />}
                      >
                        Ver analytics
                      </Button>
                    </RemixLink>

                    <RemixLink to="/app/settings">
                      <Button
                        fullWidth
                        textAlign="left"
                        icon={<Icon source={SettingsIcon} />}
                      >
                        Configuración
                      </Button>
                    </RemixLink>
                  </BlockStack>
                </BlockStack>
              </Card>

              <Card>
                <BlockStack gap="300">
                  <Text as="h2" variant="headingMd">
                    Cómo funciona
                  </Text>

                  <BlockStack gap="200">
                    <Text as="p" variant="bodySm">
                      1. Sincroniza tus productos con el botón de configuración
                    </Text>
                    <Text as="p" variant="bodySm">
                      2. El widget se mostrará automáticamente en las páginas de
                      producto
                    </Text>
                    <Text as="p" variant="bodySm">
                      3. Los clientes verán recomendaciones de outfits
                      personalizadas
                    </Text>
                    <Text as="p" variant="bodySm">
                      4. Monitorea el rendimiento en la sección de Analytics
                    </Text>
                  </BlockStack>
                </BlockStack>
              </Card>

              <Card>
                <BlockStack gap="300">
                  <Text as="h2" variant="headingMd">
                    Clasificación de productos
                  </Text>

                  <Text as="p" variant="bodySm" tone="subdued">
                    Para mejores recomendaciones, agrega estos tags a tus
                    productos:
                  </Text>

                  <Box
                    padding="300"
                    background="bg-surface-secondary"
                    borderRadius="200"
                  >
                    <BlockStack gap="100">
                      <Text as="p" variant="bodySm" fontWeight="semibold">
                        category:Camisetas
                      </Text>
                      <Text as="p" variant="bodySm" fontWeight="semibold">
                        color:Azul
                      </Text>
                      <Text as="p" variant="bodySm" fontWeight="semibold">
                        style:Casual
                      </Text>
                      <Text as="p" variant="bodySm" fontWeight="semibold">
                        gender:Hombre
                      </Text>
                    </BlockStack>
                  </Box>
                </BlockStack>
              </Card>
            </BlockStack>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}

// Componente auxiliar para estado
function StatusItem({
  label,
  status,
  value,
}: {
  label: string;
  status: "success" | "warning" | "info" | "critical";
  value: string;
}) {
  const toneMap = {
    success: "success",
    warning: "warning",
    info: "info",
    critical: "critical",
  } as const;

  return (
    <Box
      padding="300"
      background="bg-surface-secondary"
      borderRadius="200"
      minWidth="150px"
    >
      <BlockStack gap="100">
        <Text as="p" variant="bodySm" tone="subdued">
          {label}
        </Text>
        <InlineStack gap="200" align="start">
          <Badge tone={toneMap[status]}>{value}</Badge>
        </InlineStack>
      </BlockStack>
    </Box>
  );
}

// Componente auxiliar para métricas
function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <Box
      padding="400"
      background="bg-surface-secondary"
      borderRadius="200"
      minWidth="120px"
    >
      <BlockStack gap="100">
        <Text as="p" variant="bodySm" tone="subdued">
          {label}
        </Text>
        <Text as="p" variant="headingLg">
          {value}
        </Text>
      </BlockStack>
    </Box>
  );
}
