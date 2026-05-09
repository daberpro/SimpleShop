<script>
    import { onMount } from "svelte";
    import Card from "$lib/components/ui/card.svelte";
    import Button from "$lib/components/ui/button.svelte";
    import Input from "$lib/components/ui/input.svelte";
    import Label from "$lib/components/ui/label.svelte";
    import { fade, fly } from "svelte/transition";

    let items = $state([]);
    let categories = $state([]);
    let form = $state({
        id: null,
        name: "",
        price: 0,
        category_id: "",
        image: "",
        description: "",
    });
    let imageFile = $state(null);
    let displayPrice = $state("");
    let isEditing = $state(false);
    let loading = $state(true);
    let errorMessage = $state("");
    let currentPage = $state(1);
    let totalPages = $state(1);
    let limit = $state(10);
    let searchQuery = $state("");
    let selectedCategoryId = $state("");

    let selectedIds = $state([]);
    let showDeleteModal = $state(false);
    let itemToDelete = $state(null);
    let isBulkDelete = $state(false);
    let selectedProduct = $state(null);
    let showDetailModal = $state(false);

    onMount(async () => {
        await loadCategories();
        await loadData(1);
    });

    function getCSRF() {
        return document.cookie
            .split("; ")
            .find((row) => row.startsWith("csrf_token="))
            ?.split("=")[1];
    }

    function getHeaders() {
        return {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
            "x-csrf-token": getCSRF() || "",
        };
    }

    async function loadCategories() {
        try {
            const res = await fetch("/admin/category?limit=100", {
                headers: getHeaders(),
            });
            const data = await res.json();
            if (data.success) categories = data.categories || [];
        } catch (e) {
            console.error(e);
        }
    }

    async function loadData(page = 1) {
        loading = true;
        selectedIds = [];
        try {
            const res = await fetch(
                `/admin/products?page=${page}&limit=${limit}&search=${encodeURIComponent(searchQuery)}&category=${selectedCategoryId}`,
                { headers: getHeaders() },
            );
            const data = await res.json();
            if (data.success) {
                items = data.products || [];
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

            const formData = new FormData();
            if (form.id) formData.append("id", form.id);
            formData.append("name", form.name);
            formData.append("price", form.price);
            formData.append("category_id", form.category_id);
            formData.append("description", form.description);
            if (imageFile) {
                formData.append("image", imageFile);
            }
            if (form.image) {
                formData.append("existing_image", form.image);
            }

            const res = await fetch("/admin/products", {
                method,
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
                    "x-csrf-token": getCSRF() || "",
                },
                body: formData,
            });
            const data = await res.json();
            if (data.success) {
                resetForm();
                await loadData(currentPage);
            } else {
                errorMessage = data.error || "Failed to save product.";
            }
        } catch (e) {
            console.error(e);
            errorMessage = "Network error occurred.";
        }
    }

    function confirmDelete(id = null) {
        if (id) {
            itemToDelete = id;
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
            let url = "/admin/products";
            if (isBulkDelete) {
                url += `?ids=${selectedIds.join(",")}`;
            } else {
                url += `?id=${itemToDelete}`;
            }

            const res = await fetch(url, {
                method: "DELETE",
                headers: getHeaders(),
            });
            const data = await res.json();
            if (data.success) {
                selectedIds = [];
                await loadData(currentPage);
            } else errorMessage = data.error || "Failed to delete.";
        } catch (e) {
            console.error(e);
            errorMessage = "Network error occurred.";
        }
    }

    function toggleSelectAll() {
        if (selectedIds.length === items.length) {
            selectedIds = [];
        } else {
            selectedIds = items.map((item) => item.id);
        }
    }

    function toggleSelect(id) {
        if (selectedIds.includes(id)) {
            selectedIds = selectedIds.filter((i) => i !== id);
        } else {
            selectedIds = [...selectedIds, id];
        }
    }

    function handlePriceInput(e) {
        let rawValue = e.target.value.replace(/\D/g, "");
        if (!rawValue) {
            displayPrice = "";
            form.price = 0;
            return;
        }
        form.price = parseInt(rawValue, 10);
        displayPrice = "Rp " + form.price.toLocaleString("id-ID");
    }

    function editItem(item) {
        form = { ...item };
        displayPrice = form.price
            ? "Rp " + form.price.toLocaleString("id-ID")
            : "";
        isEditing = true;
        errorMessage = "";
    }

    function resetForm() {
        form = {
            id: null,
            name: "",
            price: 0,
            category_id: "",
            image: "",
            description: "",
        };
        imageFile = null;
        displayPrice = "";
        isEditing = false;
        errorMessage = "";
    }

    function viewDetails(item) {
        selectedProduct = item;
        showDetailModal = true;
    }

    function closeDetailModal() {
        showDetailModal = false;
        selectedProduct = null;
    }
