<template>
  <div v-if="data"
  ref="container"
  class="container">
    <div class="row">
      <transition name="fade" mode="out-in">
        <h3>{{ axis.z[currZ] }}</h3>
      </transition>
    </div>
        <svg class="chart" :width="chartSize.width" :height="chartSize.height">
        <g class="mainChartArea">
            <transition-group name="fade" tag="g" :transform="'translate(' + (chartSize.width / 2) + ',' + (chartSize.height / 2) + ')'">
              <g v-for="(item, i) in arcs" class="arc"
              :key="'g:'+colors(scaled.pie[i])"
              >
                <path
                :d="item.path"
                :key="'arc:'+colors(scaled.pie[i])"
                :fill="colors(scaled.pie[i])"
                :transform="(isHighlighted(scaled.pie[i])) ? transformSlice(scaled.pie[i]) : ''"
                >
                </path>
                <text
                :transform="transformLabel(scaled.pie[i])"
                :key="'t:'+colors(scaled.pie[i])"
                >
                  {{scaled.pie[i].value}} - {{scaled.pie[i].data.subject}}: {{hash(scaled.pie[i].data.subject)}}
                </text>
              </g>
            </transition-group>
            <text>
              {{label}}
            </text>

        </g>
      </svg>
    <div v-if="showNav" class="row">
      <button type="button" class="btn"
      @click="scrollX(-1)"
      > < </button>
      <button type="button" class="btn"
      @click="scrollX(1)"
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
    },
    count: {
      default: 5
    },
    highligtedSubject: {
      default: 'Катрен'
    },
    highligtColor: {
      default: 'red'
    },
    XItem: {
      default: 1
    },
    ZItem: {
      default: 0
    },
    cuttedValue: {
      default: 0.1
    }
  },
  data () {
    return {
      data: [],
      margin: {
        left: 120,
        top: 60
      },
      rowHeight: 400
    }
  },
  components: {
    d3
  },
  computed: {
    arcs () {
      return this.scaled.pie.map((d) => {
        return {key: d.data.subject,
          path: this.path(d)}
      })
    },
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
        height: this.rowHeight
      }
    },
    currentData () {
      return this.data.filter((x) => (x[this.axisZ] === this[this.axisZ][this.currZ]))
      .filter((x) => x[this.axisX] === this.axis.x[this.XItem])
      .sort((a, b) => (a.value > b.value) ? -1 : 1)
      .filter((x, i) => i < this.count)
    },
    currX () {
      return (this.x) ? this.axis.x.indexOf(this.x) : 0
    },
    currZ () {
      return (this.z) ? this.axis.z.indexOf(this.z) : 0
    },
    label () {
      return this.axis.x[this.XItem]
    },
    period () {
      return (Array.from(new Set(this.data.map(x => x.period))))
      .filter((x) => !(this.yearsOnly && x.search('год') === -1))
      .sort((a, b) => (a > b) ? -1 : 1)
    },
    radius () {
      return Math.min(this.chartSize.width * (1 - this.cuttedValue), this.chartSize.height * (1 - this.cuttedValue)) / 2
    },
    rating () {
      return (Array.from(new Set(this.data.sort((a, b) => (a.period_type < b.period_type) ? -1 : 1).map(x => this.getRatingDescr(x)))))
    },
    scaled () {
      return {
        pie: this.pie(this.currentData)
      }
    },
    subject () {
      return (Array.from(new Set(this.data.map(x => x.subject)))).sort((a, b) => (a > b) ? 1 : -1)
    },
    yearsOnly () {
      return (this.axisZ === 'rating') && (this.data.filter(x => x[this.axisZ] === this.z && x.period_type === 'Год').length > 0)
    }
  },
  methods: {
    ...mapActions([
      'loading'
    ]),
    colors (item) {
      let hash = this.hash(item.data.subject)
      return (this.isHighlighted(item)) ? this.highligtColor : ('hsla(' + (hash) + ',100%,50%,0.5)')
    },
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
    isHighlighted (item) {
      return item.data.subject === this.highligtedSubject
    },
    hash (text) {
      return text.split('')
      .reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0)
        return a & a
      }, 0)
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
    path (data) {
      var arc = d3.arc()
      .innerRadius(this.radius / 3)
      .outerRadius(this.radius)
      .startAngle(data.startAngle)
      .endAngle(data.endAngle)
      return arc()
    },
    pie (data) {
      return d3.pie()
      .sort(null)
      .value(d => d.value)(data)
    },
    ratingTitle (i) {
      if (this.data[0]) {
        return (this.data.filter(x => x.id === this.rating[i]))[0].title
      }
    },
    scrollX (direction) {
      const currX = this.XItem
      let newX = currX
      do {
        newX = (((direction < 0) ? this.axis.x.length : 0) + newX + direction) % this.axis.x.length
      } while (
        (this.data.filter((x) => (x[this.axisZ] === this[this.axisZ][this.currZ] &&
          x[this.axisX] === this.axis.x[newX])))
        .length === 0 && newX !== currX)
      this.XItem = newX
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
    },
    transformLabel (item) {
      let angle = (item.endAngle + item.startAngle) / 2
      return 'translate(' +
        this.radius * 0.9 * Math.sin(angle) +
        ',' +
        this.radius * 0.9 * Math.cos(angle) * -1 +
        ')'
    },
    transformSlice (item) {
      let angle = (item.endAngle + item.startAngle) / 2
      return 'translate(' +
        this.radius * this.cuttedValue * Math.sin(angle) +
        ',' +
        this.radius * this.cuttedValue * Math.cos(angle) * -1 +
        ')'
    }
  },
  mounted () {
    this.fetchData()
  }
}
</script>

<style>

.fade-enter-active, .fade-leave-active {
  transition: 1s;
  transform: rotate(0deg);
}
.fade-enter, .fade-leave-to /* .fade-leave-active in <2.1.8 */ {
  opacity: 0;
  transform: rotate(-60deg);
}


.arc text {
  font: 10px sans-serif;
  text-anchor: middle;
}

.arc path {
  stroke: #fff;
}

</style>
