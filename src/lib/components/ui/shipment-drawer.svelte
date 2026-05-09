<script>
    import { onMount } from "svelte";
    import { fade, fly } from "svelte/transition";
    import Button from "$lib/components/ui/button.svelte";
    import Input from "$lib/components/ui/input.svelte";
    import Label from "$lib/components/ui/label.svelte";
    
    let { orderId, isAdmin = false, onClose } = $props();

    let tracks = $state([]);
    let loading = $state(true);
    let error = $state("");

    // Admin form
    let formTitle = $state("");
    let formStatus = $state("Processing");
    let formDesc = $state("");
    let formStart = $state("");
    let formFinish = $state("");
    let submitting = $state(false);

    $effect(() => {
        if (orderId) loadTracks();
    });

    async function loadTracks() {
        loading = true;
        try {
            const res = await fetch(`/api/shipment?order_id=${orderId}`, {
                headers: {
                    "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}`
                }
            });
            const data = await res.json();
            if (data.success) {
                tracks = data.Value.data || [];
            } else {
                error = data.error;
            }
        } catch (e) {
            error = "Failed to load tracking data.";
        } finally {
            loading = false;
        }
    }

    async function submitTrack(e) {
        e.preventDefault();
        submitting = true;
        try {
            const res = await fetch("/api/shipment", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}`,
                    "x-csrf-token": document.cookie.split("; ").find((row) => row.startsWith("csrf_token="))?.split("=")[1] || ""
                },
                body: JSON.stringify({
                    order_id: orderId,
                    title: formTitle,
                    current_status: formStatus,
                    description: formDesc,
                    datetime_start: formStart || null,
                    datetime_finished: formFinish || null
                })
            });
            const data = await res.json();
            if (data.success) {
                formTitle = "";
                formDesc = "";
                formStart = "";
                formFinish = "";
                await loadTracks();
            } else {
                alert(data.error);
            }
        } catch (e) {
            alert("Network error");
        } finally {
            submitting = false;
        }
    }
</script>

<div class="h-full bg-white rounded-[32px] overflow-hidden border border-neutral-100 flex flex-col shadow-[0_8px_40px_rgb(0,0,0,0.03)]">
    <!-- Header -->
    <div class="p-6 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50 backdrop-blur-md">
        <div>
            <h2 class="text-xl font-black tracking-tight text-neutral-900">Shipment Tracking</h2>
            <p class="text-xs font-bold text-neutral-400 uppercase tracking-widest mt-1">Order #{orderId}</p>
        </div>
        <button onclick={onClose} class="w-10 h-10 rounded-full bg-white border border-neutral-200 flex items-center justify-center text-neutral-500 hover:text-black hover:border-black transition-all shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
    </div>

    <!-- Scrollable Content -->
    <div class="flex-1 overflow-y-auto p-6 space-y-8">
        
        {#if isAdmin}
            <div class="bg-neutral-50 p-6 rounded-3xl border border-neutral-100 shadow-sm">
                <h3 class="text-sm font-black uppercase tracking-widest text-neutral-900 mb-4 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-500"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                    Add Update
                </h3>
                <form onsubmit={submitTrack} class="space-y-4">
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Title / Milestone</Label>
                            <Input type="text" bind:value={formTitle} placeholder="e.g. Package Shipped" required />
                        </div>
                        <div>
                            <Label>Status Label</Label>
                            <select bind:value={formStatus} class="flex h-10 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2 mt-1">
                                <option value="Processing">Processing</option>
                                <option value="Packed">Packed</option>
                                <option value="In Transit">In Transit</option>
                                <option value="Out for Delivery">Out for Delivery</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Returned">Returned</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <Label>Description</Label>
                        <textarea 
                            bind:value={formDesc} 
                            placeholder="Details about this update..." 
                            class="flex min-h-[80px] w-full rounded-2xl border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all mt-1 resize-none"
                        ></textarea>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Start Date (Optional)</Label>
                            <Input type="datetime-local" bind:value={formStart} />
                        </div>
                        <div>
                            <Label>Finish Date (Optional)</Label>
                            <Input type="datetime-local" bind:value={formFinish} />
                        </div>
                    </div>
                    <Button type="submit" className="w-full mt-2" disabled={submitting}>
                        {submitting ? 'Saving...' : 'Post Update'}
                    </Button>
                </form>
            </div>
        {/if}

        <div class="space-y-8 relative before:absolute before:inset-0 before:ml-[15px] before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-neutral-100 before:via-neutral-200 before:to-neutral-100">
            {#if loading}
                <div class="flex justify-center py-12 relative z-10">
                    <div class="w-8 h-8 border-4 border-neutral-200 border-t-black rounded-full animate-spin"></div>
                </div>
            {:else if error}
                <div class="text-center py-12 text-red-500 font-medium relative z-10">{error}</div>
            {:else if tracks.length === 0}
                <div class="text-center py-12 relative z-10">
                    <div class="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-neutral-200">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-neutral-400"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    </div>
                    <p class="text-neutral-500 font-medium">No tracking updates yet.</p>
                </div>
            {:else}
                {#each tracks as track, i}
                    <div class="relative flex items-center pl-12 group">
                        <!-- Icon/Dot -->
                        <div class="absolute left-0 flex items-center justify-center w-8 h-8 rounded-full border-4 border-white bg-blue-500 text-white shadow-sm z-10 transition-transform group-hover:scale-110">
                            {#if i === 0}
                                <span class="relative flex h-2 w-2">
                                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                  <span class="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                                </span>
                            {:else}
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                            {/if}
                        </div>
                        
                        <!-- Card Content -->
                        <div class="flex-1 p-6 rounded-[24px] bg-white border border-neutral-100 shadow-sm transition-all hover:shadow-md hover:border-neutral-200">
                            <div class="flex flex-wrap items-center justify-between mb-3 gap-3">
                                <h4 class="font-bold text-neutral-900 tracking-tight text-lg">{track.title}</h4>
                                {#if track.current_status}
                                    <span class="px-3 py-1 text-[10px] font-black tracking-widest uppercase rounded-full bg-blue-50 text-blue-600 border border-blue-100">{track.current_status}</span>
                                {/if}
                            </div>
                            {#if track.description}
                                <p class="text-sm text-neutral-500 leading-relaxed mb-4">{track.description}</p>
                            {/if}
                            <div class="text-[11px] font-bold text-neutral-400 flex items-center gap-2 uppercase tracking-widest bg-neutral-50 w-fit px-3 py-1.5 rounded-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                {new Date(track.datetime_start || track.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                            </div>
                        </div>
                    </div>
                {/each}
            {/if}
        </div>
    </div>
</div>
