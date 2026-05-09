<script>
    import Card from "$lib/components/ui/card.svelte";
    import Button from "$lib/components/ui/button.svelte";
    import { fly } from "svelte/transition";

    let { data } = $props();
    const { targetUser, targetProfile } = data;
</script>

<svelte:head>
    <title>User Detail - {targetUser.email}</title>
</svelte:head>

<div class="p-6 max-w-4xl mx-auto space-y-6" in:fly={{ y: 20 }}>
    <div class="flex items-center gap-4">
        <a href="/admin/users" class="p-2 rounded-xl hover:bg-neutral-100 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </a>
        <h1 class="text-2xl font-bold">User Details</h1>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Sidebar: Profile Pic & Basic Info -->
        <Card className="md:col-span-1 flex flex-col items-center text-center p-8">
            <div class="w-32 h-32 rounded-3xl bg-neutral-100 border-2 border-neutral-200 overflow-hidden mb-4 flex items-center justify-center">
                {#if targetProfile?.avatar}
                    <img src={targetProfile.avatar} alt="Avatar" class="w-full h-full object-cover" />
                {:else}
                    <span class="text-4xl font-bold text-neutral-300">
                        {targetUser.email[0].toUpperCase()}
                    </span>
                {/if}
            </div>
            <h2 class="text-xl font-bold text-neutral-900">{targetProfile?.full_name || 'No Name'}</h2>
            <p class="text-sm text-neutral-500 mb-6">{targetUser.email}</p>
            
            <span class={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${targetUser.role === "admin" ? "bg-black text-white" : "bg-neutral-100 text-neutral-800"}`}>
                {targetUser.role.toUpperCase()}
            </span>
        </Card>

        <!-- Main Content: Detailed Info -->
        <div class="md:col-span-2 space-y-6">
            <Card>
                <h3 class="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-6">Account Information</h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <p class="text-xs font-bold text-neutral-400 uppercase mb-1">User ID</p>
                        <p class="font-medium">#{targetUser.id}</p>
                    </div>
                    <div>
                        <p class="text-xs font-bold text-neutral-400 uppercase mb-1">Email Address</p>
                        <p class="font-medium">{targetUser.email}</p>
                    </div>
                    <div>
                        <p class="text-xs font-bold text-neutral-400 uppercase mb-1">Role</p>
                        <p class="font-medium capitalize">{targetUser.role}</p>
                    </div>
                </div>
            </Card>

            <Card>
                <h3 class="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-6">Profile Information</h3>
                {#if targetProfile}
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <p class="text-xs font-bold text-neutral-400 uppercase mb-1">Full Name</p>
                            <p class="font-medium">{targetProfile.full_name || '-'}</p>
                        </div>
                        <div>
                            <p class="text-xs font-bold text-neutral-400 uppercase mb-1">Phone Number</p>
                            <p class="font-medium">{targetProfile.phone || '-'}</p>
                        </div>
                        <div class="sm:col-span-2">
                            <p class="text-xs font-bold text-neutral-400 uppercase mb-1">Address</p>
                            <p class="font-medium leading-relaxed">{targetProfile.address || '-'}</p>
                        </div>
                    </div>
                {:else}
                    <div class="py-8 text-center bg-neutral-50 rounded-2xl border border-dashed border-neutral-200">
                        <p class="text-neutral-400 text-sm italic">This user has not completed their profile yet.</p>
                    </div>
                {/if}
            </Card>
        </div>
    </div>
</div>
