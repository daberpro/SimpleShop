import { json } from '@sveltejs/kit';
import { ProductModel } from '$lib/db/model/product.js';
import { validateCSRF } from '$lib/server/auth/csrf.js';
import fs from 'fs/promises';
import path from 'path';

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
    const search = url.searchParams.get('search') || "";
    const category = url.searchParams.get('category') || "";

    const res = await ProductModel.getAll(page, limit, search, category);
    if (res.IsError) return json({ error: res.Message }, { status: 500 });

    return json({
        success: true,
        products: res.Value.data,
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

    const contentType = request.headers.get('content-type') || '';
    let name, price, category_id, imageFile, description;

    if (contentType.includes('multipart/form-data')) {
        const formData = await request.formData();
        name = formData.get('name');
        price = formData.get('price');
        category_id = formData.get('category_id');
        imageFile = formData.get('image');
        description = formData.get('description');
    } else {
        const data = await request.json();
        name = data.name;
        price = data.price;
        category_id = data.category_id;
        description = data.description;
    }

    if (!name || price === "" || price === null || !category_id) {
        return json({ error: 'Please provide a valid name, price, and select a category.' }, { status: 400 });
    }

    let imageUrl = null;
    if (imageFile && imageFile instanceof File && imageFile.size > 0) {
        const ext = path.extname(imageFile.name);
        const fileName = `product_${Date.now()}${ext}`;
        const uploadDir = path.join(process.cwd(), 'static', 'uploads', 'products');
        
        try {
            await fs.mkdir(uploadDir, { recursive: true });
            const buffer = Buffer.from(await imageFile.arrayBuffer());
            await fs.writeFile(path.join(uploadDir, fileName), buffer);
            imageUrl = `/uploads/products/${fileName}`;
        } catch (err) {
            console.error('Failed to save product image', err);
        }
    }

    const res = await ProductModel.create({
        name,
        price,
        category_id,
        image: imageUrl,
        description
    });

    if (res.IsError) {
        console.error("DB Error:", res.Message);
        return json({ error: 'Database error. Check your inputs or try again.' }, { status: 400 });
    }
    return json({ success: true, message: 'Product created' });
}

export async function PUT({ request, locals, cookies }) {
    try { validateCSRF(request, cookies); } catch (err) { return json({ error: 'CSRF invalid' }, { status: 403 }); }
    const guard = requireAdmin(locals);
    if (guard) return guard;

    const contentType = request.headers.get('content-type') || '';
    let id, name, price, category_id, imageFile, existing_image, description;

    if (contentType.includes('multipart/form-data')) {
        const formData = await request.formData();
        id = formData.get('id');
        name = formData.get('name');
        price = formData.get('price');
        category_id = formData.get('category_id');
        imageFile = formData.get('image');
        existing_image = formData.get('existing_image');
        description = formData.get('description');
    } else {
        const data = await request.json();
        id = data.id;
        name = data.name;
        price = data.price;
        category_id = data.category_id;
        existing_image = data.image;
        description = data.description;
    }

    if (!id) return json({ error: 'ID is required' }, { status: 400 });
    if (!name || price === "" || price === null || !category_id) {
        return json({ error: 'Please provide a valid name, price, and select a category.' }, { status: 400 });
    }

    let imageUrl = existing_image;
    if (imageFile && imageFile instanceof File && imageFile.size > 0) {
        const ext = path.extname(imageFile.name);
        const fileName = `product_${Date.now()}${ext}`;
        const uploadDir = path.join(process.cwd(), 'static', 'uploads', 'products');
        
        try {
            await fs.mkdir(uploadDir, { recursive: true });
            const buffer = Buffer.from(await imageFile.arrayBuffer());
            await fs.writeFile(path.join(uploadDir, fileName), buffer);
            imageUrl = `/uploads/products/${fileName}`;

            // Optional: delete old image if it's in our uploads
            if (existing_image && existing_image.startsWith('/uploads/products/')) {
                const oldFile = path.join(process.cwd(), 'static', existing_image);
                try { await fs.unlink(oldFile); } catch {}
            }
        } catch (err) {
            console.error('Failed to save product image', err);
        }
    }

    const res = await ProductModel.update(id, {
        name,
        price,
        category_id,
        image: imageUrl,
        description
    });

    if (res.IsError) {
        console.error("DB Error:", res.Message);
        return json({ error: 'Database error. Check your inputs or try again.' }, { status: 400 });
    }
    return json({ success: true, message: 'Product updated' });
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
            await ProductModel.delete(id);
        }
        return json({ success: true, message: 'Products deleted' });
    }

    if (!singleId) return json({ error: 'ID is required' }, { status: 400 });

    const res = await ProductModel.delete(singleId);
    if (res.IsError) return json({ error: res.Message }, { status: 500 });
    return json({ success: true, message: 'Product deleted' });
}
