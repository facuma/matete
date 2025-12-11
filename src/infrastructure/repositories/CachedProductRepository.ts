import { IProductRepository, ProductQueryParams } from "@/domain/interfaces/IProductRepository";
import { Product } from "@/domain/entities/Product";
import { ProductMapper } from "@/infrastructure/mappers/ProductMapper";

export class CachedProductRepository implements IProductRepository {
    private realRepository: IProductRepository;
    private cacheKey = 'matete_products_cache';
    private memoryCache: Product[] | null = null;
    private lastFetch: number = 0;
    private cacheDuration = 1000 * 60 * 5; // 5 minutes

    constructor(realRepository: IProductRepository) {
        this.realRepository = realRepository;
        this.loadFromStorage();
    }

    private loadFromStorage() {
        if (typeof window === 'undefined') return;

        try {
            const stored = localStorage.getItem(this.cacheKey);
            if (stored) {
                const { data, timestamp } = JSON.parse(stored);
                // Hydrate plain objects back to Domain Entities
                if (Array.isArray(data)) {
                    this.memoryCache = data.map((item: any) => ProductMapper.toDomain(item));
                    this.lastFetch = timestamp;
                }
            }
        } catch (e) {
            console.error("Failed to load cache", e);
        }
    }

    private saveToStorage(products: Product[]) {
        if (typeof window === 'undefined') return;
        this.memoryCache = products;
        this.lastFetch = Date.now();
        localStorage.setItem(this.cacheKey, JSON.stringify({
            data: products,
            timestamp: this.lastFetch
        }));
    }

    async getAll(params?: ProductQueryParams): Promise<Product[]> {
        const now = Date.now();
        const forceRefresh = params?.page === 1 && (now - this.lastFetch > this.cacheDuration);

        // Serve from Cache if available and valid (Virtual Proxy)
        if (this.memoryCache && this.memoryCache.length > 0 && !forceRefresh && !params?.search && !params?.category) {
            // Apply simple valid filters on memory cache ??? 
            // If they ask for page 1, we return cache.
            // If they ask for filtering, we might need to filter manually or go to API.
            // Simplified: If asking for all/page 1, return cache.
            return this.memoryCache;
        }

        // Fetch from Real Subject
        try {
            const products = await this.realRepository.getAll(params);

            // Only update main cache if we fetched the "main" list (no search, page 1 or all)
            // Strategy: We can append unique items to cache or replace.
            // Simplified: If page 1 and no specific filters, replace cache.
            if (!params?.category && !params?.search && (params?.page === 1 || !params?.page)) {
                this.saveToStorage(products);

                // Smart Pre-fetching: Trigger next page fetch in background
                if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
                    (window as any).requestIdleCallback(() => {
                        this.prefetchNextPage();
                    });
                }
            }

            return products;
        } catch (error) {
            console.error("Repo fetch error", error);
            return this.memoryCache || []; // Fallback to cache even if stale
        }
    }

    async prefetchNextPage() {
        // Implementation for background fetching
        // e.g. fetch page 2 and append to cache
        console.log("Background pre-fetching triggered...");
    }

    async getById(id: number): Promise<Product | null> {
        return this.memoryCache?.find((p: any) => p.id === id) || this.realRepository.getById(id);
    }

    async getBySlug(slug: string): Promise<Product | null> {
        return this.memoryCache?.find((p: any) => p.slug === slug) || this.realRepository.getBySlug(slug);
    }

    async search(query: string): Promise<Product[]> {
        // Could search in memory first
        return this.realRepository.search(query);
    }
}
