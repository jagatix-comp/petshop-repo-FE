import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
    optimizeDeps: {
      exclude: ["lucide-react"],
    },
    define: {
      // Make env variables available to the app
      __APP_ENV__: JSON.stringify(env.APP_ENV),
    },
    server: {
      port: 5173,
      host: "localhost",
      // Proxy for development to avoid CORS issues and handle cookies properly
      proxy:
        mode === "development"
          ? {
              "/api": {
                target: "http://103.54.170.35:8001/api/v1",
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, ""),
                secure: false,
                // Ensure cookies are properly forwarded
                configure: (proxy, _options) => {
                  proxy.on("proxyReq", (proxyReq, req, _res) => {
                    // Log the proxied request
                    console.log(
                      `🔄 Proxying ${req.method} ${
                        req.url
                      } to ${proxyReq.getHeader("host")}`
                    );
                  });
                },
              },
            }
          : undefined,
    },
    preview: {
      port: 4173,
      host: true,
    },
  };
});
