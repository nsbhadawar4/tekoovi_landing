import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import tailwindcss from "@tailwindcss/vite";

/**
 * Asset build only.
 *
 * Node is a build-time tool here, never a runtime one: `npm run build` writes
 * hashed CSS/JS plus a manifest into public/build, and Laravel serves those
 * files itself. Nothing on the production host needs Node installed — commit
 * public/build (or run the build in CI) and PHP is the only runtime.
 */
export default defineConfig({
  plugins: [
    laravel({
      input: [
        "resources/css/app.css",
        "resources/js/app.js",
        "resources/js/admin.js",
      ],
      refresh: true,
    }),
    tailwindcss(),
  ],
  build: {
    // Cheap shared hosting rarely gzips well; keep the payload small.
    cssMinify: true,
    chunkSizeWarningLimit: 700,
  },
});
