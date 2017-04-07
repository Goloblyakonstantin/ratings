<template>
  <div>
    <div class="col-sm-10 ">
      <p class="text-center disabled">
        <small>Для изменения содержимого таблицы наведите указаль мыши на заголовок строки или столбца</small>
      </p>
    </div>
    <chart-table
    :axis-y="charts[0].axisY"
    :axis-x="charts[0].axisX"
    :axis-z="charts[0].axisZ"
    :z="charts[0].currZ"
    :showNav="false"
    @selected="onSelect(0, $event)"
    >
    </chart-table>
    <hr>
    <chart-table
    :axis-y="charts[1].axisY"
    :axis-x="charts[1].axisX"
    :axis-z="charts[1].axisZ"
    :z="charts[1].currZ"
    :showNav="false"
    @selected="onSelect(1, $event)"
    >
    </chart-table>
  </div>
</template>

<script>
import ChartTable from '@/components/ChartTable'

export default {
  data () {
    return {
      charts: [
        {
          axisX: 'period',
          axisY: 'subject',
          axisZ: 'rating',
          currZ: 0
        },
        {
          axisX: 'rating',
          axisY: 'subject',
          axisZ: 'period',
          currZ: 0
        }
      ]
    }
  },
  components: {
    ChartTable
  },
  methods: {
    onSelect (payload, event) {
      const target = (payload === 0) ? 1 : 0
      if (event.measure !== this.charts[target].axisZ) {
        this.charts[target].axisZ = event.measure
        if (this.charts[target].axisX === this.charts[target].axisZ) {
          this.charts[target].axisX = (this.charts[payload].axisX !== event.measure) ? this.charts[payload].axisX : this.charts[payload].axisY
        }
        if (this.charts[target].axisY === this.charts[target].axisZ) {
          this.charts[target].axisY = (this.charts[payload].axisY !== event.measure) ? this.charts[payload].axisY : this.charts[payload].axisX
        }
      }
      this.charts[target].currZ = event.value
    }
  }
}
</script>
