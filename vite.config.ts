import { reactRouter } from "@react-router/dev/vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  // react-router's vite plugin builds into build/client and build/server via
  // Vite's per-environment Environment API, not this top-level option. But
  // vite-plugin-pwa isn't environment-aware — it reads this field directly to
  // decide where to emit sw.js and to glob the precache list. Left unset, it
  // defaulted to Vite's "dist", so the service worker was built into a
  // directory that is both gitignored and never deployed: /sw.js was a 404 in
  // production and the PWA had no offline support at all.
  build: {
    outDir: "build/client",
  },
  plugins: [
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    tailwindcss(),
    reactRouter(),
    tsconfigPaths(),
    VitePWA({
      registerType: "autoUpdate",
      // "auto" injects a <script> into a built index.html — this app is SSR
      // with no static HTML entrypoint, so that injection had nothing to
      // attach to and registerSW.js was never referenced anywhere. The
      // service worker is registered explicitly instead, from
      // app/entry.client.tsx via the `virtual:pwa-register` module.
      injectRegister: false,
      manifest: {
        name: "ToolHub",
        short_name: "ToolHub",
        description: "Your Hub for Essential Tools",
        theme_color: "#3b82f6",
        background_color: "#ffffff",
        display: "standalone",
        icons: [
          {
            src: "/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/maskable-icon.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        // vite-plugin-pwa defaults this to "index.html", which is the SPA
        // app-shell pattern: one static HTML file precached and served for
        // every navigation. This app is SSR — every route is its own
        // server-rendered document and no index.html is ever built — so that
        // default silently pointed the navigation handler at a file that does
        // not exist in the precache manifest. Cleared here; the NetworkFirst
        // rule below caches actual page responses instead, so a page already
        // visited stays reachable offline without pretending an unvisited one
        // will.
        navigateFallback: undefined,
        // Without this, an updated worker activates but keeps waiting for
        // every open tab to close before it starts controlling anything —
        // so the first reload after a fresh install still fetches over the
        // network uncontrolled, and "offline ready" would only be true from
        // the *second* browser session onward.
        clientsClaim: true,
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.mode === "navigate",
            handler: "NetworkFirst",
            options: {
              cacheName: "pages-cache",
              networkTimeoutSeconds: 3,
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // <== 365 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "gstatic-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // <== 365 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
});