</script>

<svelte:head>
    <title>Manage Products</title>
</svelte:head>

<div class="p-6 max-w-6xl mx-auto space-y-6">
    <div
        class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
    >
        <h1 class="text-2xl font-bold text-neutral-900">Products</h1>
        <div class="flex items-center gap-3 w-full sm:w-auto">
            <div class="relative flex-1 sm:w-64">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                    ><circle cx="11" cy="11" r="8" /><path
                        d="m21 21-4.3-4.3"
                    /></svg
                >
                <input
                    type="text"
                    bind:value={searchQuery}
                    oninput={() => loadData(1)}
                    placeholder="Search products..."
                    class="w-full pl-10 pr-4 h-10 rounded-xl border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                />
            </div>
            <select
                bind:value={selectedCategoryId}
                onchange={() => loadData(1)}
                class="h-10 rounded-xl border border-neutral-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all min-w-[140px]"
            >
                <option value="">All Categories</option>
                {#each categories as cat}
                    <option value={cat.id}>{cat.name}</option>
                {/each}
            </select>
            {#if !isEditing}
                <Button
                    onclick={() => {
                        isEditing = true;
                        errorMessage = "";
                    }}
                    className="rounded-xl h-10 px-5 shadow-lg shadow-black/5"
                >
                    Add Product
                </Button>
            {/if}
        </div>
    </div>

    {#if errorMessage && !isEditing}
        <div
            class="p-3 rounded-xl bg-red-50 text-red-700 text-sm font-medium border border-red-200"
        >
            {errorMessage}
        </div>
    {/if}

    {#if isEditing}
        <Card>
            <h2 class="text-lg font-semibold mb-4">
                {form.id ? "Edit" : "Add"} Product
            </h2>
            {#if errorMessage}
                <div
                    class="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-sm font-medium border border-red-200"
                >
                    {errorMessage}
                </div>
            {/if}
            <div class="space-y-4">
                <div>
                    <Label for="product-name">Name</Label>
                    <Input
                        id="product-name"
                        bind:value={form.name}
                        placeholder="Product Name"
                    />
                </div>
                <div>
                    <Label for="product-price">Price</Label>
                    <Input
                        id="product-price"
                        type="text"
                        value={displayPrice}
                        oninput={handlePriceInput}
                        placeholder="Rp 0"
                    />
                </div>
                <div>
                    <Label for="product-category">Category</Label>
                    <select
                        id="product-category"
                        bind:value={form.category_id}
                        class="flex h-10 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                    >
                        <option value="">Select Category</option>
                        {#each categories as cat}
                            <option value={cat.id}>{cat.name}</option>
                        {/each}
                    </select>
                </div>
                <div>
                    <Label for="product-description">Description</Label>
                    <textarea
                        id="product-description"
                        bind:value={form.description}
                        placeholder="Product Description"
                        class="flex min-h-[80px] w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                    ></textarea>
                </div>
                <div>
                    <Label for="product-image">Product Image</Label>
                    <input
                        id="product-image"
                        type="file"
                        accept="image/*"
                        onchange={(e) => (imageFile = e.target.files[0])}
                        class="mt-1 block w-full text-sm text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-neutral-50 file:text-neutral-700 hover:file:bg-neutral-100"
                    />
                    {#if form.image}
                        <div class="mt-2">
                            <p class="text-xs text-neutral-500 mb-1">
                                Current Image:
                            </p>
                            <img
                                loading="lazy"
                                src={form.image}
                                alt="Product preview"
                                class="w-20 h-20 object-cover rounded-md border border-neutral-200"
                            />
                        </div>
                    {/if}
                </div>
                <div class="flex gap-2">
                    <Button onclick={saveItem}>Save</Button>
                    <Button variant="outline" onclick={resetForm}>Cancel</Button
                    >
                </div>
            </div>
        </Card>
    {/if}

    <Card>
        {#if loading}
            <div class="py-12 text-center">
                <div
                    class="inline-block w-8 h-8 border-4 border-neutral-200 border-t-black rounded-full animate-spin mb-4"
                ></div>
                <p class="text-neutral-500 font-medium">Loading products...</p>
            </div>
        {:else if items.length === 0}
            <div class="py-12 text-center">
                <p class="text-neutral-500 font-medium">No products found.</p>
            </div>
        {:else}
            <div class="flex items-center justify-between mb-4 px-2">
                <div class="flex items-center gap-4">
                    {#if selectedIds.length > 0}
                        <Button
                            variant="outline"
                            className="text-red-600 border-red-200 bg-red-50 hover:bg-red-100"
                            onclick={() => confirmDelete()}
                        >
                            Delete Selected ({selectedIds.length})
                        </Button>
                    {/if}
                </div>
            </div>
            <div class="overflow-x-auto -mx-6 -mt-2">
                <table
                    class="w-full text-left border-collapse whitespace-nowrap"
                >
                    <thead>
                        <tr
                            class="border-y border-neutral-200 bg-neutral-50/50"
                        >
                            <th class="px-6 py-3">
                                <input
                                    type="checkbox"
                                    class="rounded border-neutral-300 text-black focus:ring-black"
                                    checked={selectedIds.length ===
                                        items.length && items.length > 0}
                                    onchange={toggleSelectAll}
                                />
                            </th>
                            <th
                                class="px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider"
                                >ID</th
                            >
                            <th
                                class="px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider"
                                >Image</th
                            >
                            <th
                                class="px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider"
                                >Name</th
                            >
                            <th
                                class="px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider"
                                >Price</th
                            >
                            <th
                                class="px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider"
                                >Category ID</th
                            >
                            <th
                                class="px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider text-right"
                                >Actions</th
                            >
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-neutral-100">
                        {#each items as item (item.id)}
                            <tr
                                class={`transition-colors ${selectedIds.includes(item.id) ? "bg-blue-50/30" : "hover:bg-neutral-50/50"}`}
                            >
                                <td class="px-6 py-4">
                                    <input
                                        type="checkbox"
                                        class="rounded border-neutral-300 text-black focus:ring-black"
                                        checked={selectedIds.includes(item.id)}
                                        onchange={() => toggleSelect(item.id)}
                                    />
                                </td>
                                <td class="px-6 py-4 text-sm text-neutral-500"
                                    >{item.id}</td
                                >
                                <td class="px-6 py-4 text-sm">
                                    {#if item.image}
                                        <img
                                            loading="lazy"
                                            src={item.image}
                                            alt={item.name}
                                            class="w-12 h-12 object-cover rounded-md shadow-sm border border-neutral-100"
                                        />
                                    {:else}
                                        <div
                                            class="w-12 h-12 bg-neutral-100 rounded-md flex items-center justify-center text-neutral-400 text-[10px]"
                                        >
                                            No Img
                                        </div>
                                    {/if}
                                </td>
                                <td
                                    class="px-6 py-4 text-sm font-medium text-neutral-900 cursor-pointer hover:text-blue-600 transition-colors"
                                    onclick={() => viewDetails(item)}
                                    >{item.name}</td
                                >
                                <td class="px-6 py-4 text-sm text-neutral-600"
                                    >Rp {item.price.toLocaleString("id-ID")}</td
                                >
                                <td class="px-6 py-4 text-sm text-neutral-500"
                                    >{item.category_id}</td
                                >
                                <td
                                    class="px-6 py-4 text-sm text-right space-x-4"
                                >
                                    <button
                                        class="font-medium text-blue-600 hover:text-blue-800 transition-colors"
                                        onclick={() => editItem(item)}
                                        >Edit</button
                                    >
                                    <button
                                        class="font-medium text-red-600 hover:text-red-800 transition-colors"
                                        onclick={() => confirmDelete(item.id)}
                                        >Delete</button
                                    >
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>

            <div class="flex justify-between items-center mt-6 pt-2">
                <div class="flex items-center space-x-2">
                    <span class="text-sm font-medium text-neutral-500"
                        >Show</span
                    >
                    <select
                        bind:value={limit}
                        onchange={() => loadData(1)}
                        class="h-8 rounded-md border border-neutral-300 bg-white px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400"
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                    </select>
                </div>
                <div class="flex items-center space-x-4">
                    <Button
                        variant="outline"
                        disabled={currentPage <= 1}
                        onclick={() => loadData(currentPage - 1)}
                        className="text-sm">Previous</Button
                    >
                    <span class="text-sm font-medium text-neutral-500"
                        >Page <span class="text-neutral-900">{currentPage}</span
                        >
                        of {totalPages}</span
                    >
                    <Button
                        variant="outline"
                        disabled={currentPage >= totalPages}
                        onclick={() => loadData(currentPage + 1)}
                        className="text-sm">Next</Button
                    >
                </div>
            </div>
        {/if}
    </Card>
</div>

<!-- Delete Confirmation Modal -->
{#if showDeleteModal}
    <div
        class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        transition:fade
    >
        <div
            class="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-neutral-100"
            transition:fly={{ y: 20 }}
        >
            <div
                class="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6 text-red-600"
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
                    ><path d="M3 6h18"></path><path
                        d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"
                    ></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"
                    ></path><line x1="10" y1="11" x2="10" y2="17"></line><line
                        x1="14"
                        y1="11"
                        x2="14"
                        y2="17"
                    ></line></svg
                >
            </div>
            <h3 class="text-2xl font-bold mb-2">Confirm Delete</h3>
            <p class="text-neutral-500 mb-8 font-medium leading-relaxed">
                {isBulkDelete
                    ? `Are you sure you want to delete ${selectedIds.length} selected products? This action cannot be undone.`
                    : "Are you sure you want to delete this product? This action cannot be undone."}
            </p>
            <div class="flex gap-3">
                <Button
                    variant="outline"
                    className="flex-1"
                    onclick={() => (showDeleteModal = false)}>Cancel</Button
                >
                <Button
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                    onclick={processDelete}>Delete Now</Button
                >
            </div>
        </div>
    </div>
{/if}

{#if showDetailModal && selectedProduct}
    <!-- Modal Overlay -->
    <div
        class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity"
        onclick={closeDetailModal}
    >
        <!-- Modal Content -->
        <div
            class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col md:flex-row relative"
            onclick={(e) => e.stopPropagation()}
        >
            <button
                class="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 z-10 p-1 bg-white/80 rounded-full"
                onclick={closeDetailModal}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
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

            <!-- Image Section -->
            <div
                class="w-full md:w-1/2 h-64 md:h-auto bg-neutral-100 flex items-center justify-center border-b md:border-b-0 md:border-r border-neutral-100"
            >
                {#if selectedProduct.image}
                    <img
                        loading="lazy"
                        src={selectedProduct.image}
                        alt={selectedProduct.name}
                        class="w-full h-full object-cover"
                    />
                {:else}
                    <div class="flex flex-col items-center text-neutral-400">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="48"
                            height="48"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            class="mb-2"
                            ><rect
                                x="3"
                                y="3"
                                width="18"
                                height="18"
                                rx="2"
                                ry="2"
                            ></rect><circle cx="8.5" cy="8.5" r="1.5"
                            ></circle><polyline points="21 15 16 10 5 21"
                            ></polyline></svg
                        >
                        <span class="text-sm font-medium"
                            >No image available</span
                        >
                    </div>
                {/if}
            </div>

            <!-- Details Section -->
            <div class="w-full md:w-1/2 p-8 flex flex-col">
                <div class="mb-6">
                    <span
                        class="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 mb-2"
                    >
                        ID: {selectedProduct.id}
                    </span>
                    <h2
                        class="text-2xl font-bold text-neutral-900 leading-tight mb-2"
                    >
                        {selectedProduct.name}
                    </h2>
                    <p class="text-3xl font-bold text-neutral-900">
                        Rp {selectedProduct.price.toLocaleString("id-ID")}
                    </p>
                </div>

                <div
                    class="space-y-4 flex-grow overflow-y-auto max-h-[300px] pr-2"
                >
                    <div>
                        <h3
                            class="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1"
                        >
                            Category ID
                        </h3>
                        <p class="text-sm text-neutral-700 font-medium">
                            {selectedProduct.category_id}
                        </p>
                    </div>
                    <div>
                        <h3
                            class="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1"
                        >
                            Description
                        </h3>
                        <p
                            class="text-sm text-neutral-600 leading-relaxed italic"
                        >
                            {selectedProduct.description ||
                                "No description provided for this product."}
                        </p>
                    </div>
                </div>

                <div class="mt-8 pt-6 border-t border-neutral-100 flex gap-3">
                    <Button
                        onclick={() => {
                            editItem(selectedProduct);
                            closeDetailModal();
                        }}
                        className="flex-1">Edit Product</Button
                    >
                    <Button
                        variant="outline"
                        onclick={closeDetailModal}
                        className="flex-1">Close</Button
                    >
                </div>
            </div>
        </div>
    </div>
{/if}
