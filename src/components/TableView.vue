<template>
  <div class="container" v-if="(getData)">
    <div class="row ">
      <ul class="list-group">
        <li lass="list-group-item justify-content-between">
          <span class="badge badge-default"> Источник </span> {{ getData.source }}
        </li>
        <li lass="list-group-item justify-content-between">
          <span class="badge badge-default"> Показатель </span> {{ getData.index.name }}, {{ getData.index.unit }}
        </li>
      </ul>
    </div>
    <div class="row justify-content-center">
      <table class="table table-hover">
        <thead class="thead-default">
          <th class="text-right">
            Ранг
          </th>
          <th class="text-left">
            Дистрибьютор
          </th>
          <th v-for="period in getData.names.periods" class="text-center">
            {{ period }}
          </th>
          <th>
            <ui-icon-button v-if="!ifAddColumn && ifEditMode" color="default" icon="add" size="small" @click="showAddColumn">
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
            <td class="text-right">
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
              <ui-icon-button v-if="!ifAddRow && ifEditMode" color="default" icon="add" size="small" @click="showAddRow">
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
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
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
  methods: {
    ...mapActions([
      'dataAddName',
      'dataAddPeriod'
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
        console.log(this.newName)
        this.dataAddName(this.newName.trim())
      }
      this.addRowCancel()
    },
    addRowCancel () {
      this.ifAddRow = false
      this.newName = ''
    },
    editValue () {
      console.log(event)
    },
    setFocus (refname) {
      this.$refs[refname].focus()
      this.$refs[refname].select()
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
  }
}
</script>

<style>
.list-group {
  width: 100%;
}
ul {
  list-style-type: none;
}
</style>
