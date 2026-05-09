<script>
    import { onMount } from "svelte";

    let { data } = $props();
    let user = $state(data.user);
    let loading = $state(false);
    let isEditing = $state(false);
    let saveMessage = $state("");

    let avatarFile = $state(null);
    let avatarPreview = $state(null);

    function handleAvatarChange(e) {
        const file = e.target.files[0];
        if (file) {
            avatarFile = file;
            avatarPreview = URL.createObjectURL(file);
        }
    }

    function getCSRF() {
        return document.cookie
            .split("; ")
            .find((row) => row.startsWith("csrf_token="))
            ?.split("=")[1];
    }

    async function saveProfile() {
        if (loading) return;
        loading = true;
        saveMessage = "";
        const token = sessionStorage.getItem("accessToken");

        try {
            const formData = new FormData();
            formData.append("full_name", user.full_name || "");
            formData.append("email", user.email || "");
            formData.append("phone", user.phone || "");
            formData.append("address", user.address || "");
            formData.append("existing_avatar", user.avatar || "");

            if (avatarFile) {
                formData.append("avatar", avatarFile);
            }

            const response = await fetch("/user/profile", {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                    "x-csrf-token": getCSRF() || "",
                },
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                user = data.user;
                saveMessage = data.message || "Profile updated successfully";
                isEditing = false;
                avatarFile = null;
                avatarPreview = null;
            } else {
                const data = await response.json();
                saveMessage = data.error || "Error updating profile";
            }
        } catch (error) {
            console.error("Failed to save profile", error);
            saveMessage = "Error updating profile";
        } finally {
            loading = false;
            setTimeout(() => (saveMessage = ""), 4000);
        }
    }
</script>

<svelte:head>
    <title>Profile Settings | Simple Shop</title>
</svelte:head>

