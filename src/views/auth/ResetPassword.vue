<template>
  <div class="auth-container">
    <div class="auth-form">
      <h2>Restablecer Contraseña</h2>
      <p class="subtitle" v-if="!passwordReset">
        Ingresa y confirma tu nueva contraseña
      </p>


      <form @submit.prevent="handleSubmit" v-if="!passwordReset">
        <div class="form-group">
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="Nueva contraseña (mínimo 6 caracteres)"
            required
            minlength="6"
          />
        </div>

        <div class="form-group">
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            placeholder="Confirmar contraseña"
            required
          />
        </div>

        <button type="submit" :disabled="loading">
          {{ loading ? 'Actualizando...' : 'Actualizar contraseña' }}
        </button>
      </form>

      <p v-if="error" class="error">{{ error }}</p>

      <div v-if="passwordReset" class="success-message">
        <div class="icon-wrapper success">
          <CheckIcon />
        </div>
        <h3>¡Contraseña actualizada!</h3>
        <p>
          Tu contraseña ha sido restablecida exitosamente.
          Ya puedes iniciar sesión con tu nueva contraseña.
        </p>
        <router-link to="/login" class="button">
          Ir al inicio de sesión
        </router-link>
      </div>
    </div>

    <div class="auth-illustration">
      <div class="icon-wrapper">
        <KeyIcon />
      </div>
      <p class="brand-text">Nueva Contraseña</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../../lib/supabase.js'
import { useAuth } from '@/services/useAuth.js'
import KeyIcon from '@/components/icons/KeyIcon.vue'
import CheckIcon from '@/components/icons/CheckIcon.vue'


const { signOut } = useAuth();
const router = useRouter()
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref('')
const passwordReset = ref(false)

onMounted(async () => {
  // Verificar si hay una sesión de recuperación activa
  const { data, error: sessionError } = await supabase.auth.getSession()
  
  if (sessionError || !data.session) {
    error.value = 'Enlace inválido o expirado. Por favor solicita un nuevo enlace.'
  }
})

const handleSubmit = async () => {
  // Validar que las contraseñas coincidan
  if (password.value !== confirmPassword.value) {
    error.value = 'Las contraseñas no coinciden'
    return
  }

  // Validar longitud mínima
  if (password.value.length < 6) {
    error.value = 'La contraseña debe tener al menos 6 caracteres'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const { error: updateError } = await supabase.auth.updateUser({
      password: password.value
    })

    if (updateError) {
      error.value = updateError.message
    } else {
      passwordReset.value = true
      await signOut()
      // Opcional: redirigir automáticamente después de 3 segundos
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    }
  } catch (err) {
    error.value = 'Ocurrió un error inesperado. Por favor intenta de nuevo.'
  } finally {
    loading.value = false
  }
}
</script>

<style>
  @import '@/assets/styles/auth.css';
</style>