<template>
  <b-table
    :data="isEmpty ? [] : payListData"
    :striped="isStriped">
    <template v-slot="props">
      <b-table-column field="using_day" label="日付">
        <span class="tag is-success">
          {{ dateFormat(props.row.using_day) }}
        </span>
      </b-table-column>
      <b-table-column field="place" label="場所">
        {{ props.row.place }}
      </b-table-column>
      <b-table-column field="price" label="ご利用料金" numeric>
        {{ props.row.price }}
      </b-table-column>
    </template>
    <template slot="footer">
      <div class="has-text-right">
          合計金額: {{ totalPriceView }}
      </div>
    </template>
  </b-table>
</template>

<script>
import Moment from 'moment'

export default {
  name: 'PayList',
  props: ['payListData'],
  data: () => {
    return {
      isEmpty: false,
      isStriped: true
    }
  },
  computed: {
    totalPriceView () {
      if (this.payListData.length === 0) {
        return 0
      }
      return this.payListData.reduce((total, data) => {
        return total + Number(data.price)
      }, 0)
    }
  },
  methods: {
    dateFormat (usingDay) {
      return Moment(usingDay).format('YYYY/MM/DD')
    }
  }
}
</script>
