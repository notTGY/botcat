<script lang="ts">
	import Table from './Table.svelte';
	const urlParams = new URLSearchParams(window.location.search);
	const dashboardId = urlParams.get('dashboardId');

	export let rowData = null

	fetch(`http://localhost:3000/v/${dashboardId}`)
		.then(res => {
      console.log(res)
      return res.json()
    })
		.then(res => {
			rowData = res
		})

	const clearNotifications = () => {
		const prevData = JSON.parse(JSON.stringify(rowData))
		rowData = null
		fetch(`http://localhost:3000/v/${dashboardId}`, {
			method: 'DELETE',
		}).then(res => {
			if(res.status !== 204){
				rowData = prevData
			}
		})
	}
</script>
<main class="container">
	<nav>
		<strong><a href="/">BotCat</a></strong>
		<strong>Dashboard</strong>
	</nav>
	<article>
		<Table bind:rowData />
	
		<button on:click={clearNotifications} aria-busy={rowData === null ? 'true' : false}>
			clear notifications
		</button>
	</article>
</main>