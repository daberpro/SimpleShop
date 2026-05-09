<script>
    import { fade, fly } from 'svelte/transition';
    import Button from "$lib/components/ui/button.svelte";
</script>

<svelte:head>
    <title>Our Story | SimpleShop</title>
</svelte:head>

<div class="min-h-screen bg-[#0a0a0a] text-white selection:bg-blue-500/30">
    <!-- Hero Section: Ultra Premium -->
    <div class="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20">
        <!-- Abstract Background Elements -->
        <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-[1400px]">
            <div class="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[120px] rounded-full animate-pulse"></div>
            <div class="absolute bottom-[10%] right-[-5%] w-[40%] h-[40%] bg-purple-600/10 blur-[100px] rounded-full animate-pulse [animation-delay:2s]"></div>
        </div>
        
        <div class="max-w-5xl mx-auto px-6 relative z-10">
            <div class="text-center space-y-8">
                <div in:fly={{ y: 20, duration: 800 }} class="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                    <span class="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">Est. 2024</span>
                </div>
                
                <h1 class="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9]" in:fly={{ y: 30, duration: 800, delay: 100 }}>
                    WE BUILD THE <br/>
                    <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-600 to-purple-500">FUTURE</span> OF RETAIL.
                </h1>
                
                <p class="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed font-medium" in:fly={{ y: 20, duration: 800, delay: 200 }}>
                    SimpleShop is a technology-first commerce platform. We believe shopping should be an effortless extension of your lifestyle.
                </p>

                <div in:fade={{ duration: 1000, delay: 400 }} class="pt-8">
                    <Button className="h-16 px-10 rounded-2xl bg-white text-black hover:bg-neutral-200 text-lg font-bold transition-all shadow-2xl shadow-white/5">
                        Discover Our Platform
                    </Button>
                </div>
            </div>
        </div>

        <!-- Scroll Indicator -->
        <div class="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-30">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 13l5 5 5-5M7 6l5 5 5-5"/></svg>
        </div>
    </div>

    <!-- The Vision: Split Layout -->
    <div class="py-32 bg-white text-black rounded-[64px] relative z-20">
        <div class="max-w-6xl mx-auto px-6">
            <div class="grid lg:grid-cols-2 gap-24 items-center">
                <div class="space-y-8">
                    <div class="w-16 h-1 bg-blue-600"></div>
                    <h2 class="text-5xl font-black tracking-tighter leading-tight">
                        CRAFTED WITH <br/>
                        <span class="text-neutral-400">PRECISION.</span>
                    </h2>
                    <div class="space-y-6 text-neutral-500 text-lg leading-relaxed font-medium">
                        <p>
                            We don't just sell products; we curate experiences. Every line of code, every pixel, and every shipment is optimized for one thing: your satisfaction.
                        </p>
                        <p>
                            Our engineering team works around the clock to ensure that SimpleShop remains the fastest, most secure, and most beautiful marketplace in the digital age.
                        </p>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-6">
                    <div class="space-y-6 pt-12">
                        <div class="aspect-[4/5] bg-neutral-100 rounded-[32px] overflow-hidden shadow-2xl group relative">
                            <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800" alt="Shop" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            <div class="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all"></div>
                        </div>
                        <div class="p-8 bg-blue-600 rounded-[32px] text-white">
                            <p class="text-4xl font-black mb-1">24/7</p>
                            <p class="text-xs font-bold uppercase tracking-widest opacity-80">Global Support</p>
                        </div>
                    </div>
                    <div class="space-y-6">
                        <div class="p-8 bg-neutral-900 rounded-[32px] text-white">
                            <p class="text-4xl font-black mb-1">0.8s</p>
                            <p class="text-xs font-bold uppercase tracking-widest opacity-80">Avg. Page Load</p>
                        </div>
                        <div class="aspect-[4/5] bg-neutral-100 rounded-[32px] overflow-hidden shadow-2xl group relative">
                            <img src="https://images.unsplash.com/photo-1556742044-3c52d6e88c62?q=80&w=800" alt="Tech" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            <div class="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Footer Quote -->
    <div class="py-40 flex items-center justify-center text-center px-6">
        <div class="max-w-3xl space-y-10">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="currentColor" class="mx-auto text-blue-500 opacity-50"><path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H16.017C14.9124 8 14.017 7.10457 14.017 6V5C14.017 3.89543 14.9124 3 16.017 3H19.017C21.2261 3 23.017 4.79086 23.017 7V15C23.017 18.3137 20.3307 21 17.017 21H14.017ZM1.017 21L1.017 18C1.017 16.8954 1.91243 16 3.017 16H6.017C6.56928 16 7.017 15.5523 7.017 15V9C7.017 8.44772 6.56928 8 6.017 8H3.017C1.91243 8 1.017 7.10457 1.017 6V5C1.017 3.89543 1.91243 3 3.017 3H6.017C8.22614 3 10.017 4.79086 10.017 7V15C10.017 18.3137 7.33072 21 4.017 21H1.017Z"/></svg>
            <h3 class="text-4xl md:text-5xl font-black tracking-tight leading-tight italic">
                "SimpleShop is not just a store, it's a statement about how technology can serve humanity's daily needs."
            </h3>
            <p class="text-blue-500 font-black uppercase tracking-[0.4em] text-sm">Founder & CEO</p>
        </div>
    </div>
</div>

<style>
    :global(html) {
        scroll-behavior: smooth;
    }
</style>
