<script>
    import { page } from "$app/state";
    import { goto, invalidateAll } from "$app/navigation";
    import { cart } from "$lib/cart.svelte.js";
    import CartDrawer from "./cart-drawer.svelte";

    let isLoggedIn = $derived(!!page.data.user);
    let isAdmin = $derived(page.data.user?.role === "admin");
    let menuOpen = $state(false);

    async function handleLogout() {
        if (typeof sessionStorage !== 'undefined') {
            sessionStorage.removeItem("accessToken");
        }
        await fetch("/logout");
        await invalidateAll();
        goto("/login");
    }
</script>

<header
    class="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-neutral-200 shadow-sm"
>
    <div
        class="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4"
    >
        <!-- Brand -->
        <a
            href="/home"
            class="flex items-center gap-2 font-semibold text-neutral-900 tracking-tight text-base hover:opacity-80 transition-opacity"
        >
            <div
                class="w-7 h-7 bg-black rounded-lg flex items-center justify-center"
            >
                <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    stroke-width="2.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >
                    <path
                        d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"
                    /><line x1="3" y1="6" x2="21" y2="6" /><path
                        d="M16 10a4 4 0 0 1-8 0"
                    />
                </svg>
            </div>
            SimpleShop
        </a>

        <!-- Desktop nav links -->
        <nav class="hidden md:flex items-center gap-1 text-sm font-medium text-neutral-600">
            <a href="/home" class="px-3 py-1.5 rounded-lg hover:bg-neutral-100 hover:text-neutral-900 transition-colors">Home</a>
            <a href="/home/products" class="px-3 py-1.5 rounded-lg hover:bg-neutral-100 hover:text-neutral-900 transition-colors">Products</a>
            {#if isLoggedIn}
                <a href="/home/order" class="px-3 py-1.5 rounded-lg hover:bg-neutral-100 hover:text-neutral-900 transition-colors">Orders</a>
                <a href="/user/profile" class="px-3 py-1.5 rounded-lg hover:bg-neutral-100 hover:text-neutral-900 transition-colors">Profile</a>
            {/if}
            {#if isAdmin}
                <a
                    href="/admin"
                    class="px-3 py-1.5 rounded-lg hover:bg-neutral-100 hover:text-neutral-900 transition-colors font-bold text-black"
                    >Dashboard</a
                >
            {/if}
        </nav>

        <!-- Desktop auth actions -->
        <div class="hidden md:flex items-center gap-4">
            <div class="relative flex items-center">
                <button
                    onclick={() => cart.toggle()}
                    class="relative p-2 text-neutral-600 hover:text-black transition-colors focus:outline-none"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    >
                        <circle cx="8" cy="21" r="1" /><circle
                            cx="19"
                            cy="21"
                            r="1"
                        />
                        <path
                            d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.56-7.43H5.12"
                        />
                    </svg>
                    {#if cart.count > 0}
                        <span
                            class="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full animate-in zoom-in duration-300"
                        >
                            {cart.count}
                        </span>
                    {/if}
                </button>
                <CartDrawer />
            </div>

            {#if isLoggedIn}
                <div class="flex items-center gap-3">
                    <a href="/user/profile" class="flex items-center gap-2 group">
                        <div class="w-8 h-8 rounded-full bg-neutral-100 border border-neutral-200 overflow-hidden flex items-center justify-center transition-all group-hover:border-black">
                            {#if page.data.profile?.avatar}
                                <img src={page.data.profile.avatar} alt="Profile" class="w-full h-full object-cover" />
                            {:else}
                                <span class="text-xs font-bold text-neutral-500 group-hover:text-black">
                                    {page.data.user.email[0].toUpperCase()}
                                </span>
                            {/if}
                        </div>
                        <div class="hidden lg:block">
                            <div class="text-xs font-bold text-neutral-900 leading-none">
                                {page.data.profile?.full_name || 'User'}
                            </div>
                            <div class="text-[10px] text-neutral-500">
                                {page.data.user.role}
                            </div>
                        </div>
                    </a>
                    <button
                        onclick={handleLogout}
                        class="px-4 py-1.5 text-sm font-medium rounded-lg border border-neutral-300 text-neutral-700 hover:bg-neutral-100 transition-colors"
                    >
                        Logout
                    </button>
                </div>
            {:else}
                <a
                    href="/login"
                    class="px-4 py-1.5 text-sm font-medium rounded-lg border border-neutral-300 text-neutral-700 hover:bg-neutral-100 transition-colors"
                >
                    Login
                </a>
                <a
                    href="/register"
                    class="px-4 py-1.5 text-sm font-medium rounded-lg bg-black text-white hover:bg-neutral-800 transition-colors"
                >
                    Register
                </a>
            {/if}
        </div>

        <!-- Mobile menu toggle -->
        <button
            class="md:hidden flex items-center justify-center w-9 h-9 rounded-lg hover:bg-neutral-100 transition-colors text-neutral-700"
            onclick={() => (menuOpen = !menuOpen)}
            aria-label="Toggle menu"
        >
            {#if menuOpen}
                <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >
                    <line x1="18" y1="6" x2="6" y2="18" /><line
                        x1="6"
                        y1="6"
                        x2="18"
                        y2="18"
                    />
                </svg>
            {:else}
                <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >
                    <line x1="3" y1="12" x2="21" y2="12" /><line
                        x1="3"
                        y1="6"
                        x2="21"
                        y2="6"
                    /><line x1="3" y1="18" x2="21" y2="18" />
                </svg>
            {/if}
        </button>
    </div>

    <!-- Mobile dropdown menu -->
    {#if menuOpen}
        <div
            class="md:hidden border-t border-neutral-100 bg-white px-4 py-3 space-y-1 text-sm font-medium text-neutral-700"
        >
            <a
                href="/home"
                onclick={() => (menuOpen = false)}
                class="block px-3 py-2 rounded-lg hover:bg-neutral-100 transition-colors"
                >Home</a
            >
            <a
                href="/home/products"
                onclick={() => (menuOpen = false)}
                class="block px-3 py-2 rounded-lg hover:bg-neutral-100 transition-colors"
                >Products</a
            >
            {#if isLoggedIn}
                <div class="flex items-center gap-3 px-3 py-4 border-b border-neutral-100 mb-2">
                    <div class="w-12 h-12 rounded-2xl bg-neutral-100 border border-neutral-200 overflow-hidden flex items-center justify-center">
                        {#if page.data.profile?.avatar}
                            <img src={page.data.profile.avatar} alt="Profile" class="w-full h-full object-cover" />
                        {:else}
                            <span class="text-lg font-bold text-neutral-400">
                                {page.data.user.email[0].toUpperCase()}
                            </span>
                        {/if}
                    </div>
                    <div>
                        <div class="font-bold text-neutral-900">{page.data.profile?.full_name || 'User'}</div>
                        <div class="text-xs text-neutral-500">{page.data.user.email}</div>
                    </div>
                </div>
                <a
                    href="/home/order"
                    onclick={() => (menuOpen = false)}
                    class="block px-3 py-2 rounded-lg hover:bg-neutral-100 transition-colors"
                    >Orders</a
                >
                <a
                    href="/user/profile"
                    onclick={() => (menuOpen = false)}
                    class="block px-3 py-2 rounded-lg hover:bg-neutral-100 transition-colors"
                    >Profile</a
                >
                {#if isAdmin}
                    <a
                        href="/admin"
                        onclick={() => (menuOpen = false)}
                        class="block px-3 py-2 rounded-lg hover:bg-neutral-100 transition-colors font-bold text-black"
                        >Dashboard</a
                    >
                {/if}
                <button
                    onclick={handleLogout}
                    class="w-full text-left px-3 py-2 rounded-lg hover:bg-neutral-100 transition-colors text-red-600"
                >
                    Logout
                </button>
            {:else}
                <a
                    href="/login"
                    onclick={() => (menuOpen = false)}
                    class="block px-3 py-2 rounded-lg hover:bg-neutral-100 transition-colors"
                    >Login</a
                >
                <a
                    href="/register"
                    onclick={() => (menuOpen = false)}
                    class="block px-3 py-2 rounded-lg bg-black text-white hover:bg-neutral-800 transition-colors text-center"
                    >Register</a
                >
            {/if}
        </div>
    {/if}
</header>
