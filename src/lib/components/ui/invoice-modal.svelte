<script>
    import { fade, scale } from "svelte/transition";
    import Button from "$lib/components/ui/button.svelte";
    import Card from "$lib/components/ui/card.svelte";

    let { order, onClose } = $props();

    function handleDownload() {
        // Simple print-based "download"
        const printContent =
            document.getElementById("invoice-content").innerHTML;

        // We'll use a hidden iframe or just a new window for a cleaner print
        const printWindow = window.open("", "_blank");
        printWindow.document.write(`
            <html>
                <head>
                    <title>Invoice #${order.id}</title>
                    <script src="https://cdn.tailwindcss.com"><\/script>
                    <style>
                        @media print {
                            body { padding: 20px; }
                            .no-print { display: none; }
                        }
                    </style>
                </head>
                <body class="bg-white p-8">
                    ${printContent}
                    <script>
                        window.onload = () => {
                            window.print();
                            window.close();
                        };
                    <\/script>
                </body>
            </html>
        `);
        printWindow.document.close();
    }
</script>

<div
    class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    transition:fade={{ duration: 200 }}
>
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="absolute inset-0" onclick={onClose}></div>

    <div
        class="relative w-full max-w-3xl bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        transition:scale={{ start: 0.95, duration: 200 }}
    >
        <!-- Header -->
        <div
            class="px-8 py-6 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50"
        >
            <div>
                <h2 class="text-2xl font-black tracking-tight">Invoice</h2>
                <p
                    class="text-sm font-bold text-neutral-400 uppercase tracking-widest mt-1"
                >
                    Order #{order.id}
                </p>
            </div>
            <button
                onclick={onClose}
                class="w-10 h-10 rounded-full flex items-center justify-center hover:bg-neutral-100 transition-colors"
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
                    ><line x1="18" y1="6" x2="6" y2="18" /><line
                        x1="6"
                        y1="6"
                        x2="18"
                        y2="18"
                    /></svg
                >
            </button>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto p-8" id="invoice-content">
            <div class="flex justify-between items-start mb-12">
                <div>
                    <div class="flex items-center gap-2 mb-4">
                        <div
                            class="w-10 h-10 bg-black rounded-xl flex items-center justify-center"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="white"
                                stroke-width="3"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                ><path
                                    d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"
                                /><path d="M3 6h18" /><path
                                    d="M16 10a4 4 0 0 1-8 0"
                                /></svg
                            >
                        </div>
                        <span
                            class="text-xl font-black tracking-tighter uppercase"
                            >SimpleShop</span
                        >
                    </div>
                    <div class="text-sm text-neutral-500 space-y-1">
                        <p>123 Commerce Avenue</p>
                        <p>Jakarta, Indonesia 12345</p>
                        <p>support@simpleshop.com</p>
                    </div>
                </div>
                <div class="text-right">
                    <h3
                        class="text-4xl font-black text-neutral-200 uppercase mb-2"
                    >
                        PAID
                    </h3>
                    <div class="text-sm space-y-1">
                        <p class="font-bold text-neutral-900">Date Issued</p>
                        <p class="text-neutral-500">
                            {new Date(order.created_at).toLocaleDateString(
                                "id-ID",
                                {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                },
                            )}
                        </p>
                    </div>
                </div>
            </div>

            <div
                class="grid grid-cols-2 gap-12 mb-12 border-t border-neutral-100 pt-12"
            >
                <div>
                    <h4
                        class="text-xs font-black uppercase tracking-widest text-neutral-400 mb-4"
                    >
                        Bill To
                    </h4>
                    <p class="font-bold text-lg text-neutral-900">
                        {order.email || "Customer"}
                    </p>
                    <p class="text-sm text-neutral-500 mt-1">
                        Customer ID: #{order.user_id}
                    </p>
                </div>
                <div>
                    <h4
                        class="text-xs font-black uppercase tracking-widest text-neutral-400 mb-4"
                    >
                        Order Details
                    </h4>
                    <div class="space-y-1 text-sm">
                        <div class="flex justify-between">
                            <span class="text-neutral-500">Invoice Number</span>
                            <span class="font-bold"
                                >#INV-{order.id}-{new Date(
                                    order.created_at,
                                ).getFullYear()}</span
                            >
                        </div>
                        <div class="flex justify-between">
                            <span class="text-neutral-500">Payment Status</span>
                            <span class="font-bold text-emerald-600 uppercase"
                                >Successful</span
                            >
                        </div>
                    </div>
                </div>
            </div>

            <table class="w-full mb-12">
                <thead>
                    <tr class="border-b-2 border-neutral-900">
                        <th
                            class="py-4 text-left text-xs font-black uppercase tracking-widest"
                            >Description</th
                        >
                        <th
                            class="py-4 text-center text-xs font-black uppercase tracking-widest"
                            >Qty</th
                        >
                        <th
                            class="py-4 text-right text-xs font-black uppercase tracking-widest"
                            >Price</th
                        >
                        <th
                            class="py-4 text-right text-xs font-black uppercase tracking-widest"
                            >Total</th
                        >
                    </tr>
                </thead>
                <tbody class="divide-y divide-neutral-100">
                    {#if order.items}
                        {#each order.items as item}
                            <tr>
                                <td class="py-6">
                                    <p class="font-bold text-neutral-900">
                                        {item.name}
                                    </p>
                                    <p
                                        class="text-xs text-neutral-400 mt-1 uppercase tracking-tight"
                                    >
                                        Product ID: {item.product_id}
                                    </p>
                                </td>
                                <td class="py-6 text-center font-medium"
                                    >{item.quantity}</td
                                >
                                <td class="py-6 text-right font-medium"
                                    >Rp {item.price.toLocaleString("id-ID")}</td
                                >
                                <td class="py-6 text-right font-bold"
                                    >Rp {(
                                        item.price * item.quantity
                                    ).toLocaleString("id-ID")}</td
                                >
                            </tr>
                        {/each}
                    {/if}
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="2"></td>
                        <td
                            class="py-6 text-right text-sm font-bold text-neutral-400 uppercase tracking-widest pt-12"
                            >Subtotal</td
                        >
                        <td class="py-6 text-right font-bold pt-12"
                            >Rp {order.total_price.toLocaleString("id-ID")}</td
                        >
                    </tr>
                    <tr>
                        <td colspan="2"></td>
                        <td
                            class="py-4 text-right text-sm font-bold text-neutral-400 uppercase tracking-widest"
                            >Tax (0%)</td
                        >
                        <td class="py-4 text-right font-bold text-neutral-400"
                            >Rp 0</td
                        >
                    </tr>
                    <tr class="border-t-2 border-neutral-900">
                        <td colspan="2"></td>
                        <td
                            class="py-6 text-right text-lg font-black uppercase tracking-tighter"
                            >Grand Total</td
                        >
                        <td
                            class="py-6 text-right text-2xl font-black tracking-tighter"
                            >Rp {order.total_price.toLocaleString("id-ID")}</td
                        >
                    </tr>
                </tfoot>
            </table>

            <div
                class="bg-neutral-50 rounded-2xl p-6 border border-neutral-100"
            >
                <h4
                    class="text-xs font-black uppercase tracking-widest text-neutral-400 mb-2"
                >
                    Note
                </h4>
                <p class="text-sm text-neutral-500 leading-relaxed">
                    Thank you for shopping with SimpleShop. This is a
                    computer-generated invoice and doesn't require a physical
                    signature. For any questions regarding this invoice, please
                    contact our support team.
                </p>
            </div>
        </div>

        <!-- Footer -->
        <div class="px-8 py-6 border-t border-neutral-100 flex gap-4 bg-white">
            <Button
                variant="outline"
                className="flex-1 rounded-2xl h-12"
                onclick={onClose}
            >
                Close
            </Button>
            <Button
                className="flex-1 rounded-2xl h-12 shadow-lg shadow-black/10 flex items-center justify-center gap-2"
                onclick={handleDownload}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    ><path
                        d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
                    /><polyline points="7 10 12 15 17 10" /><line
                        x1="12"
                        y1="15"
                        x2="12"
                        y2="3"
                    /></svg
                >
                Download PDF
            </Button>
        </div>
    </div>
</div>
