<template>
  <div v-if="data[0]"
  ref="container"
  class="container">
    <h2>{{description.index_name}} ({{description.unit}})</h2>
    <h3>{{description.title}}</h3>
    <h4>{{description.source}}</h4>
    <div class="row">
      <div class="col-5 col-xs-2">
        <svg class="chart" :width="chartWidth" :height="chartHeight">
          <g class="mainChartArea" :transform="'translate(' + (chartWidth / 2) + ',' + (chartHeight / 2) + ')'">
            <g class="pie-chart" transform="rotate(-90)">
              <g
              class="arc"
              :class="{'arc-active': isActive(i)}"
              v-for="(item, i) in arcs[current]"
              @click="active = (active === i) ? null : i"
              >
                <circle
                :r="radius" fill="transparent"
                :key="item.id"
                :stroke="color(item.id)"
                :stroke-dasharray="item.dash"
                :stroke-dashoffset="item.offset"
                />
                <text
                transform="rotate(90)"
                :x="item.labelPos.x"
                :y="item.labelPos.y"
                :key="'t:'+item.id"
                >
                  {{ item.value }}
                </text>
              </g>
              <circle
              :r="radius" fill="white"
              @click="current = (current + 1) % data.length"
              />
            </g>
            <foreignObject :width="radius" :height="radius" :x="-radius / 2" :y="-radius / 2">
            <div>
              <p class>
                {{period}}
              </p>
            </div>
            </foreignObject>
          </g>
        </svg>
      </div>
      <div class="col-7 col-xs-10">
        <transition-group tag="ul" name="slide-fade">
          <li v-for="(item, i) in arcs[current]"
          v-if="item.rate > 0"
          :key="item.id"
          :style="'color: ' + color(item.id)"
          :class="{'li-active': isActive(i)}"
          @click="active = (active === i) ? null : i"
          >
            <span class="li-text">{{ item.id }}</span>
          </li>
        </transition-group>
      </div>
    </div>
    <button type="button" class="btn"
    @click="current = (current + 1) % data.length"
    > < </button>
    <button type="button" class="btn"
    @click="current = (current + data.length - 1) % data.length"
    > > </button>
  </div>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  props: {
    id: {
      default: ''
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
    othersName: {
      default: 'Прочие'
    },
    othersColor: {
      default: 'gray'
    },
    cuttedValue: {
      default: 0.1
    }
  },
  data () {
    return {
      data: [],
      description: {},
      margin: {
        left: 120,
        top: 60
      },
      rowHeight: 400,
      current: 0,
      active: null
    }
  },
  computed: {
    radius () {
      return ((this.chartWidth > this.chartHeight) ? this.chartHeight : this.chartWidth) * 0.2
    },
    decimals () {
      return 1
    },
    allIDs () {
      let ids = this.data.reduce((r, x) => {
        return r.concat(x.map((xx) => xx.id))
          .filter((xx, ii, self) => self.indexOf(xx) === ii)
      }, [])
      const otherPos = ids.indexOf(this.othersName)
      if (otherPos > -1) {
        ids.splice(otherPos, 1)
        ids.push(this.othersName)
      }
      return ids
    },
    arcs () {
      return this.data.map((x) => {
        return this.allIDs
        .map((id) => {
          const defItem = {
            id: id,
            rate: 0
          }
          const item = x.filter((xx) => xx.id === id)
            .reduce((r, xx) => xx, {})
          return Object.keys(item).length === 0 ? defItem : item
        }
        )
        .map((xx, ii, self) => {
          return {
            id: xx.id,
            dash: this.arc(xx.rate || 0),
            rate: xx.rate || 0,
            value: this.showValue(xx),
            offset: this.calcOffset(self, ii),
            labelPos: this.calcLabelPos(self, ii)
          }
        })
      })
    },
    chartWidth () {
      return '400'
    },
    chartHeight () {
      return '400'
    },
    period (period) {
      return this.data[this.current][0].period
    },
    strokeWidth () {
      return this.radius * 2
    }
  },
  methods: {
    ...mapActions([
      'loading'
    ]),
    arc (rate) {
      return this.rateToDash(rate) + ' ' + this.rateToDash(1 - rate)
    },
    calcOffset (arcs, count) {
      return -this.rateToDash(
        arcs
        .filter((x, i) => i < count)
        .reduce((r, x) => {
          return r + x.rate
        }, 0)
      )
    },
    calcLabelPos (arcs, count) {
      const radialPos = arcs
        .filter((x, i) => i < count)
        .reduce((r, x) => {
          return r + x.rate
        }, 0) + arcs[count].rate / 2
      return {
        pos: radialPos,
        x: Math.sin(radialPos * Math.PI * 2) * this.radius * 1.8,
        y: -Math.cos(radialPos * Math.PI * 2) * this.radius * 1.8
      }
    },
    color (id) {
      let hash = this.hash(id)
      return (this.highligtedSubject === id)
        ? this.highligtColor
        : (this.othersName === id)
          ? this.othersColor
          : ('hsla(' + (hash) + ',100%,50%,1)')
    },
    getRatingDescr (item) {
      return item.index_name + ' (' + item.source + ')'
    },
    fetchData () {
      this.loading(true)
      this.$http.get('ratings?id=eq.' + this.id)
        .then(
          (response) => {
            return response.json()
          },
          (response) => {
            console.log('http error: ', response)
          }
        )
        .then((data) => {
          this.description = data[0]
        })
      this.$http.get('rating?table=eq.' + this.id)
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
          this.data = data.map((x) => x.period)
            .filter((x, i, self) => self.indexOf(x) === i)
            .sort((a, b) => (a < b) ? 1 : -1)
            .map((period) => data.filter((x) => x.period === period)
              .sort((a, b) => (b.value || 0) - (a.value || 0))
              .map((x, i, self) => {
                const total = self.reduce((r, xx) => r + (xx.value || 0), 0)
                if (i === this.count) {
                  x.subject = this.othersName
                  x.value = (
                    (this.description.unit === '%')
                    ? (100 - self.filter((px, pi, pself) => pi < this.count).reduce((r, xx) => r + (xx.value || 0), 0))
                    : total - self.filter((px, pi, pself) => pi < this.count).reduce((r, xx) => r + (xx.value || 0), 0)
                  ).toFixed(this.decimals)
                }
                x.rate = (this.description.unit === '%') ? x.value / 100
                  : x.value / total
                x.id = x.subject
                return x
              })
              .filter((px, pi, pself) => pi <= this.count)
            )
          this.loading(false)
        })
    },
    hash (text) {
      return text.split('')
      .reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0)
        return a & a
      }, 0)
    },
    isActive (i) {
      return i === this.active
    },
    rateToDash (rate) {
      return this.radius * rate * Math.PI * 2
    },
    showValue (item) {
      return item.value || ((item.rate * 100).toFixed(this.decimals) + '%')
    }
  },
  mounted () {
    this.fetchData()
  }
}
</script>

<style>
.arc circle {
  stroke-width: 40%;
  stroke-opacity: 0.4;
  transition: 0.6s;
}
.arc text {
  opacity: 0;
  transition: 1s;
  font: 0.8em;
  font-weight: bold;
  text-anchor: middle;
  transform: rotate(90);
}
.arc-active circle {
  stroke-width: 48%;
}
.arc-active text {
  opacity: 1;
}
.arc:hover circle {
  stroke-width: 50%;
  stroke-opacity: 0.6;
  transition: 0.2s;
}
.arc:hover text {
  opacity: 1;
  lighting-color: white;
}

.slide-fade-enter-active {
  transition: all .3s ease;
}
.slide-fade-leave-active {
  transition: all .3s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}
.slide-fade-enter, .slide-fade-leave-to
/* .slide-fade-leave-active below version 2.1.8 */ {
  transform: translateX(10px);
  opacity: 0;
}
li {
  list-style-type: square;
  font-size: 0.8em;
}
.li-active {
  font-weight: bold;
  font-size: 1em;
}
.li-text {
  color: black;
}
</style>
