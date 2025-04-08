<script lang="ts">
	// Define la función que se enviará desde el padre
	export let onLoad: (text: string) => void;

	let fileInputId = 'csv-input-' + Math.random().toString(36).substring(2, 8); // ID único por si hay múltiples inputs

	const handleFileChange = async (event: Event) => {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		const text = await file.text();
		onLoad(text); // Emitimos el contenido al padre
	};
</script>

<div class="space-y-2">
	<label for={fileInputId} class="block font-semibold text-gray-700">
		Selecciona un archivo CSV:
	</label>
	<input
		id={fileInputId}
		type="file"
		accept=".csv"
		class="block w-full cursor-pointer file:mr-4 file:rounded-md file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-white hover:file:bg-blue-700"
		on:change={handleFileChange}
	/>
</div>
