/** @type {import('next').NextConfig} */
const nextConfig = {
    // Ignora erros de ESLint durante o build (tratados separadamente no CI)
    eslint: {
        ignoreDuringBuilds: true,
    },
    // Ignora erros de TypeScript durante o build (tratados separadamente no CI)
    typescript: {
        ignoreBuildErrors: false,
    },
    // Otimizações de imagem
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**.supabase.co',
            },
            {
                protocol: 'https',
                hostname: '**.googleapis.com',
            },
        ],
    },
    // Headers de segurança
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY',
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin',
                    },
                ],
            },
        ]
    },
}

module.exports = nextConfig
