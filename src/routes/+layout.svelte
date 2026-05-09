<script>
    import '../app.css';
    import Navbar from '$lib/components/ui/navbar.svelte';
    import Footer from '$lib/components/ui/footer.svelte';
    import Toast from '$lib/components/ui/toast.svelte';
    import ChatWidget from '$lib/components/ui/chat-widget.svelte';
    import { navigating } from '$app/stores';
    let { children, data } = $props();
</script>

<svelte:head>
    <script src="https://app.sandbox.midtrans.com/snap/snap.js" data-client-key={import.meta.env.VITE_MIDTRANS_CLIENT_KEY}></script>
</svelte:head>

{#if $navigating}
    <div class="fixed top-0 left-0 w-full h-1 z-[9999] bg-neutral-100 overflow-hidden">
        <div class="w-full h-full bg-black animate-[loading_1.5s_ease-in-out_infinite]" style="transform-origin: left"></div>
    </div>
    <style>
        @keyframes loading {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
        }
    </style>
{/if}

<div class="min-h-screen flex flex-col">
    <Navbar />
    <main class="flex-1">
        {@render children()}
    </main>
    <Footer />
    <Toast />
    {#if data.user}
        <ChatWidget user={data.user} />
    {/if}
</div>
