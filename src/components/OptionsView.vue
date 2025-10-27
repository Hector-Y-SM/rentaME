<template>
  <nav v-if="user && !isRestrictedRoute" class="options-nav">
    <div class="header-section">
      <div class="icon-wrapper">
        <router-link to="/">
          <HouseIcon />
        </router-link>
      </div>
      <p class="brand-text">INcontrol</p>
      <p class="brand-text">{{user.email}}</p>
    </div>

    <div class="menu-section">
      <div class="profile-menu">
        <button @click="toggleProfileMenu" class="menu-button">
          Mi Perfil
          <span :class="{ 'arrow': true, 'arrow-down': !isOpen, 'arrow-up': isOpen }">▼</span>
        </button>
        
        <div v-if="isOpen" class="profile-submenu">
          <RouterLink to="/settings" class="menu-link">Ajustes</RouterLink>
        </div>
      </div>

      <RouterLink to="/posts" class="menu-link">Posts</RouterLink>
      <RouterLink to="/my-properties" class="menu-link">Mis Propiedades</RouterLink>
      <button @click="handleLogout" class="menu-button logout">Cerrar Sesión</button>
    </div>
  </nav>
</template>

<script setup>
    import { ref, computed } from 'vue'
    import HouseIcon from './icons/HouseIcon.vue'
    import { useAuth } from '@/services/useAuth'
    import { useRoute, useRouter } from 'vue-router'

    const isOpen = ref(false)
    const router = useRouter()
    const route = useRoute()
    const { user, signOut } = useAuth();


    const restrictedRoutes = [
        '/forgot-password',
        '/reset-password',
        '/login'
    ]

    const isRestrictedRoute = computed(() => {
      return restrictedRoutes.includes(route.path)
    })

    const toggleProfileMenu = () => {
      isOpen.value = !isOpen.value
    }

    const handleLogout = async () => {
        const {data, err} = await signOut();
        if(!err){
          router.push('/login')
        }
    }
</script>

<style scoped>
  @import '../assets/styles/components/optionsView.css';
</style>