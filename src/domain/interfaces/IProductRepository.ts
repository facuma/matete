import { Product } from "@/domain/entities/Product";

export interface IProductRepository {
    getAll(params?: ProductQueryParams): Promise<Product[]>;
    getById(id: number): Promise<Product | null>;
    getBySlug(slug: string): Promise<Product | null>;
    search(query: string): Promise<Product[]>;
}

export interface ProductQueryParams {
    page?: number;
    limit?: number;
    category?: string;
    featured?: boolean;
    search?: string;
}
