<script lang="ts">
</script>

<div
	class="bg-theme-primary border-theme-primary mx-auto mt-10 max-w-4xl space-y-6 rounded-2xl border p-6 shadow-md"
>
	<h1 class="text-theme-primary text-center text-2xl font-bold">Dashboard de CSV</h1>

	<div class="bg-theme-secondary border-theme-primary mt-8 rounded-lg border p-6">
		<h2 class="text-theme-primary mb-4 text-xl font-semibold">Bienvenido a CSV Analyzer</h2>
		<p class="text-theme-secondary mb-4">
			Esta herramienta te permite analizar y visualizar datos CSV de manera fácil e intuitiva.
			Puedes optar por un análisis manual donde configuras la visualización, o dejar que nuestra IA
			genere automáticamente la mejor visualización para tus datos.
		</p>
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			<a
				href="/analyze"
				class="bg-accent-primary border-theme-primary hover:bg-accent-secondary transform rounded-lg
				border p-4 text-white transition hover:-translate-y-1"
			>
				<h3 class="mb-2 font-medium">Análisis Manual</h3>
				<p class="text-sm opacity-90">
					Configura manualmente las visualizaciones con control total sobre los parámetros.
				</p>
			</a>
			<a
				href="/autogen"
				class="bg-accent-primary border-theme-primary hover:bg-accent-primary transform rounded-lg
				border p-4 text-white transition hover:-translate-y-1"
			>
				<h3 class="mb-2 font-medium">Análisis con IA</h3>
				<p class="text-sm opacity-90">
					Deja que la IA analice tus datos y genere la mejor visualización automáticamente.
				</p>
			</a>
		</div>
	</div>
</div>
