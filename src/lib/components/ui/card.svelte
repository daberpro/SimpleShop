<script>
    let { className = "", children } = $props();
</script>

<div class={`bg-white border border-neutral-200 rounded-2xl shadow-sm p-6 ${className}`}>
    {@render children?.()}
</div>