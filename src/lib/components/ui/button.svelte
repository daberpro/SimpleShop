<script>
    let { variant = "default", className = "", children, onclick } = $props();
</script>

<button
    onclick={onclick}
    class={`px-4 py-2 rounded-xl text-sm font-medium transition
    ${variant === "default" ? "bg-black text-white hover:bg-neutral-800" : ""}
    ${variant === "outline" ? "border border-neutral-300 hover:bg-neutral-100" : ""}
    ${className}`}
>
    {@render children?.()}
</button>