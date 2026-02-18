/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // output: 'export' desactivado: las API routes (Stripe, etc.) no funcionan con export estático.
  // Si necesitas static export, usa Stripe Payment Links en lugar de la API.
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
