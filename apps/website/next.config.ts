import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // images: {
  //   domains: [
  //     "oppsys.io",
  //     "app.oppsys.io",
  //     "admin.oppsys.io",
  //     "api.oppsys.io",
  //     "n8n.oppsys.io",
  //   ],
  //   formats: ["image/webp", "image/avif"],
  // },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  // Headers de sécurité
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
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "img-src 'self' data: https://*.googleapis.com https://n8n.oppsys.io",
              "font-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com",
              "style-src 'self' https://fonts.googleapis.com 'unsafe-inline'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://api.oppsys.io",
            ].join("; "),
          },
        ],
      },
    ];
  },

  // Redirections vers l'app pour certaines routes
  async redirects() {
    return [
      {
        source: "/dashboard",
        destination: process.env.NEXT_PUBLIC_APP_URL + "/dashboard",
        permanent: false,
      },
      {
        source: "/app/:path*",
        destination: process.env.NEXT_PUBLIC_APP_URL + "/:path*",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
