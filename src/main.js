// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import VueResource from 'vue-resource'
import KeenUI from 'keen-ui'
import App from './App'
import router from './router'
import { store } from './store/store'

Vue.config.productionTip = false

Vue.use(KeenUI)
Vue.use(VueResource)

Vue.http.options.root = 'http://172.16.202.42:3005'

if (process.env.NODE_ENV === 'production') {
  // Vue.http.options.root = '/api/v1'
}

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App }
})
