currentData<template>
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
      <div class="row justify-content-center">
        <table v-if="currentData.names" class="table">
          <thead class="thead-default">
            <th v-if="currentData.names.range" class="text-right">
              {{ currentData.names.range }}
            </th>
            <th class="text-left">
              {{ currentData.names.name }}
            </th>
            <th v-for="period in currentData.names.periods" class="text-center">
              {{ period }}
            </th>
            <th>
              <ui-icon-button v-if="!ifAddColumn && ifEditMode" color="default" icon="add" size="small" :tooltip="currentData.names.period" @click="showAddColumn">
              </ui-icon-button>
              <div v-if="ifAddColumn" class="input-group input-group-sm">
                <input v-model="newPeriod" ref="newPeriodInput" class="form-control form-control-sm" :placeholder="currentData.names.period" @keyup.enter="addColumn" @keyup.esc="addColumnCancel">
                </input>
                <button class="input-group-addon" @click="addColumn">OK</button>
              </div>
            </th>
          </thead>
          <tbody>
            <tr  v-for="(row, i) in currentData.data">
              <td v-if="currentData.names.range" class="text-right">
                {{ row.range }}
              </td>
              <td class="text-left">
                {{ row.name }}
              </td>
              <td v-for="(value, n) in row.values" class="text-center" @click="editMode = true">
                <div>
                  <div v-if="!ifEditMode">
                    <span class="badge badge-default">
                      {{ row.calculated[n].range }}
                    </span>
                    {{ value | beautyNumber }}
                    <span v-if="(row.calculated[n].gain)" :class="{gain: true, negative: isNegative(row.calculated[n].gain)}"> {{ row.calculated[n].gain | gain }} </span>
                  </div>
                  <div v-if="ifEditMode">
                    <input v-model="currentData.data[i].values[n]" class="form-control form-control-sm">
                    </input>
                  </div>
                </div>
              </td>
              <td>
              </td>
            </tr>
            <tr v-if="ifEditMode">
              <td colspan="2">
                <ui-icon-button v-if="!ifAddRow && ifEditMode" color="default" icon="add" size="small" :tooltip="currentData.names.name" @click="showAddRow">
                </ui-icon-button>
                <div v-if="ifAddRow" class="input-group input-group-sm">
                  <input v-model="newName" ref="newNameInput" class="form-control form-control-sm" :placeholder="currentData.names.name" @keyup.enter="addRow" @keyup.esc="addRowCancel">
                  </input>
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
import { mapGetters, mapActions } from 'vuex'

export default {
  props: {
    id: {
      default: ''
    }
  },
  data () {
    return {
      ifAddColumn: false,
      ifAddRow: false,
      contextOptions: [
        {
          label: 'Добавить',
          icon: 'add'
        }
      ],
      newPeriod: '',
      newName: ''
    }
  },
  computed: {
    ...mapGetters([
      'getData',
      'ifEditMode',
      'ifLoading'
    ]),
    currentData () {
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
              gain: ((i) ? (v || 0) - (x.values[i - 1] || 0) : 0),
              range: res.data.filter((p) => p.values[i] > v).length + 1
            }
          })
          return x
        })
        // res.data.sort((a, b) => b.values[res.names.periods.length - 1] - (a.values[res.names.periods.length - 1] || 0))
      }
      return res
    }
  },
  watch: {
    'id': 'fetchData'
  },
  methods: {
    ...mapActions([
      'dataAddName',
      'dataAddPeriod',
      'loading',
      'setData'
    ]),
    addColumn () {
      if (this.newPeriod && this.newPeriod.trim()) {
        this.dataAddPeriod(this.newPeriod.trim())
      }
      this.addColumnCancel()
    },
    addColumnCancel () {
      this.ifAddColumn = false
      this.newPeriod = ''
    },
    addRow () {
      if (this.newName && this.newName.trim()) {
        this.dataAddName(this.newName.trim())
      }
      this.addRowCancel()
    },
    addRowCancel () {
      this.ifAddRow = false
      this.newName = ''
    },
    isNegative (value) {
      return ((+value) < 0)
    },
    setFocus (refname) {
      this.$refs[refname].focus()
      this.$refs[refname].select()
    },
    fetchData () {
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
            newData.saveFunc = function (data) {
              let serializedData = data.data.map((x) => x.values.map((v, i) => {
                return {
                  table: data.id,
                  subject: x.name,
                  period: data.names.periods[i],
                  value: v || null
                }
              }
              ))
              .reduce((r, x) => r.concat(x))
              vm.$http.post('rating', serializedData, {options: {headers: {ContentType: 'application/json'}}})
              .then(
                (response) => {
                  console.log('saved')
                  vm.fetchData()
                },
                (response) => {
                  console.log('not saved', response)
                  vm.fetchData()
                }
              )
            }
          }
          this.loading(false)
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
            this.loading(false)
          })
        )
    },
    dataDeserialize (template, data) {
      template.names.periods = Array.from(new Set(data.map(x => x.period))).sort((a, b) => (a > b) ? 1 : -1)
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
        }
        )
      )
      return template
    },
    showAddColumn () {
      this.ifAddColumn = true
      this.$nextTick(function () {
        this.setFocus('newPeriodInput')
      })
    },
    showAddRow () {
      this.ifAddRow = true
      this.$nextTick(function () {
        this.setFocus('newNameInput')
      })
    }
  },
  mounted () {
    this.fetchData()
  },
  filters: {
    beautyNumber: function (value) {
      const nullSign = '-'
      if (!value ||
        value === undefined ||
        value === Infinity ||
        value === null ||
        ((typeof (value) !== 'string') && isNaN(value)) ||
        value === '') {
        return nullSign
      } else {
        if (typeof (value) === 'string') {
          return value
        } else {
          return value.toFixed(2)
        }
      }
    },
    gain: function (value) {
      const valNumber = +value || 0
      if (valNumber === undefined ||
        valNumber === Infinity ||
        valNumber === null) {
        return 0
      } else {
        if (valNumber > 0) {
          return '↗ ' + (Math.abs(value)).toFixed(2)
        } else {
          return '↘ ' + (Math.abs(value)).toFixed(2)
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
ul {
  list-style-type: none;
}
input {
  min-width: 4em;
}
</style>
