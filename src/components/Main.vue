<template>
  <div class="container">
    <div class="row justify-content-center">
    </div>
    <div class="row justify-content-center">
      <ul class="col list-group">
        <li v-for="rating in ratingsList" class="list-group-item">
          <div class="badge badge-default">
            {{ rating.source }}
          </div>
          <div class="">
            <router-link :to="{ name: 'TableView', params: { id: rating.id }}">{{ rating.title }}</router-link>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  data () {
    return {
      ratingsList: {}
    }
  },
  computed: {
    ...mapGetters([
      'getData',
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