<div class="min-h-screen bg-[#FDFDFD] text-[#1D1D1F] pb-32">
    <!-- Hero Banner for Profile -->
    <section class="relative w-full h-[40vh] bg-black overflow-hidden flex items-center justify-center pt-10">
        <div class="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.2)_0%,transparent_70%)]"></div>
        <div class="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/30 rounded-full blur-[120px] animate-pulse"></div>
        <div class="absolute bottom-[-20%] left-[-10%] w-[40%] h-[40%] bg-purple-600/30 rounded-full blur-[100px] animate-pulse" style="animation-delay: 2s;"></div>
        
        <h1 class="text-white/5 text-[15vw] font-black tracking-tighter uppercase whitespace-nowrap select-none absolute bottom-0 translate-y-1/4">
            {user.full_name || 'Profile'}
        </h1>
    </section>

    <!-- Main Content Area -->
    <section class="max-w-7xl mx-auto px-6 relative z-10 -mt-24 md:-mt-32">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            
            <!-- Left Column: User Card -->
            <div class="lg:col-span-4">
                <div class="bg-white/90 backdrop-blur-3xl rounded-[40px] p-10 shadow-2xl shadow-black/5 border border-white relative overflow-hidden group">
                    <div class="absolute top-0 right-0 w-40 h-40 bg-blue-50/50 rounded-full blur-3xl -z-10 group-hover:bg-blue-100/50 transition-colors duration-700"></div>
                    
                    <div class="flex flex-col items-center text-center relative z-10">
                        <!-- Avatar -->
                        <!-- svelte-ignore a11y_click_events_have_key_events -->
                        <!-- svelte-ignore a11y_no_static_element_interactions -->
                        <div class={`relative w-40 h-40 rounded-[32px] rotate-3 overflow-hidden bg-neutral-100 shadow-2xl mb-10 flex items-center justify-center group/avatar transition-all duration-500 hover:rotate-0 hover:scale-105 ${isEditing ? 'cursor-pointer ring-4 ring-blue-600/20' : ''}`}
                             onclick={() => isEditing && document.getElementById("avatar-upload").click()}>
                            
                            {#if avatarPreview || user.avatar}
                                <img loading="lazy" src={avatarPreview || user.avatar} alt="User Avatar" class={`w-full h-full object-cover transition-transform duration-700 ${isEditing ? 'opacity-75' : ''}`} />
                            {:else}
                                <span class={`text-6xl text-neutral-300 font-bold transition ${isEditing ? 'opacity-75' : ''}`}>
                                    {user.full_name ? user.full_name.charAt(0).toUpperCase() : (user.email ? user.email.charAt(0).toUpperCase() : 'U')}
                                </span>
                            {/if}

                            {#if isEditing}
                                <div class="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity backdrop-blur-sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white mb-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                                    <span class="text-white text-xs font-black tracking-widest uppercase">Upload</span>
                                </div>
                            {/if}
                        </div>
                        <input type="file" id="avatar-upload" accept="image/*" class="hidden" onchange={handleAvatarChange} />

                        <!-- User Info -->
                        <div class="mb-8">
                            <h2 class="text-3xl font-black tracking-tight mb-2 text-neutral-900">{user.full_name || "Unknown User"}</h2>
                            <p class="text-neutral-500 font-medium">{user.email}</p>
                        </div>

                        <div class="inline-flex items-center gap-3 bg-neutral-100 px-5 py-2.5 rounded-full text-xs font-black tracking-widest uppercase mb-10 shadow-inner">
                            <span class="w-2 h-2 bg-blue-600 rounded-full animate-pulse shadow-[0_0_8px_rgba(37,99,235,0.8)]"></span>
                            {user.role || "Member"}
                        </div>

                        {#if user.role === 'admin'}
                            <a href="/admin" class="w-full group/btn relative inline-block">
                                <div class="absolute inset-0 bg-blue-600 rounded-2xl blur-lg opacity-40 group-hover/btn:opacity-60 transition-opacity duration-500"></div>
                                <button class="relative w-full py-5 bg-black text-white rounded-2xl font-bold text-sm tracking-wide hover:bg-neutral-900 hover:scale-[1.02] active:scale-[0.98] transition-all">
                                    Admin Dashboard
                                </button>
                            </a>
                        {/if}
                    </div>
                </div>
            </div>

            <!-- Right Column: Settings Form -->
            <div class="lg:col-span-8">
                <div class="bg-white/90 backdrop-blur-3xl rounded-[40px] p-8 md:p-14 shadow-2xl shadow-black/5 border border-white">
                    <div class="mb-14">
                        <div class="inline-flex items-center gap-2 mb-4">
                            <span class="w-8 h-[2px] bg-blue-600"></span>
                            <p class="text-xs font-black text-blue-600 uppercase tracking-[0.2em]">Profile Settings</p>
                        </div>
                        <h2 class="text-4xl md:text-5xl font-black tracking-tight mb-5 leading-[1.1]">Personal <br/><span class="text-neutral-400">Information.</span></h2>
                        <p class="text-lg text-neutral-500 font-medium max-w-lg leading-relaxed">
                            Review and update your account details. Keep your information current to ensure a seamless shopping experience.
                        </p>
                    </div>

                    {#if saveMessage}
                        <div class={`mb-10 p-5 rounded-2xl text-sm font-bold tracking-wide flex items-center gap-4 ${saveMessage.includes('Error') ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
                            <div class={`w-2.5 h-2.5 rounded-full ${saveMessage.includes('Error') ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]'} animate-pulse`}></div>
                            {saveMessage}
                        </div>
                    {/if}

                    <div class="space-y-10">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <!-- Full Name -->
                            <div class="group relative">
                                <label class="block text-xs font-black text-neutral-400 uppercase tracking-widest mb-3 group-focus-within:text-blue-600 transition-colors">Full Name</label>
                                {#if isEditing}
                                    <input type="text" bind:value={user.full_name} placeholder="Your full name" class="w-full px-6 py-5 bg-neutral-50 rounded-[20px] text-neutral-900 font-bold border-2 border-transparent focus:bg-white focus:border-blue-600 focus:shadow-[0_8px_30px_rgba(37,99,235,0.1)] transition-all outline-none" />
                                {:else}
                                    <div class="w-full px-6 py-5 bg-neutral-50/50 rounded-[20px] text-neutral-800 font-bold border-2 border-transparent flex items-center min-h-[64px]">
                                        {user.full_name || "—"}
                                    </div>
                                {/if}
                            </div>

                            <!-- Email -->
                            <div class="group relative">
                                <label class="block text-xs font-black text-neutral-400 uppercase tracking-widest mb-3 group-focus-within:text-blue-600 transition-colors">Email Address</label>
                                {#if isEditing}
                                    <input type="email" bind:value={user.email} placeholder="Your email address" class="w-full px-6 py-5 bg-neutral-50 rounded-[20px] text-neutral-900 font-bold border-2 border-transparent focus:bg-white focus:border-blue-600 focus:shadow-[0_8px_30px_rgba(37,99,235,0.1)] transition-all outline-none" />
                                {:else}
                                    <div class="w-full px-6 py-5 bg-neutral-50/50 rounded-[20px] text-neutral-800 font-bold border-2 border-transparent flex items-center min-h-[64px]">
                                        {user.email || "—"}
                                    </div>
                                {/if}
                            </div>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <!-- Phone -->
                            <div class="group relative">
                                <label class="block text-xs font-black text-neutral-400 uppercase tracking-widest mb-3 group-focus-within:text-blue-600 transition-colors">Phone Number</label>
                                {#if isEditing}
                                    <input type="tel" bind:value={user.phone} placeholder="Your phone number" class="w-full px-6 py-5 bg-neutral-50 rounded-[20px] text-neutral-900 font-bold border-2 border-transparent focus:bg-white focus:border-blue-600 focus:shadow-[0_8px_30px_rgba(37,99,235,0.1)] transition-all outline-none" />
                                {:else}
                                    <div class="w-full px-6 py-5 bg-neutral-50/50 rounded-[20px] text-neutral-800 font-bold border-2 border-transparent flex items-center min-h-[64px]">
                                        {user.phone || "—"}
                                    </div>
                                {/if}
                            </div>

                            <!-- Address -->
                            <div class="group relative">
                                <label class="block text-xs font-black text-neutral-400 uppercase tracking-widest mb-3 group-focus-within:text-blue-600 transition-colors">Shipping Address</label>
                                {#if isEditing}
                                    <input type="text" bind:value={user.address} placeholder="Your full address" class="w-full px-6 py-5 bg-neutral-50 rounded-[20px] text-neutral-900 font-bold border-2 border-transparent focus:bg-white focus:border-blue-600 focus:shadow-[0_8px_30px_rgba(37,99,235,0.1)] transition-all outline-none" />
                                {:else}
                                    <div class="w-full px-6 py-5 bg-neutral-50/50 rounded-[20px] text-neutral-800 font-bold border-2 border-transparent flex items-center min-h-[64px]">
                                        {user.address || "—"}
                                    </div>
                                {/if}
                            </div>
                        </div>

                        <!-- Actions -->
                        <div class="pt-10 mt-10 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-end gap-5">
                            {#if isEditing}
                                <button onclick={() => { isEditing = false; avatarFile = null; avatarPreview = null; }}
                                        class="w-full sm:w-auto px-8 py-5 bg-neutral-100 text-neutral-500 rounded-2xl font-bold tracking-wide hover:bg-neutral-200 hover:text-neutral-900 transition-all">
                                    Cancel Updates
                                </button>
                                <div class="relative w-full sm:w-auto">
                                    <div class="absolute inset-0 bg-blue-600 rounded-2xl blur-lg opacity-40 transition-opacity duration-500"></div>
                                    <button onclick={loading ? null : saveProfile}
                                            class={`relative w-full px-10 py-5 bg-black text-white rounded-2xl font-bold tracking-wide hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/20 ${loading ? 'opacity-50 cursor-not-allowed scale-100' : ''}`}>
                                        {loading ? "Saving Changes..." : "Save Profile"}
                                    </button>
                                </div>
                            {:else}
                                <button onclick={() => isEditing = true}
                                        class="w-full sm:w-auto px-10 py-5 bg-black text-white rounded-2xl font-bold tracking-wide hover:bg-neutral-900 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-black/20 flex items-center justify-center gap-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                    Edit Details
                                </button>
                            {/if}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</div>

<style>
    @import url("https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap");

    :global(body) {
        font-family: "Plus Jakarta Sans", sans-serif;
    }
</style>
