import { HydratedRouter } from "react-router/dom";
import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import "./i18n";

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <HydratedRouter />
    </StrictMode>
  );
});

// This app is SSR with no static index.html, so vite-plugin-pwa's
// injectRegister has nothing to inject a <script> into — registration has to
// happen here explicitly, or /sw.js is built but never requested.
registerSW({ immediate: true });
