/**
 * API de recomendaciones del widget MyOutfit.
 * Usa el inventario real del usuario (Supabase) vía get_widget_recommendations.
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tdzglepfyqnteatmtfna.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { api_key, product_id, count } = req.query;

  if (!api_key || !product_id) {
    return res.status(400).json({
      error: 'api_key y product_id son requeridos',
      recommendations: [],
    });
  }

  const limit = Math.min(Math.max(parseInt(count, 10) || 3, 1), 10);

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const pid = String(product_id);

    // Obtener store_id por api_key
    const { data: storeData } = await supabase
      .from('stores')
      .select('id')
      .eq('api_key', api_key)
      .single();

    let currentProduct = null;
    if (storeData?.id) {
      let prod = null;
      const { data: byExternal } = await supabase
        .from('products')
        .select('id, external_id, name, price, image_url, product_url')
        .eq('store_id', storeData.id)
        .eq('is_active', true)
        .eq('external_id', pid)
        .maybeSingle();
      if (byExternal) prod = byExternal;
      else {
        const { data: byId } = await supabase
          .from('products')
          .select('id, external_id, name, price, image_url, product_url')
          .eq('store_id', storeData.id)
          .eq('is_active', true)
          .eq('id', pid)
          .maybeSingle();
        if (byId) prod = byId;
      }
      if (prod) {
        currentProduct = {
          product_id: prod.id,
          external_id: prod.external_id,
          name: prod.name || 'Producto',
          price: parseFloat(prod.price || 0),
          image_url: prod.image_url || '',
          product_url: prod.product_url || '',
        };
      }
    }

    const { data, error } = await supabase.rpc('get_widget_recommendations', {
      p_api_key: api_key,
      p_product_id: pid,
      p_count: limit,
    });

    if (error) {
      console.error('[recommendations] Supabase RPC error:', error);
      return res.status(500).json({
        error: 'Error al obtener recomendaciones',
        recommendations: [],
        current_product: null,
      });
    }

    const recommendations = data?.recommendations || [];
    const list = Array.isArray(recommendations) ? recommendations : [];

    return res.status(200).json({
      current_product: currentProduct,
      recommendations: list.map((p) => ({
        product_id: p.product_id || p.external_id,
        external_id: p.external_id,
        name: p.name || 'Producto',
        price: parseFloat(p.price || 0),
        image_url: p.image_url || '',
        product_url: p.product_url || '',
      })),
    });
  } catch (err) {
    console.error('[recommendations] Error:', err);
    return res.status(500).json({
      error: 'Error interno',
      recommendations: [],
    });
  }
}
