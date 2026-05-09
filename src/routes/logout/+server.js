import { redirect } from "@sveltejs/kit";

export function GET({ cookies }) {
    cookies.delete("refresh_token", { path: "/", domain: ".daberdev.my.id" });
    cookies.delete("access_token", { path: "/", domain: ".daberdev.my.id" });
    throw redirect(302, "/login");
}