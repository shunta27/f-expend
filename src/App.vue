<template>
  <div id="app">
    <nav class="navbar" role="navigation" aria-label="main navigation">
      <div class="navbar-brand">
        <!-- <a class="navbar-item" href="https://bulma.io">
          <img src="https://bulma.io/images/bulma-logo.png" width="112" height="28">
        </a> -->
        <a
          v-bind:class="{ 'is-active': menuActive }"
          v-on:click="menuToggle()"
          role="button"
          class="navbar-burger burger"
          aria-label="menu"
          aria-expanded="false"
          data-target="navbar">
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
        </a>
      </div>

      <div
        id="navbar"
        v-bind:class="{ 'is-active': menuActive }"
        class="navbar-menu">
        <div class="navbar-start">
          <router-link to="/" class="navbar-item">Home</router-link>
          <router-link to="/upload" class="navbar-item">CSV Upload</router-link>
        </div>
      </div>
    </nav>
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App',
  data: () => {
    return {
      menuActive: false
    }
  },
  methods: {
    menuToggle () {
      this.menuActive = !this.menuActive
    }
  }
}
</script>
