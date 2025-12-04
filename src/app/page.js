import HomePageClient from '@/components/HomePageClient';

export const revalidate = 3600; // Revalidate every hour

async function getProducts() {
  try {
    // Usamos la URL completa porque esto se ejecuta en el servidor
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`, {
      cache: 'no-store' // Evitar cache durante build
    });
    if (!res.ok) {
      console.log('Failed to fetch products during build');
      return [];
    }
    return res.json();
  } catch (error) {
    console.log('Error fetching products during build:', error.message);
    return []; // Retornar array vacío si falla (durante build)
  }
}

async function getContent() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/content/home`, {
      cache: 'no-store'
    });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error('Error fetching content:', error);
    return null;
  }
}

export default async function HomePage() {
  const productsData = getProducts();
  const contentData = getContent();

  const [products, content] = await Promise.all([productsData, contentData]);

  return <HomePageClient products={products} content={content} />;
}
