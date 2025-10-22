<template>
  <div class="property-form">
    <h2>Agregar Nueva Propiedad</h2>
    <p class="subtitle">Ingresa los detalles de tu propiedad</p>

    <form @submit.prevent="handleSubmit">
      <!-- Imagen de la propiedad -->
      <div class="photo-upload">
        <img 
          :src="preview || defaultPropertyImg" 
          alt="Property photo" 
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

      <!-- Información básica -->
      <div class="form-group">
        <label for="title">Título</label>
        <input
          id="title"
          v-model="title"
          type="text"
          placeholder="Ej: Departamento amueblado en zona centro"
          required
        />
      </div>

      <div class="form-group">
        <label for="description">Descripción</label>
        <textarea
          id="description"
          v-model="description"
          placeholder="Describe tu propiedad..."
          rows="4"
          required
        ></textarea>
      </div>

      <div class="form-group">
        <label for="address">Dirección</label>
        <input
          id="address"
          v-model="address"
          type="text"
          placeholder="Dirección completa"
          required
        />
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="monthlyPrice">Precio Mensual</label>
          <input
            id="monthlyPrice"
            v-model="monthlyPrice"
            type="number"
            min="0"
            placeholder="$"
            required
          />
        </div>

        <div class="form-group">
          <label for="propertyType">Tipo de Propiedad</label>
          <select id="propertyType" v-model="propertyType" required>
            <option value="">Selecciona tipo</option>
            <option value="house">Casa</option>
            <option value="apartment">Departamento</option>
            <option value="room">Habitación</option>
            <option value="office">Oficina</option>
          </select>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="minStay">Tiempo Mínimo (meses)</label>
          <input
            id="minStay"
            v-model="minStay"
            type="number"
            min="1"
            placeholder="Mínimo"
            required
          />
        </div>

        <div class="form-group">
          <label for="maxStay">Tiempo Máximo (meses)</label>
          <input
            id="maxStay"
            v-model="maxStay"
            type="number"
            min="1"
            placeholder="Máximo"
            required
          />
        </div>
      </div>

      <div class="form-group">
        <label>Servicios Incluidos</label>
        <div class="services-grid">
          <label class="checkbox-label">
            <input type="checkbox" v-model="services" value="wifi" />
            WiFi
          </label>
          <label class="checkbox-label">
            <input type="checkbox" v-model="services" value="water" />
            Agua
          </label>
          <label class="checkbox-label">
            <input type="checkbox" v-model="services" value="electricity" />
            Luz
          </label>
          <label class="checkbox-label">
            <input type="checkbox" v-model="services" value="gas" />
            Gas
          </label>
          <label class="checkbox-label">
            <input type="checkbox" v-model="services" value="furniture" />
            Amueblado
          </label>
          <label class="checkbox-label">
            <input type="checkbox" v-model="services" value="parking" />
            Estacionamiento
          </label>
        </div>
      </div>

      <button type="submit" :disabled="loading">
        {{ loading ? 'Publicando...' : 'Publicar Propiedad' }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { supabase } from '@/lib/supabase'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Form fields
const title = ref('')
const description = ref('')
const address = ref('')
const monthlyPrice = ref('')
const minStay = ref('')
const maxStay = ref('')
const propertyType = ref('')
const services = ref([])
const loading = ref(false)
const error = ref('')


// Photo handling
const photo = ref(null)
const preview = ref(null)
const defaultPropertyImg = 'https://placehold.co/600x400/e2e8f0/cccccc?text=Agregar+Foto'

const handlePhotoChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    photo.value = file
    preview.value = URL.createObjectURL(file)
  }
}

const removePhoto = () => {
  photo.value = null
  preview.value = null
}

const handleSubmit = async () => {
    loading.value = true;
    error.value = ''

    try {    
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            throw new Error('inicia sesión antes de continuar.');
        }
    
        let propertyImageUrl = defaultPropertyImg;

        if (photo.value) {
            const fileExt = photo.value.name.split('.').pop();
            const fileName = `${user.id}_${Date.now()}.${fileExt}`; // Generamos un nombre único
            const filePath = `properties/${fileName}`;
        
            // subida al bucket
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('properties')
                .upload(filePath, photo.value, {
                    upsert: true,
                    contentType: photo.value.type || 'image/jpeg',
                });
        
            if (uploadError) {
                throw new Error(`error al subir imagen: ${uploadError.message}`);
            }
      
            // obtener URL publica
            const { data: publicUrlData } = await supabase.storage
                .from('properties')
                .getPublicUrl(filePath);
      
            propertyImageUrl = publicUrlData.publicUrl; // Corregido el nombre de la variable
        }

        const { error: propertyError } = await supabase
            .from('properties')
            .upsert({
                owner_uuid: user.id,
                title: title.value,
                description: description.value,
                address: address.value,
                monthly_price: monthlyPrice.value,
                min_lease_term: minStay.value,
                max_lease_term: maxStay.value,
                status: 'available',
                amenities: services.value, // Usamos el array de servicios seleccionados
                property_type: propertyType.value,
                main_image_url: propertyImageUrl
            });
      
        if (propertyError) {
            throw new Error(`error al guardar datos de la propiedad: ${propertyError.message}`);
        }
    
        setTimeout(async () => {
            await router.push('/posts');
            window.location.reload();
        }, 2000)
    } catch (err) {
        error.value = err.message || 'Error desconocido al guardar los datos.';
        console.error(error.value); // Cambiado a console.error para mejor debugging
    } finally {
        loading.value = false
    }
}
</script>

<style scoped>
.property-form {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.subtitle {
  color: #666;
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 500;
}

textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 15px;
  resize: vertical;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
  margin-top: 0.5rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.photo-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.preview-image {
  width: 100%;
  max-width: 400px;
  height: 250px;
  object-fit: cover;
  border-radius: 8px;
  border: 2px dashed #ddd;
}

.upload-controls {
  display: flex;
  gap: 1rem;
}

.upload-button {
  background: #7fcdbb;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.upload-button:hover {
  background: #6bb3a3;
}

.remove-button {
  background: #ff4444;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.remove-button:hover {
  background: #ff2020;
}

.hidden {
  display: none;
}

button[type="submit"] {
  width: 100%;
  padding: 14px;
  background-color: #7fcdbb;
  color: white;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 2rem;
}

button[type="submit"]:hover:not(:disabled) {
  background-color: #6bb3a3;
}

button[type="submit"]:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>