import type { NextConfig } from "next";

const staticExport =
  process.env.STATIC_EXPORT === "true" || process.env.NETLIFY === "true";

const nextConfig: NextConfig = staticExport
  ? {
      output: "export",
      trailingSlash: true,
      assetPrefix: ".",
      images: { unoptimized: true },
      typescript: { tsconfigPath: "tsconfig.static.json" },
    }
  : {};

export default nextConfig;
