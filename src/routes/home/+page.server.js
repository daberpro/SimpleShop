import { ProductModel } from '$lib/db/model/product.js';
import { CategoryModel } from '$lib/db/model/category.js';

export async function load() {
    const [prodRes, catRes] = await Promise.all([
        ProductModel.getAll(1, 100),
        CategoryModel.getAll(1, 100)
    ]);
    
    return {
        products: prodRes.Value?.data || [],
        categories: catRes.Value?.data || []
    };
}
