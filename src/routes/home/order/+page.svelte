<script>
    import { fade, fly } from "svelte/transition";
    import { goto } from "$app/navigation";
    import Input from "$lib/components/ui/input.svelte";
    import Button from "$lib/components/ui/button.svelte";
    import ShipmentDrawer from "$lib/components/ui/shipment-drawer.svelte";
    import InvoiceModal from "$lib/components/ui/invoice-modal.svelte";

    let { data } = $props();
    let orders = $derived(data.orders);
    let pagination = $derived(data.pagination);
    let searchQuery = $state(data.search || "");
    let selectedOrderIdForShipment = $state(null);
    let selectedOrderForInvoice = $state(null);

    function applyFilters() {
        goto(`?page=1&search=${encodeURIComponent(searchQuery)}`);
    }

    function changePage(newPage) {
        if (!pagination || newPage < 1 || newPage > pagination.totalPages)
            return;
        goto(
            `?page=${newPage}&limit=${pagination.limit}&search=${encodeURIComponent(searchQuery)}`,
        );
    }

    function changeLimit(e) {
        const newLimit = e.target.value;
        goto(
            `?page=1&limit=${newLimit}&search=${encodeURIComponent(searchQuery)}`,
        );
    }

    function getStatusStyles(status) {
        switch (status.toLowerCase()) {
            case "pending":
                return "bg-orange-50 text-orange-600 border-orange-100";
            case "completed":
                return "bg-emerald-50 text-emerald-600 border-emerald-100";
            case "cancelled":
                return "bg-rose-50 text-rose-600 border-rose-100";
            default:
                return "bg-neutral-50 text-neutral-600 border-neutral-100";
        }
    }
</script>

<svelte:head>
    <title>Purchase History | Simple Shop</title>
</svelte:head>

<div
    class="min-h-screen bg-[#FAFAFA] text-[#1D1D1F] pt-24 pb-32"
