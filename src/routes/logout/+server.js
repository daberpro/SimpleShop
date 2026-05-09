import { redirect } from "@sveltejs/kit";

export function GET({ cookies, url }) {
    const isProd = url.hostname.includes("daberdev.my.id");
    const cookieOptions = { 
        path: "/", 
        ...(isProd ? { domain: ".daberdev.my.id" } : {}) 
    };

    cookies.delete("refresh_token", cookieOptions);
    cookies.delete("access_token", cookieOptions);
    throw redirect(302, "/login");
}