import {
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import { Suspense } from "react";
import { useTranslation } from "react-i18next";
import { Compass, Home } from "lucide-react";

import type { Route } from "./+types/root";
import { Toaster } from "sonner";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import "./app.css";

import { CommandMenu } from "./components/CommandMenu";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
  {
    rel: "stylesheet",
    href: "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
    integrity: "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=",
    crossOrigin: "anonymous",
  },
  { rel: "icon", type: "image/png", href: "/favicon.png" },
  { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
  { rel: "manifest", href: "/manifest.webmanifest" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="ToolHub" />
        <Meta />
        <Links />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const savedTheme = localStorage.getItem("theme");
                  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
                  const theme = savedTheme || systemTheme;
                  if (theme === "dark") {
                    document.documentElement.classList.add("dark");
                  } else {
                    document.documentElement.classList.remove("dark");
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="flex min-h-screen overflow-x-hidden bg-white dark:bg-slate-800">
        <CommandMenu>
          <Suspense
            fallback={
              <>
                <div className="hidden sm:block w-64 h-screen shrink-0 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-white/10" />
                <div className="fixed inset-x-0 top-0 z-40 h-14 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-white/10 sm:hidden" />
              </>
            }
          >
            <Navbar />
          </Suspense>
          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex-1 relative pt-14 sm:pt-0">
              {children}
            </div>
            <Footer />
          </div>
          <Toaster position="bottom-right" richColors />
          <ScrollRestoration />
          <Scripts />
        </CommandMenu>
      </body>
    </html>
  );
}

import { NuqsAdapter } from 'nuqs/adapters/react-router/v7';

export default function App() {
  return (
    <NuqsAdapter>
      <Outlet />
    </NuqsAdapter>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const { t } = useTranslation();
  const is404 = isRouteErrorResponse(error) && error.status === 404;

  let details = t("error_boundary.description");
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    details = is404 ? t("not_found.description") : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="relative flex items-center justify-center">
          <span
            aria-hidden
            className="text-8xl md:text-9xl font-black tracking-tight bg-gradient-to-br from-blue-500 to-indigo-600 bg-clip-text text-transparent select-none"
          >
            {is404 ? "404" : "500"}
          </span>
          <Compass
            aria-hidden
            className="absolute w-10 h-10 text-blue-500/40 dark:text-blue-400/40 -rotate-12 top-0 right-6 md:right-10"
          />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {is404 ? t("not_found.title") : t("error_boundary.title")}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">{details}</p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
          >
            <Home className="w-4 h-4" />
            {is404 ? t("not_found.home") : t("error_boundary.home")}
          </Link>
          {is404 && (
            <Link
              to="/projects"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-400 dark:hover:border-blue-500 text-sm font-medium transition-colors"
            >
              {t("not_found.projects")}
            </Link>
          )}
        </div>

        {stack && (
          <pre className="w-full p-4 overflow-x-auto text-left text-xs rounded-xl bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400">
            <code>{stack}</code>
          </pre>
        )}
      </div>
    </main>
  );
}
