import { json } from "@sveltejs/kit";
import { OAuth2Client } from "google-auth-library";
import { PUBLIC_GOOGLE_CLIENT_ID } from "$env/static/public";
import { UsersModel } from "$lib/db/model/users.js";
import { ProfileModel } from "$lib/db/model/profile.js";
import { signAccessToken, signRefreshToken } from "$lib/server/auth/jwt.js";

const client = new OAuth2Client(PUBLIC_GOOGLE_CLIENT_ID);

export async function POST({ request, cookies }) {
    try {
        let idToken;
        const contentType = request.headers.get("content-type") || "";

        if (contentType.includes("application/json")) {
            const body = await request.json();
            idToken = body.idToken;
        } else {
            const formData = await request.formData();
            idToken = formData.get("credential"); // GSI sends it as 'credential' in form POST
        }

        if (!idToken) {
            return json({ error: "Missing ID Token or Credential" }, { status: 400 });
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
            console.error("DB Error getByGoogleId:", userRes.Message);
            return json({ error: "Database error during google_id check" }, { status: 500 });
        }

        if (!userRes.IsValueExists) {
            // 2. Check if user exists by email (maybe they signed up with password before)
            let emailUserRes = await UsersModel.getByEmail(email);
            
            if (emailUserRes.IsError) {
                console.error("DB Error getByEmail:", emailUserRes.Message);
                return json({ error: "Database error during email check" }, { status: 500 });
            }

            if (emailUserRes.IsValueExists) {
                // Link Google ID to existing account
                user = emailUserRes.Value;
                const updateRes = await UsersModel.update(user.id, {
                    ...user,
                    google_id: googleId
                });
                
                if (updateRes.IsError) {
                    console.error("DB Error linking google_id:", updateRes.Message);
                    return json({ error: "Failed to link Google account" }, { status: 500 });
                }
            } else {
                // 3. Create new user
                const createRes = await UsersModel.create({
                    email,
                    google_id: googleId,
                    role: "user"
                });

                if (createRes.IsError) {
                    console.error("DB Error creating user:", createRes.Message);
                    return json({ error: "Failed to create user: " + createRes.Message }, { status: 500 });
                }

                // Get the newly created user
                const newUserRes = await UsersModel.getByGoogleId(googleId);
                user = newUserRes.Value;

                // Create initial profile
                const profileCreateRes = await ProfileModel.create({
                    user_id: user.id,
                    full_name: name,
                    avatar: picture
                });

                if (profileCreateRes.IsError) {
                    console.warn("Profile creation failed (non-critical):", profileCreateRes.Message);
                }
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
        const cookieOptions = {
            httpOnly: true,
            path: "/",
            sameSite: "strict",
            secure: request.url.startsWith("https") // Auto-set secure on HTTPS
        };

        cookies.set("refresh_token", refreshToken, cookieOptions);
        cookies.set("access_token", accessToken, cookieOptions);

        return json({ success: true, accessToken });

    } catch (err) {
        console.error("Google Auth Error:", err);
        return json({ error: "Authentication failed: " + err.message }, { status: 500 });
    }
}
