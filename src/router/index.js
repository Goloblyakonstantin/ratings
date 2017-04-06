import Vue from 'vue'
import Router from 'vue-router'
import Chart from '@/components/Chart'
import RatingList from '@/components/RatingList'
import TableView from '@/components/TableView'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'RatingList',
      component: RatingList,
      props: true
    },
    {
      path: '/chart',
      name: 'Chart',
      component: Chart,
      props: true
    },
    {
      path: '/rating/:id',
      name: 'TableView',
      component: TableView,
      props: true
    }
  ]
})
