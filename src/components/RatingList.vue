<template>
  <div class="container">
    <div v-if="!ifEditMode">
      <div class="row justify-content-center">
        <div class="col list-group">
          <div v-for="rating in currentData" class="row list-group-item">
            <span class="col-12">
              <router-link :to="{ name: 'TableView', params: { id: rating.id }}">{{ rating.title }}</router-link>
            </span>
            <span class="col-2 badge badge-default">
              {{ rating.source }}
            </span>
            <span class="small">
              {{ rating.index_name }},
              {{ rating.unit }}
            </span>
          </div>
        </div>
      </div>
    </div>
    <div v-if="ifEditMode">
      <table class="table" >
        <thead class="thead-default">
          <th>
            Источник
          </th>
          <th>
            Заголовок
          </th>
          <th>
            Наименование показателя
          </th>
          <th>
            Единица измерения
          </th>
          <th>
            Заголовок для участников рейтинга
          </th>
          <th>
            Периодичность
          </th>
        </thead>
        <tbody>
          <tr v-for="(row, i) in currentData">
            <td>
              <input v-model="currentData[i].source" class="form-control form-control-sm">
              </input>
            </td>
            <td>
              <input v-model="currentData[i].title" class="form-control form-control-sm">
              </input>
            </td>
            <td>
              <input v-model="currentData[i].index_name" class="form-control form-control-sm">
              </input>
            </td>
            <td>
              <input v-model="currentData[i].unit" class="form-control form-control-sm">
              </input>
            </td>
            <td>
              <input v-model="currentData[i].subject_type" class="form-control form-control-sm">
              </input>
            </td>
            <td>
              <input v-model="currentData[i].period_type" class="form-control form-control-sm">
              </input>
            </td>
          </tr>
          <tr>
            <td>
              <ui-icon-button v-if="!ifAddRow" color="default" icon="add" size="small" @click="addRow">
              </ui-icon-button>
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
      ifAddRow: false,
      ratingsList: {}
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
      return res.data
    }
  },
  methods: {
    ...mapActions([
      'dataAdd',
      'loading',
      'setData'
    ]),
    fetchData () {
      this.loading(true)
      this.setData()
      let newData = this.getData
      this.$http.get('ratings')
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
          newData.data = data
          newData.saveFunc = function (data) {
            let serializedData = data.data
            vm.$http.post('ratings', serializedData, {options: {headers: {ContentType: 'application/json'}}})
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
          this.setData(newData)
          this.loading(false)
        })
    },
    addRow () {
      const newRow = {
        id: null,
        title: '',
        source: '',
        index_name: '',
        unit: '',
        subject_type: '',
        period_type: ''
      }
      this.dataAdd(newRow)
    }
  },
  beforeMount () {
    this.fetchData()
    this.loading(false)
  }
}
</script>

<style>
</style>
