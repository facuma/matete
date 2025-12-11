/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    // Deshabilitar optimizaciones que pueden causar SIGILL en CPUs antiguos
    experimental: {
        // Deshabilitar ISR y SSG durante build para evitar SIGILL
        isrFlushToDisk: false,
    },
    // NO generar archivos estáticos durante build (evita SIGILL en CPUs viejos)
    outputFileTracing: false,
    // Generar rutas dinámicamente en runtime, no durante build
    generateBuildId: async () => {
        return 'build-' + Date.now()
    },
    // Deshabilitar optimizaciones de imagen que pueden causar SIGILL
    images: {
        unoptimized: true,
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'imgs.search.brave.com',
            },
            {
                protocol: 'https',
                hostname: 'i.pinimg.com',
            },
            {
                protocol: 'https',
                hostname: '*.r2.cloudflarestorage.com',
            },
        ],
    },
    // Deshabilitar minificación agresiva
    swcMinify: false,
};

module.exports = nextConfig;
