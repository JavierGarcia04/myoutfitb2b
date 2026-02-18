import Stripe from 'stripe';

// Product IDs de Stripe (planes mensuales)
const STRIPE_PRODUCTS = {
  starter: 'prod_TxsbrCBFpitbwx',   // Starter Mensual €49/mes
  pro: 'prod_TxsbyG1QwV0RHT',     // Pro Mensual €149/mes
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { plan } = req.body;

  if (!plan || !['starter', 'pro'].includes(plan)) {
    return res.status(400).json({ error: 'Plan inválido. Debe ser "starter" o "pro".' });
  }

  const secretKey = (process.env.STRIPE_SECRET_KEY || '').trim();
  if (!secretKey || !secretKey.startsWith('sk_')) {
    return res.status(500).json({ error: 'Configuración de Stripe incompleta. Revisa STRIPE_SECRET_KEY en .env.local' });
  }

  const stripe = new Stripe(secretKey);

  try {
    const productId = STRIPE_PRODUCTS[plan];
    const product = await stripe.products.retrieve(productId);

    // Obtener el precio por defecto del producto
    let priceId = product.default_price;
    if (typeof priceId === 'object' && priceId?.id) {
      priceId = priceId.id;
    }
    if (!priceId) {
      return res.status(500).json({ error: 'No se encontró el precio del producto en Stripe.' });
    }

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
      metadata: {
        plan,
      },
      allow_promotion_codes: true,
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    let msg = error.message || 'Error al crear la sesión de pago.';
    if (msg.includes('Invalid API Key')) {
      msg = 'Clave de Stripe inválida. Ve al Dashboard de Stripe > Developers > API keys, copia de nuevo la clave secreta (sk_test_...) y actualízala en .env.local. Reinicia el servidor.';
    }
    return res.status(500).json({ error: msg });
  }
}
