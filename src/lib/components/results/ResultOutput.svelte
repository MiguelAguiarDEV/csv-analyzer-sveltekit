<script lang="ts">
	export let result = '';
	export let error = '';
</script>

{#if error}
	<p class="mt-2 text-sm text-red-600">{error}</p>
{/if}

{#if result}
	<div
		class="rounded-md border border-gray-300 bg-gray-100 p-4 text-sm whitespace-pre-wrap text-gray-800"
	>
		{result}
	</div>
{/if}
