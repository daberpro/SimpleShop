<script>
    let { type = "text", placeholder = "", value = $bindable(), ...rest } = $props();
</script>

<input
    {type}
    bind:value
    placeholder={placeholder}
    class="w-full px-3 py-2 rounded-xl border border-neutral-300 
           focus:outline-none focus:ring-2 focus:ring-black"
    {...rest}
/>