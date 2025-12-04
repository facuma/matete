export default function robots() {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://matete.com.ar';

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin/', '/api/admin/'],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
