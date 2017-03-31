<template>
  <div class="container">
    <div v-if="getData.title">
      <div class="row">
        <ul class="list-group">
          <li v-if="getData.source" class="list-group-item">
            <span class="badge badge-default"> Источник </span> {{ getData.source }}
          </li>
          <li v-if="getData.index && getData.index.name" class="list-group-item">
            <span class="badge badge-default"> Показатель </span> {{ getData.index.name }}, {{ getData.index.unit }}
          </li>
        </ul>
      </div>
      <div class="row justify-content-center">
        <table v-if="getData.names" class="table">
          <thead class="thead-default">
            <th v-if="getData.names.range" class="text-right">
              {{ getData.names.range }}
            </th>
            <th class="text-left">
              {{ getData.names.name }}
            </th>
            <th v-for="period in getData.names.periods" class="text-center">
              {{ period }}
            </th>
            <th>
              <ui-icon-button v-if="!ifAddColumn && ifEditMode" color="default" icon="add" size="small" :tooltip="getData.names.period" @click="showAddColumn">
              </ui-icon-button>
              <div v-if="ifAddColumn" class="input-group input-group-sm">
                <input v-model="newPeriod" ref="newPeriodInput" class="form-control form-control-sm" :placeholder="getData.names.period" @keyup.enter="addColumn" @keyup.esc="addColumnCancel">
                </input>
                <button class="input-group-addon" @click="addColumn">OK</button>
              </div>
            </th>
          </thead>
          <tbody>
            <tr  v-for="(row, i) in getData.data">
              <td v-if="getData.names.range" class="text-right">
                {{ row.range }}
              </td>
              <td class="text-left">
                {{ row.name }}
              </td>
              <td v-for="(value, n) in row.values" class="text-center" @click="editMode = true">
                <div>
                  <div v-if="!ifEditMode">
                    {{ value }}
                  </div>
                  <div v-if="ifEditMode">
                    <input v-model="getData.data[i].values[n]" class="form-control form-control-sm">
                    </input>
                  </div>
                </div>
              </td>
              <td>
              </td>
            </tr>
            <tr v-if="ifEditMode">
              <td colspan="2">
                <ui-icon-button v-if="!ifAddRow && ifEditMode" color="default" icon="add" size="small" :tooltip="getData.names.name" @click="showAddRow">
                </ui-icon-button>
                <div v-if="ifAddRow" class="input-group input-group-sm">
                  <input v-model="newName" ref="newNameInput" class="form-control form-control-sm" :placeholder="getData.names.name" @keyup.enter="addRow" @keyup.esc="addRowCancel">
                  </input>
                  <button class="input-group-addon" @click="addRow">OK</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div v-if="!getData.title">
      Нет доступа к запрошенным данным. Обратитесь в службу поддержки
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
    ])
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
          if (data[0]) {
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
            values: template.names.periods.map((p) => data.filter((x) => x.subject === s && x.period === p)[0].value)
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
ul {
  list-style-type: none;
}
input {
  min-width: 4em;
}
</style>
