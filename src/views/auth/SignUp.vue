<template>
  <div class="auth-container">
    <div class="auth-form">
      <h2>Registro</h2>
      <p class="subtitle">Crea una cuenta para empezar</p>

      <form @submit.prevent="handleSignUp">
        <div class="form-group">
          <input 
            v-model="email"
            type="email"
            placeholder="Email"            
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
        <div class="form-group">
          <div style="display: flex; gap: 10px;">
            <select v-model="select" style="width: 30%;">
              <option disabled value="">Lada</option>
              <option>+52</option>
            </select>

            <input 
              v-model="phoneNumber"
              type="text"
              placeholder="Número telefónico"            
              required
              style="width: 70%;"
            />
          </div>
        </div>

        <button type="submit" :disabled="isLoading">
          {{ isLoading ? 'Cargando...' : 'Registrarse'}}
        </button>

        <p class="text-center">
          <router-link to="/login">Volver al login</router-link>
        </p>
      </form>

      <p v-if="error" class="error">{{ error }}</p>
    </div>

    <div class="auth-illustration">
      <div class="icon-wrapper">
        <HouseIcon />
      </div>
      <p class="brand-text">Únete a Nosotros</p>
    </div>
  </div>
</template>

<script setup>
  import { useAuth } from '@/services/useAuth';
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import HouseIcon from '@/components/icons/HouseIcon.vue';

  const select = "";
  const { signUp } = useAuth();
  const router = useRouter();
  const phoneNumber = ref('');
  const email = ref('');
  const password = ref('');
  const error = ref(null);
  const isLoading = ref(false);

  const handleSignUp = async () => {
    error.value = null;
    isLoading.value = true;

    const {data, err: signUpError} = await signUp(
      email.value, phoneNumber.value, password.value);
      
    isLoading.value = false;

    if(signUpError){
      error.value = signUpError.message;
    } else {
      router.push('/login');
    }

    console.log('creacion ',data);
  }
</script>

<style>
  @import '@/assets/styles/auth.css';
</style>