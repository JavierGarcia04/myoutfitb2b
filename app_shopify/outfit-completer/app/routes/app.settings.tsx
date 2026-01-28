// =============================================================================
// DASHBOARD: Settings
// Configuración de la aplicación y sincronización de inventario
// =============================================================================

import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useSubmit, useNavigation, useActionData } from "@remix-run/react";
import { useState, useCallback, useEffect } from "react";
import {
  Page,
  Layout,
  Card,
  Text,
  BlockStack,
  InlineStack,
  Button,
  TextField,
  Banner,
  Badge,
  Divider,
  Box,
  Link,
  Icon,
} from "@shopify/polaris";
import { ClipboardIcon, CheckIcon, ExternalIcon } from "@shopify/polaris-icons";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import { 
  linkShopifyStore, 
  validateApiKey, 
  validateShopSubscription,
  getShopApiKey,
  getStoreIdByShopifyDomain,
  clearApiKeyCache,
  bulkSyncToSupabase,
  syncAllAnalyticsToSupabase,
} from "../services/supabase.server";

interface LoaderData {
  shop: {
    name: string | null;
    shopDomain: string;
    syncStatus: string;
    lastSyncAt: string | null;
    productCount: number;
    aiApiConfigured: boolean;
  };
  myoutfit: {
    isConnected: boolean;
    isValid: boolean;
    storeName: string | null;
    plan: string | null;
    status: string | null;
    limits: {
      maxProducts: number;
      maxApiRequests: number;
      currentRequests: number;
    } | null;
    error: string | null;
  };
}

