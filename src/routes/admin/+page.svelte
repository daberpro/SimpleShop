<script>
    import { onMount } from "svelte";
    import Button from "$lib/components/ui/button.svelte";

    let stats = $state({
        totalUsers: 0,
        totalProducts: 0,
        totalOrders: 0,
        totalCategories: 0,
    });
    let loading = $state(true);
    let adminName = $state("");

    onMount(async () => {
        const token = sessionStorage.getItem("accessToken");

        try {
            // Fetch stats
            const resStats = await fetch("/admin/stats", {
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            if (resStats.ok) {
                const data = await resStats.json();
                if (data.success) {
                    stats = data.stats;
                }
            }

            // Fetch admin profile for a personalized welcome message
            const resProfile = await fetch("/user/profile", {
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            if (resProfile.ok) {
                const pData = await resProfile.json();
                if (pData.success && pData.profile) {
                    adminName = pData.profile.full_name || pData.profile.email;
                }
            }
        } catch (error) {
            console.error("Failed to fetch dashboard data", error);
        } finally {
            loading = false;
        }
    });

    const links = [
        {
            name: "Manage Products",
            path: "/admin/products",
            icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>`,
        },
        {
            name: "Manage Categories",
            path: "/admin/category",
            icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>`,
        },
        {
            name: "Manage Orders",
            path: "/admin/orders",
            icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>`,
        },
        {
            name: "Manage Users",
            path: "/admin/users",
            icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
        },
    ];
</script>

<svelte:head>
    <title>Admin Dashboard | Simple Shop</title>
</svelte:head>

<div class="min-h-screen bg-[#FAFAFA] text-[#1D1D1F] pt-16 pb-32">
    <div class="max-w-6xl mx-auto px-6 space-y-16">
        <!-- Welcome Section -->
        <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-neutral-100 pb-10">
            <div>
                <h1 class="text-4xl md:text-5xl font-black tracking-tight mb-3">Dashboard</h1>
                <p class="text-neutral-500 font-medium text-lg">
                    Welcome back{adminName ? `, ${adminName}` : ""}. Here is what's happening today.
                </p>
            </div>
            <div class="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-neutral-100 shadow-sm">
                <span class="relative flex h-3 w-3">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <span class="text-sm font-bold text-neutral-800 uppercase tracking-widest">System Online</span>
            </div>
        </div>

        {#if loading}
            <div class="flex justify-center py-24">
                <div class="w-12 h-12 border-4 border-neutral-200 border-t-black rounded-full animate-spin"></div>
            </div>
        {:else}
            <!-- Stats Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <!-- Revenue -->
                <div class="bg-white rounded-[32px] p-8 border border-neutral-100 shadow-[0_8px_40px_rgb(0,0,0,0.03)] relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                    <div class="absolute -right-10 -top-10 w-32 h-32 bg-emerald-50 rounded-full blur-2xl group-hover:bg-emerald-100 transition-colors duration-500"></div>
                    <div class="relative z-10 flex flex-col h-full justify-between">
                        <div class="w-14 h-14 rounded-2xl bg-neutral-50 flex items-center justify-center text-neutral-800 border border-neutral-100 mb-8">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                        </div>
                        <div>
                            <p class="text-xs font-bold text-neutral-400 uppercase tracking-[0.2em] mb-2">Revenue</p>
                            <h3 class="text-4xl font-black tracking-tight text-neutral-900">---</h3>
                        </div>
                    </div>
                </div>

                <!-- Orders -->
                <div class="bg-white rounded-[32px] p-8 border border-neutral-100 shadow-[0_8px_40px_rgb(0,0,0,0.03)] relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                    <div class="absolute -right-10 -top-10 w-32 h-32 bg-blue-50 rounded-full blur-2xl group-hover:bg-blue-100 transition-colors duration-500"></div>
                    <div class="relative z-10 flex flex-col h-full justify-between">
                        <div class="w-14 h-14 rounded-2xl bg-neutral-50 flex items-center justify-center text-neutral-800 border border-neutral-100 mb-8">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
                        </div>
                        <div>
                            <p class="text-xs font-bold text-neutral-400 uppercase tracking-[0.2em] mb-2">Orders</p>
                            <h3 class="text-4xl font-black tracking-tight text-neutral-900">{stats.totalOrders}</h3>
                        </div>
                    </div>
                </div>

                <!-- Products -->
                <div class="bg-white rounded-[32px] p-8 border border-neutral-100 shadow-[0_8px_40px_rgb(0,0,0,0.03)] relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                    <div class="absolute -right-10 -top-10 w-32 h-32 bg-purple-50 rounded-full blur-2xl group-hover:bg-purple-100 transition-colors duration-500"></div>
                    <div class="relative z-10 flex flex-col h-full justify-between">
                        <div class="w-14 h-14 rounded-2xl bg-neutral-50 flex items-center justify-center text-neutral-800 border border-neutral-100 mb-8">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
                        </div>
                        <div>
                            <p class="text-xs font-bold text-neutral-400 uppercase tracking-[0.2em] mb-2">Products</p>
                            <h3 class="text-4xl font-black tracking-tight text-neutral-900">{stats.totalProducts}</h3>
                        </div>
                    </div>
                </div>

                <!-- Users -->
                <div class="bg-white rounded-[32px] p-8 border border-neutral-100 shadow-[0_8px_40px_rgb(0,0,0,0.03)] relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                    <div class="absolute -right-10 -top-10 w-32 h-32 bg-orange-50 rounded-full blur-2xl group-hover:bg-orange-100 transition-colors duration-500"></div>
                    <div class="relative z-10 flex flex-col h-full justify-between">
                        <div class="w-14 h-14 rounded-2xl bg-neutral-50 flex items-center justify-center text-neutral-800 border border-neutral-100 mb-8">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                        </div>
                        <div>
                            <p class="text-xs font-bold text-neutral-400 uppercase tracking-[0.2em] mb-2">Users</p>
                            <h3 class="text-4xl font-black tracking-tight text-neutral-900">{stats.totalUsers}</h3>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Quick Links -->
            <div class="pt-8">
                <div class="flex items-center justify-between mb-8">
                    <h2 class="text-2xl font-black tracking-tight text-neutral-900">
                        Quick Actions
                    </h2>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {#each links as link}
                        <a href={link.path} class="block group">
                            <div class="bg-white rounded-[32px] p-8 border border-neutral-100 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 flex flex-col items-center justify-center text-center group-hover:-translate-y-1 group-hover:border-neutral-200 h-full">
                                <div class="w-20 h-20 rounded-[24px] flex items-center justify-center text-black bg-neutral-50 mb-6 group-hover:bg-black group-hover:text-white transition-all duration-500 shadow-inner group-hover:rotate-3">
                                    {@html link.icon}
                                </div>
                                <span class="font-bold text-lg text-neutral-900 tracking-tight">{link.name}</span>
                            </div>
                        </a>
                    {/each}
                </div>
            </div>
        {/if}
    </div>
</div>

<style>
    @import url("https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap");

    :global(body) {
        font-family: "Plus Jakarta Sans", sans-serif;
    }
</style>
