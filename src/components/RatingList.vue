<template>
  <div class="container">
    <div v-if="!ifEditMode">
      <div class="row justify-content-center">
        <div class="col list-group">
          <div v-for="rating in ratingsList" class="row list-group-item">
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
          <tr v-for="(row, i) in ratingsList">
            <td>
              <input v-model="ratingsList[i].source" class="form-control form-control-sm">
              </input>
            </td>
            <td>
              <input v-model="ratingsList[i].title" class="form-control form-control-sm">
              </input>
            </td>
            <td>
              <input v-model="ratingsList[i].index_name" class="form-control form-control-sm">
              </input>
            </td>
            <td>
              <input v-model="ratingsList[i].unit" class="form-control form-control-sm">
              </input>
            </td>
            <td>
              <input v-model="ratingsList[i].subject_type" class="form-control form-control-sm">
              </input>
            </td>
            <td>
              <input v-model="ratingsList[i].period_type" class="form-control form-control-sm">
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
    ])
  },
  methods: {
    ...mapActions([
      'loading',
      'setData'
    ]),
    fetchData () {
      this.loading(true)
      this.setData()
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
          this.ratingsList = data
          this.loading(false)
        })
    },
    addRow () {
      this.ratingsList.push({})
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
