<script>
    import { fade, fly } from 'svelte/transition';
    import Button from "$lib/components/ui/button.svelte";
    import Input from "$lib/components/ui/input.svelte";
    import Label from "$lib/components/ui/label.svelte";

    let form = $state({ name: "", email: "", subject: "", message: "" });
    let submitting = $state(false);
    let success = $state(false);

    async function handleSubmit(e) {
        e.preventDefault();
        submitting = true;
        await new Promise(r => setTimeout(r, 1500));
        submitting = false;
        success = true;
        form = { name: "", email: "", subject: "", message: "" };
    }
</script>

<svelte:head>
    <title>Contact Us | SimpleShop</title>
</svelte:head>

<div class="min-h-screen bg-[#050505] text-white relative overflow-hidden flex items-center justify-center py-20 selection:bg-blue-500/30">
    <!-- Animated background -->
    <div class="absolute inset-0 z-0">
        <div class="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/20 blur-[150px] rounded-full"></div>
        <div class="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[150px] rounded-full"></div>
    </div>

    <div class="max-w-6xl mx-auto px-6 relative z-10 w-full">
        <div class="grid lg:grid-cols-2 gap-20 items-center">
            <!-- Left Side: Content -->
            <div class="space-y-12">
                <div in:fly={{ y: 20, duration: 800 }}>
                    <h1 class="text-6xl md:text-8xl font-black tracking-tighter leading-none mb-8">
                        LET'S <br/>
                        <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">TALK.</span>
                    </h1>
                    <p class="text-xl text-neutral-400 font-medium leading-relaxed max-w-md">
                        We're here to answer any questions you may have. Reach out to us and we'll respond as soon as we can.
                    </p>
                </div>

                <div class="grid sm:grid-cols-2 gap-8" in:fade={{ delay: 300 }}>
                    <div class="space-y-2">
                        <h4 class="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500">Support Email</h4>
                        <p class="text-lg font-bold">hello@simpleshop.com</p>
                    </div>
                    <div class="space-y-2">
                        <h4 class="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500">HQ Location</h4>
                        <p class="text-lg font-bold">Jakarta, Indonesia</p>
                    </div>
                    <div class="space-y-2">
                        <h4 class="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500">Phone</h4>
                        <p class="text-lg font-bold">+62 21 1234 5678</p>
                    </div>
                </div>
            </div>

            <!-- Right Side: The Glass Card -->
            <div in:fly={{ x: 30, duration: 800 }} class="relative group">
                <!-- Decorative border glow -->
                <div class="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-[40px] blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                
                <div class="relative bg-neutral-900/40 backdrop-blur-3xl border border-white/10 p-10 md:p-14 rounded-[40px] shadow-2xl">
                    {#if success}
                        <div class="absolute inset-0 bg-neutral-900/90 backdrop-blur-xl z-20 flex flex-col items-center justify-center p-12 text-center rounded-[40px]" in:fade>
                            <div class="w-20 h-20 bg-blue-500 text-white rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-blue-500/40">
                                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                            </div>
                            <h3 class="text-3xl font-black mb-4 uppercase tracking-tighter">MESSAGE SENT</h3>
                            <p class="text-neutral-400 mb-8 leading-relaxed font-medium">We've received your inquiry. Expect a response within one business day.</p>
                            <Button onclick={() => success = false} className="w-full h-14 rounded-2xl bg-white text-black font-bold">Send Another</Button>
                        </div>
                    {/if}

                    <form onsubmit={handleSubmit} class="space-y-8">
                        <div class="space-y-6">
                            <div class="grid sm:grid-cols-2 gap-6">
                                <div class="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-1">Your Name</Label>
                                    <input bind:value={form.name} required placeholder="John Doe" class="w-full bg-white/5 border border-white/10 rounded-2xl h-14 px-5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-neutral-600" />
                                </div>
                                <div class="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-1">Email Address</Label>
                                    <input type="email" bind:value={form.email} required placeholder="john@example.com" class="w-full bg-white/5 border border-white/10 rounded-2xl h-14 px-5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-neutral-600" />
                                </div>
                            </div>
                            <div class="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-1">Message</Label>
                                <textarea bind:value={form.message} required placeholder="How can we help you today?" class="w-full bg-white/5 border border-white/10 rounded-2xl min-h-[140px] p-5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-neutral-600 resize-none"></textarea>
                            </div>
                        </div>
                        
                        <Button type="submit" disabled={submitting} className="w-full h-16 rounded-2xl bg-blue-600 text-white font-black text-lg tracking-tight shadow-2xl shadow-blue-600/20 hover:bg-blue-500 transition-all">
                            {submitting ? 'SENDING...' : 'SEND MESSAGE'}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>
