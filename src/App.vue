<template>
  <div v-if="user" class="layout-container">
    <aside class="layout-sidebar">
      <OptionsView />
    </aside>

    <main class="layout-main">
      <RouterView />
    </main>
  </div>
  
  <RouterView v-else />
</template>

<script setup>
  import OptionsView from './components/OptionsView.vue';
  import { onMounted } from 'vue'
  import { useAuth } from './services/useAuth'
  
  const { user, getUser } = useAuth();
  
  onMounted(async () => {
    await getUser();
  })
</script>

<style>
  @import '@/assets/styles/layout.css';
</style>