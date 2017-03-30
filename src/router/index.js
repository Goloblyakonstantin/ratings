import Vue from 'vue'
import Router from 'vue-router'
import TableView from '@/components/TableView'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'TableView',
      component: TableView
    }
  ]
})
