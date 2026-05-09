import { json } from "@sveltejs/kit";
import bcrypt from "bcrypt";
import { UsersModel } from "$lib/db/model/users.js";
import { signAccessToken, signRefreshToken } from "$lib/server/auth/jwt.js";
import { validateCSRF } from "$lib/server/auth/csrf";

export async function POST({ request, cookies }) {
    try {
        validateCSRF(request, cookies);

        const { email, password } = await request.json();

        if (!email || !password) {
            return json({ error: "Invalid input" }, { status: 400 });
        }

        const userRes = await UsersModel.getByEmail(email);

        if (userRes.IsError || !userRes.IsValueExists) {
            return json({ error: "Invalid credentials" }, { status: 401 });
        }

        const user = userRes.Value;


        const valid = await bcrypt.compare(password, user.password);

        if (!valid) {
            return json({ error: "Invalid credentials" }, { status: 401 });
        }

        const payload = { user_id: user.id, email: user.email, role: user.role };

        const accessToken = signAccessToken(payload);
        const refreshToken = signRefreshToken(payload);

        cookies.set("refresh_token", refreshToken, {
            httpOnly: true,
            path: "/",
            sameSite: "strict",
            secure: false
        });

        cookies.set("access_token", accessToken, {
            httpOnly: true,
            path: "/",
            sameSite: "strict",
            secure: false
        });

        return json({ accessToken });

    } catch (err) {
        // handle CSRF error juga masuk sini
        if (err.message === "CSRF_INVALID") {
            return json({ error: "CSRF invalid" }, { status: 403 });
        }

        return json({ error: err.message }, { status: 500 });
    }
}