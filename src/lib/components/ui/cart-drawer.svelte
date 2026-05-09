<script>
    import { cart } from "$lib/cart.svelte.js";
    import { notification } from "$lib/notification.svelte.js";
    import Button from "$lib/components/ui/button.svelte";
    import { goto } from "$app/navigation";
    import { fade, fly } from "svelte/transition";

    let loading = $state(false);

    async function placeOrder() {
        if (cart.items.length === 0) return;

        loading = true;
        try {
            const res = await fetch("/home/order", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
                },
                body: JSON.stringify({
                    items: cart.items.map((i) => ({
                        product_id: i.id,
                        quantity: i.quantity,
                        price: i.price,
                        name: i.name // Added name for Midtrans item_details
                    })),
                }),
            });

            const result = await res.json();
            if (result.success && result.snap_token) {
                const orderId = result.order_id;
                // Midtrans Snap integration
                window.snap.pay(result.snap_token, {
                    onSuccess: function(result) {
                        notification.success("Payment successful! ✨");
                        cart.clear();
                        cart.close();
                        goto("/home/order");
                    },
                    onPending: function(result) {
                        notification.info("Payment pending. Please complete your payment.");
                        cart.clear();
                        cart.close();
                        goto("/home/order");
                    },
                    onError: async function(result) {
                        notification.error("Payment failed!");
                        console.error(result);
                        // Cancel order in DB
                        await fetch(`/home/order?id=${orderId}`, { method: 'DELETE', headers: { "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}` } });
                    },
                    onClose: async function() {
                        notification.info("You closed the payment popup. Order cancelled.");
                        // Cancel order in DB
                        await fetch(`/home/order?id=${orderId}`, { method: 'DELETE', headers: { "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}` } });
                    }
                });
            } else {
                notification.error(result.error || "Failed to place order.");
            }
        } catch (e) {
            console.error(e);
            notification.error("Network error occurred.");
        } finally {
            loading = false;
        }
    }
</script>

{#if cart.isOpen}
    <!-- Backdrop -->
    <div
        class="fixed inset-0 z-[100]"
        onclick={() => cart.close()}
    ></div>

    <!-- Dropdown -->
    <div
        class="absolute top-full right-0 mt-4 w-[400px] max-h-[80vh] bg-white z-[101] shadow-2xl rounded-3xl border border-neutral-100 flex flex-col overflow-hidden"
        transition:fly={{ y: -20, duration: 200, opacity: 0 }}
    >
        <!-- Header -->
        <div
            class="px-6 py-5 border-b border-neutral-100 flex items-center justify-between"
        >
            <h2 class="text-xl font-bold flex items-center gap-2">
                Your Cart
                <span
                    class="bg-neutral-100 text-neutral-500 text-xs px-2 py-0.5 rounded-full"
                    >{cart.count}</span
                >
            </h2>
            <button
                onclick={() => cart.close()}
                class="p-2 hover:bg-neutral-50 rounded-full transition-colors text-neutral-400 hover:text-black"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    ><line x1="18" y1="6" x2="6" y2="18"></line><line
                        x1="6"
                        y1="6"
                        x2="18"
                        y2="18"
                    ></line></svg
                >
            </button>
        </div>

        <!-- Items -->
        <div class="flex-grow overflow-y-auto p-6 space-y-6">
            {#if cart.items.length === 0}
                <div
                    class="h-full flex flex-col items-center justify-center text-center"
                >
                    <div
                        class="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mb-4 text-neutral-300"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="32"
                            height="32"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="1.5"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            ><circle cx="9" cy="21" r="1"></circle><circle
                                cx="20"
                                cy="21"
                                r="1"
                            ></circle><path
                                d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"
                            ></path></svg
                        >
                    </div>
                    <p class="text-neutral-500 font-medium">
                        Your cart is empty.
                    </p>
                    <button
                        onclick={() => cart.close()}
                        class="mt-4 text-sm font-bold text-blue-600 hover:underline"
                        >Continue Shopping</button
                    >
                </div>
            {:else}
                {#each cart.items as item}
                    <div class="flex gap-4 group">
                        <div
                            class="w-20 h-20 rounded-2xl overflow-hidden bg-neutral-50 flex-shrink-0 border border-neutral-100"
                        >
                            {#if item.image}
                                <img loading="lazy"
                                    src={item.image}
                                    alt={item.name}
                                    class="w-full h-full object-cover"
                                />
                            {:else}
                                <div
                                    class="w-full h-full flex items-center justify-center text-neutral-300"
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
                        <div class="flex-grow min-w-0 py-1">
                            <div class="flex justify-between items-start mb-1">
                                <h3 class="text-sm font-bold truncate pr-4">
                                    {item.name}
                                </h3>
                                <p class="text-sm font-black">
                                    Rp {(
                                        item.price * item.quantity
                                    ).toLocaleString("id-ID")}
                                </p>
                            </div>
                            <p
                                class="text-xs text-neutral-400 mb-3 font-medium"
                            >
                                Rp {item.price.toLocaleString("id-ID")}
                            </p>
                            <div class="flex items-center justify-between">
                                <div
                                    class="flex items-center bg-neutral-50 rounded-lg p-1 border border-neutral-100"
                                >
                                    <button
                                        onclick={() =>
                                            cart.updateQuantity(
                                                item.id,
                                                item.quantity - 1,
                                            )}
                                        class="p-1 hover:text-black text-neutral-400"
                                        ><svg
                                            width="12"
                                            height="12"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            stroke-width="3"
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            ><line
                                                x1="5"
                                                y1="12"
                                                x2="19"
                                                y2="12"
                                            ></line></svg
                                        ></button
                                    >
                                    <span
                                        class="w-8 text-center text-xs font-bold"
                                        >{item.quantity}</span
                                    >
                                    <button
                                        onclick={() =>
                                            cart.updateQuantity(
                                                item.id,
                                                item.quantity + 1,
                                            )}
                                        class="p-1 hover:text-black text-neutral-400"
                                        ><svg
                                            width="12"
                                            height="12"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            stroke-width="3"
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            ><line
                                                x1="12"
                                                y1="5"
                                                x2="12"
                                                y2="19"
                                            ></line><line
                                                x1="5"
                                                y1="12"
                                                x2="19"
                                                y2="12"
                                            ></line></svg
                                        ></button
                                    >
                                </div>
                                <button
                                    onclick={() => cart.remove(item.id)}
                                    class="text-[10px] font-black uppercase tracking-widest text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >Remove</button
                                >
                            </div>
                        </div>
                    </div>
                {/each}
            {/if}
        </div>

        <!-- Footer -->
        {#if cart.items.length > 0}
            <div class="p-6 border-t border-neutral-100 bg-neutral-50/50">
                <div class="flex justify-between items-end mb-6">
                    <span
                        class="text-sm font-bold text-neutral-400 uppercase tracking-widest"
                        >Total Price</span
                    >
                    <span class="text-2xl font-black"
                        >Rp {cart.total.toLocaleString("id-ID")}</span
                    >
                </div>
                <Button
                    onclick={placeOrder}
                    disabled={loading}
                    className="w-full py-4 bg-black text-white rounded-2xl font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-black/10"
                >
                    {loading ? "Processing..." : "Place Order Now"}
                </Button>
                <p
                    class="text-[9px] text-center text-neutral-400 mt-4 font-bold uppercase tracking-[0.2em]"
                >
                    Free Shipping Included
                </p>
            </div>
        {/if}
    </div>
{/if}
