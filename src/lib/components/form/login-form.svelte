<script>
    import Button from "$lib/components/ui/button.svelte";
    import Input from "$lib/components/ui/input.svelte";
    import Label from "$lib/components/ui/label.svelte";
    import { login } from "$lib/services/auth.js";
    import { goto, invalidateAll } from '$app/navigation';
    import { onMount } from "svelte";
    import { PUBLIC_GOOGLE_CLIENT_ID } from "$env/static/public";

    let email = $state("");
    let password = $state("");
    let error = $state("");
    let loading = $state(false);

    onMount(() => {
        if (typeof google !== "undefined") {
            google.accounts.id.initialize({
                client_id: PUBLIC_GOOGLE_CLIENT_ID,
                callback: handleGoogleCallback,
                auto_select: false,
                itp_support: true,
            });

            google.accounts.id.renderButton(
                document.getElementById("google-button"),
                { theme: "outline", size: "large", width: "100%", text: "continue_with" }
            );
        }
    });

    async function handleGoogleCallback(response) {
        loading = true;
        error = "";

        try {
            const res = await fetch("/auth/google/callback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idToken: response.credential }),
            });

            const data = await res.json();

            if (data.success) {
                if (data.accessToken) {
                    sessionStorage.setItem("accessToken", data.accessToken);
                    await invalidateAll();
                    goto("/home");
                }
            } else {
                error = data.error || "Google login failed";
            }
        } catch (e) {
            error = "Network error occurred";
        } finally {
            loading = false;
        }
    }

    async function handleSubmit() {
        loading = true;
        error = "";

        const res = await login({ email, password });

        if (res.IsError) {
            error = res.Message;
        } else {
            if (res.accessToken) {
                sessionStorage.setItem("accessToken", res.accessToken);
                await invalidateAll();
                goto("/home");
            }
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

    {#if error}
        <p class="text-sm text-red-500">{error}</p>
    {/if}

    <Button onclick={handleSubmit} className="w-full">
        {loading ? "Loading..." : "Login"}
    </Button>

    <div class="relative py-2">
        <div class="absolute inset-0 flex items-center">
            <span class="w-full border-t border-neutral-300"></span>
        </div>
        <div class="relative flex justify-center text-xs uppercase">
            <span class="bg-white px-2 text-neutral-500">Or continue with</span>
        </div>
    </div>

    <div id="google-button" class="w-full"></div>

    <p class="text-sm text-center text-neutral-500">
        Don't have an account?
        <a href="/register" class="underline">Register</a>
    </p>
</div>
