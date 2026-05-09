import { json } from '@sveltejs/kit';
import { UsersModel } from '$lib/db/model/users.js';
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

    const res = await UsersModel.getAll(page, limit);
    if (res.IsError) return json({ error: res.Message }, { status: 500 });
    
    return json({ 
        success: true, 
        users: res.Value.data,
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
    if (!data.email || data.email.trim() === "") {
        return json({ error: 'Email is required.' }, { status: 400 });
    }

    const res = await UsersModel.create({
        email: data.email,
        password: data.password,
        role: data.role || 'user'
    });

    if (res.IsError) {
        console.error("DB Error:", res.Message);
        return json({ error: 'Database error while creating user. Email may already exist.' }, { status: 400 });
    }
    return json({ success: true, message: 'User created' });
}

export async function PUT({ request, locals, cookies }) {
    try { validateCSRF(request, cookies); } catch (err) { return json({ error: 'CSRF invalid' }, { status: 403 }); }
    const guard = requireAdmin(locals);
    if (guard) return guard;

    const data = await request.json();
    if (!data.id) return json({ error: 'ID is required' }, { status: 400 });
    if (!data.email || data.email.trim() === "") {
        return json({ error: 'Email is required.' }, { status: 400 });
    }

    const existingUser = await UsersModel.getById(data.id);
    if (existingUser.IsError || !existingUser.IsValueExists) {
        return json({ error: 'User not found' }, { status: 404 });
    }

    const fullUser = await UsersModel.getByEmail(existingUser.Value.email);

    const res = await UsersModel.update(data.id, {
        email: data.email || fullUser.Value.email,
        password: data.password || fullUser.Value.password,
        role: data.role || fullUser.Value.role
    });

    if (res.IsError) {
        console.error("DB Error:", res.Message);
        return json({ error: 'Database error while updating user. Email may already be in use.' }, { status: 400 });
    }
    return json({ success: true, message: 'User updated' });
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
            await UsersModel.delete(id);
        }
        return json({ success: true, message: 'Users deleted' });
    }

    if (!singleId) return json({ error: 'ID is required' }, { status: 400 });

    const res = await UsersModel.delete(singleId);
    if (res.IsError) return json({ error: res.Message }, { status: 500 });
    return json({ success: true, message: 'User deleted' });
}
