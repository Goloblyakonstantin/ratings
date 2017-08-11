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
      <router-link :to="{ name: 'PieChart', params: { id: id }}">Диаграмма</router-link>

      <a :href="csvExport()" download="data.csv"> Получить файл </a>
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
    },
    csvFieldDelimiter: {
      default: ';'
    },
    csvDecimalDelimiter: {
      default: ','
    }
  },
  data () {
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
    availableSubjects () {
      return this.subjectList.filter((x) => this.getData.data.filter((y) => y.name === x).length === 0)
    },
    availablePeriods () {
      return this.periodList.filter((x) => this.getData.names.periods.filter((y) => y === x).length === 0)
    },
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
              gain: ((v)
                ? v - (
                  x.values.filter((v1, i1) => (i1 > i) && (v1))[0] || v
                )
                : 0
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
    csvExport () {
      const charEncodeCache = {
        ' ': '%20',
        '+': '%2B',
        '%': '%25',
        '&': '%26',
        '=': '%3D',
        '\n': '%0D'
      }

      // utf8 to 1251 converter (1 byte format, RU/EN support only + any other symbols) by drgluck
      const DMap = {0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, 10: 10, 11: 11, 12: 12, 13: 13, 14: 14, 15: 15, 16: 16, 17: 17, 18: 18, 19: 19, 20: 20, 21: 21, 22: 22, 23: 23, 24: 24, 25: 25, 26: 26, 27: 27, 28: 28, 29: 29, 30: 30, 31: 31, 32: 32, 33: 33, 34: 34, 35: 35, 36: 36, 37: 37, 38: 38, 39: 39, 40: 40, 41: 41, 42: 42, 43: 43, 44: 44, 45: 45, 46: 46, 47: 47, 48: 48, 49: 49, 50: 50, 51: 51, 52: 52, 53: 53, 54: 54, 55: 55, 56: 56, 57: 57, 58: 58, 59: 59, 60: 60, 61: 61, 62: 62, 63: 63, 64: 64, 65: 65, 66: 66, 67: 67, 68: 68, 69: 69, 70: 70, 71: 71, 72: 72, 73: 73, 74: 74, 75: 75, 76: 76, 77: 77, 78: 78, 79: 79, 80: 80, 81: 81, 82: 82, 83: 83, 84: 84, 85: 85, 86: 86, 87: 87, 88: 88, 89: 89, 90: 90, 91: 91, 92: 92, 93: 93, 94: 94, 95: 95, 96: 96, 97: 97, 98: 98, 99: 99, 100: 100, 101: 101, 102: 102, 103: 103, 104: 104, 105: 105, 106: 106, 107: 107, 108: 108, 109: 109, 110: 110, 111: 111, 112: 112, 113: 113, 114: 114, 115: 115, 116: 116, 117: 117, 118: 118, 119: 119, 120: 120, 121: 121, 122: 122, 123: 123, 124: 124, 125: 125, 126: 126, 127: 127, 1027: 129, 8225: 135, 1046: 198, 8222: 132, 1047: 199, 1168: 165, 1048: 200, 1113: 154, 1049: 201, 1045: 197, 1050: 202, 1028: 170, 160: 160, 1040: 192, 1051: 203, 164: 164, 166: 166, 167: 167, 169: 169, 171: 171, 172: 172, 173: 173, 174: 174, 1053: 205, 176: 176, 177: 177, 1114: 156, 181: 181, 182: 182, 183: 183, 8221: 148, 187: 187, 1029: 189, 1056: 208, 1057: 209, 1058: 210, 8364: 136, 1112: 188, 1115: 158, 1059: 211, 1060: 212, 1030: 178, 1061: 213, 1062: 214, 1063: 215, 1116: 157, 1064: 216, 1065: 217, 1031: 175, 1066: 218, 1067: 219, 1068: 220, 1069: 221, 1070: 222, 1032: 163, 8226: 149, 1071: 223, 1072: 224, 8482: 153, 1073: 225, 8240: 137, 1118: 162, 1074: 226, 1110: 179, 8230: 133, 1075: 227, 1033: 138, 1076: 228, 1077: 229, 8211: 150, 1078: 230, 1119: 159, 1079: 231, 1042: 194, 1080: 232, 1034: 140, 1025: 168, 1081: 233, 1082: 234, 8212: 151, 1083: 235, 1169: 180, 1084: 236, 1052: 204, 1085: 237, 1035: 142, 1086: 238, 1087: 239, 1088: 240, 1089: 241, 1090: 242, 1036: 141, 1041: 193, 1091: 243, 1092: 244, 8224: 134, 1093: 245, 8470: 185, 1094: 246, 1054: 206, 1095: 247, 1096: 248, 8249: 139, 1097: 249, 1098: 250, 1044: 196, 1099: 251, 1111: 191, 1055: 207, 1100: 252, 1038: 161, 8220: 147, 1101: 253, 8250: 155, 1102: 254, 8216: 145, 1103: 255, 1043: 195, 1105: 184, 1039: 143, 1026: 128, 1106: 144, 8218: 130, 1107: 131, 8217: 146, 1108: 186, 1109: 190}

      function unicodeToWin1251UrlEncoded (s) {
        let L = []
        for (let i = 0; i < s.length; i++) {
          let ord = s.charCodeAt(i)
          L.push(charEncodeCache[s[i]] || '%' + DMap[ord].toString(16))
        }
        return L.join('').toUpperCase()
      }

      let csvContent = JSON.stringify(this.currentData.names.name) + this.csvFieldDelimiter
      csvContent += this.currentData.names.periods.join(this.csvFieldDelimiter) + '\n'
      csvContent += this.currentData.data.map((d) => {
        return JSON.stringify(d.name) +
          d.values.reduce((r, v) => r + this.csvFieldDelimiter + JSON.stringify(v || '-')
            .replace(/\./, this.csvDecimalDelimiter), '')
      })
      .join('\n')
      .replace(/(^\{)|(\}$)/mg, '')
      // window.open(encodeURI(csvContent))
      return encodeURI('data:text/csv;charset=windows-1251,') + unicodeToWin1251UrlEncoded(csvContent)
    },
    isNegative (value) {
      return ((+value) < 0)
    },
    setFocus (refname) {
      this.$refs[refname].$children[0].$el.nextElementSibling.focus()
      this.$refs[refname].$children[0].$el.nextElementSibling.select()
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
    fetchPeriodList () {
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
    fetchSubjectList () {
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
    dataDeserialize (template, data) {
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
