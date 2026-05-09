import { json } from "@sveltejs/kit";
import { UsersModel } from "$lib/db/model/users.js";
import { ProfileModel } from "$lib/db/model/profile.js";
import { validateCSRF } from "$lib/server/auth/csrf.js";

export async function POST({ request, cookies }) {
    try {
        validateCSRF(request, cookies);

        const { email, password } = await request.json();

        if (!email || !password) {
            return json(
                { error: "Email and password are required" },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return json(
                { error: "Password must be at least 6 characters" },
                { status: 400 }
            );
        }

        const existing = await UsersModel.getByEmail(email);

        if (existing.IsValueExists) {
            return json(
                { error: "Email already exists" },
                { status: 409 }
            );
        }

        const createRes = await UsersModel.create({
            email,
            password
        });

        if (createRes.IsError) {
            return json(
                { error: createRes.Message },
                { status: 500 }
            );
        }

        await ProfileModel.create({
            user_id: createRes.Value.insertId
        });

        return json({
            message: "User registered successfully"
        });

    } catch (err) {
        if (err.message === "CSRF_INVALID") {
            return json({ error: "CSRF invalid" }, { status: 403 });
        }

        return json({ error: err.message }, { status: 500 });
    }
}