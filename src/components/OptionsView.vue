<template>
  <nav v-if="user && !isRestrictedRoute" class="options-nav">
    <div class="header-section">
      <div class="icon-wrapper">
        <HouseIcon />
      </div>
      <p class="brand-text">INcontrol</p>
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
.options-nav {
  display: flex;
  flex-direction: column;
  height: 90%;
  background-color: #7fcdbb;
}

.header-section {
  padding: 2rem;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.icon-wrapper {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
}

.brand-text {
  color: white;
  font-size: 1.5rem;
  font-weight: 500;
}

.menu-section {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.menu-button, .menu-link {
  width: 100%;
  height: 48px;
  padding: 2px 8px;
  border: 1px solid #7fcdbb;
  border-radius: 10px;
  font-size: 15px;
  background-color: #7fcdbb;
  color: white;
  text-align: left;
  text-decoration: none;
  transition: all 0.3s ease;
  cursor: pointer;
  display: flex;
}

.menu-button:hover, .menu-link:hover {
  background-color: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.1);
}

.profile-menu {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.profile-submenu {
  padding-left: 1rem;
}

.arrow {
  float: right;
  transition: transform 0.2s ease;
  margin-left: auto;
  color: rgba(255, 255, 255, 0.8);
}

.arrow-up {
  transform: rotate(180deg);
}

.logout {
  margin-top: auto;
  background-color: #7fcdbb;
  color: white;
}

.logout:hover {
  background-color: rgba(255, 68, 68, 0.2);
  border-color: rgba(255, 68, 68, 0.4);
  box-shadow: 0 0 0 2px rgba(255, 68, 68, 0.1);
}
</style>