<script>
	import { onMount } from 'svelte';

	let isDarkMode = false;

	onMount(() => {
		// Verificar tema guardado o preferencia del sistema
		const savedTheme = localStorage.getItem('theme');
		const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

		isDarkMode = savedTheme === 'dark' || (!savedTheme && prefersDark);
		applyTheme();
	});

	function toggleTheme() {
		isDarkMode = !isDarkMode;
		localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
		applyTheme();
	}

	function applyTheme() {
		if (isDarkMode) {
			document.documentElement.classList.add('theme-dark');
			document.documentElement.classList.remove('theme-light');
		} else {
			document.documentElement.classList.add('theme-light');
			document.documentElement.classList.remove('theme-dark');
		}
	}
</script>

<button
	on:click={toggleTheme}
	class="bg-theme-secondary hover:bg-theme-accent flex items-center justify-center rounded-full p-2 transition-all duration-300 ease-in-out {isDarkMode
		? 'text-accent-secondary'
		: 'text-accent-primary'}"
	aria-label="Cambiar tema"
	title="Cambiar tema"
>
	<div class="relative h-5 w-5 overflow-hidden">
		{#if isDarkMode}
			<!-- Sol (modo claro) - con animación de entrada -->
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-5 w-5 transform transition-transform duration-300 ease-in-out"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
				/>
			</svg>
		{:else}
			<!-- Luna (modo oscuro) - con animación de entrada -->
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-5 w-5 transform transition-transform duration-300 ease-in-out"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
				/>
			</svg>
		{/if}
	</div>
</button>
