const { withSentryConfig } = require("@sentry/nextjs");

const moduleExports = {
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,
  swcMinify: true,
  reactStrictMode: true,
  async headers() {
    return [
      {
        // matching all API routes
        source: "/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,OPTIONS,PATCH,DELETE,POST,PUT",
          },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/api/user",
        destination: "/api/session",
        permanent: false,
      },
      {
        source: "/api/property/tasks/agenda",
        destination: "/api/property/tasks/perspectives",
        permanent: false,
      },
      {
        source: "/signup",
        destination: "/auth/signup",
        permanent: true,
      },
      {
        source: "/login",
        destination: "/auth",
        permanent: true,
      },
      {
        source: "/tasks",
        destination: "/tasks/perspectives/days",
        permanent: false,
      },
      {
        source: "/tasks/agenda/:path*",
        destination: "/tasks/perspectives/:path*",
        permanent: false,
      },
      {
        source: "/web\\+dysperse\\:/:path*",
        destination: "/:path*",
        permanent: false,
      },
      {
        source: "/discord",
        destination: "https://discord.gg/fvngmDzh77",
        permanent: true,
      },
    ];
  },
};

const sentryWebpackPluginOptions = {
  hideSourceMaps: true,
  silent: true,
};

if (process.env.NODE_ENV == "development") {
  module.exports = moduleExports;
} else {
  module.exports = withSentryConfig(moduleExports, sentryWebpackPluginOptions);
}
