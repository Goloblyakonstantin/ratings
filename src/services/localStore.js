export const ls = {
  get (key, defaultVal = null) {
    return window.localStorage.getItem(key) || defaultVal
  },
  set (key, val) {
    return window.localStorage.setItem(key, val)
  },
  remove (key) {
    return window.localStorage.removeItem(key)
  }
}
