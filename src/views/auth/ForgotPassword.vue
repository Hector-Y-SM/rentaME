<template>
  <div class="auth-container">
    <div class="auth-form">
      <h2>Recuperar Contraseña</h2>
      <p class="subtitle">
        Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
      </p>

      <form @submit.prevent="handleSubmit" v-if="!emailSent">
        <div class="form-group">
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="tu@email.com"
            required
          />
        </div>

        <button type="submit" :disabled="loading">
          {{ loading ? 'Enviando...' : 'Enviar enlace de recuperación' }}
        </button>

        <p class="text-center">
          <router-link to="/login">← Volver al inicio de sesión</router-link>
        </p>
      </form>

      <p v-if="error" class="error">{{ error }}</p>

      <div v-if="emailSent" class="success-message">
        <div class="icon-wrapper success">
          <CheckIcon />
        </div>
        <h3>¡Correo enviado!</h3>
        <p>
          Hemos enviado un enlace de recuperación a <strong>{{ email }}</strong>.
          Por favor revisa tu bandeja de entrada y sigue las instrucciones.
        </p>
        <button @click="emailSent = false" class="btn-secondary">
          Enviar otro correo
        </button>
        <router-link to="/login" class="button">
          Ir al inicio de sesión
        </router-link>
      </div>
    </div>


    <div class="auth-illustration">
      <div class="icon-wrapper">
        <KeyIcon />
      </div>
      <p class="brand-text">Recupera tu acceso</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { supabase } from '../../lib/supabase.js'
import KeyIcon from '@/components/icons/KeyIcon.vue'

const email = ref('')
const loading = ref(false)
const error = ref('')
const emailSent = ref(false)

const handleSubmit = async () => {
  loading.value = true
  error.value = ''

  try {
    const { error: supabaseError } = await supabase.auth.resetPasswordForEmail(
      email.value,
      {
        redirectTo: `${window.location.origin}/reset-password`
      }
    )

    if (supabaseError) {
      error.value = supabaseError.message
    } else {
      emailSent.value = true
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