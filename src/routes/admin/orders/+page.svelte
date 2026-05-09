<script>
    import { onMount } from "svelte";
    import Card from "$lib/components/ui/card.svelte";
    import Button from "$lib/components/ui/button.svelte";
    import Input from "$lib/components/ui/input.svelte";
    import Label from "$lib/components/ui/label.svelte";
    import ShipmentDrawer from "$lib/components/ui/shipment-drawer.svelte";
    import InvoiceModal from "$lib/components/ui/invoice-modal.svelte";
    import { fade, fly } from "svelte/transition";
    
    let items = $state([]);
    let form = $state({ id: null, user_id: "", total_price: 0, status: "pending" });
    let displayPrice = $state("");
    let isEditing = $state(false);
    let loading = $state(true);
    let errorMessage = $state("");
    let currentPage = $state(1);
    let totalPages = $state(1);
    let limit = $state(10);
    let searchQuery = $state("");
    let selectedOrderIdForShipment = $state(null);
    let selectedOrderForInvoice = $state(null);

    let selectedIds = $state([]);
    let showDeleteModal = $state(false);
    let orderToDelete = $state(null);
    let isBulkDelete = $state(false);

    onMount(() => loadData(1));

    function getCSRF() {
        return document.cookie.split("; ").find((row) => row.startsWith("csrf_token="))?.split("=")[1];
    }

    function getHeaders() {
        return {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}`,
            "x-csrf-token": getCSRF() || ""
        };
    }

    async function loadData(page = 1) {
        loading = true;
        selectedIds = []; // Clear selection on reload
        try {
            const res = await fetch(`/admin/orders?page=${page}&limit=${limit}&search=${encodeURIComponent(searchQuery)}`, { headers: getHeaders() });
            const data = await res.json();
            if (data.success) {
                items = data.orders || [];
                if (data.pagination) {
                    currentPage = data.pagination.page;
                    totalPages = data.pagination.totalPages || 1;
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            loading = false;
        }
    }

    async function saveItem() {
        errorMessage = "";
        try {
            const method = form.id ? "PUT" : "POST";
            const res = await fetch("/admin/orders", {
                method,
                headers: getHeaders(),
                body: JSON.stringify(form)
            });
            const data = await res.json();
            if (data.success) {
                resetForm();
                await loadData(currentPage);
            } else {
                errorMessage = data.error || "Failed to save order.";
            }
        } catch (e) {
            console.error(e);
            errorMessage = "Network error occurred.";
        }
    }

    function confirmDelete(id = null) {
        if (id) {
            orderToDelete = id;
            isBulkDelete = false;
        } else {
            isBulkDelete = true;
        }
        showDeleteModal = true;
    }

    async function processDelete() {
        showDeleteModal = false;
        errorMessage = "";
        try {
            let url = "/admin/orders";
            if (isBulkDelete) {
                url += `?ids=${selectedIds.join(",")}`;
            } else {
                url += `?id=${orderToDelete}`;
            }

            const res = await fetch(url, {
                method: "DELETE",
                headers: getHeaders()
            });
            const data = await res.json();
            if (data.success) {
                selectedIds = [];
                await loadData(currentPage);
            }
            else errorMessage = data.error || "Failed to delete.";
        } catch (e) {
            console.error(e);
            errorMessage = "Network error occurred.";
        }
    }

    function toggleSelectAll() {
        if (selectedIds.length === items.length) {
            selectedIds = [];
        } else {
            selectedIds = items.map(item => item.id);
        }
    }

    function toggleSelect(id) {
        if (selectedIds.includes(id)) {
            selectedIds = selectedIds.filter(i => i !== id);
        } else {
            selectedIds = [...selectedIds, id];
        }
    }

    function handlePriceInput(e) {
        let rawValue = e.target.value.replace(/\D/g, "");
        if (!rawValue) {
            displayPrice = "";
            form.total_price = 0;
            return;
        }
        form.total_price = parseInt(rawValue, 10);
        displayPrice = "Rp " + form.total_price.toLocaleString("id-ID");
    }

    function editItem(item) {
        form = { ...item };
        displayPrice = form.total_price ? "Rp " + form.total_price.toLocaleString("id-ID") : "";
        isEditing = true;
        errorMessage = "";
    }

    function resetForm() {
        form = { id: null, user_id: "", total_price: 0, status: "pending" };
        displayPrice = "";
        isEditing = false;
        errorMessage = "";
    }
</script>

<svelte:head>
    <title>Manage Orders</title>
</svelte:head>

<div class="bg-neutral-50 pt-8 pb-12">
    <div class="max-w-[1600px] mx-auto px-6">
        <div class="flex gap-8 items-start relative">
            <!-- Main Content Area -->
            <div class={`space-y-6 ${selectedOrderIdForShipment ? 'lg:w-[70%] hidden lg:block' : 'w-full max-w-6xl mx-auto'}`}>
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 class="text-2xl font-bold">Orders</h1>
        <div class="flex items-center gap-4 w-full sm:w-auto">
            <div class="relative w-full sm:w-64">
                <Input 
                    type="number" 
                    placeholder="Search Invoice ID..." 
                    bind:value={searchQuery}
                    oninput={() => {
                        // debounce or just direct load for simple ID search
                        loadData(1);
                    }}
                />
            </div>
            {#if !isEditing}
                <Button onclick={() => { isEditing = true; errorMessage = ""; }}>Add Order</Button>
            {/if}
        </div>
    </div>

    {#if errorMessage && !isEditing}
        <div class="p-3 rounded-xl bg-red-50 text-red-700 text-sm font-medium border border-red-200">
            {errorMessage}
        </div>
    {/if}

    {#if isEditing}
        <Card>
            <h2 class="text-lg font-semibold mb-4">{form.id ? 'Edit' : 'Add'} Order</h2>
            {#if errorMessage}
                <div class="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-sm font-medium border border-red-200">
                    {errorMessage}
                </div>
            {/if}
            <div class="space-y-4">
                <div>
                    <Label>User ID</Label>
                    <Input type="number" bind:value={form.user_id} placeholder="User ID" />
                </div>
                <div>
                    <Label>Total Price</Label>
                    <Input type="text" value={displayPrice} oninput={handlePriceInput} placeholder="Rp 0" />
                </div>
                <div>
                    <Label>Status</Label>
                    <select bind:value={form.status} class="flex h-10 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1">
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
                <div class="flex gap-2">
                    <Button onclick={saveItem}>Save</Button>
                    <Button variant="outline" onclick={resetForm}>Cancel</Button>
                </div>
            </div>
        </Card>
    {/if}

    <Card>
        {#if loading}
            <div class="py-12 text-center">
                <div class="inline-block w-8 h-8 border-4 border-neutral-200 border-t-black rounded-full animate-spin mb-4"></div>
                <p class="text-neutral-500 font-medium">Loading orders...</p>
            </div>
        {:else if items.length === 0}
            <div class="py-12 text-center">
                <p class="text-neutral-500 font-medium">No orders found.</p>
            </div>
        {:else}
            <div class="flex items-center justify-between mb-4 px-2">
                <div class="flex items-center gap-4">
                    {#if selectedIds.length > 0}
                        <Button variant="outline" className="text-red-600 border-red-200 bg-red-50 hover:bg-red-100" onclick={() => confirmDelete()}>
                            Delete Selected ({selectedIds.length})
                        </Button>
                    {/if}
                </div>
            </div>
            <div class="overflow-x-auto -mx-6 -mt-2">
                <table class="w-full text-left border-collapse whitespace-nowrap">
                    <thead>
                        <tr class="border-y border-neutral-200 bg-neutral-50/50">
                            <th class="px-6 py-3">
                                <input 
                                    type="checkbox" 
                                    class="rounded border-neutral-300 text-black focus:ring-black"
                                    checked={selectedIds.length === items.length && items.length > 0}
                                    onchange={toggleSelectAll}
                                />
                            </th>
                            <th class="px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">ID</th>
                            <th class="px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">User Email</th>
                            <th class="px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Total Price</th>
                            <th class="px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Status</th>
                            <th class="px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-neutral-100">
                        {#each items as item (item.id)}
                            <tr class={`transition-all duration-300 ${selectedOrderIdForShipment === item.id ? 'bg-neutral-900 text-white' : 'hover:bg-neutral-50/50'} ${selectedIds.includes(item.id) ? 'bg-blue-50/30' : ''}`}>
                                <td class="px-6 py-4">
                                    <input 
                                        type="checkbox" 
                                        class="rounded border-neutral-300 text-black focus:ring-black"
                                        checked={selectedIds.includes(item.id)}
                                        onchange={() => toggleSelect(item.id)}
                                    />
                                </td>
                                <td class={`px-6 py-4 text-sm ${selectedOrderIdForShipment === item.id ? 'text-neutral-300' : 'text-neutral-500'}`}>{item.id}</td>
                                <td class="px-6 py-4 text-sm font-medium">{item.email || item.user_id}</td>
                                <td class={`px-6 py-4 text-sm ${selectedOrderIdForShipment === item.id ? 'text-neutral-200' : 'text-neutral-600'}`}>Rp {item.total_price.toLocaleString('id-ID')}</td>
                                <td class="px-6 py-4">
                                    <span class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${selectedOrderIdForShipment === item.id ? 'bg-white/20 text-white' : 'bg-neutral-100 text-neutral-800'}`}>
                                        {item.status}
                                    </span>
                                </td>
                                <td class="px-6 py-4 text-sm text-right space-x-4">
                                    <button class={`font-medium transition-colors ${selectedOrderIdForShipment === item.id ? 'text-white/80 hover:text-white' : 'text-blue-600 hover:text-blue-800'}`} onclick={() => editItem(item)}>Edit</button>
                                    <button class={`font-medium transition-colors ${selectedOrderIdForShipment === item.id ? 'text-white' : 'text-emerald-600 hover:text-emerald-800'}`} onclick={() => selectedOrderIdForShipment = item.id}>
                                        {selectedOrderIdForShipment === item.id ? 'Tracking' : 'Track'}
                                    </button>
                                    <button class={`font-medium transition-colors ${selectedOrderIdForShipment === item.id ? 'text-white/60 hover:text-white' : 'text-neutral-500 hover:text-neutral-900'}`} onclick={() => selectedOrderForInvoice = item}>
                                        Invoice
                                    </button>
                                    <button class={`font-medium transition-colors ${selectedOrderIdForShipment === item.id ? 'text-red-300 hover:text-red-100' : 'text-red-600 hover:text-red-800'}`} onclick={() => confirmDelete(item.id)}>Delete</button>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>

            <div class="flex justify-between items-center mt-6 pt-2">
                <div class="flex items-center space-x-2">
                    <span class="text-sm font-medium text-neutral-500">Show</span>
                    <select bind:value={limit} onchange={() => loadData(1)} class="h-8 rounded-md border border-neutral-300 bg-white px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400">
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                    </select>
                </div>
                <div class="flex items-center space-x-4">
                    <Button variant="outline" disabled={currentPage <= 1} onclick={() => loadData(currentPage - 1)} className="text-sm">Previous</Button>
                    <span class="text-sm font-medium text-neutral-500">Page <span class="text-neutral-900">{currentPage}</span> of {totalPages}</span>
                    <Button variant="outline" disabled={currentPage >= totalPages} onclick={() => loadData(currentPage + 1)} className="text-sm">Next</Button>
                </div>
            </div>
        {/if}
    </Card>
        </div>

        <!-- Shipment Drawer Area -->
        {#if selectedOrderIdForShipment}
            <div class="w-full lg:w-[30%] h-[calc(100vh-8rem)] sticky top-24 self-start z-10">
                <ShipmentDrawer 
                    orderId={selectedOrderIdForShipment} 
                    isAdmin={true}
                    onClose={() => selectedOrderIdForShipment = null} 
                />
            </div>
        {/if}
    </div>
</div>

{#if selectedOrderForInvoice}
    <InvoiceModal 
        order={selectedOrderForInvoice} 
        onClose={() => selectedOrderForInvoice = null} 
    />
{/if}

<!-- Delete Confirmation Modal -->
{#if showDeleteModal}
    <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" transition:fade>
        <div class="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-neutral-100" transition:fly={{ y: 20 }}>
            <div class="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6 text-red-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
            </div>
            <h3 class="text-2xl font-bold mb-2">Confirm Delete</h3>
            <p class="text-neutral-500 mb-8 font-medium leading-relaxed">
                {isBulkDelete 
                    ? `Are you sure you want to delete ${selectedIds.length} selected orders? This action cannot be undone.` 
                    : "Are you sure you want to delete this order? This action cannot be undone."}
            </p>
            <div class="flex gap-3">
                <Button variant="outline" className="flex-1" onclick={() => showDeleteModal = false}>Cancel</Button>
                <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white" onclick={processDelete}>Delete Now</Button>
            </div>
        </div>
    </div>
{/if}
</div>
