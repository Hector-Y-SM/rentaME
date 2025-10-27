<template>
    <div v-if="!loading" class="container">
        <img :src="user.profile_img_url" alt="Foto de perfil">
        <h1>Hola {{ user.first_name }} {{ user.last_name }}</h1>
    </div>
    <div v-else class="container">
        <h1>cargando...</h1>
    </div>
</template>

<script setup>
    import { supabase } from '@/lib/supabase';
    import { onMounted, ref } from 'vue';
    import { useRouter } from 'vue-router'; 

    const loading = ref(true);
    const user = ref(null);
    const router = useRouter(); 

    onMounted(async () => {
        try {
            const {data, error: sesionError} = await supabase.auth.getSession();

            if(sesionError || !data.session){
              router.push('/login');
              return
            }

            const {data: userData, error} = await supabase
              .from('user_info')
              .select('*')
              .eq('user_uuid', data.session.user.id)
              .single();

            if (error) {
              console.error('Error fetching user info:', error);
              router.push('/login');
              return;
            }

            user.value = userData;
        } catch (error) {
          console.error('error:', error);
          router.push('/login');
        } finally {
          loading.value = false;
        }
    })
</script>

<style scoped>
    .container {
      display: flex;
      flex-direction: column; 
      justify-content: center; 
      align-items: center;   
    height: 100vh; 
      text-align: center; 
    }

    img {
      width: 40%; 
      height: 60%;
      border-radius: 10%; 
      margin-bottom: 1rem; 
    }
</style>