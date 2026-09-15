import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const base = env.VITE_BASE_PATH || '/';

  return {
    base,
    // PCだけでなく、同じWi-Fi上のスマートフォンからも開発画面を確認できるようにする。
    // 起動後にViteが表示する Network のURL（例: http://192.168.1.43:5173/）を使う。
    server: {
      host: '0.0.0.0',
      port: 5173,
      strictPort: true,
    },
    preview: {
      host: '0.0.0.0',
      port: 4173,
      strictPort: true,
    },
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['mailpin-icon.svg'],
        manifest: {
          name: 'MailPin',
          short_name: 'MailPin',
          lang: 'ja',
          description: 'OutlookメールからGoogleカレンダーの予定を作る、プライバシー重視のPWA',
          theme_color: '#eaf2ff',
          background_color: '#eaf2ff',
          display: 'standalone',
          start_url: './',
          scope: './',
          orientation: 'portrait-primary',
          icons: [
            {
              src: 'mailpin-icon.svg',
              sizes: 'any',
              type: 'image/svg+xml',
              purpose: 'any maskable'
            }
          ]
        },
        workbox: {
          // ビルド成果物だけを事前キャッシュする。Graph/OAuth/Googleへの
          // 通信を扱うruntimeCachingは意図的に設定しない。
          globPatterns: ['**/*.{js,css,html,svg,ico}'],
          navigateFallback: 'index.html',
          cleanupOutdatedCaches: true
        }
      })
    ],
    build: {
      emptyOutDir: true,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/@azure/msal')) return 'msal';
            if (id.includes('node_modules/react')) return 'react';
          }
        }
      }
    },
    test: {
      environment: 'node',
      include: ['src/**/*.test.ts']
    }
  };
});
