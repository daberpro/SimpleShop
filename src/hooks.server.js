import { verifyAccessToken } from "$lib/server/auth/jwt.js";
import crypto from "crypto";

export async function handle({ event, resolve }) {

    // ======================
    // 1. CSRF TOKEN (FIXED)
    // ======================
    let csrf = event.cookies.get("csrf_token");

    // hanya generate kalau belum ada
    if (!csrf) {
        csrf = crypto.randomBytes(24).toString("hex");

        event.cookies.set("csrf_token", csrf, {
            path: "/",
            httpOnly: false,     // harus false → supaya client bisa baca
            sameSite: "strict",
            secure: false        // true kalau sudah HTTPS
        });
    }

    event.locals.csrf = csrf;

    // ======================
    // 2. AUTH (JWT)
    // ======================
    let token = null;
    const auth = event.request.headers.get("authorization");
    
    if (auth && auth.startsWith("Bearer ")) {
        token = auth.split(" ")[1];
    } else {
        token = event.cookies.get("access_token");
    }

    if (token) {
        try {
            const user = verifyAccessToken(token);
            event.locals.user = user;
        } catch {
            event.locals.user = null;
        }
    } else {
        event.locals.user = null;
    }

    const response = await resolve(event);
    response.headers.set("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
    return response;
}