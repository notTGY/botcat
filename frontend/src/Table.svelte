<script>
  export let rowData = null
</script>
{#if rowData === null}
<p aria-busy="true">querying out database, please wait</p>
{:else}
<figure>
  <table role="grid">
    <thead>Notification history</thead>
    <tbody>
      <th>
        <span>Message</span>
      </th>
      <th>
        <span>IP</span>
      </th>
      {#each rowData as row}
        <tr>
          <td>{row.message}</td>
          <td>{row.ip}</td>
        </tr>
      {/each}
      {#if rowData.length === 0}
        <tr>
          <td colspan="2">No notifications</td>
        </tr>
      {/if}
  </table>
</figure>
{/if}