export async function loader({ request }: LoaderFunctionArgs) {
  const { session } = await authenticate.admin(request);

  let shop = await db.shop.findUnique({
    where: { shopDomain: session.shop },
    select: {
      name: true,
      shopDomain: true,
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

  // Si no existe el shop, crearlo
  if (!shop) {
    shop = await db.shop.create({
      data: { shopDomain: session.shop },
      select: {
        name: true,
        shopDomain: true,
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

  // Verificar conexión con MyOutfit
  let myoutfitInfo: LoaderData["myoutfit"] = {
    isConnected: false,
    isValid: false,
    storeName: null,
    plan: null,
    status: null,
    limits: null,
    error: null,
  };

  try {
    const validation = await validateShopSubscription(session.shop);
    
    if (validation.storeId) {
      const apiKey = await getShopApiKey(session.shop);
      const apiValidation = apiKey ? await validateApiKey(apiKey) : null;
      
      myoutfitInfo = {
        isConnected: true,
        isValid: validation.isValid,
        storeName: apiValidation?.store_name || null,
        plan: apiValidation?.subscription_plan || null,
        status: apiValidation?.subscription_status || null,
        limits: validation.limits || null,
        error: validation.isValid ? null : validation.reason || null,
      };
    } else {
      myoutfitInfo.error = validation.reason || "Not connected";
    }
  } catch (error) {
    myoutfitInfo.error = "Could not connect to MyOutfit service";
  }

  return json<LoaderData>({
    shop: {
      name: shop.name,
      shopDomain: shop.shopDomain,
      syncStatus: shop.syncStatus,
      lastSyncAt: shop.lastSyncAt?.toISOString() || null,
      productCount: shop._count.products,
      aiApiConfigured: !!shop.aiApiKey,
    },
    myoutfit: myoutfitInfo,
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const action = formData.get("action");

  if (action === "update_ai_key") {
    const aiApiKey = formData.get("aiApiKey") as string;

    await db.shop.update({
      where: { shopDomain: session.shop },
      data: { aiApiKey: aiApiKey || null },
    });

    return json({ success: true, message: "API key actualizada" });
  }

  if (action === "connect_myoutfit") {
    const myoutfitApiKey = formData.get("myoutfitApiKey") as string;

    if (!myoutfitApiKey) {
      return json({ success: false, message: "API Key es requerida" });
    }

    // Validar la API key primero
    const validation = await validateApiKey(myoutfitApiKey);

    if (!validation) {
      return json({ 
        success: false, 
        message: "API Key no encontrada. Verifica que la API Key sea correcta." 
      });
    }

    if (!validation.is_valid) {
      return json({ 
        success: false, 
        message: "API Key inválida o expirada. Por favor, verifica tu suscripción en myoutfit.app" 
      });
    }

    // Vincular la tienda Shopify con la tienda de MyOutfit
    const linkResult = await linkShopifyStore(
      myoutfitApiKey,
      session.shop,
      undefined // shopifyShopId - podemos obtenerlo después si es necesario
    );

    if (!linkResult.success) {
      return json({ 
        success: false, 
        message: linkResult.error || "Error al vincular la tienda" 
      });
    }

    // Limpiar caché para forzar recarga de datos
    clearApiKeyCache();

    // Sincronizar inventario y estadísticas a Supabase
    let syncMessage = "";
    if (linkResult.storeId) {
      try {
        const syncResult = await bulkSyncToSupabase(session.shop, linkResult.storeId);
        if (syncResult.success) {
          syncMessage = ` Se sincronizaron ${syncResult.productsSync.synced} productos y ${syncResult.analyticsSync.synced} días de estadísticas.`;
        }
      } catch (syncError) {
        console.error('[Settings] Sync error:', syncError);
        // No fallamos si la sincronización falla, la conexión ya está hecha
      }
    }

    return json({ 
      success: true, 
      message: `¡Conectado exitosamente! Tu tienda está vinculada a ${validation.store_name} (Plan ${validation.subscription_plan}).${syncMessage}` 
    });
  }

  if (action === "disconnect_myoutfit") {
    // No desvinculamos realmente, solo mostramos mensaje
    // El usuario puede reconectar con otra API key
    return json({ 
      success: true, 
      message: "Para cambiar de cuenta, simplemente ingresa una nueva API Key" 
    });
  }

  if (action === "sync_analytics") {
    try {
      const storeId = await getStoreIdByShopifyDomain(session.shop);
      
      if (!storeId) {
        return json({ 
          success: false, 
          message: "No estás conectado a MyOutfit. Configura tu API Key primero." 
        });
      }
      
      const result = await syncAllAnalyticsToSupabase(session.shop, storeId);
      
      return json({ 
        success: true, 
        message: `Estadísticas sincronizadas: ${result.synced} días actualizados.` 
      });
    } catch (error) {
      console.error('[Settings] Sync analytics error:', error);
      return json({ 
        success: false, 
        message: "Error al sincronizar estadísticas" 
      });
    }
  }

  return json({ success: false, message: "Acción no reconocida" });
}

export default function SettingsPage() {
  const { shop, myoutfit } = useLoaderData<typeof loader>();
  const actionData = useActionData<{ success: boolean; message: string }>();
  const submit = useSubmit();
  const navigation = useNavigation();
  const [aiApiKey, setAiApiKey] = useState("");
  const [myoutfitApiKey, setMyoutfitApiKey] = useState("");
  const [syncTriggered, setSyncTriggered] = useState(false);

  const isLoading = navigation.state === "submitting";
  const [justConnected, setJustConnected] = useState(false);

  // Efecto para recargar la página después de una conexión exitosa
  useEffect(() => {
    if (actionData?.success && actionData.message?.includes('Conectado') && !justConnected) {
      setJustConnected(true);
      // Esperar un momento y recargar para mostrar el estado actualizado
      const timer = setTimeout(() => {
        window.location.href = window.location.href; // Forzar recarga completa
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [actionData, justConnected]);

  const handleSync = useCallback(async () => {
    setSyncTriggered(true);
    
    try {
      const response = await fetch("/api/sync", {
        method: "POST",
      });
      
      const data = await response.json();
      
      if (data.success) {
        window.location.reload();
      } else {
        console.error("Sync error:", data.error);
        setSyncTriggered(false);
      }
    } catch (error) {
      console.error("Sync error:", error);
      setSyncTriggered(false);
    }
  }, []);

  const handleSaveApiKey = useCallback(() => {
    const formData = new FormData();
    formData.append("action", "update_ai_key");
    formData.append("aiApiKey", aiApiKey);
    submit(formData, { method: "post" });
  }, [aiApiKey, submit]);

  const handleConnectMyOutfit = useCallback(() => {
    const formData = new FormData();
    formData.append("action", "connect_myoutfit");
    formData.append("myoutfitApiKey", myoutfitApiKey);
    submit(formData, { method: "post" });
  }, [myoutfitApiKey, submit]);

  const handleSyncAnalytics = useCallback(() => {
    const formData = new FormData();
    formData.append("action", "sync_analytics");
    submit(formData, { method: "post" });
  }, [submit]);

  const getSyncStatusBadge = () => {
    switch (shop.syncStatus) {
      case "SYNCED":
        return <Badge tone="success">Sincronizado</Badge>;
      case "SYNCING":
        return <Badge tone="attention">Sincronizando...</Badge>;
      case "ERROR":
        return <Badge tone="critical">Error</Badge>;
      default:
        return <Badge tone="warning">Pendiente</Badge>;
    }
  };

  const getMyOutfitStatusBadge = () => {
    if (!myoutfit.isConnected) {
      return <Badge tone="warning">No conectado</Badge>;
    }
    if (!myoutfit.isValid) {
      return <Badge tone="critical">Suscripción inactiva</Badge>;
    }
    return <Badge tone="success">{`Conectado - ${myoutfit.plan || 'Activo'}`}</Badge>;
  };

  const getUsagePercentage = () => {
    if (!myoutfit.limits) return 0;
    return Math.round((myoutfit.limits.currentRequests / myoutfit.limits.maxApiRequests) * 100);
  };

  return (
    <Page title="Configuración">
      <Layout>
        {/* Mensaje de acción */}
        {actionData && (
          <Layout.Section>
            <Banner
              tone={actionData.success ? "success" : "critical"}
              onDismiss={() => {}}
            >
              <p>{actionData.message}</p>
            </Banner>
          </Layout.Section>
        )}

        {/* Conexión con MyOutfit */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <InlineStack align="space-between">
                <Text as="h2" variant="headingMd">
                  🔗 Conexión con MyOutfit
                </Text>
                {getMyOutfitStatusBadge()}
              </InlineStack>

              {myoutfit.isConnected && myoutfit.isValid ? (
                <>
                  <Banner tone="success">
                    <p>
                      Tu tienda está conectada a <strong>{myoutfit.storeName}</strong>.
                      Los datos de inventario y estadísticas se sincronizarán automáticamente con tu dashboard de MyOutfit.
                    </p>
                  </Banner>

                  <BlockStack gap="200">
                    <InlineStack gap="400">
                      <Box>
                        <Text as="p" variant="bodySm" tone="subdued">
                          Plan actual
                        </Text>
                        <Text as="p" variant="headingMd">
                          {myoutfit.plan?.charAt(0).toUpperCase()}{myoutfit.plan?.slice(1)}
                        </Text>
                      </Box>

                      <Box>
                        <Text as="p" variant="bodySm" tone="subdued">
                          Estado
                        </Text>
                        <Text as="p" variant="headingMd">
                          {myoutfit.status === 'active' ? '✅ Activo' : 
                           myoutfit.status === 'trial' ? '🎁 Prueba' : myoutfit.status}
                        </Text>
                      </Box>

                      {myoutfit.limits && (
                        <Box>
                          <Text as="p" variant="bodySm" tone="subdued">
                            Uso API este mes
                          </Text>
                          <Text as="p" variant="headingMd">
                            {myoutfit.limits.currentRequests.toLocaleString()} / {myoutfit.limits.maxApiRequests.toLocaleString()}
                            <Text as="span" variant="bodySm" tone="subdued"> ({getUsagePercentage()}%)</Text>
                          </Text>
                        </Box>
                      )}
                    </InlineStack>
                  </BlockStack>

                  <Divider />

                  <Text as="p" tone="subdued">
                    Para cambiar de cuenta o ver tu dashboard completo, visita{" "}
                    <Link url="https://myoutfit.app/dashboard" external>
                      myoutfit.app/dashboard
                    </Link>
                  </Text>
                </>
              ) : (
                <>
                  {myoutfit.error && (
                    <Banner tone="warning">
                      <p>{myoutfit.error}</p>
                    </Banner>
                  )}

                  <Text as="p" tone="subdued">
                    Conecta tu tienda Shopify con tu cuenta de MyOutfit para sincronizar
                    automáticamente el inventario y las estadísticas del widget.
                  </Text>

                  <BlockStack gap="200">
                    <Text as="p" variant="bodyMd">
                      <strong>¿No tienes cuenta?</strong>{" "}
                      <Link url="https://myoutfit.app/b2b/register" external>
                        Regístrate gratis
                      </Link>
                      {" "}y obtén 14 días de prueba.
                    </Text>

                    <Text as="p" variant="bodySm" tone="subdued">
                      Tu API Key la encontrarás en el dashboard de MyOutfit, en la sección "Widget".
                    </Text>
                  </BlockStack>

                  <TextField
                    label="API Key de MyOutfit"
                    type="password"
                    value={myoutfitApiKey}
                    onChange={setMyoutfitApiKey}
                    placeholder="sk_live_..."
                    autoComplete="off"
                    helpText="Copia tu API Key desde el dashboard de MyOutfit"
                  />

                  <Button
                    variant="primary"
                    onClick={handleConnectMyOutfit}
                    loading={isLoading}
                    disabled={!myoutfitApiKey || myoutfitApiKey.length < 10}
                  >
                    Conectar con MyOutfit
                  </Button>
                </>
              )}
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* Estado de sincronización */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <InlineStack align="space-between">
                <Text as="h2" variant="headingMd">
                  📦 Sincronización de inventario
                </Text>
                {getSyncStatusBadge()}
              </InlineStack>

              <BlockStack gap="200">
                <InlineStack gap="400">
                  <Box>
                    <Text as="p" variant="bodySm" tone="subdued">
                      Productos sincronizados
                    </Text>
                    <Text as="p" variant="headingLg">
                      {shop.productCount.toLocaleString()}
                    </Text>
                  </Box>

                  <Box>
                    <Text as="p" variant="bodySm" tone="subdued">
                      Última sincronización
                    </Text>
                    <Text as="p" variant="headingLg">
                      {shop.lastSyncAt
                        ? new Date(shop.lastSyncAt).toLocaleString()
                        : "Nunca"}
                    </Text>
                  </Box>
                </InlineStack>
              </BlockStack>

              <Divider />

              <Banner tone="info">
                <p>
                  Los productos se sincronizan automáticamente mediante webhooks
                  cuando hay cambios en Shopify. Usa el botón de sincronización
                  manual solo si es necesario.
                </p>
              </Banner>

              {myoutfit.isConnected && myoutfit.isValid && (
                <Banner tone="success">
                  <p>
                    ✅ Los productos también se sincronizan con tu dashboard de MyOutfit.
                  </p>
                </Banner>
              )}

              <InlineStack gap="300">
                <Button
                  variant="primary"
                  onClick={handleSync}
                  loading={syncTriggered || shop.syncStatus === "SYNCING"}
                  disabled={syncTriggered || shop.syncStatus === "SYNCING"}
                >
                  Sincronizar productos
                </Button>

                {myoutfit.isConnected && myoutfit.isValid && (
                  <Button
                    onClick={handleSyncAnalytics}
                    loading={isLoading}
                  >
                    Sincronizar estadísticas
                  </Button>
                )}
              </InlineStack>
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* Configuración de API de IA (opcional) */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <InlineStack align="space-between">
                <Text as="h2" variant="headingMd">
                  🤖 API de Inteligencia Artificial (Opcional)
                </Text>
                {shop.aiApiConfigured ? (
                  <Badge tone="success">Configurada</Badge>
                ) : (
                  <Badge>No configurada</Badge>
                )}
              </InlineStack>

              <Text as="p" tone="subdued">
                Configura la clave de API del servicio de IA que generará las
                recomendaciones de outfits avanzadas. Si no se configura, se usarán
                las recomendaciones nativas de Shopify.
              </Text>

              <TextField
                label="API Key (OpenAI, etc.)"
                type="password"
                value={aiApiKey}
                onChange={setAiApiKey}
                placeholder="sk-..."
                autoComplete="off"
              />

              <Button
                onClick={handleSaveApiKey}
                loading={isLoading}
                disabled={!aiApiKey}
              >
                Guardar API Key de IA
              </Button>
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* Información de la tienda */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                🏪 Información de la tienda
              </Text>

              <BlockStack gap="200">
                <InlineStack align="space-between">
                  <Text as="span" tone="subdued">
                    Dominio
                  </Text>
                  <Text as="span">{shop.shopDomain}</Text>
                </InlineStack>

                {shop.name && (
                  <InlineStack align="space-between">
                    <Text as="span" tone="subdued">
                      Nombre
                    </Text>
                    <Text as="span">{shop.name}</Text>
                  </InlineStack>
                )}

                {myoutfit.isConnected && (
                  <InlineStack align="space-between">
                    <Text as="span" tone="subdued">
                      Cuenta MyOutfit
                    </Text>
                    <Text as="span">{myoutfit.storeName ?? '-'}</Text>
                  </InlineStack>
                )}
              </BlockStack>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
