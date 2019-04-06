import Vue from 'vue'
import Router from 'vue-router'
import Buefy from 'buefy'
import 'buefy/dist/buefy.css'
import Home from '@/components/Home'
import CsvUpload from '@/components/CsvUpload'

Vue.use(Buefy)
Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/upload',
      name: 'CsvUpload',
      component: CsvUpload
    }
  ]
})
