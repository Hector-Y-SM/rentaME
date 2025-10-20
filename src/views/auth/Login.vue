<template>
  <div class="auth-container">
    <div class="auth-form">
      <h2>Bienvenido</h2>
      <p class="subtitle">Inicia sesión para gestionar tus inmuebles</p>

      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <input
            v-model="email"
            type="email"
            placeholder="Correo electrónico"
            required
          />
        </div>

        <div class="form-group">
          <input
            v-model="password"
            type="password"
            placeholder="Contraseña"
            required
          />
        </div>

        <div class="links">
          <router-link to="/forgot-password">¿Olvidaste tu contraseña?</router-link>
        </div>

        <button type="submit" :disabled="isLoading">
          {{ isLoading ? 'Cargando...' : 'Iniciar sesión' }}
        </button>
      </form>

      <p v-if="error" class="error">{{ error }}</p>

      <p class="register">
        ¿No tienes cuenta?
        <router-link to="/signup">Regístrate aquí</router-link>
      </p>
    </div>

    <div class="auth-illustration">
      <div class="icon-wrapper">
        <HouseIcon />
      </div>
      <p class="brand-text">Gestor de Inmuebles</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/services/useAuth'
import HouseIcon from '@/components/icons/HouseIcon.vue'

const router = useRouter()
const { signIn } = useAuth()

const email = ref('')
const password = ref('')
const error = ref(null)
const isLoading = ref(false)

const handleLogin = async () => {
  console.log('aquiii');
  error.value = null
  isLoading.value = true
  
  const { data, error: loginError } = await signIn(email.value, password.value)
  isLoading.value = false
  
  if (loginError) {
    error.value = loginError.message
  } else {
    router.push('/')
  }

  console.log(data);
}
</script>

<style>
@import '@/assets/styles/auth.css';
</style>