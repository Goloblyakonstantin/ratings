<template>
  <div v-if="data"
  ref="container"
  class="container">
    <svg class="chart" :width="chartSize.width" :height="chartSize.height">
      <g>
        <g class="axis axis--y">
          <g v-for="(item, i) in axis.y"
          :key="'y:'+item"
          :transform="'translate(0,' + scaled.y(item) + ')'"
          :height="scaled.y.bandwidth()"
          >
            <text
            :key="'y text:'+item"
            :x="margin.left"
            dx="-0.35em"
            :y="scaled.y.bandwidth() / 2"
            dy=".35em">
            {{item}}
            </text>
          </g>
        </g>
        <g class="axis axis--x">
          <g v-for="(item, i) in axis.x"
          :key="'x:'+item"
          :transform="'translate(' + scaled.x(item) + ', 0)'"
          :height="scaled.y.bandwidth()"
          >
            <text
            :key="'x text:'+item"
            :x="scaled.x.bandwidth() / 2"
            :y="scaled.y.bandwidth() / 2"
            dy=".35em"
            >
            {{item}}
            </text>
          </g>
        </g>
        <g class="mainChartArea">
          <g v-for="(item, i) in currentData"
          :key="item.period + item.subject"
          :transform="'translate(' + scaled.x(item[axisX]) + ',' + scaled.y(item[axisY]) + ')'"
          :height="scaled.y.bandwidth()"
          >
            <rect
            :key="'rect' + item.period + item.subject"
            :x="0"
            y="0"
            :width="scaled.x.bandwidth()"
            :height="scaled.y.bandwidth()"
            :fill="hslaColor(item[value])"
            >
            </rect>
            <text
            :key="'text' + item.period + item.subject"
            :x="scaled.x.bandwidth() / 2"
            :y="scaled.y.bandwidth() / 2"
            dy=".35em"> {{item[value]}}
            </text>
          </g>
        </g>
      </g>
    </svg>
    <button type="button" class="btn"
    @click="currRating=((currRating + 1) % ratings.length)"
    >{{ ratingTitle }}</button>
  </div>
</template>

<script>
import * as d3 from 'd3'
import { mapActions } from 'vuex'

export default {
  props: {
    axisX: {
      default: 'period'
    },
    axisY: {
      default: 'subject'
    },
    value: {
      default: 'value'
    }
  },
  data () {
    return {
      data: [],
      margin: {
        left: 120,
        top: 30
      },
      currRating: 1,
      rowHeight: 40
    }
  },
  components: {
    d3
  },
  computed: {
    axis () {
      return {
        x: this[this.axisX],
        y: this[this.axisY]
      }
    },
    chartSize () {
      return {
        width: 800,
        height: this.rowHeight * this[this.axisY].length
      }
    },
    currentData () {
      return this.data.filter((x) => (x.id === this.ratings[this.currRating]))
    },
    maxValue () {
      return d3.max(this.currentData.map((x) => x[this.value]))
    },
    minValue () {
      return d3.min(this.currentData.filter(x => (x[this.value])).map((x) => x[this.value]))
    },
    period () {
      return (Array.from(new Set(this.data.map(x => x.period))))
      .filter((x) => !(this.yearsOnly && x.search('год') === -1))
      .sort((a, b) => (a > b) ? 1 : -1)
    },
    ratings () {
      return (Array.from(new Set(this.data.sort((a, b) => (a.period_type < b.period_type) ? -1 : 1).map(x => x.id))))
    },
    ratingTitle () {
      if (this.data[0]) {
        return (this.data.filter(x => x.id === this.ratings[this.currRating]))[0].title
      }
    },
    scaled () {
      return {
        x: d3.scaleBand()
        .domain(this[this.axisX])
        .range([this.chartSize.width, this.margin.left])
        .paddingInner(0.1)
        .paddingOuter(0.1),
        y: d3.scaleBand()
        .domain(this[this.axisY])
        .range([this.margin.top, this.chartSize.height])
        .paddingInner(0.2)
      }
    },
    subject () {
      return (Array.from(new Set(this.data.map(x => x.subject)))).sort((a, b) => (a > b) ? 1 : -1)
    },
    yearsOnly () {
      return this.currentData[0].period_type === 'Год'
    }
  },
  methods: {
    ...mapActions([
      'loading'
    ]),
    fetchData () {
      this.loading(true)
      this.$http.get('all_ratings')
        .then(
          (response) => {
            return response.json()
          },
          (response) => {
            console.log('http error: ', response)
            this.loading(false)
          }
        )
        .then((data) => {
          this.data = data
          this.initChart()
          this.loading(false)
        })
    },
    hslaColor (value) {
      // const min = 0
      // const max = 1
      let h = 90 * (((value || 0) - this.minValue) / (this.maxValue - this.minValue))
      let s = 80
      let l = (!value) ? 100 : 50
      let a = 0.8
      return 'hsla(' + h + ',' + s + '%,' + l + '%,' + a + ')'
    },
    initChart () {
    }
  },
  mounted () {
    this.fetchData()
  }
}
</script>

<style>
.chart {

  transition: 1s;
}
.chart rect {
  fill-opacity: 0.5;
  stroke-opacity: 0.8;
  transition: 1s;
}
.chart text {
  fill: black;
  text-anchor: middle;
  transition: 1s;
}
.chart .axis {
  font-size: 0.7em;
  font-weight: bold;
  transition: 1s;
}
.chart .axis--y text {
  text-anchor: end;
}
</style>
