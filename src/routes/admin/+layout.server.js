import { redirect } from '@sveltejs/kit';

export function load({ locals }) {
    if (!locals.user) {
        throw redirect(302, '/login');
    }
    
    if (locals.user.role !== 'admin') {
        throw redirect(302, '/home');
    }

    return {
        user: locals.user
    };
}
