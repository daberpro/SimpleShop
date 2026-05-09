<script>
    import { fade, fly } from 'svelte/transition';
</script>

<svelte:head>
    <title>Terms of Service | SimpleShop</title>
</svelte:head>

<div class="min-h-screen bg-[#0a0a0a] py-32 selection:bg-blue-500/30">
    <div class="max-w-4xl mx-auto px-6">
        <!-- Header -->
        <div class="mb-24 text-center space-y-4">
            <div in:fly={{ y: 20, duration: 800 }} class="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                <span class="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">User Agreement</span>
            </div>
            <h1 class="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase" in:fly={{ y: 20, duration: 800, delay: 100 }}>
                Terms of <span class="text-blue-500">Service.</span>
            </h1>
            <p class="text-neutral-500 font-bold uppercase tracking-[0.2em] text-[10px]" in:fade={{ delay: 300 }}>Last Updated: May 2024</p>
        </div>

        <!-- Main Content -->
        <div class="bg-white rounded-[48px] shadow-2xl p-10 md:p-20 space-y-20 relative overflow-hidden" in:fade={{ duration: 1000, delay: 400 }}>
            <!-- Decorative Section -->
            <div class="absolute -top-20 -right-20 w-64 h-64 bg-blue-600/5 blur-[80px] rounded-full"></div>

            <section class="space-y-8">
                <div class="flex items-center gap-6">
                    <span class="text-6xl font-black text-neutral-100 select-none">01</span>
                    <h2 class="text-3xl font-black tracking-tighter uppercase">Acceptance</h2>
                </div>
                <p class="text-neutral-500 text-lg leading-relaxed font-medium pl-4 border-l-2 border-neutral-100 ml-4">
                    By accessing SimpleShop, you agree to comply with and be bound by these Terms of Service. If you do not agree with any part of these terms, you must discontinue use of our services immediately.
                </p>
            </section>

            <section class="space-y-8">
                <div class="flex items-center gap-6">
                    <span class="text-6xl font-black text-neutral-100 select-none">02</span>
                    <h2 class="text-3xl font-black tracking-tighter uppercase">Usage Rights</h2>
                </div>
                <div class="space-y-6 pl-4 border-l-2 border-neutral-100 ml-4">
                    <p class="text-neutral-500 text-lg leading-relaxed font-medium">
                        We grant you a limited, non-exclusive, non-transferable license to access and make personal use of our platform. You are prohibited from:
                    </p>
                    <div class="grid sm:grid-cols-2 gap-4 text-sm font-bold text-neutral-900">
                        <div class="p-4 bg-neutral-50 rounded-2xl flex items-center gap-3">
                            <div class="w-2 h-2 bg-blue-600 rounded-full"></div>
                            Data Scraping
                        </div>
                        <div class="p-4 bg-neutral-50 rounded-2xl flex items-center gap-3">
                            <div class="w-2 h-2 bg-blue-600 rounded-full"></div>
                            Reverse Engineering
                        </div>
                        <div class="p-4 bg-neutral-50 rounded-2xl flex items-center gap-3">
                            <div class="w-2 h-2 bg-blue-600 rounded-full"></div>
                            Unauthorized Access
                        </div>
                        <div class="p-4 bg-neutral-50 rounded-2xl flex items-center gap-3">
                            <div class="w-2 h-2 bg-blue-600 rounded-full"></div>
                            Intellectual Theft
                        </div>
                    </div>
                </div>
            </section>

            <section class="space-y-8">
                <div class="flex items-center gap-6">
                    <span class="text-6xl font-black text-neutral-100 select-none">03</span>
                    <h2 class="text-3xl font-black tracking-tighter uppercase">Commerce</h2>
                </div>
                <div class="pl-4 border-l-2 border-neutral-100 ml-4 space-y-6">
                    <p class="text-neutral-500 text-lg leading-relaxed font-medium">
                        All transactions are final. SimpleShop reserves the right to refuse service, terminate accounts, or cancel orders at our sole discretion.
                    </p>
                    <div class="bg-neutral-900 text-white p-8 rounded-[32px]">
                        <h4 class="text-xs font-black uppercase tracking-[0.3em] text-blue-400 mb-4">Liability Disclaimer</h4>
                        <p class="text-sm leading-relaxed opacity-70 italic">
                            SimpleShop is provided "as is" without any warranties. We shall not be held liable for any damages arising from the use of this service.
                        </p>
                    </div>
                </div>
            </section>

            <footer class="pt-12 border-t border-neutral-100 text-center">
                <p class="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-400">SimpleShop Regulatory Compliance &copy; 2024</p>
            </footer>
        </div>
    </div>
</div>
