<script lang="ts">
	export let loading = false;
	export let disabled = false;
	export let onClick: () => void;
	export let label = 'Enviar';
</script>

<button
	on:click={onClick}
	class="w-full rounded-md bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700 disabled:opacity-50"
	disabled={loading || disabled}
>
	{loading ? 'Procesando...' : label}
</button>
