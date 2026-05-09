<script>
    let { children, ...rest } = $props();
</script>
 
<label class="text-sm font-medium text-neutral-700" {...rest}>
    {@render children?.()}
</label>