>
    <div class="max-w-[1400px] mx-auto px-6">
        <div
            class="flex gap-8 items-start relative"
        >
            <!-- Main Content Area -->
            <div
                class={`${selectedOrderIdForShipment ? "lg:w-1/2 hidden lg:block" : "w-full max-w-4xl mx-auto"}`}
            >
                <!-- Header -->
                <div
                    class="mb-12 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6"
                >
                    <div>
                        <h1 class="text-4xl font-bold tracking-tight mb-3">
                            Your Orders
                        </h1>
                        <p class="text-neutral-500 font-medium text-lg">
                            Manage your recent purchases and track shipments.
                        </p>
                    </div>
                    <div class="flex items-center gap-3 w-full sm:w-auto">
                        <div class="relative w-full sm:w-64">
                            <Input
                                type="number"
                                placeholder="Search Invoice ID..."
                                bind:value={searchQuery}
                                onkeydown={(e) => {
                                    if (e.key === "Enter") applyFilters();
                                }}
                            />
                        </div>
                        <Button onclick={applyFilters}>Search</Button>
                    </div>
                </div>

                {#if orders.length === 0}
                    <div
                        in:fade={{ duration: 400 }}
                        class="bg-white rounded-[40px] p-24 text-center border border-neutral-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)]"
                    >
                        {#if data.search}
                            <div
                                class="w-20 h-20 bg-neutral-50 rounded-[24px] flex items-center justify-center mx-auto mb-8 text-neutral-300 shadow-inner rotate-3"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="36"
                                    height="36"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    class="-rotate-3"
                                    ><circle cx="11" cy="11" r="8"
                                    ></circle><line
                                        x1="21"
                                        y1="21"
                                        x2="16.65"
                                        y2="16.65"
                                    ></line><line x1="11" y1="8" x2="11" y2="14"
                                    ></line><line x1="8" y1="11" x2="14" y2="11"
                                    ></line></svg
                                >
                            </div>
                            <h2 class="text-2xl font-bold mb-3">
                                Invoice Not Found
                            </h2>
                            <p
                                class="text-neutral-400 mb-10 max-w-sm mx-auto font-medium leading-relaxed"
                            >
                                We couldn't find any order matching invoice "#{data.search}".
                            </p>
                            <button
                                onclick={() => {
                                    searchQuery = "";
                                    applyFilters();
                                }}
                                class="inline-flex items-center justify-center px-10 py-4 bg-black text-white rounded-full font-bold hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/10"
                            >
                                Clear Search
                            </button>
                        {:else}
                            <div
                                class="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-8 text-neutral-300"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="36"
                                    height="36"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="1.5"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    ><circle cx="9" cy="21" r="1"
                                    ></circle><circle cx="20" cy="21" r="1"
                                    ></circle><path
                                        d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"
                                    ></path></svg
                                >
                            </div>
                            <h2 class="text-2xl font-bold mb-3">
                                No orders yet
                            </h2>
                            <p
                                class="text-neutral-400 mb-10 max-w-sm mx-auto font-medium leading-relaxed"
                            >
                                Discover our curated collection and start your
                                first purchase today.
                            </p>
                            <a
                                href="/home/products"
                                class="inline-flex items-center justify-center px-10 py-4 bg-black text-white rounded-full font-bold hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/10"
                            >
                                Start Shopping
                            </a>
                        {/if}
                    </div>
                {:else}
                    <div class="space-y-12">
                        {#each orders as order (order.id)}
                            <div
                                in:fly={{ y: 20, duration: 500 }}
                                class={`bg-white rounded-[32px] overflow-hidden border transition-all duration-300 ${selectedOrderIdForShipment === order.id ? 'border-neutral-900 shadow-[0_20px_50px_rgba(0,0,0,0.1)] ring-2 ring-neutral-900' : 'border-neutral-100 shadow-[0_8px_40px_rgb(0,0,0,0.03)] scale-[0.98]'} group`}
                            >
                                <!-- Order Header -->
                                <div
                                    class="px-10 py-8 border-b border-neutral-50 flex flex-wrap items-center justify-between gap-6"
                                >
                                    <div class="flex items-center gap-6">
                                        <div
                                            class="bg-neutral-900 text-white w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm shadow-lg shadow-black/10"
                                        >
                                            #{order.id}
                                        </div>
                                        <div>
                                            <div
                                                class="flex items-center gap-3 mb-1"
                                            >
                                                <p
                                                    class="text-xs font-black text-neutral-300 uppercase tracking-widest"
                                                >
                                                    Order Placed
                                                </p>
                                                <span
                                                    class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border {getStatusStyles(
                                                        order.status,
                                                    )}"
                                                >
                                                    {order.status}
                                                </span>
                                            </div>
                                            <p
                                                class="text-sm font-bold text-neutral-800"
                                            >
                                                {new Date(
                                                    order.created_at,
                                                ).toLocaleDateString("id-ID", {
                                                    day: "numeric",
                                                    month: "long",
                                                    year: "numeric",
                                                })}
                                            </p>
                                        </div>
                                    </div>

                                    <div class="text-right">
                                        <p
                                            class="text-xs font-black text-neutral-300 uppercase tracking-widest mb-1"
                                        >
                                            Total Paid
                                        </p>
                                        <p
                                            class="text-2xl font-black tracking-tight"
                                        >
                                            <span
                                                class="text-sm font-medium align-top mr-0.5"
                                                >Rp</span
                                            >
                                            {order.total_price.toLocaleString(
                                                "id-ID",
                                            )}
                                        </p>
                                    </div>
                                </div>

                                <!-- Order Items -->
                                <div class="px-10 pb-8 bg-white">
                                    <div class="space-y-8">
                                        {#each order.items as item}
                                            <div
                                                class="flex items-center justify-between gap-6"
                                            >
                                                <div
                                                    class="flex items-center gap-5"
                                                >
                                                    <div
                                                        class="w-16 h-16 rounded-2xl overflow-hidden bg-neutral-50 border border-neutral-100 flex-shrink-0"
                                                    >
                                                        {#if item.product_image}
                                                            <img
                                                                loading="lazy"
                                                                src={item.product_image}
                                                                alt={item.product_name}
                                                                class="w-full h-full object-cover"
                                                            />
                                                        {:else}
                                                            <div
                                                                class="w-full h-full flex items-center justify-center text-neutral-200"
                                                            >
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    width="24"
                                                                    height="24"
                                                                    viewBox="0 0 24 24"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    stroke-width="1.5"
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
                                                    </div>
                                                    <div>
                                                        <h4
                                                            class="text-base font-bold text-neutral-900 mb-0.5"
                                                        >
                                                            {item.product_name}
                                                        </h4>
                                                        <p
                                                            class="text-sm text-neutral-400 font-medium"
                                                        >
                                                            Qty: {item.quantity}
                                                            <span class="mx-2"
                                                                >·</span
                                                            >
                                                            Rp {item.price.toLocaleString(
                                                                "id-ID",
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div class="text-right">
                                                    <p
                                                        class="text-base font-bold text-neutral-900"
                                                    >
                                                        Rp {(
                                                            item.price *
                                                            item.quantity
                                                        ).toLocaleString(
                                                            "id-ID",
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        {/each}
                                    </div>
                                </div>

                                <!-- Footer Actions -->
                                <div
                                    class="px-10 py-6 bg-neutral-50/50 border-t border-neutral-50 flex items-center justify-between"
                                >
                                    <button
                                        onclick={() => selectedOrderForInvoice = order}
                                        class="text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-black transition-colors flex items-center gap-2"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="14"
                                            height="14"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            stroke-width="2.5"
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            ><path
                                                d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4"
                                            /><polyline
                                                points="7 10 12 15 17 10"
                                            /><line
                                                x1="12"
                                                y1="15"
                                                x2="12"
                                                y2="3"
                                            /></svg
                                        >
                                        Get Invoice
                                    </button>
                                    <button
                                        onclick={() =>
                                            (selectedOrderIdForShipment =
                                                order.id)}
                                        class={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${selectedOrderIdForShipment === order.id ? 'bg-black text-white' : 'bg-white border border-neutral-200 hover:bg-neutral-50'}`}
                                    >
                                        {selectedOrderIdForShipment === order.id ? 'Tracking...' : 'Track Shipment'}
                                    </button>
                                </div>
                            </div>
                        {/each}
                    </div>

                    <!-- Pagination -->
                    {#if pagination}
                        <div
                            class="flex flex-col sm:flex-row justify-between items-center mt-12 bg-white p-6 rounded-[24px] border border-neutral-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] gap-4"
                        >
                            <div class="flex items-center gap-3">
                                <span class="text-sm font-bold text-neutral-500"
                                    >Show</span
                                >
                                <select
                                    value={pagination.limit}
                                    onchange={changeLimit}
                                    class="h-10 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-black"
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                </select>
                            </div>

                            <div class="flex items-center gap-4">
                                <Button
                                    variant="outline"
                                    disabled={pagination.page <= 1}
                                    onclick={() =>
                                        changePage(pagination.page - 1)}
                                >
                                    Previous
                                </Button>
                                <span
                                    class="text-sm font-bold text-neutral-500"
                                >
                                    Page <span class="text-black"
                                        >{pagination.page}</span
                                    >
                                    of {pagination.totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    disabled={pagination.page >=
                                        pagination.totalPages}
                                    onclick={() =>
                                        changePage(pagination.page + 1)}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    {/if}
                {/if}
                <!-- ADDED: Missing closing tag for {#if orders.length === 0} -->
            </div>

            <!-- Shipment Drawer Area -->
            {#if selectedOrderIdForShipment}
                <div
                    class="w-full lg:w-1/2 z-10 sticky top-24 self-start h-[calc(100vh-8rem)]"
                >
                    <ShipmentDrawer
                        orderId={selectedOrderIdForShipment}
                        onClose={() => (selectedOrderIdForShipment = null)}
                    />
                </div>
            {/if}
        </div>
    </div>
</div>

{#if selectedOrderForInvoice}
    <InvoiceModal 
        order={selectedOrderForInvoice} 
        onClose={() => selectedOrderForInvoice = null} 
    />
{/if}

<style>
    @import url("https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap");

    :global(body) {
        font-family: "Plus Jakarta Sans", sans-serif;
        background-color: #fafafa;
    }
</style>
