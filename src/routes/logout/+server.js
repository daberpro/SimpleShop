import { redirect } from "@sveltejs/kit";

export function GET({ cookies }) {
    cookies.delete("refresh_token", { path: "/" });
    cookies.delete("access_token", { path: "/" });
    throw redirect(302, "/login");
}