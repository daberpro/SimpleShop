import { ProductModel } from '$lib/db/model/product.js';
import { CategoryModel } from '$lib/db/model/category.js';

export function load() {
    return {
        streamed: {
            productsData: ProductModel.getAll(1, 100).then(res => res.Value?.data || []),
            categoriesData: CategoryModel.getAll(1, 100).then(res => res.Value?.data || [])
        }
    };
}
