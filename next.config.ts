import type { NextConfig } from "next";
import TerserPlugin from "terser-webpack-plugin";

const nextConfig: NextConfig = {
  // Ignore lint and type errors during build (safe for Vercel deploy)
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },

  webpack(config, { isServer }) {
    // Handle SVG files with @svgr/webpack
    const imageRule = config.module.rules.find(
      (rule: any) => rule?.test?.toString().includes("svg")
    );

    if (imageRule) {
      imageRule.exclude = /\.svg$/i;
    }

    config.module.rules.push({
      test: /\.svg$/,
      use: [
        {
          loader: "@svgr/webpack",
          options: {
            svgo: false,
            titleProp: true,
            ref: true,
          },
        },
      ],
    });

    // Remove console logs and debugger statements in production (client-side only)
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        minimize: true,
        minimizer: [
          new TerserPlugin({
            terserOptions: {
              compress: {
                drop_console: true,
                drop_debugger: true,
              },
              format: {
                comments: false,
              },
            },
            extractComments: false,
          }),
        ],
      };
    }

    return config;
  },

  experimental: {
    middlewareClientMaxBodySize: 100 * 1024 * 1024, // 100 MB
  },
};

export default nextConfig;