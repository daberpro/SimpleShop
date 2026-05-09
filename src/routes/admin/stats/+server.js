import { json } from '@sveltejs/kit';
import { UsersModel } from '$lib/db/model/users.js';
import { ProductModel } from '$lib/db/model/product.js';
import { OrdersModel } from '$lib/db/model/orders.js';
import { CategoryModel } from '$lib/db/model/category.js';

function requireAdmin(locals) {
    if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });
    if (locals.user.role !== 'admin') return json({ error: 'Forbidden: admin only' }, { status: 403 });
    return null;
}

export async function GET({ locals }) {
    const guard = requireAdmin(locals);
    if (guard) return guard;

    try {
        const usersRes = await UsersModel.getAll();
        const productsRes = await ProductModel.getAll();
        const ordersRes = await OrdersModel.getAll();
        const categoriesRes = await CategoryModel.getAll();

        const stats = {
            totalUsers: usersRes.IsError ? 0 : usersRes.Value.total,
            totalProducts: productsRes.IsError ? 0 : productsRes.Value.total,
            totalOrders: ordersRes.IsError ? 0 : ordersRes.Value.total,
            totalCategories: categoriesRes.IsError ? 0 : categoriesRes.Value.total,
        };

        return json({ success: true, stats });
    } catch (err) {
        return json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}
