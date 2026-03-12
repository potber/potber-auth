<script>
	import Fa from 'svelte-fa';
	import Button from '../../components/button/button.svelte';
	import { faCheck, faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
	import { sleep } from '$lib/utils/misc.utils';
	import { redirect } from '$lib/utils/client.utils';

	/** @type {App.Session} */
	export let session;

	/** @type {string }*/
	export let accessToken;

	let redirecting = false;
	let signOutIsBusy = false;

	export function continueWithSession() {
		redirecting = true;
		redirect(accessToken, 1000);
	}

	export async function signOut() {
		signOutIsBusy = true;
		await fetch('/sign-out', { method: 'POST' });
		await sleep(1000);
		location.reload();
	}
</script>

<p class="info-text">
	Du bist angemeldet als: <b>{session.username}</b>
</p>
<Button
	variant="primary"
	text={redirecting ? 'Du wirst weitergeleitet...' : 'Fortfahren'}
	onClick={continueWithSession}
	busy={redirecting}
>
	<Fa slot="icon" icon={faCheck} />
</Button>
<Button variant="primary" text="Abmelden" onClick={signOut} busy={signOutIsBusy}>
	<Fa slot="icon" icon={faRightFromBracket} />
</Button>

<style>
	:global(button) {
		width: 100%;
	}

	:global(button) {
		margin-bottom: 0.5rem;
	}

	.info-text {
		text-align: center;
	}

	.info-text:empty {
		color: transparent;
	}
</style>
