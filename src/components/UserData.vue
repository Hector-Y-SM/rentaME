<template>
    <h1>Ingresa tus datos para continuar</h1>
    <form @submit.prevent="handleSubmit">
        <div class="photo-upload">
            <img 
                :src="preview || defaultAvatar" 
                alt="Profile photo" 
                class="preview-image"
            />
            <div class="upload-controls">
                <label for="photo" class="upload-button">
                    {{ photo ? 'Cambiar foto' : 'Subir foto' }}
                    <input
                        type="file"
                        id="photo"
                        accept="image/*"
                        @change="handlePhotoChange"
                        class="hidden"
                    />
                </label>
                <button 
                    v-if="photo" 
                    type="button" 
                    @click="removePhoto" 
                    class="remove-button"
                >
                    Quitar foto
                </button>
            </div>
        </div>

        <div class="form-group">
            <input
                id="fName"
                v-model="first_name"
                type="text"
                placeholder="Name"
                required
            />
        </div>
        <div class="form-group">
            <input
                id="lName"
                v-model="last_name"
                type="text"
                placeholder="Last name"
                required
            />
        </div>

        <button type="submit" :disabled="loading">
            {{ loading ? 'Cargando' : 'Agregar mis datos' }}
        </button>
    </form>
</template>

<script setup>
    import { supabase } from '@/lib/supabase';
    import { ref } from 'vue';
    import { useRouter } from 'vue-router';
    
    const props = defineProps({
        idUser: {
            type: String, 
            required: true
        }
    });
    
    const loading = ref(false);
    const error = ref('');
    const first_name = ref('');
    const last_name = ref('');
    const router = useRouter();
    const photo = ref(null);
    const preview = ref(null);
    const defaultAvatar = 'https://api.dicebear.com/7.x/avataaars/svg';
    
    const handlePhotoChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            photo.value = file;
            preview.value = URL.createObjectURL(file);
        }
    };
    
    const removePhoto = () => {
        photo.value = null;
        preview.value = null;
    };
    
    const handleSubmit = async () => {
      loading.value = true;
      error.value = '';
    
      try {
    
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          throw new Error('inicia sesión antes de continuar.');
        }
    
        let profileImageUrl = defaultAvatar;
    
        if (photo.value) {
          const fileExt = photo.value.name.split('.').pop();
          const fileName = `${props.idUser}.${fileExt}`;
          const filePath = `profiles/${fileName}`;
        
          // subida al bucket
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, photo.value, {
              upsert: true,
              contentType: photo.value.type || 'image/jpeg',
            });
        
          if (uploadError) {
            throw new Error(`error al subir imagen: ${uploadError.message}`);
          }
      
          // obtener URL publica
          const { data: publicUrlData } = await supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);
      
          profileImageUrl = publicUrlData.publicUrl;
        }
    
        const { error: profileError } = await supabase
          .from('user_info')
          .upsert({
            user_uuid: props.idUser,
            first_name: first_name.value,
            last_name: last_name.value,
            profile_img_url: profileImageUrl,
            email: user.email,
            is_initialized: true,
          });
      
        if (profileError) {
          throw new Error(`error al guardar datos del perfil: ${profileError.message}`);
        }
    
        setTimeout(async () => {
            await router.push('/posts');
            window.location.reload();
        }, 2000)
    
      } catch (err) {
        error.value = err.message || 'Error desconocido al guardar los datos.';
      } finally {
        loading.value = false;
      }
    };
</script>

<style scoped>
    @import '../assets/styles/components/userData.css'
</style>