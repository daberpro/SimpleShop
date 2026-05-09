import { json } from '@sveltejs/kit';
import { UsersModel } from '$lib/db/model/users.js';
import { ProfileModel } from '$lib/db/model/profile.js';
import fs from 'fs/promises';
import path from 'path';
import { validateCSRF } from "$lib/server/auth/csrf.js";

export async function GET({ locals }) {
    if (!locals.user) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profileRes = await ProfileModel.getByUserId(locals.user.user_id);
    
    // If profile doesn't exist, fallback to just users data
    if (profileRes.IsError || !profileRes.IsValueExists) {
        const userRes = await UsersModel.getById(locals.user.user_id);
        if (userRes.IsError || !userRes.IsValueExists) {
            return json({ error: 'User not found' }, { status: 404 });
        }
        return json({
            success: true,
            user: {
                email: userRes.Value.email,
                role: userRes.Value.role,
                full_name: '',
                address: '',
                phone: '',
                avatar: ''
            }
        });
    }

    const p = profileRes.Value;

    return json({
        success: true,
        user: {
            email: p.email,
            role: p.role,
            full_name: p.full_name || '',
            address: p.address || '',
            phone: p.phone || '',
            avatar: p.avatar || ''
        }
    });
}

export async function POST({ request, locals, cookies }) {
    try {
        validateCSRF(request, cookies);
    } catch (err) {
        if (err.message === "CSRF_INVALID") {
            return json({ error: "CSRF invalid" }, { status: 403 });
        }
        return json({ error: err.message }, { status: 500 });
    }

    if (!locals.user) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const contentType = request.headers.get('content-type') || '';
    let data = {};
    let avatarFile = null;

    if (contentType.includes('multipart/form-data')) {
        const formData = await request.formData();
        data = {
            email: formData.get('email') || '',
            full_name: formData.get('full_name') || '',
            address: formData.get('address') || '',
            phone: formData.get('phone') || '',
            existing_avatar: formData.get('existing_avatar') || ''
        };
        const file = formData.get('avatar');
        if (file && file.name && file.size > 0) {
            avatarFile = file;
        }
    } else {
        data = await request.json();
    }
    
    // Fetch full user to preserve existing password and role
    const fullUser = await UsersModel.getByEmail(locals.user.email);
    if (fullUser.IsError || !fullUser.IsValueExists) {
        return json({ error: 'User not found' }, { status: 404 });
    }

    // Handle avatar upload
    let avatarUrl = data.existing_avatar || data.avatar;
    if (avatarFile) {
        const ext = path.extname(avatarFile.name);
        const fileName = `avatar_${locals.user.user_id}_${Date.now()}${ext}`;
        const uploadDir = path.join(process.cwd(), 'static', 'uploads');
        
        try {
            await fs.mkdir(uploadDir, { recursive: true });
            const buffer = Buffer.from(await avatarFile.arrayBuffer());
            await fs.writeFile(path.join(uploadDir, fileName), buffer);

            // Delete old avatar file if it was a local upload
            const oldAvatar = data.existing_avatar || '';
            if (oldAvatar.startsWith('/uploads/')) {
                const oldFile = path.join(process.cwd(), 'static', oldAvatar);
                try {
                    await fs.unlink(oldFile);
                } catch {
                    // ignore if old file doesn't exist
                }
            }

            avatarUrl = `/uploads/${fileName}`;
        } catch (err) {
            console.error('Failed to save avatar', err);
            // continue even if avatar fails
        }
    }

    // Update Users table
    const updateRes = await UsersModel.update(locals.user.user_id, {
        email: data.email || fullUser.Value.email,
        password: fullUser.Value.password,
        role: fullUser.Value.role
    });

    if (updateRes.IsError) {
        return json({ error: updateRes.Message }, { status: 400 });
    }

    // Update Profiles table
    const profileRes = await ProfileModel.getByUserId(locals.user.user_id);
    if (profileRes.IsError || !profileRes.IsValueExists) {
        // Create profile if doesn't exist yet
        await ProfileModel.create({
            user_id: locals.user.user_id,
            full_name: data.full_name,
            address: data.address,
            phone: data.phone,
            avatar: avatarUrl
        });
    } else {
        // Update existing profile
        await ProfileModel.update(profileRes.Value.id, {
            full_name: data.full_name,
            address: data.address,
            phone: data.phone,
            avatar: avatarUrl
        });
    }
    
    return json({
        success: true,
        message: 'Profile updated successfully',
        user: {
            email: data.email || fullUser.Value.email,
            role: fullUser.Value.role,
            full_name: data.full_name,
            address: data.address,
            phone: data.phone,
            avatar: avatarUrl
        }
    });
}
