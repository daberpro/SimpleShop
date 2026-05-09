import { redirect } from '@sveltejs/kit';
import { ProfileModel } from '$lib/db/model/profile.js';
import { UsersModel } from '$lib/db/model/users.js';

export async function load({ locals }) {
    if (!locals.user) {
        throw redirect(302, '/login');
    }

    const profileRes = await ProfileModel.getByUserId(locals.user.user_id);
    let userData = {};

    if (profileRes.IsError || !profileRes.IsValueExists) {
        const userRes = await UsersModel.getById(locals.user.user_id);
        userData = {
            email: userRes.Value?.email || '',
            role: userRes.Value?.role || 'member',
            full_name: '',
            address: '',
            phone: '',
            avatar: ''
        };
    } else {
        const p = profileRes.Value;
        userData = {
            email: p.email,
            role: p.role,
            full_name: p.full_name || '',
            address: p.address || '',
            phone: p.phone || '',
            avatar: p.avatar || ''
        };
    }

    return {
        user: userData
    };
}
