<template>
  <div id="app">
    <AppHeader  v-if="user" />
    <main>
      <RouterView />
    </main>
  </div>
</template>

<script setup>
  import { onMounted, ref } from 'vue'
  import AppHeader from './components/AppHeader.vue'
  import { useAuth } from './services/useAuth'

  const { user, getUser } = useAuth();
  
  onMounted( async () => {
    await getUser();
  })

</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  width: 100%;
}

#app {
  width: 100%;
  min-height: 100vh;
}

main {
  width: 100%;
  min-height: 100vh;
}

body {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>