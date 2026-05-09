import { json } from "@sveltejs/kit";
import { verifyRefreshToken, signAccessToken } from "$lib/server/auth/jwt.js";

export async function POST({ cookies }) {
    const token = cookies.get("refresh_token");

    if (!token) {
        return json({ error: "No refresh token" }, { status: 401 });
    }

    try {
        const payload = verifyRefreshToken(token);

        const newAccessToken = signAccessToken({
            user_id: payload.user_id,
            email: payload.email
        });

        return json({ accessToken: newAccessToken });

    } catch {
        return json({ error: "Invalid refresh token" }, { status: 401 });
    }
}