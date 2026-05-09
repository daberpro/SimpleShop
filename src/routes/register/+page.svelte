<script>
    import Card from "$lib/components/ui/card.svelte";
    import RegisterForm from "$lib/components/form/register-form.svelte";
</script>

<div class="min-h-screen flex items-center justify-center bg-neutral-50">
    <div class="w-full max-w-md">
        <Card>
            <h1 class="text-xl font-semibold mb-6 text-center">
                Register
            </h1>

            <RegisterForm />
        </Card>
    </div>
</div>