<script>
    import Button from "$lib/components/ui/button.svelte";
    import Input from "$lib/components/ui/input.svelte";
    import Label from "$lib/components/ui/label.svelte";
    import { register } from "$lib/services/auth.js";

    let email = $state("");
    let password = $state("");
    let confirmPassword = $state("");
    let error = $state("");
    let loading = $state(false);

    async function handleSubmit() {
        console.log("ppppppp")
        error = "";

        if (!email || !password) {
            error = "All fields are required";
            return;
        }

        if (password !== confirmPassword) {
            error = "Password does not match";
            return;
        }

        loading = true;

        const res = await register({ email, password });

        if (res.IsError) {
            error = res.Message;
        } else {
            window.location.href = "/login";
        }

        loading = false;
    }
</script>

<div class="space-y-4">
    <div>
        <Label>Email</Label>
        <Input bind:value={email} placeholder="you@example.com" />
    </div>

    <div>
        <Label>Password</Label>
        <Input type="password" bind:value={password} />
    </div>

    <div>
        <Label>Confirm Password</Label>
        <Input type="password" bind:value={confirmPassword} />
    </div>

    {#if error}
        <p class="text-sm text-red-500">{error}</p>
    {/if}

    <Button onclick={handleSubmit} className="w-full">
        {loading ? "Creating..." : "Register"}
    </Button>

    <p class="text-sm text-center text-neutral-500">
        Already have an account?
        <a href="/login" class="underline">Login</a>
    </p>
</div>
