/**
 * Productos de ropa de ejemplo para la vista previa del widget y demos.
 * Imágenes de Unsplash (moda/ropa).
 */
export const SAMPLE_CLOTHING_PRODUCTS = [
  { name: 'Camiseta Básica Blanca', price: 24.99, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=120&h=120&fit=crop' },
  { name: 'Pantalón Negro Slim', price: 49.99, image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=120&h=120&fit=crop' },
  { name: 'Zapatillas Blancas Deportivas', price: 79.99, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=120&h=120&fit=crop' },
  { name: 'Chaqueta Vaquera Azul', price: 89.99, image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=120&h=120&fit=crop' },
  { name: 'Vestido Floral Midi', price: 59.99, image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=120&h=120&fit=crop' },
  { name: 'Sudadera Gris con Capucha', price: 45.99, image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=120&h=120&fit=crop' },
  { name: 'Pantalón Chino Beige', price: 54.99, image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=120&h=120&fit=crop' },
  { name: 'Camisa Oxford Azul', price: 39.99, image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=120&h=120&fit=crop' },
  { name: 'Falda Plisada Negra', price: 34.99, image: 'https://images.unsplash.com/photo-1583496661160-fb5886a0eb67?w=120&h=120&fit=crop' },
  { name: 'Botas de Cuero Marrón', price: 119.99, image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=120&h=120&fit=crop' },
  { name: 'Jersey de Punto Verde', price: 42.99, image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=120&h=120&fit=crop' },
  { name: 'Shorts Deportivos Negro', price: 29.99, image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=120&h=120&fit=crop' },
  { name: 'Blazer Formal Negro', price: 129.99, image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=120&h=120&fit=crop' },
  { name: 'Bolso de Cuero Marrón', price: 69.99, image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=120&h=120&fit=crop' },
  { name: 'Gorra Baseball Azul', price: 19.99, image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=120&h=120&fit=crop' },
];

/**
 * Obtiene productos aleatorios del catálogo de ejemplo
 */
export function getRandomClothingProducts(count = 3) {
  const shuffled = [...SAMPLE_CLOTHING_PRODUCTS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map((p, i) => ({
    product_id: `DEMO-${i + 1}`,
    name: p.name,
    price: p.price,
    image_url: p.image,
    match_score: 0.9 - i * 0.05,
  }));
}
