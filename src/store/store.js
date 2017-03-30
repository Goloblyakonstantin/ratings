import Vue from 'vue'
import Vuex from 'vuex'
import { ls } from './../services/localStore'

Vue.use(Vuex)

export const store = new Vuex.Store({
  state: {
    backRoute: false,
    editMode: false,
    tokenName: 'jwt-token',
    loading: false,
    loggedIn: true,
    data: {
      title: 'ТОР10 крупнейших дистрибьюторов на рынке прямых продаж ЛС (включая льготное лекарственное обеспечение)',
      source: 'QuintilesIMS',
      index: {
        name: 'Доля на рынке прямых продаж ЛС',
        unit: '%'
      },
      names: {
        'range': 'Ранг',
        'name': 'Дистрибьютор',
        'period': 'Год',
        'periods': ['2016', '2015']
      },
      data: [
        {
          range: 1,
          name: 'Протек',
          values: [ 18.71, 18.43 ]
        },
        {
          range: 2,
          name: 'Катрен',
          values: [ 18.09, 16.53 ]
        }
      ]
    }
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
    logIn: (state, payload) => {
      ls.set(state.tokenName, payload)
      state.loggedIn = true
    },
    logOut: (state) => {
      ls.remove(state.tokenName)
      state.loggedIn = false
    },
    setBackRoute: (state, payload) => {
      if (payload !== '/login') {
        state.backRoute = payload
      }
    }
  },
  actions: {
    dataAddName: ({commit}, payload) => {
      commit('dataAddName', payload)
    },
    dataAddPeriod: ({commit}, payload) => {
      commit('dataAddPeriod', payload)
    },
    doEditMode: ({commit}, payload) => {
      commit('doEditMode', payload)
    },
    logIn: ({commit}, payload) => {
      commit('logIn', payload)
    },
    logOut: ({commit}) => {
      commit('logOut')
    },
    setBackRoute: ({commit}, payload) => {
      commit('setBackRoute', payload)
    }
  }
})
