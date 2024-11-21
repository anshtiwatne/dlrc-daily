import type { NextConfig } from "next"

const nextConfig: NextConfig = {
	output: "export",
	distDir: "dist",
	images: {
		unoptimized: true,
	},
	experimental: {
		reactCompiler: true,
	},
	reactStrictMode: true,
	eslint: {
		ignoreDuringBuilds: true,
	},
}

export default nextConfig
