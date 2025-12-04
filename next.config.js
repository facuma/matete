/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    // Deshabilitar optimizaciones que pueden causar SIGILL en algunos servidores
    experimental: {
        // Deshabilitar ISR y SSG durante build para evitar SIGILL
        isrFlushToDisk: false,
    },
    // Generar rutas dinámicamente en runtime, no durante build
    generateBuildId: async () => {
        return 'build-' + Date.now()
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'imgs.search.brave.com',
            },
            {
                protocol: 'https',
                hostname: 'i.pinimg.com',
            },
        ],
    },
};

module.exports = nextConfig;
