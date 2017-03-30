<template>
  <div class="container">
  </div>
</template>

<script>
export default {
  data () {
    return {
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
          'period': 'Год'
        },
        data: [
          {
            range: 1,
            name: 'Протек',
            values: {
              '2016': 18.71,
              '2015': 18.43
            }
          },
          {
            range: 2,
            name: 'Катрен',
            values: {
              '2016': 18.09,
              '2015': 16.53
            }
          }
        ]
      }
    }
  }
}
</script>
