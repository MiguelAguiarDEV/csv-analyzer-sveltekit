<script lang="ts">
	import '../app.css';
	import ThemeToggle from '$lib/components/ui/ThemeToggle.svelte';
	import { onMount } from 'svelte';

	// Verificar tema guardado al cargar la página
	onMount(() => {
		const savedTheme = localStorage.getItem('theme');
		const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

		if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
			document.documentElement.classList.add('theme-dark');
		} else {
			document.documentElement.classList.add('theme-light');
		}
	});
</script>

<div class="bg-theme-primary flex min-h-screen flex-col">
	<div class="container mx-auto flex flex-grow flex-col px-4">
		<header class="flex items-center justify-between py-4">
			<a href="/" class="text-theme-primary text-xl font-bold">CSV Analyzer</a>
			<ThemeToggle />
		</header>

		<main class="flex-grow">
			<slot />
		</main>

		<footer
			class="border-theme-primary text-theme-secondary mt-auto border-t py-4 text-center text-sm"
		>
			<p>CSV Analyzer &copy; {new Date().getFullYear()}</p>
		</footer>
	</div>
</div>
