<template>
  <div class="property-form">
    <h2>{{ isEditing ? 'Editar Propiedad' : 'Agregar Nueva Propiedad' }}</h2>
    <p class="subtitle">{{ isEditing ? 'Modifica los detalles de tu propiedad' : 'Ingresa los detalles de tu propiedad' }}</p>

    <form @submit.prevent="handleSubmit">
      <div class="photo-upload">
        <div class="main-image">
          <h3>Imagen Principal</h3>
          <img 
            :src="preview || defaultPropertyImg" 
            alt="Main property photo" 
            class="preview-image"
          />
          <div class="upload-controls">
            <label for="photo" class="upload-button">
              {{ photo ? 'Cambiar foto principal' : 'Subir foto principal' }}
              <input
                type="file"
                id="photo"
                accept="image/jpeg,image/jpg,image/png,image/webp"
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

        <div class="additional-images">
          <h3>Imágenes Adicionales (máximo 5)</h3>
          <div class="images-grid">
            <div 
              v-for="(img, index) in additionalImages" 
              :key="index" 
              class="image-item"
            >
              <img :src="img.preview" :alt="`Additional photo ${index + 1}`">
              <div class="image-overlay">
                <select v-model="img.category">
                  <option value="general">General</option>
                  <option value="facade">Fachada</option>
                  <option value="living_room">Sala</option>
                  <option value="kitchen">Cocina</option>
                  <option value="bedroom">Habitación</option>
                  <option value="bathroom">Baño</option>
                </select>
                <button @click="removeAdditionalImage(index)" class="remove-button">
                  Eliminar
                </button>
              </div>
            </div>

            <label 
              v-if="additionalImages.length < 5"
              class="add-image-button"
              :class="{ disabled: additionalImages.length >= 5 }"
            >
              <span>+ Agregar imagen</span>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                @change="handleAdditionalImageChange"
                class="hidden"
                :disabled="additionalImages.length >= 5"
              />
            </label>
          </div>
          <p class="image-info">
            Formatos permitidos: JPG, PNG, WEBP. Tamaño máximo: 5MB por imagen.
          </p>
        </div>
      </div>

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

      <div class="form-group address-section">
        <h3>Dirección</h3>
        
        <div class="address-grid">
          <div class="form-group">
            <label for="street">Calle y número</label>
            <input
              id="street"
              v-model="addressDetails.street"
              type="text"
              placeholder="Ej: Av. Principal #123"
              required
            />
          </div>

          <div class="form-group">
            <label for="neighborhood">Colonia/Barrio</label>
            <input
              id="neighborhood"
              v-model="addressDetails.neighborhood"
              type="text"
              placeholder="Ej: Centro"
              required
            />
          </div>

          <div class="form-group">
            <label for="postalCode">Código Postal</label>
            <input
              id="postalCode"
              v-model="addressDetails.postalCode"
              type="text"
              pattern="[0-9]*"
              maxlength="5"
              placeholder="Ej: 12345"
              required
            />
          </div>

          <div class="form-group">
            <label for="city">Ciudad</label>
            <input
              id="city"
              v-model="addressDetails.city"
              type="text"
              placeholder="Ej: Guadalajara"
              required
            />
          </div>

          <div class="form-group">
            <label for="state">Estado</label>
            <input
              id="state"
              v-model="addressDetails.state"
              type="text"
              placeholder="Ej: Jalisco"
              required
            />
          </div>

          <div class="form-group">
            <label for="country">País</label>
            <input
              id="country"
              v-model="addressDetails.country"
              type="text"
              placeholder="Ej: México"
              required
            />
          </div>
        </div>
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
import { ref, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  isEditing: {
    type: Boolean,
    default: false
  },
  propertyData: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['submit']);

const title = ref(props.propertyData.title || '');
const description = ref(props.propertyData.description || '');
const monthlyPrice = ref(props.propertyData.monthly_price || '');
const minStay = ref(props.propertyData.min_lease_term || '');
const maxStay = ref(props.propertyData.max_lease_term || '');
const propertyType = ref(props.propertyData.property_type || '');
const services = ref(props.propertyData.amenities || []);
const loading = ref(false);
const error = ref('');

const photo = ref(null);
const preview = ref(props.propertyData.main_image_url || null);
const defaultPropertyImg = 'https://placehold.co/600x400/e2e8f0/cccccc?text=Agregar+Foto';

const additionalImages = ref([]);
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const addressDetails = ref({
  street: props.propertyData.address?.street || '',
  neighborhood: props.propertyData.address?.neighborhood || '',
  postalCode: props.propertyData.address?.postalCode || '',
  city: props.propertyData.address?.city || '',
  state: props.propertyData.address?.state || '',
  country: props.propertyData.address?.country || ''
});

const validateFile = (file) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  console.log('File type:', file.type); // Para debugging
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error(`Tipo de archivo no permitido (${file.type}). Solo se permiten imágenes JPG, PNG y WEBP.`);
  }
  
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('El tamaño del archivo excede el límite de 5MB.');
  }
};

const handlePhotoChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    try {
      validateFile(file);
      photo.value = file;
      preview.value = URL.createObjectURL(file);
    } catch (err) {
      alert(err.message);
    }
  }
};

const handleAdditionalImageChange = (event) => {
  const file = event.target.files[0];
  if (file && additionalImages.value.length < 5) {
    try {
      validateFile(file);
      additionalImages.value.push({
        file,
        preview: URL.createObjectURL(file),
        category: 'general'
      });
    } catch (err) {
      alert(err.message);
    }
  }
};

const removeAdditionalImage = (index) => {
  URL.revokeObjectURL(additionalImages.value[index].preview);
  additionalImages.value.splice(index, 1);
};

const handleSubmit = () => {
  const formData = {
    title: title.value,
    description: description.value,
    address: addressDetails.value,
    monthly_price: monthlyPrice.value,
    min_lease_term: minStay.value,
    max_lease_term: maxStay.value,
    property_type: propertyType.value,
    amenities: services.value,
    photo: photo.value, // Should be a File object
    photos: additionalImages.value.map(img => ({
      file: img.file, // Should be a File object
      category: img.category
    }))
  };

  emit('submit', formData);
};

// Clean up object URLs when component is destroyed
onUnmounted(() => {
  if (preview.value && preview.value.startsWith('blob:')) {
    URL.revokeObjectURL(preview.value);
  }
  additionalImages.value.forEach(img => {
    URL.revokeObjectURL(img.preview);
  });
});
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

.main-image {
  width: 100%;
  margin-bottom: 2rem;
}

.additional-images {
  width: 100%;
}

.images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin: 1rem 0;
}

.image-item {
  position: relative;
  aspect-ratio: 4/3;
  border-radius: 8px;
  overflow: hidden;
}

.image-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 0.5rem;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.image-overlay select {
  padding: 0.25rem;
  border-radius: 4px;
  border: none;
}

.add-image-button {
  aspect-ratio: 4/3;
  border: 2px dashed #ddd;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-image-button:hover:not(.disabled) {
  border-color: #7fcdbb;
  color: #7fcdbb;
}

.add-image-button.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.image-info {
  font-size: 0.9rem;
  color: #666;
  margin-top: 0.5rem;
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

.address-section {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.address-section h3 {
  margin-bottom: 1.5rem;
  color: #333;
}

.address-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

@media (max-width: 768px) {
  .address-grid {
    grid-template-columns: 1fr;
  }
}
</style>