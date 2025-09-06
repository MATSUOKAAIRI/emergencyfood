import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // SSG対応の最適化
  output: 'standalone',

  // 画像最適化
  images: {
    formats: ['image/webp', 'image/avif'],
  },

  // 圧縮とキャッシュ最適化
  compress: true,

  // 静的ページの生成設定
  generateStaticParams: true,

  // パフォーマンス最適化
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@/components', '@/utils', '@/hooks'],
  },

  // セキュリティヘッダー
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
