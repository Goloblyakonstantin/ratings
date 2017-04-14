<template>
<div class="container">
  <div v-if="currentData.title">
    <div class="row">
      <ul class="list-group">
        <li v-if="currentData.source" class="list-group-item">
          <span class="col-md-2 badge badge-default"> {{ currentData.source }} </span>
          <span class="col-md-9"> {{ currentData.index.name }}, {{ currentData.index.unit }} </span>
        </li>
      </ul>
    </div>
    <div class="row justify-content-center scroll-x">
      <table v-if="currentData.names" class="table">
        <thead class="thead-default">
          <th v-if="currentData.names.range" class="text-right">
            {{ currentData.names.range }}
          </th>
          <th class="text-left">
            {{ currentData.names.name }}
          </th>
          <th v-if="ifEditMode">
            <ui-icon-button v-if="!ifAddColumn && ifEditMode" color="default" icon="add" size="small" :tooltip="currentData.names.period" @click="showAddColumn">
            </ui-icon-button>
            <div v-if="ifAddColumn" class="input-group input-group-sm">
              <ui-autocomplete floating-label ref="newPeriodInput" :minChars="(1)" :placeholder="currentData.names.period" :suggestions="availablePeriods" v-model="newPeriod"></ui-autocomplete>
              <button class="input-group-addon" @click="addColumn">OK</button>
            </div>
          </th>
          <th v-for="period in currentData.names.periods" class="text-center">
            {{ period }}
          </th>
        </thead>
        <tbody>
          <tr v-for="(row, i) in currentData.data">
            <td v-if="currentData.names.range" class="text-right">
              {{ row.range }}
            </td>
            <td class="text-left">
              {{ row.name }}
            </td>
            <td v-if="ifEditMode">
            </td>
            <td v-for="(value, n) in row.values" class="text-center" @click="editMode = true">
              <div>
                <div v-if="!ifEditMode" class="table-value">
                  <span v-if="(value)" class="badge badge-default">
                      {{ row.calculated[n].range }}
                    </span> {{ value | beautyNumber }}
                  <span v-if="(row.calculated[n].gain)" :class="{gain: true, negative: isNegative(row.calculated[n].gain)}"> {{ row.calculated[n].gain | gain }} </span>
                </div>
                <div v-if="ifEditMode">
                  <input v-model="currentData.data[i].values[n]" type="number" step=0.01 class="form-control form-control-sm">
                  </input>
                </div>
              </div>
            </td>
          </tr>
          <tr v-if="ifEditMode">
            <td colspan="2">
              <ui-icon-button v-if="!ifAddRow && ifEditMode" color="default" icon="add" size="small" :tooltip="currentData.names.name" @click="showAddRow">
              </ui-icon-button>
              <div v-if="ifAddRow" class="input-group input-group-sm">
                <ui-autocomplete floating-label ref="newNameInput" :minChars="(1)" :placeholder="currentData.names.name" :suggestions="availableSubjects" v-model="newName"></ui-autocomplete>
                <button class="input-group-addon" @click="addRow">OK</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  <div v-if="!currentData.title">
    <p v-if="ifLoading">
      Подождите, данные загружаются...
    </p>
    <p v-if="!ifLoading">
      Нет доступа к запрошенным данным. Обратитесь в службу поддержки
    </p>
  </div>
</div>
</template>

<script>
import {
  mapGetters,
  mapActions
} from 'vuex'

