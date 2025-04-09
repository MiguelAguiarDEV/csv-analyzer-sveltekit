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
	<div class="container mx-auto flex flex-grow flex-col px-4 py-2">
		<header class="border-theme-primary flex items-center justify-between border-b py-4">
			<a href="/" class="text-theme-primary hover:text-accent-primary text-xl font-bold transition"
				>CSV Analyzer</a
			>
			<ThemeToggle />
		</header>

		<main class="flex-grow py-6">
			<slot />
		</main>

		<footer
			class="border-theme-primary text-theme-secondary mt-auto border-t py-4 text-center text-sm"
		>
			<p>
				CSV Analyzer &copy; {new Date().getFullYear()} |
				<a href="/privacy" class="text-accent-primary hover:text-accent-secondary transition"
					>Política de Privacidad</a
				>
			</p>
		</footer>
	</div>
</div>
