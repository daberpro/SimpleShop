<script>
    import { cart } from "$lib/cart.svelte.js";
    import { notification } from "$lib/notification.svelte.js";
    import { fade, fly } from "svelte/transition";

    let { data } = $props();
    let selectedCategoryId = $state(null);

    let selectedProduct = $state(null);

    function viewProduct(product) {
        selectedProduct = product;
    }

    function closeProductModal() {
        selectedProduct = null;
    }

    async function addToCart(product) {
        cart.add(product);
        notification.success(`${product.name} added to cart!`);
    }
</script>

<svelte:head>
    <title>The Collection | Simple Shop</title>
</svelte:head>

<div class="min-h-screen bg-[#FDFDFD] text-[#1D1D1F] pb-32">
    <!-- Header Section -->
    <section class="relative w-full pt-24 pb-20 bg-neutral-50 overflow-hidden flex flex-col items-center justify-center border-b border-neutral-200/50">
        <!-- Subtle background elements -->
        <div class="absolute inset-0 pointer-events-none">
            <div class="absolute -top-32 -right-32 w-96 h-96 bg-white rounded-full blur-3xl opacity-60"></div>
            <div class="absolute bottom-0 -left-32 w-80 h-80 bg-white rounded-full blur-3xl opacity-60"></div>
        </div>

        <div class="relative z-10 text-center px-4 max-w-2xl mx-auto">
            <span class="inline-block py-1.5 px-4 rounded-full bg-white text-neutral-600 text-[10px] font-black tracking-[0.2em] uppercase mb-8 shadow-sm border border-neutral-200/50">
                Curated Essentials
            </span>
            <h1 class="text-black text-5xl md:text-7xl font-black tracking-tighter leading-[1] mb-6">
                The Collection.
            </h1>
            <p class="text-neutral-500 font-medium text-lg leading-relaxed">
                Discover pieces that bridge the gap between functional design and timeless aesthetics.
            </p>
        </div>
    </section>

    <!-- Main Content Area -->
    {#await Promise.all([data.streamed.productsData, data.streamed.categoriesData])}
        <section class="max-w-7xl mx-auto px-6 relative z-20 -mt-8">
            <!-- Skeleton Filter Bar -->
            <div class="bg-white/90 backdrop-blur-3xl rounded-full p-3 shadow-2xl shadow-black/5 border border-white mb-16 mx-auto w-fit flex gap-2">
                <div class="w-20 h-12 bg-neutral-200 rounded-full animate-pulse"></div>
                <div class="w-24 h-12 bg-neutral-200 rounded-full animate-pulse"></div>
                <div class="w-32 h-12 bg-neutral-200 rounded-full animate-pulse"></div>
            </div>

            <!-- Skeleton Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-16">
                {#each Array(6) as _}
                    <div class="group relative flex flex-col">
                        <div class="relative aspect-[4/5] rounded-[40px] bg-neutral-200 mb-6 animate-pulse border border-neutral-100"></div>
                        <div class="px-2">
                            <div class="w-3/4 h-7 bg-neutral-200 rounded-md mb-3 animate-pulse"></div>
                            <div class="w-1/4 h-5 bg-neutral-200 rounded-md animate-pulse"></div>
                        </div>
                    </div>
                {/each}
            </div>
        </section>
    {:then [products, categories]}
        {@const filteredProducts = selectedCategoryId ? products.filter((p) => p.category_id === selectedCategoryId) : products}

        <section class="max-w-7xl mx-auto px-6 relative z-20 -mt-8">
        <!-- Filter Bar Floating Panel -->
        <div
            class="bg-white/90 backdrop-blur-3xl rounded-full p-3 shadow-2xl shadow-black/5 border border-white mb-16 mx-auto w-fit flex flex-wrap items-center justify-center gap-2"
        >
            <button
                onclick={() => (selectedCategoryId = null)}
                class={`px-8 py-4 rounded-full text-xs font-black tracking-widest uppercase transition-all duration-300 ${
                    selectedCategoryId === null
                        ? "bg-black text-white shadow-xl shadow-black/20 scale-105"
                        : "bg-transparent text-neutral-500 hover:text-black hover:bg-neutral-100"
                }`}
            >
                All
            </button>
            {#each categories as category}
                <button
                    onclick={() => (selectedCategoryId = category.id)}
                    class={`px-8 py-4 rounded-full text-xs font-black tracking-widest uppercase transition-all duration-300 ${
                        selectedCategoryId === category.id
                            ? "bg-black text-white shadow-xl shadow-black/20 scale-105"
                            : "bg-transparent text-neutral-500 hover:text-black hover:bg-neutral-100"
                    }`}
                >
                    {category.name}
                </button>
            {/each}
        </div>

        <!-- Product Grid -->
        {#if filteredProducts.length === 0}
            <div
                class="py-32 text-center bg-white rounded-[64px] shadow-sm border border-neutral-100 max-w-2xl mx-auto"
            >
                <div
                    class="w-20 h-20 bg-neutral-50 rounded-[24px] flex items-center justify-center mx-auto mb-8 shadow-inner rotate-3"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="text-neutral-300 -rotate-3"
                        ><circle cx="12" cy="12" r="10" /><line
                            x1="12"
                            y1="8"
                            x2="12"
                            y2="12"
                        /><line x1="12" y1="16" x2="12.01" y2="16" /></svg
                    >
                </div>
                <h3 class="text-2xl font-black tracking-tight mb-2">
                    Nothing Here Yet
                </h3>
                <p class="text-neutral-500 font-medium">
                    Try selecting a different category or check back later.
                </p>
                <button
                    onclick={() => (selectedCategoryId = null)}
                    class="mt-8 px-8 py-4 bg-black text-white rounded-2xl font-bold hover:scale-105 transition-transform shadow-xl shadow-black/10"
                >
                    View All Products
                </button>
            </div>
        {:else}
            <div
                class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-16"
            >
                {#each filteredProducts as product}
                    <div class="group relative flex flex-col">
                        <!-- Image Container -->
                        <div
                            onclick={() => viewProduct(product)}
                            role="button"
                            tabindex="0"
                            onkeydown={(e) => { if(e.key==='Enter') viewProduct(product); }}
                            class="relative aspect-[4/5] cursor-pointer rounded-[40px] overflow-hidden bg-neutral-100 mb-6 shadow-md group-hover:shadow-2xl group-hover:-translate-y-2 transition-all duration-700"
                        >
                            {#if product.image}
                                <img loading="lazy"
                                    src={product.image}
                                    alt={product.name}
                                    class="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                />
                            {:else}
                                <div
                                    class="w-full h-full flex items-center justify-center text-neutral-200"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="64"
                                        height="64"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        stroke-width="0.5"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        ><rect
                                            x="3"
                                            y="3"
                                            width="18"
                                            height="18"
                                            rx="2"
                                            ry="2"
                                        ></rect><circle
                                            cx="8.5"
                                            cy="8.5"
                                            r="1.5"
                                        ></circle><polyline
                                            points="21 15 16 10 5 21"
                                        ></polyline></svg
                                    >
                                </div>
                            {/if}

                            <!-- Hover Add to Cart Action -->
                            <div
                                class="absolute inset-0 bg-black/5 backdrop-blur-[2px] flex items-end justify-center p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                            >
                                <button
                                    onclick={(e) => { e.stopPropagation(); addToCart(product); }}
                                    class="w-full py-5 pointer-events-auto bg-white/95 backdrop-blur-xl rounded-[20px] font-black tracking-wide text-neutral-900 shadow-2xl hover:bg-black hover:text-white transition-all duration-300 transform translate-y-4 group-hover:translate-y-0"
                                >
                                    ADD TO CART
                                </button>
                            </div>

                            <!-- Decorative category tag on image -->
                            <div
                                class="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-500 -translate-x-4 group-hover:translate-x-0"
                            >
                                <span
                                    class="text-[9px] font-black uppercase tracking-[0.2em] text-black"
                                >
                                    {product.category_name || "Item"}
                                </span>
                            </div>
                        </div>

                        <!-- Product Info -->
                        <div 
                            class="px-2 cursor-pointer"
                            onclick={() => viewProduct(product)}
                            role="button"
                            tabindex="0"
                            onkeydown={(e) => { if(e.key==='Enter') viewProduct(product); }}
                        >
                            <div
                                class="flex items-start justify-between mb-2 gap-4"
                            >
                                <h3
                                    class="text-xl font-black tracking-tight leading-tight group-hover:text-blue-600 transition-colors"
                                >
                                    {product.name}
                                </h3>
                                <span
                                    class="text-lg font-black whitespace-nowrap"
                                >
                                    Rp {product.price.toLocaleString("id-ID")}
                                </span>
                            </div>
                            <p
                                class="text-sm text-neutral-500 font-medium line-clamp-2 leading-relaxed"
                            >
                                {product.description ||
                                    "Premium essential item."}
                            </p>
                        </div>
                    </div>
                {/each}
            </div>
        {/if}
    </section>
    {/await}

    <!-- Product Detail Modal -->
    {#if selectedProduct}
        <div class="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6">
            <!-- Backdrop -->
            <div
                class="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                transition:fade={{ duration: 200 }}
                onclick={closeProductModal}
            ></div>

            <!-- Modal Content -->
            <div
                class="relative bg-white rounded-[40px] max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-2xl"
                in:fly={{ y: 20, duration: 300 }}
                out:fade={{ duration: 200 }}
            >
                <button
                    onclick={closeProductModal}
                    class="absolute top-4 right-4 z-10 w-10 h-10 bg-white/50 hover:bg-white backdrop-blur-md rounded-full flex items-center justify-center text-black shadow-sm transition-colors"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>

                <!-- Product Image -->
                <div class="md:w-1/2 bg-neutral-100 relative h-64 md:h-auto flex-shrink-0">
                    {#if selectedProduct.image}
                        <img loading="lazy"
                            src={selectedProduct.image}
                            alt={selectedProduct.name}
                            class="w-full h-full object-cover"
                        />
                    {:else}
                        <div class="w-full h-full flex items-center justify-center text-neutral-300">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                        </div>
                    {/if}
                    <div class="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg">
                        <span class="text-[9px] font-black uppercase tracking-[0.2em] text-black">
                            {selectedProduct.category_name || "Item"}
                        </span>
                    </div>
                </div>

                <!-- Product Details -->
                <div class="md:w-1/2 p-8 md:p-12 flex flex-col h-full overflow-y-auto">
                    <h2 class="text-3xl md:text-4xl font-black tracking-tight leading-tight mb-2">
                        {selectedProduct.name}
                    </h2>
                    <p class="text-2xl font-black text-blue-600 mb-6">
                        Rp {selectedProduct.price.toLocaleString("id-ID")}
                    </p>
                    
                    <div class="mb-8 flex-grow">
                        <h4 class="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3">Description</h4>
                        <p class="text-neutral-600 font-medium leading-relaxed whitespace-pre-wrap">
                            {selectedProduct.description || "No description available for this premium item. Experience the quality and functional design firsthand."}
                        </p>
                    </div>

                    <button
                        onclick={() => { addToCart(selectedProduct); closeProductModal(); }}
                        class="w-full py-5 bg-black text-white rounded-2xl font-black tracking-wide shadow-[0_8px_30px_rgba(0,0,0,0.2)] hover:scale-[1.02] active:scale-95 transition-all mt-auto"
                    >
                        ADD TO CART
                    </button>
                </div>
            </div>
        </div>
    {/if}
</div>

<style>
    @import url("https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap");

    :global(body) {
        font-family: "Plus Jakarta Sans", sans-serif;
    }
</style>
