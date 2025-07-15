import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Otimizações de performance
  swcMinify: true,
  compress: true,

  // Configurações de imagem
  images: {
    domains: ["localhost"],
    formats: ["image/webp", "image/avif"],
  },

  // Headers de segurança
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
        ],
      },
    ];
  },

  // Variáveis de ambiente
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // Configurações de build
  experimental: {
    optimizeCss: true,
  },
};

export default nextConfig;
