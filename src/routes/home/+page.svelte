<script>
    import { cart } from "$lib/cart.svelte.js";
    import { notification } from "$lib/notification.svelte.js";

    let { data } = $props();
    // Only show first 4 products as "Featured"
    let featuredProducts = $derived(data.products.slice(0, 4));

    async function addToCart(product) {
        cart.add(product);
        notification.success(`${product.name} added to cart!`);
    }
</script>

<svelte:head>
    <title>Simple Shop | Design for Excellence</title>
</svelte:head>

<div class="min-h-screen bg-[#FDFDFD] text-[#1D1D1F]">
    <!-- Hero Section -->
    <section class="relative h-[85vh] flex items-center">
        <div class="absolute inset-0 -z-10 overflow-hidden">
            <div
                class="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-50/50 rounded-full blur-[120px]"
            ></div>
            <div
                class="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-50/50 rounded-full blur-[100px]"
            ></div>
        </div>

        <div
            class="max-w-7xl mx-auto px-6 grid md:grid-cols-2 items-center gap-16"
        >
            <div class="text-left">
                <div
                    class="inline-flex items-center gap-3 bg-neutral-100 px-4 py-2 rounded-full text-xs font-black tracking-widest uppercase mb-8"
                >
                    <span class="w-2 h-2 bg-blue-600 rounded-full animate-pulse"
                    ></span>
                    E-Commerce Reimagined
                </div>
                <h1
                    class="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.95]"
                >
                    The Art <br /> Of
                    <span class="text-blue-600">Simplicity.</span>
                </h1>
                <p
                    class="text-xl text-neutral-400 font-medium max-w-md leading-relaxed mb-12"
                >
                    Discover a collection that bridges the gap between
                    functional design and timeless aesthetics.
                </p>
                <div class="flex items-center gap-6">
                    <a
                        href="/home/products"
                        class="px-10 py-5 bg-black text-white rounded-2xl font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-black/20"
                    >
                        Shop Collection
                    </a>
                    <a
                        href="/home/products"
                        class="text-lg font-bold border-b-2 border-black pb-1 hover:text-blue-600 hover:border-blue-600 transition-all"
                    >
                        View All
                    </a>
                </div>
            </div>

            <div class="hidden md:flex justify-center items-center w-full">
                <div class="relative w-full max-w-md">
                    <div
                        class="w-full aspect-[4/5] bg-neutral-100 rounded-[40px] md:rounded-[64px] overflow-hidden rotate-3 shadow-2xl relative z-10"
                    >
                        {#if featuredProducts[0]?.image}
                            <img loading="lazy"
                                src={featuredProducts[0].image}
                                alt="Hero"
                                class="w-full h-full object-cover"
                            />
                        {:else}
                            <div
                                class="w-full h-full flex items-center justify-center text-neutral-200"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="120"
                                    height="120"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="0.5"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    ><path
                                        d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
                                    /><polyline
                                        points="9 22 9 12 15 12 15 22"
                                    /></svg
                                >
                            </div>
                        {/if}
                    </div>
                    <!-- Floating Card -->
                    <div
                        class="absolute -bottom-10 -left-10 bg-white p-6 rounded-3xl shadow-2xl border border-neutral-50 -rotate-6 z-20"
                    >
                        <p
                            class="text-xs font-black text-blue-600 uppercase tracking-widest mb-1"
                        >
                            New Arrival
                        </p>
                        <p class="text-lg font-bold italic">
                            {featuredProducts[0]?.name || "Premium Item"}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Featured Section -->
    <section class="max-w-7xl mx-auto px-6 py-32">
        <div class="flex items-end justify-between mb-16">
            <div>
                <p
                    class="text-sm font-black text-neutral-300 uppercase tracking-[0.3em] mb-4"
                >
                    Curated Picks
                </p>
                <h2 class="text-4xl font-bold tracking-tight">
                    Featured Items
                </h2>
            </div>
            <a
                href="/home/products"
                class="text-sm font-bold bg-neutral-50 px-6 py-3 rounded-full hover:bg-neutral-100 transition-all"
            >
                BROWSE ALL →
            </a>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {#each featuredProducts as product}
                <div class="group relative flex flex-col">
                    <div
                        class="relative aspect-square rounded-[40px] overflow-hidden bg-neutral-50 mb-6 border border-neutral-100 group-hover:border-transparent group-hover:shadow-2xl transition-all duration-700"
                    >
                        {#if product.image}
                            <img loading="lazy"
                                src={product.image}
                                alt={product.name}
                                class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                            />
                        {:else}
                            <div
                                class="w-full h-full flex items-center justify-center text-neutral-200"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="48"
                                    height="48"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="1"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    ><rect
                                        x="3"
                                        y="3"
                                        width="18"
                                        height="18"
                                        rx="2"
                                        ry="2"
                                    ></rect><circle cx="8.5" cy="8.5" r="1.5"
                                    ></circle><polyline
                                        points="21 15 16 10 5 21"
                                    ></polyline></svg
                                >
                            </div>
                        {/if}
                        <button
                            onclick={() => addToCart(product)}
                            class="absolute bottom-4 inset-x-4 py-4 bg-white/90 backdrop-blur-xl rounded-2xl font-bold text-sm shadow-xl opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500"
                        >
                            Quick Add
                        </button>
                    </div>
                    <div class="px-2">
                        <h3 class="font-bold text-lg mb-1">{product.name}</h3>
                        <p class="text-neutral-400 font-bold">
                            Rp {product.price.toLocaleString("id-ID")}
                        </p>
                    </div>
                </div>
            {/each}
        </div>
    </section>

    <!-- Banner -->
    <section class="max-w-7xl mx-auto px-6 py-20">
        <div
            class="bg-black rounded-[64px] p-20 text-center relative overflow-hidden"
        >
            <div
                class="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.2)_0%,transparent_70%)]"
            ></div>
            <h2
                class="text-white text-5xl md:text-7xl font-black tracking-tighter mb-8 relative z-10"
            >
                Ready to elevate <br /> your experience?
            </h2>
            <a
                href="/home/products"
                class="inline-block px-12 py-6 bg-white text-black rounded-full font-black text-xl hover:scale-105 active:scale-95 transition-all relative z-10"
            >
                Start Exploring
            </a>
        </div>
    </section>
</div>

<style>
    @import url("https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap");

    :global(body) {
        font-family: "Plus Jakarta Sans", sans-serif;
    }
</style>
