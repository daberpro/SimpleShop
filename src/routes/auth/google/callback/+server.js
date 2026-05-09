import { json } from "@sveltejs/kit";
import { OAuth2Client } from "google-auth-library";
import { PUBLIC_GOOGLE_CLIENT_ID } from "$env/static/public";
import { UsersModel } from "$lib/db/model/users.js";
import { ProfileModel } from "$lib/db/model/profile.js";
import { signAccessToken, signRefreshToken } from "$lib/server/auth/jwt.js";

const client = new OAuth2Client(PUBLIC_GOOGLE_CLIENT_ID);

export async function POST({ request, cookies }) {
    try {
        const { idToken } = await request.json();

        if (!idToken) {
            return json({ error: "Missing ID Token" }, { status: 400 });
        }

        // Verify the token
        const ticket = await client.verifyIdToken({
            idToken,
            audience: PUBLIC_GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { email, sub: googleId, name, picture } = payload;

        if (!email) {
            return json({ error: "Email not found in Google token" }, { status: 400 });
        }

        // 1. Check if user exists by googleId
        let userRes = await UsersModel.getByGoogleId(googleId);
        let user;

        if (userRes.IsError) {
            return json({ error: "Database error" }, { status: 500 });
        }

        if (!userRes.IsValueExists) {
            // 2. Check if user exists by email (maybe they signed up with password before)
            let emailUserRes = await UsersModel.getByEmail(email);
            
            if (emailUserRes.IsError) {
                return json({ error: "Database error" }, { status: 500 });
            }

            if (emailUserRes.IsValueExists) {
                // Link Google ID to existing account
                user = emailUserRes.Value;
                // We should update the user to include the google_id
                await UsersModel.update(user.id, {
                    ...user,
                    google_id: googleId
                });
            } else {
                // 3. Create new user
                const createRes = await UsersModel.create({
                    email,
                    google_id: googleId,
                    role: "user"
                });

                if (createRes.IsError) {
                    return json({ error: createRes.Message }, { status: 500 });
                }

                // Get the newly created user
                const newUserRes = await UsersModel.getByGoogleId(googleId);
                user = newUserRes.Value;

                // Create initial profile
                await ProfileModel.create({
                    user_id: user.id,
                    full_name: name,
                    avatar: picture
                });
            }
        } else {
            user = userRes.Value;
            
            // Check if profile exists, if not create one
            const profileRes = await ProfileModel.getByUserId(user.id);
            if (!profileRes.IsValueExists) {
                await ProfileModel.create({
                    user_id: user.id,
                    full_name: name,
                    avatar: picture
                });
            }
        }

        // Generate tokens
        const jwtPayload = { user_id: user.id, email: user.email, role: user.role };
        const accessToken = signAccessToken(jwtPayload);
        const refreshToken = signRefreshToken(jwtPayload);

        // Set cookies
        cookies.set("refresh_token", refreshToken, {
            httpOnly: true,
            path: "/",
            sameSite: "strict",
            secure: false // Set to true in production
        });

        cookies.set("access_token", accessToken, {
            httpOnly: true,
            path: "/",
            sameSite: "strict",
            secure: false // Set to true in production
        });

        return json({ success: true, accessToken });

    } catch (err) {
        console.error("Google Auth Error:", err);
        return json({ error: "Authentication failed: " + err.message }, { status: 500 });
    }
}
