<template>
  <div>
    <chart-table>
    </chart-table>
    <chart-table
    axis-y="period"
    axis-x="subject"
    value="value"
    >
    </chart-table>
  </div>
</template>

<script>
import ChartTable from '@/components/ChartTable'

export default {
  components: {
    ChartTable
  }
}
</script>
