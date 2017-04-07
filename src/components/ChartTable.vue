<template>
  <div v-if="data"
  ref="container"
  class="container">
    <div class="row">
      <h3>{{ axis.z[currZ] }}</h3>
    </div>
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
            dy=".35em"
            @mouseover="selected(axisY, item)">
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
            @mouseover="selected(axisX, item)">
              <tspan v-for="(part, part_i) in splitText(item, 20)"
              :x="scaled.x.bandwidth() / 2"
              :y="margin.top"
              :dy="(-part_i - 1) + 'em'"
              >{{part}}</tspan>
            </text>
          </g>
        </g>
        <g class="mainChartArea">
          <g v-for="(item, i) in currentData"
          :key="item[item[axisX]] + item[item[axisY]]"
          :transform="'translate(' + scaled.x(item[axisX]) + ',' + scaled.y(item[axisY]) + ')'"
          :height="scaled.y.bandwidth()"
          >
            <rect
            :key="'rect:' + item[item[axisX]] + item[item[axisY]]"
            :x="0"
            y="0"
            :width="scaled.x.bandwidth()"
            :height="scaled.y.bandwidth()"
            :fill="hslaColor(item)"
            >
            </rect>
            <text
            :key="'text:' + item[item[axisX]] + item[item[axisY]]"
            :x="scaled.x.bandwidth() / 2"
            :y="scaled.y.bandwidth() / 2"
            dy=".35em"> {{item[value]}}
            </text>
          </g>
        </g>
      </g>
    </svg>
    <div v-if="showNav" class="row">
      <button type="button" class="btn"
      @click="currZ=((axis.z.length + currZ - 1) % axis.z.length)"
      > < </button>
      <button type="button" class="btn"
      @click="currZ=((currZ + 1) % axis.z.length)"
      > > </button>
    </div>
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
    axisZ: {
      default: 'rating'
    },
    value: {
      default: 'value'
    },
    z: {},
    showNav: {
      default: true
    }
  },
  data () {
    return {
      data: [],
      margin: {
        left: 120,
        top: 60
      },
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
        y: this[this.axisY],
        z: this[this.axisZ]
      }
    },
    chartSize () {
      return {
        width: 800,
        height: this.rowHeight * this[this.axisY].length
      }
    },
    currentData () {
      return this.data.filter((x) => (x[this.axisZ] === this[this.axisZ][this.currZ]))
    },
    currZ () {
      return (this.z) ? this.axis.z.indexOf(this.z) : 0
    },
    period () {
      return (Array.from(new Set(this.data.map(x => x.period))))
      // .filter((x) => !(this.yearsOnly && x.search('год') === -1))
      .sort((a, b) => (a > b) ? 1 : -1)
    },
    rating () {
      return (Array.from(new Set(this.data.sort((a, b) => (a.period_type < b.period_type) ? -1 : 1).map(x => this.getRatingDescr(x)))))
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
    getRatingDescr (item) {
      return item.index_name + ' (' + item.source + ')'
    },
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
          this.data = data.map(x => {
            x.rating = this.getRatingDescr(x)
            return x
          })
          this.loading(false)
        })
    },
    hslaColor (item) {
      const measure = 'unit'
      const min = this.minValue(measure, item[measure])
      const max = this.maxValue(measure, item[measure])
      let h = 90 * (((item[this.value] || 0) - min) / (max - min))
      let s = 80
      let l = (item[this.value]) ? 50 : 100
      let a = 0.8
      return 'hsla(' + h + ',' + s + '%,' + l + '%,' + a + ')'
    },
    maxValue (measure, value) {
      return this.currentData.filter(x => !(measure) || x[measure] === value)
      .reduce((r, x) => {
        r = Math.max(r || 0, x[this.value] || 0, 0)
        return r
      }, 0)
    },
    minValue (measure, value) {
      return this.currentData.filter(x => !(measure) || x[measure] === value)
      .filter(x => x[this.value])
      .reduce((r, x) => {
        r = Math.min(r || x[this.value], x[this.value])
        return r
      }, null)
    },
    ratingTitle (i) {
      if (this.data[0]) {
        return (this.data.filter(x => x.id === this.rating[i]))[0].title
      }
    },
    selected (measure, value) {
      this.$emit('selected', {measure, value})
    },
    splitText (text, width) {
      const words = text.split(/\s+/).reverse()
      let res = [words[0]]
      for (let i = 1; i < words.length; i++) {
        if ((res[res.length - 1]) && (res[res.length - 1] + ' ' + words[i]).length <= width) {
          res[res.length - 1] = words[i] + ' ' + res[res.length - 1]
        } else {
          res[res.length] = words[i]
        }
      }
      return res
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
.axis g :hover{
  fill: blue;
  stroke: blue;
  transition: 0;
}
.chart .axis--y text {
  text-anchor: end;
}
</style>
