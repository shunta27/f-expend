<template>
  <div class="main">
    <b-loading :is-full-page="isFullPage" :active.sync="isLoading" :can-cancel="false"></b-loading>
    <section class="section">
      <div class="container">
        <h1 class="title">クレジット利用履歴</h1>
        <h2 class="subtitle">
          {{ startDtView }} - {{ endDtView }}
        </h2>
        <div>
          <b-field label="Start date">
            <b-datepicker
                placeholder="Click to select..."
                icon="calendar-today"
                @input="startDate">
            </b-datepicker>
          </b-field>
          <b-field label="End date">
            <b-datepicker
                placeholder="Click to select..."
                icon="calendar-today"
                @input="endDate">
            </b-datepicker>
          </b-field>
          <button
            @click="search"
            class="button">Search</button>
        </div>
        <hr>
        <PayList v-bind:payListData="payListData"></PayList>
      </div>
    </section>
  </div>
</template>

<script>
import Moment from 'moment'
import Axios from 'axios'
import PayList from '@/components/PayList'

export default {
  name: 'Home',
  components: {
    PayList
  },
  data: () => {
    return {
      isLoading: false,
      isFullPage: true,
      startDt: new Date(),
      endDt: new Date(),
      payListData: []
    }
  },
  computed: {
    startDtView () {
      return this.dateFormat(this.startDt)
    },
    endDtView () {
      return this.dateFormat(this.endDt)
    }
  },
  methods: {
    dateFormat (date, format = 'YYYY/MM/DD') {
      return Moment(date).format(format)
    },
    searchValidate (from, to) {
      return Moment(from).isSameOrBefore(to)
    },
    startDate (date) {
      this.startDt = date
    },
    endDate (date) {
      this.endDt = date
    },
    async search () {
      if (!this.searchValidate(this.startDt, this.endDt)) {
        return null
      }

      try {
        this.isLoading = true
        const res = await Axios.get(
          'https://f-expend.firebaseapp.com/api/csv_data',
          {
            params: {
              startDt: this.dateFormat(this.startDt, 'YYYYMMDD'),
              endDt: this.dateFormat(this.endDt, 'YYYYMMDD')
            }
          }
        )
        // console.log(res)
        this.isLoading = false
        this.payListData = res.data.payListData
      } catch (error) {
        this.isLoading = false
        const {
          status,
          statusText
        } = error.response
        console.log(`Error! HTTP Status: ${status} ${statusText}`)
      }
    }
  }
}
</script>
