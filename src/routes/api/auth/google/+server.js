import { json } from "@sveltejs/kit";
import { OAuth2Client } from "google-auth-library";
import { PUBLIC_GOOGLE_CLIENT_ID } from "$env/static/public";
import { UsersModel } from "$lib/db/model/users.js";
import { ProfileModel } from "$lib/db/model/profile.js";
import { signAccessToken, signRefreshToken } from "$lib/server/auth/jwt.js";
import crypto from "crypto";

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

        // Check if user exists
        let userRes = await UsersModel.getByEmail(email);
        let user;

        if (userRes.IsError) {
            return json({ error: "Database error" }, { status: 500 });
        }

        if (!userRes.IsValueExists) {
            // Create new user
            const randomPassword = crypto.randomBytes(16).toString("hex");
            const createRes = await UsersModel.create({
                email,
                password: randomPassword,
                role: "user"
            });

            if (createRes.IsError) {
                return json({ error: createRes.Message }, { status: 500 });
            }

            // Get the newly created user
            const newUserRes = await UsersModel.getByEmail(email);
            user = newUserRes.Value;

            // Create initial profile with Google Avatar
            await ProfileModel.create({
                user_id: user.id,
                full_name: name,
                avatar: picture
            });
        } else {
            user = userRes.Value;
            
            // Check if profile exists, if not create one with Google Avatar
            const profileRes = await ProfileModel.getByUserId(user.id);
            if (!profileRes.IsValueExists) {
                await ProfileModel.create({
                    user_id: user.id,
                    full_name: name,
                    avatar: picture
                });
            } else if (!profileRes.Value.avatar) {
                // If profile exists but no avatar, set the Google one as default
                await ProfileModel.update(profileRes.Value.id, {
                    ...profileRes.Value,
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
            secure: false
        });

        cookies.set("access_token", accessToken, {
            httpOnly: true,
            path: "/",
            sameSite: "strict",
            secure: false
        });

        return json({ success: true, accessToken });

    } catch (err) {
        console.error("Google Auth Error:", err);
        return json({ error: "Authentication failed: " + err.message }, { status: 500 });
    }
}
