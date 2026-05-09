import { redirect } from '@sveltejs/kit';

export function load({ cookies }) {
    if (cookies.get('refresh_token')) {
        throw redirect(302, '/user/profile');
    }
}
