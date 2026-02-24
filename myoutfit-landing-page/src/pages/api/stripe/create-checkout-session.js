import Stripe from 'stripe';

/**
 * API para crear sesión de Stripe Checkout.
 * Usa los Price IDs de las suscripciones ya creadas en Stripe.
 *
 * Opción 1 - Price IDs (recomendado): STRIPE_PRICE_STARTER_MONTHLY, STRIPE_PRICE_PRO_MONTHLY, etc.
 * Opción 2 - Product IDs: STRIPE_PRODUCT_STARTER, STRIPE_PRODUCT_PRO (obtiene el precio por defecto)
 */
const PRODUCT_IDS = {
  starter: process.env.STRIPE_PRODUCT_STARTER?.trim() || 'prod_TxsbrCBFpitbwx',
  pro: process.env.STRIPE_PRODUCT_PRO?.trim() || 'prod_TxsbyG1QwV0RHT',
};

const getPriceIdFromEnv = (plan, interval) => {
  const key = `STRIPE_PRICE_${plan.toUpperCase()}_${interval.toUpperCase()}`;
  return (process.env[key] || '').trim();
};

async function resolvePriceId(stripe, plan, interval) {
  const envPriceId = getPriceIdFromEnv(plan, interval);
  if (envPriceId && envPriceId.startsWith('price_')) return envPriceId;

  if (interval === 'annual') return null;

  const productId = PRODUCT_IDS[plan];
  if (!productId || !productId.startsWith('prod_')) return null;

  const product = await stripe.products.retrieve(productId);
  let priceId = product.default_price;
  if (typeof priceId === 'object' && priceId?.id) priceId = priceId.id;
  return priceId || null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { plan, interval = 'monthly' } = req.body;

  if (!plan || !['starter', 'pro'].includes(plan)) {
    return res.status(400).json({ error: 'Plan inválido. Debe ser "starter" o "pro".' });
  }

  if (!['monthly', 'annual'].includes(interval)) {
    return res.status(400).json({ error: 'Intervalo inválido. Debe ser "monthly" o "annual".' });
  }

  const secretKey = (process.env.STRIPE_SECRET_KEY || '').trim();
  if (!secretKey || !secretKey.startsWith('sk_')) {
    return res.status(500).json({
      error: 'Configuración de Stripe incompleta. Revisa STRIPE_SECRET_KEY en .env.local',
    });
  }

  const stripe = new Stripe(secretKey);
  const priceId = await resolvePriceId(stripe, plan, interval);

  if (!priceId || !priceId.startsWith('price_')) {
    const msg =
      interval === 'annual'
        ? `No hay precio anual configurado para ${plan}. Añade STRIPE_PRICE_${plan.toUpperCase()}_ANNUAL en .env.local.`
        : `No se encontró precio para ${plan}. Configura STRIPE_PRICE_${plan.toUpperCase()}_MONTHLY o STRIPE_PRODUCT_${plan.toUpperCase()} en .env.local.`;
    return res.status(500).json({ error: msg });
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || req.headers.origin || 'http://localhost:3000';
    const successUrl = `${baseUrl}/b2b/register?session_id={CHECKOUT_SESSION_ID}&plan=${plan}`;
    const cancelUrl = `${baseUrl}/b2b/pricing`;

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { plan, interval },
      allow_promotion_codes: true,
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    let msg = error.message || 'Error al crear la sesión de pago.';
    if (msg.includes('Invalid API Key') || msg.includes('No such price')) {
      msg =
        'Revisa las claves y Price IDs en .env.local. Ve a Stripe Dashboard > Products > [Producto] > Precio y copia el ID (price_...).';
    }
    return res.status(500).json({ error: msg });
  }
}
