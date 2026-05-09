import { ProfileModel } from "$lib/db/model/profile.js";

export async function load({ locals }) {
    let profile = null;
    
    if (locals.user) {
        const profileRes = await ProfileModel.getByUserId(locals.user.user_id);
        if (profileRes.IsValueExists) {
            profile = profileRes.Value;
        }
    }

    return {
        user: locals.user,
        profile
    };
}
