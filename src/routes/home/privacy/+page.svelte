<script>
    import { fade, fly } from 'svelte/transition';
</script>

<svelte:head>
    <title>Privacy Policy | SimpleShop</title>
</svelte:head>

<div class="min-h-screen bg-[#fafafa] py-32 selection:bg-blue-500/20">
    <div class="max-w-4xl mx-auto px-6">
        <!-- Header -->
        <div class="mb-24 text-center space-y-4">
            <div in:fly={{ y: 20, duration: 800 }} class="inline-block px-3 py-1 rounded-full bg-blue-50 border border-blue-100">
                <span class="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600">Legal Document</span>
            </div>
            <h1 class="text-5xl md:text-7xl font-black text-neutral-900 tracking-tighter uppercase" in:fly={{ y: 20, duration: 800, delay: 100 }}>
                Privacy <span class="text-blue-600">Policy.</span>
            </h1>
            <p class="text-neutral-400 font-bold uppercase tracking-[0.2em] text-[10px]" in:fade={{ delay: 300 }}>Effective Date: May 08, 2024</p>
        </div>

        <!-- Main Content -->
        <div class="bg-white border border-neutral-100 rounded-[48px] shadow-sm p-10 md:p-20 space-y-20 relative overflow-hidden" in:fade={{ duration: 1000, delay: 400 }}>
            <!-- Decorative background text -->
            <div class="absolute top-10 right-10 opacity-[0.03] select-none pointer-events-none">
                <p class="text-[200px] font-black leading-none uppercase">PRIVACY</p>
            </div>

            <section class="relative z-10 space-y-6">
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 bg-neutral-900 text-white rounded-2xl flex items-center justify-center font-black">01</div>
                    <h2 class="text-2xl font-black uppercase tracking-tight">Overview</h2>
                </div>
                <div class="pl-16 space-y-4 text-neutral-500 text-lg leading-relaxed font-medium">
                    <p>
                        Your privacy is not just a policy for us; it's a fundamental principle of our operations. This document outlines how SimpleShop collects, uses, and safeguards your digital footprint.
                    </p>
                    <p>
                        We strive for total transparency. If anything in this policy is unclear, our legal team is available for clarification.
                    </p>
                </div>
            </section>

            <section class="relative z-10 space-y-6">
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 bg-neutral-900 text-white rounded-2xl flex items-center justify-center font-black">02</div>
                    <h2 class="text-2xl font-black uppercase tracking-tight">Data Acquisition</h2>
                </div>
                <div class="pl-16 space-y-4 text-neutral-500 text-lg leading-relaxed font-medium">
                    <p>We acquire data through direct interaction and automated systems to improve your experience:</p>
                    <div class="grid sm:grid-cols-2 gap-4 pt-4">
                        <div class="p-6 bg-neutral-50 rounded-3xl border border-neutral-100">
                            <h4 class="font-bold text-neutral-900 mb-2">Direct Data</h4>
                            <p class="text-sm">Information you provide during checkout, registration, or support requests.</p>
                        </div>
                        <div class="p-6 bg-neutral-50 rounded-3xl border border-neutral-100">
                            <h4 class="font-bold text-neutral-900 mb-2">Passive Data</h4>
                            <p class="text-sm">Browser telemetry, IP resolution, and interaction analytics.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section class="relative z-10 space-y-6">
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-black">03</div>
                    <h2 class="text-2xl font-black uppercase tracking-tight">Security Protocol</h2>
                </div>
                <div class="pl-16 space-y-4 text-neutral-500 text-lg leading-relaxed font-medium">
                    <p>
                        SimpleShop employs military-grade AES-256 encryption for all stored data. Our infrastructure is audited quarterly to ensure compliance with the highest global security standards.
                    </p>
                    <div class="p-8 bg-blue-600 text-white rounded-[32px] shadow-xl shadow-blue-600/20">
                        <p class="font-bold italic">
                            "We never sell your data. We never share your data without consent. We treat your information as if it were our own."
                        </p>
                    </div>
                </div>
            </section>

            <footer class="pt-12 border-t border-neutral-100 text-center">
                <p class="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-400">SimpleShop Legal Division &copy; 2024</p>
            </footer>
        </div>
    </div>
</div>