export default {
  props: {
    id: {
      default: ''
    }
  },
  data() {
    return {
      ifAddColumn: false,
      ifAddRow: false,
      contextOptions: [{
        label: 'Добавить',
        icon: 'add'
      }],
      newPeriod: '',
      newName: '',
      periodList: [],
      periodType: '',
      subjectList: [],
      subjectType: ''
    }
  },
  computed: {
    ...mapGetters([
      'getData',
      'ifEditMode',
      'ifLoading'
    ]),
    availableSubjects() {
      return this.subjectList.filter((x) => this.getData.data.filter((y) => y.name === x).length === 0)
    },
    availablePeriods() {
      return this.periodList.filter((x) => this.getData.names.periods.filter((y) => y === x).length === 0)
    },
    currentData() {
      let res = Object.assign(this.getData)
      if (res.data && res.names && res.names.periods && res.names.periods.length > 0) {
        res.period_val = res.names.periods.map((x, i) => {
          let pv = {}
          pv.min = res.data.reduce((r, p) => Math.min((p.values[i] || 0), r), 0)
          pv.max = res.data.reduce((r, p) => Math.max((p.values[i] || 0), r), 0)
          return pv
        })
        res.data.map((x, n) => {
          x.calculated = x.values.map((v, i) => {
            return {
              gain: ((v) ?
                v - (
                  x.values.filter((v1, i1) => (i1 > i) && (v1))[0] || v
                ) :
                0
              ),
              range: res.data.filter((p) => (p.values[i]) && (p.values[i] >= v)).length
            }
          })
          return x
        })
      }
      return res
    }
  },
  watch: {
    'id': 'fetchData',
    'subjectType': 'fetchSubjectList',
    'periodType': 'fetchPeriodList'
  },
  methods: {
    ...mapActions([
      'dataAddName',
      'dataAddPeriod',
      'doEditMode',
      'loading',
      'setData'
    ]),
    addColumn() {
      if (this.newPeriod && this.newPeriod.trim()) {
        this.dataAddPeriod(this.newPeriod.trim())
      }
      this.addColumnCancel()
    },
    addColumnCancel() {
      this.ifAddColumn = false
      this.newPeriod = ''
    },
    addRow() {
      if (this.newName && this.newName.trim()) {
        this.dataAddName(this.newName.trim())
      }
      this.addRowCancel()
    },
    addRowCancel() {
      this.ifAddRow = false
      this.newName = ''
    },
    isNegative(value) {
      return ((+value) < 0)
    },
    setFocus(refname) {
      this.$refs[refname].$children[0].$el.nextElementSibling.focus()
      this.$refs[refname].$children[0].$el.nextElementSibling.select()
    },
    fetchData() {
      this.loading(true)
      this.setData()
      let newData = this.getData
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
          const vm = this
          if (data[0]) {
            newData.id = this.id
            newData.title = data[0].title
            newData.source = data[0].source
            newData.index = {
              name: data[0].index_name,
              unit: data[0].unit
            }
            newData.names = {
              name: data[0].subject_type,
              period: data[0].period_type
            }
            newData.saveFunc = function(data) {
              let serializedData = data.data.map((x) => x.values.map((v, i) => {
                  return {
                    table: data.id,
                    subject: x.name,
                    period: data.names.periods[i],
                    value: v || null
                  }
                }))
                .reduce((r, x) => r.concat(x))
              vm.$http.post('rating', serializedData, {
                  options: {
                    headers: {
                      ContentType: 'application/json'
                    }
                  }
                })
                .then(
                  (response) => {
                    console.log('saved')
                    vm.fetchData()
                  },
                  (response) => {
                    vm.doEditMode(true)
                    vm.loading(false)
                  }
                )
            }
            this.subjectType = newData.names.name
            this.periodType = newData.names.period
          }
        })
        .then(
          this.$http.get('rating?table=eq.' + this.id)
          .then(
            (response) => {
              return response.json()
            },
            (response) => {
              console.log('http error: ', response)
            }
          )
          .then((data) => {
            this.setData(this.dataDeserialize(newData, data))
          })
        )
        .then(
          this.loading(false)
        )
    },
    fetchPeriodList() {
      this.$http.get('periods?period_type=eq.' + this.periodType)
        .then(
          (response) => {
            return response.json()
          },
          (response) => {
            console.log('http error: ', response)
          }
        )
        .then((data) => {
          this.periodList = data.map((x) => x.period)
        })
    },
    fetchSubjectList() {
      this.$http.get('subjects?subject_type=eq.' + this.subjectType)
        .then(
          (response) => {
            return response.json()
          },
          (response) => {
            console.log('http error: ', response)
          }
        )
        .then((data) => {
          this.subjectList = data.map((x) => x.subject)
        })
    },
    dataDeserialize(template, data) {
      template.names.periods = Array.from(new Set(data.map(x => x.period))).sort((a, b) => (a < b) ? 1 : -1)
      let subjects = Array.from(new Set(data.map(x => x.subject)))
      template.data = Array.from(subjects
        .map((s) => {
          return {
            name: s,
            values: template.names.periods.map((p) => {
              let res = data.filter((x) => x.subject === s && x.period === p)
              return (res.length > 0) ? res[0].value : null
            })
          }
        })
        .sort((a, b) => b.values[0] - a.values[0])
      )
      return template
    },
    showAddColumn() {
      this.ifAddColumn = true
      this.$nextTick(function() {
        this.setFocus('newPeriodInput')
      })
    },
    showAddRow() {
      this.ifAddRow = true
      this.$nextTick(function() {
        this.setFocus('newNameInput')
      })
    }
  },
  mounted() {
    this.fetchData()
  },
  filters: {
    beautyNumber: function(value) {
      const nullSign = '-'
      if (!value ||
        value === undefined ||
        value === Infinity ||
        value === null ||
        ((typeof(value) !== 'string') && isNaN(value)) ||
        value === '') {
        return nullSign
      } else {
        if (typeof(value) === 'string') {
          return value
        } else {
          return value.toFixed(2)
        }
      }
    },
    gain: function(value) {
      const valNumber = +value || 0
      if (valNumber === undefined ||
        valNumber === Infinity ||
        valNumber === null) {
        return 0
      } else {
        if (valNumber > 0) {
          return '↗' + (Math.abs(value)).toFixed(2)
        } else {
          return '↘' + (Math.abs(value)).toFixed(2)
        }
      }
    }
  }
}
</script>

<style>
.container {
  margin-top: 1em;
}

.list-group {
  width: 100%;
  margin-bottom: 0.5em;
}

.badge {
  margin-right: 1em;
}

.gain {
  vertical-align: super;
  font-size: 0.7em;
  color: green;
}

.negative {
  color: red;
}

.scroll-x {
  overflow-x: auto;
}

.table-value {
  min-width: 8em;
}

ul {
  list-style-type: none;
}

input {
  min-width: 4em;
}
</style>
