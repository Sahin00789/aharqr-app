import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  /**
   * Local dev API origin. Keep this in sync with the API's PORT:
   *   VITE_API_PROXY_TARGET wins, otherwise derive it from VITE_API_URL
   *   (e.g. http://localhost:3000/api -> http://localhost:3000), and fall
   *   back to the API's default port 3000.
   */
  const apiTarget = (() => {
    if (env.VITE_API_PROXY_TARGET) return env.VITE_API_PROXY_TARGET;
    let origin = 'http://localhost:3000';
    try {
      origin = new URL(env.VITE_API_URL ?? '').origin;
    } catch {
      // keep the default
    }
    // The API binds IPv4 (0.0.0.0); `localhost` can resolve to ::1 and fail.
    return origin.replace('//localhost', '//127.0.0.1');
  })();

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    resolve: {
      dedupe: ['pdfkit'],
    },
    optimizeDeps: {
      include: ['@react-pdf/renderer'],
    },
    server: {
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
        },
        '/ws': {
          target: apiTarget,
          ws: true,
          changeOrigin: true,
        },
      },
    },
  };
});
