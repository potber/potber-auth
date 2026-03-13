<script>
	import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
	import Fa from 'svelte-fa';

	/** @type {Select.Option[]} */
	export let options;
	/** @type {Select.Option | undefined} */
	export let defaultOption = undefined;
	/** @type {string} */
	export let label;
	/** @type {((value: any) => void) | undefined}*/
	export let onSelect = undefined;
	const componentId = crypto.randomUUID();
</script>

<div class="container">
	<select
		id={`${componentId}-select`}
		on:change={(event) => {
			if (onSelect) onSelect(event.currentTarget.value);
		}}
		{...$$restProps}
	>
		{#each options as option (option.value)}
			<option value={option.value} selected={defaultOption === option}>{option.label}</option
			>{/each}
	</select>
	<label for={`${componentId}-select`}>{label}</label>
	<Fa icon={faChevronDown} />
</div>

<style>
	.container {
		position: relative;
		width: 100%;
	}

	select {
		height: var(--control-input-height);
		width: 100%;
		box-sizing: border-box;
		background-color: var(--color-control-inactive);
		border: none;
		margin: 0;
		padding: 1.4rem 1rem 0 1rem;
		color: var(--color-text-default);
		font-size: 1em;
		/* Hide dropdown arrow */
		-o-appearance: none;
		-ms-appearance: none;
		-webkit-appearance: none;
		-moz-appearance: none;
		appearance: none;
	}

	select:not(:disabled):hover {
		filter: var(--filter-control-hover);
	}

	select:focus {
		outline: none;
	}

	label {
		display: block;
		position: absolute;
		top: 50%;
		transform: translateY(-100%);
		left: 1rem;
		transform-origin: left top;
		user-select: none;
		pointer-events: none;
		color: var(--color-text-subtle);
	}

	select:focus + label {
		color: var(--color-accent);
	}

	.container :global(svg) {
		position: absolute;
		right: 0;
		top: 50%;
		transform: translateY(-50%);
		margin-right: 1rem;
	}

	.container :global(path) {
		color: var(--color-text-subtle);
	}
</style>
