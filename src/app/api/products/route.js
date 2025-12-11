import { NextResponse } from 'next/server';
import { ServiceFactory } from '@/infrastructure/factories/ServiceFactory';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get('category');

    const productRepository = ServiceFactory.getProductRepository();

    // Use the repository to fetch domain entities
    const products = await productRepository.findAll({
      categorySlug: categorySlug || undefined
    });

    // Map Domain Objects back to DTOs/JSON if necessary.
    // Since our Domain Product closely matches what frontend expects (thanks to Mapper), 
    // we can return it. Ideally we should use a DTO Mapper here too.
    // For now, returning the domain entities is a safe improvement over raw DB rows.

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products', details: error.message }, { status: 500 });
  }
}
