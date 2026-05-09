<script>
    import { notification } from "$lib/notification.svelte.js";
    import { fly, fade } from "svelte/transition";
    import { flip } from "svelte/animate";
</script>

<div class="fixed top-20 right-6 z-[200] flex flex-col gap-3 pointer-events-none w-full max-w-sm">
    {#each notification.messages as msg (msg.id)}
        <div 
            animate:flip={{ duration: 300 }}
            in:fly={{ x: 100, duration: 400, opacity: 0 }}
            out:fade={{ duration: 200 }}
            class="pointer-events-auto bg-white rounded-2xl shadow-2xl border border-neutral-100 p-4 flex items-center gap-4 group"
        >
            <div class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
                {msg.type === 'success' ? 'bg-green-50 text-green-600' : ''}
                {msg.type === 'error' ? 'bg-red-50 text-red-600' : ''}
                {msg.type === 'info' ? 'bg-blue-50 text-blue-600' : ''}"
            >
                {#if msg.type === 'success'}
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                {:else if msg.type === 'error'}
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                {:else}
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                {/if}
            </div>
            
            <div class="flex-grow">
                <p class="text-sm font-bold text-neutral-900">{msg.text}</p>
            </div>

            <button 
                onclick={() => notification.remove(msg.id)}
                class="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-neutral-300 hover:text-neutral-600"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
        </div>
    {/each}
</div>
