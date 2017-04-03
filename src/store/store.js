import Vue from 'vue'
import Vuex from 'vuex'
import { ls } from './../services/localStore'

Vue.use(Vuex)

export const store = new Vuex.Store({
  state: {
    backRoute: false,
    editMode: false,
    tokenName: 'jwt-token',
    loading: true,
    loggedIn: true,
    ratings: {},
    initData: {
      title: '',
      names: {
        periods: []
      },
      data: []
    },
    data: {}
  },
  getters: {
    checkLogIn: (state) => {
      state.loggedIn = (ls.get(state.tokenName))
      return (state.loggedIn)
    },
    backRoute: (state) => {
      return state.backRoute
    },
    getData: (state) => {
      return state.data
    },
    getDataSerialized: (state) => {
      return state.data
    },
    ifEditMode: (state) => {
      return state.editMode
    },
    ifLoading: (state) => {
      return state.loading
    },
    tokenName: (state) => {
      return state.tokenName
    }
  },
  mutations: {
    dataAdd: (state, payload) => {
      state.data.data.push(payload)
    },
    dataAddName: (state, payload) => {
      let newRow = {name: payload}
      newRow.values = state.data.names.periods.map(x => null)
      state.data.data.push(newRow)
    },
    dataAddPeriod: (state, payload) => {
      state.data.names.periods.push(payload)
      state = state.data.data.map(x => x.values.push(null))
    },
    doEditMode: (state, payload) => {
      state.editMode = true
    },
    loading: (state, payload) => {
      state.loading = payload
    },
    logIn: (state, payload) => {
      ls.set(state.tokenName, payload)
      state.loggedIn = true
    },
    logOut: (state) => {
      ls.remove(state.tokenName)
      state.loggedIn = false
    },
    saveData: (state, payload) => {
      state.loading = true
      state.editMode = false
      state.data.saveFunc(state.data)
    },
    setBackRoute: (state, payload) => {
      if (payload !== '/login') {
        state.backRoute = payload
      }
    },
    setData: (state, payload) => {
      state.data = payload || Object.assign({}, state.initData)
    }
  },
  actions: {
    dataAdd: ({commit}, payload) => {
      commit('dataAdd', payload)
    },
    dataAddName: ({commit}, payload) => {
      commit('dataAddName', payload)
    },
    dataAddPeriod: ({commit}, payload) => {
      commit('dataAddPeriod', payload)
    },
    doEditMode: ({commit}, payload) => {
      commit('doEditMode', payload)
    },
    setData: ({commit}, payload) => {
      commit('setData', payload)
    },
    loading: ({commit}, payload) => {
      commit('loading', payload)
    },
    logIn: ({commit}, payload) => {
      commit('logIn', payload)
    },
    logOut: ({commit}) => {
      commit('logOut')
    },
    saveData: ({commit}, payload) => {
      commit('saveData', payload)
    },
    setBackRoute: ({commit}, payload) => {
      commit('setBackRoute', payload)
    }
  }
})
