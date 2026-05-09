import { json } from '@sveltejs/kit';
import { CategoryModel } from '$lib/db/model/category.js';
import { validateCSRF } from '$lib/server/auth/csrf.js';

function requireAdmin(locals) {
    if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });
    if (locals.user.role !== 'admin') return json({ error: 'Forbidden: admin only' }, { status: 403 });
    return null;
}

export async function GET({ locals, url }) {
    const guard = requireAdmin(locals);
    if (guard) return guard;

    const page = Number(url.searchParams.get('page')) || 1;
    const limit = Number(url.searchParams.get('limit')) || 10;

    const res = await CategoryModel.getAll(page, limit);
    if (res.IsError) return json({ error: res.Message }, { status: 500 });
    
    return json({ 
        success: true, 
        categories: res.Value.data,
        pagination: {
            total: res.Value.total,
            page: res.Value.page,
            limit: res.Value.limit,
            totalPages: Math.ceil(res.Value.total / res.Value.limit)
        }
    });
}

export async function POST({ request, locals, cookies }) {
    try { validateCSRF(request, cookies); } catch (err) { return json({ error: 'CSRF invalid' }, { status: 403 }); }
    const guard = requireAdmin(locals);
    if (guard) return guard;

    const data = await request.json();
    if (!data.name || data.name.trim() === "") {
        return json({ error: 'Category name is required.' }, { status: 400 });
    }

    const res = await CategoryModel.create({
        name: data.name,
        description: data.description
    });

    if (res.IsError) {
        console.error("DB Error:", res.Message);
        return json({ error: 'Database error while creating category.' }, { status: 400 });
    }
    return json({ success: true, message: 'Category created' });
}

export async function PUT({ request, locals, cookies }) {
    try { validateCSRF(request, cookies); } catch (err) { return json({ error: 'CSRF invalid' }, { status: 403 }); }
    const guard = requireAdmin(locals);
    if (guard) return guard;

    const data = await request.json();
    if (!data.id) return json({ error: 'ID is required' }, { status: 400 });
    if (!data.name || data.name.trim() === "") {
        return json({ error: 'Category name is required.' }, { status: 400 });
    }

    const res = await CategoryModel.update(data.id, {
        name: data.name,
        description: data.description
    });

    if (res.IsError) {
        console.error("DB Error:", res.Message);
        return json({ error: 'Database error while updating category.' }, { status: 400 });
    }
    return json({ success: true, message: 'Category updated' });
}

export async function DELETE({ request, locals, cookies, url }) {
    try { validateCSRF(request, cookies); } catch (err) { return json({ error: 'CSRF invalid' }, { status: 403 }); }
    const guard = requireAdmin(locals);
    if (guard) return guard;

    const ids = url.searchParams.get('ids');
    const singleId = url.searchParams.get('id');

    if (ids) {
        const idList = ids.split(',');
        for (const id of idList) {
            await CategoryModel.delete(id);
        }
        return json({ success: true, message: 'Categories deleted' });
    }

    if (!singleId) return json({ error: 'ID is required' }, { status: 400 });

    const res = await CategoryModel.delete(singleId);
    if (res.IsError) return json({ error: res.Message }, { status: 500 });
    return json({ success: true, message: 'Category deleted' });
}
