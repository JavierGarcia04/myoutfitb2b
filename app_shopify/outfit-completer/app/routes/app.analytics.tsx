// =============================================================================
// DASHBOARD: Analytics
// Panel de estadísticas de rendimiento del widget de recomendaciones
// =============================================================================

import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  Text,
  BlockStack,
  InlineStack,
  Box,
  Badge,
  ProgressBar,
  DataTable,
  EmptyState,
  Banner,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import {
  getRecentAnalytics,
  getProductPerformance,
  getDailyTrend,
  type AnalyticsSummary,
  type ProductPerformance,
} from "../services/analytics.server";
import db from "../db.server";

interface LoaderData {
  summary: AnalyticsSummary;
  topProducts: ProductPerformance[];
  dailyTrend: Array<{
    date: string;
    impressions: number;
    clicks: number;
    addToCarts: number;
  }>;
  hasData: boolean;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const { session } = await authenticate.admin(request);

  const shop = await db.shop.findUnique({
    where: { shopDomain: session.shop },
    select: { id: true },
  });

  if (!shop) {
    return json<LoaderData>({
      summary: {
        period: "",
        impressions: 0,
        views: 0,
        clicks: 0,
        addToCarts: 0,
        purchases: 0,
        ctr: 0,
        addToCartRate: 0,
        conversionRate: 0,
      },
      topProducts: [],
      dailyTrend: [],
      hasData: false,
    });
  }

  const [summary, topProducts, dailyTrend] = await Promise.all([
    getRecentAnalytics(shop.id, 30),
    getProductPerformance(
      shop.id,
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      new Date(),
      10
    ),
    getDailyTrend(shop.id, 30),
  ]);

  return json<LoaderData>({
    summary,
    topProducts,
    dailyTrend,
    hasData: summary.impressions > 0,
  });
}

export default function AnalyticsDashboard() {
  const { summary, topProducts, hasData } = useLoaderData<typeof loader>();

  if (!hasData) {
    return (
      <Page title="Analytics">
        <Layout>
          <Layout.Section>
            <Card>
              <EmptyState
                heading="No hay datos de analytics todavía"
                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
              >
                <p>
                  Una vez que los clientes empiecen a ver recomendaciones en tu
                  tienda, verás las estadísticas aquí.
                </p>
              </EmptyState>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  return (
    <Page title="Analytics">
      <Layout>
        {/* Banner informativo */}
        <Layout.Section>
          <Banner tone="info">
            <p>
              Estadísticas de los últimos 30 días. Los datos se actualizan en
              tiempo real.
            </p>
          </Banner>
        </Layout.Section>

        {/* Métricas principales */}
        <Layout.Section>
          <InlineStack gap="400" wrap={false}>
            <Box width="25%">
              <Card>
                <BlockStack gap="200">
                  <Text as="h3" variant="headingSm" tone="subdued">
                    Impresiones
                  </Text>
                  <Text as="p" variant="headingXl">
                    {summary.impressions.toLocaleString()}
                  </Text>
                  <Text as="p" variant="bodySm" tone="subdued">
                    Veces que se mostró el widget
                  </Text>
                </BlockStack>
              </Card>
            </Box>

            <Box width="25%">
              <Card>
                <BlockStack gap="200">
                  <Text as="h3" variant="headingSm" tone="subdued">
                    Clics
                  </Text>
                  <Text as="p" variant="headingXl">
                    {summary.clicks.toLocaleString()}
                  </Text>
                  <InlineStack gap="200" align="start">
                    <Badge tone="success">
                      CTR: {summary.ctr.toFixed(1)}%
                    </Badge>
                  </InlineStack>
                </BlockStack>
              </Card>
            </Box>

            <Box width="25%">
              <Card>
                <BlockStack gap="200">
                  <Text as="h3" variant="headingSm" tone="subdued">
                    Agregar al carrito
                  </Text>
                  <Text as="p" variant="headingXl">
                    {summary.addToCarts.toLocaleString()}
                  </Text>
                  <InlineStack gap="200" align="start">
                    <Badge tone="attention">
                      Rate: {summary.addToCartRate.toFixed(1)}%
                    </Badge>
                  </InlineStack>
                </BlockStack>
              </Card>
            </Box>

            <Box width="25%">
              <Card>
                <BlockStack gap="200">
                  <Text as="h3" variant="headingSm" tone="subdued">
                    Compras
                  </Text>
                  <Text as="p" variant="headingXl">
                    {summary.purchases.toLocaleString()}
                  </Text>
                  <InlineStack gap="200" align="start">
                    <Badge tone="success">
                      Conv: {summary.conversionRate.toFixed(1)}%
                    </Badge>
                  </InlineStack>
                </BlockStack>
              </Card>
            </Box>
          </InlineStack>
        </Layout.Section>

        {/* Funnel de conversión */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                Funnel de conversión
              </Text>

              <BlockStack gap="300">
                <FunnelStep
                  label="Impresiones del widget"
                  value={summary.impressions}
                  percentage={100}
                />
                <FunnelStep
                  label="Clics en recomendaciones"
                  value={summary.clicks}
                  percentage={
                    summary.impressions > 0
                      ? (summary.clicks / summary.impressions) * 100
                      : 0
                  }
                />
                <FunnelStep
                  label="Agregar al carrito"
                  value={summary.addToCarts}
                  percentage={
                    summary.impressions > 0
                      ? (summary.addToCarts / summary.impressions) * 100
                      : 0
                  }
                />
                <FunnelStep
                  label="Compras completadas"
                  value={summary.purchases}
                  percentage={
                    summary.impressions > 0
                      ? (summary.purchases / summary.impressions) * 100
                      : 0
                  }
                />
              </BlockStack>
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* Productos más clickeados */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                Productos recomendados más populares
              </Text>

              {topProducts.length > 0 ? (
                <DataTable
                  columnContentTypes={[
                    "text",
                    "numeric",
                    "numeric",
                    "numeric",
                    "numeric",
                  ]}
                  headings={[
                    "Producto",
                    "Impresiones",
                    "Clics",
                    "Add to cart",
                    "CTR",
                  ]}
                  rows={topProducts.map((product) => [
                    product.title.length > 40
                      ? product.title.substring(0, 40) + "..."
                      : product.title,
                    product.impressions.toLocaleString(),
                    product.clicks.toLocaleString(),
                    product.addToCarts.toLocaleString(),
                    `${product.ctr.toFixed(1)}%`,
                  ])}
                />
              ) : (
                <Text as="p" tone="subdued">
                  No hay datos suficientes para mostrar productos populares.
                </Text>
              )}
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

// Componente auxiliar para el funnel
function FunnelStep({
  label,
  value,
  percentage,
}: {
  label: string;
  value: number;
  percentage: number;
}) {
  return (
    <BlockStack gap="100">
      <InlineStack align="space-between">
        <Text as="span" variant="bodySm">
          {label}
        </Text>
        <Text as="span" variant="bodySm" fontWeight="semibold">
          {value.toLocaleString()} ({percentage.toFixed(1)}%)
        </Text>
      </InlineStack>
      <ProgressBar progress={percentage} size="small" tone="primary" />
    </BlockStack>
  );
}

