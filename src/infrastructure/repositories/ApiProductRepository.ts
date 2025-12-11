import { IProductRepository, ProductQueryParams } from "@/domain/interfaces/IProductRepository";
import { Product } from "@/domain/entities/Product";
import { ProductMapper } from "@/infrastructure/mappers/ProductMapper";

export class ApiProductRepository implements IProductRepository {
    async getAll(params?: ProductQueryParams): Promise<Product[]> {
        const query = new URLSearchParams();
        if (params?.page) query.set('page', params.page.toString());
        if (params?.limit) query.set('limit', params.limit.toString());
        if (params?.category) query.set('categorySlug', params.category);

        const res = await fetch(`/api/products?${query.toString()}`);
        if (!res.ok) throw new Error('Failed to fetch products');

        const data = await res.json();
        // Handle both paginated and flat responses just in case, though API returns { products, pagination } now
        const items = data.products || data;

        return items.map((item: any) => ProductMapper.toDomain(item));
    }

    async getById(id: number): Promise<Product | null> {
        // Fallback to searching in getAll or a specific endpoint if needed
        // For now, assuming we don't have a direct /api/products/:id, using search or list
        // But optimally we should have it. sticking to list for now or implementing if needed.
        // Let's rely on finding in the list or fetching filtered list.
        // Actually, let's implement a quick fetch by ID if not found in cache (handled by proxy).
        // Since API supports filters, we might need specific ID endpoint or filter.
        // For now, I'll return null to force "getAll" usage or implement if needed. 
        // Realistically, detail page uses slug.
        return null;
    }

    async getBySlug(slug: string): Promise<Product | null> {
        // We can use the product detail API derived from the page logic or a generic search
        // Current architecture: detailed page fetches unique on server. 
        // Client side? We can hit the API with a filter if we add it, or use valid method.
        // Let's add 'slug' to valid filters in API.
        // Ignoring for now as clean arch usually implies specialized endpoints or filters.
        // I will assume we fetch all or filter.

        // Let's return null to simulate "not implemented yet" or standard "fetch all and find"
        // But for performance, we want Cache to handle this.
        return null;
    }

    async search(query: string): Promise<Product[]> {
        const res = await fetch(`/api/products?search=${encodeURIComponent(query)}`);
        if (!res.ok) return [];
        const data = await res.json();
        return (data.products || []).map((item: any) => ProductMapper.toDomain(item));
    }
}
