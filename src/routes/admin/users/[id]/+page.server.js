import { UsersModel } from "$lib/db/model/users.js";
import { ProfileModel } from "$lib/db/model/profile.js";
import { error } from "@sveltejs/kit";

export async function load({ params }) {
    const userId = params.id;

    const userRes = await UsersModel.getById(userId);
    if (userRes.IsError || !userRes.IsValueExists) {
        throw error(404, "User not found");
    }

    const profileRes = await ProfileModel.getByUserId(userId);
    
    return {
        targetUser: userRes.Value,
        targetProfile: profileRes.IsValueExists ? profileRes.Value : null
    };
}
