<template>
<ui-toolbar :loading="ifLoading" text-color="white" type="colored" :brand="brand" :title="getData.title">
  <div slot="actions">
    <ui-icon-button color="white" has-dropdown icon="more_vert" ref="dropdownButton5" size="large" type="secondary">
      <ui-menu contain-focus has-icons slot="dropdown" :options="currentMenuOptions" @close="$refs.dropdownButton5.closeDropdown()" @select="select"></ui-menu>
    </ui-icon-button>
  </div>
</ui-toolbar>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

const menuOptions = [
  {
    id: 'edit',
    icon: 'edit',
    label: 'Редактировать'
  },
  {
    id: 'save',
    icon: 'save',
    label: 'Сохранить'
  }
]

export default {
  data () {
    return {
      menuOptions,
      brand: 'Реестры'
    }
  },
  props: [
    'title'
  ],
  computed: {
    ...mapGetters([
      'getData',
      'ifLoading',
      'ifEditMode'
    ]),
    currentMenuOptions () {
      return this.menuOptions.map(x => {
        x.disabled = (
          (x.id === 'edit' && this.ifEditMode) ||
          (x.id === 'save' && !this.ifEditMode)
        )
        return x
      })
    }
  },
  methods: {
    ...mapActions([
      'dataAddPeriod',
      'doEditMode'
    ]),
    select (item) {
      switch (item.id) {
        case 'edit':
          this.doEditMode()
          break
      }
    }
  }
}
</script>
