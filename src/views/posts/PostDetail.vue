<template>
  <p>
    <router-link to="/posts">← volver</router-link>
  </p>
  <div class="post-detail" v-if="property">
    <div class="property-header">
      <div class="image-carousel">
        <img 
          :src="currentImage" 
          :alt="property.title" 
          class="property-image"
        >
        
        <button 
          class="carousel-button prev" 
          @click="prevImage"
          :disabled="currentIndex === 0"
        >
          &#10094;
        </button>
        <button 
          class="carousel-button next" 
          @click="nextImage"
          :disabled="currentIndex === allImages.length - 1"
        >
          &#10095;
        </button>

        <div class="image-counter">
          {{ currentIndex + 1 }} / {{ allImages.length }}
        </div>

        <div class="thumbnail-container">
          <div 
            v-for="(img, index) in allImages" 
            :key="index"
            :class="['thumbnail', { active: currentIndex === index }]"
            @click="setImage(index)"
          >
            <img :src="img" :alt="`Thumbnail ${index + 1}`">
          </div>
        </div>
      </div>
    </div>

    <span :class="['status-badge', property.status]">
      {{ formatStatus(property.status) }}
    </span>
    <div class="content-grid">
      <div class="property-info">
        <section class="info-section">
          <h2>Descripción</h2>
          <p>{{ property.description }}</p>
        </section>

        <section class="info-section">
          <h2>Ubicación</h2>
          <p><strong>Calle:</strong> {{ property.address.street }}</p>
          <p><strong>Colonia:</strong> {{ property.address.neighborhood }}</p>
          <p><strong>Ciudad:</strong> {{ property.address.city }}</p>
          <p><strong>Estado:</strong> {{ property.address.state }}</p>
          <p><strong>Código Postal:</strong> {{ property.address.postalCode }}</p>
          <p><strong>País:</strong> {{ property.address.country }}</p>
        </section>

        <section class="info-section">
          <h2>Detalles de la renta</h2>
          <p><strong>Precio mensual:</strong> ${{ property.monthly_price }}</p>
          <p><strong>Tiempo mínimo:</strong> {{ property.min_lease_term }} meses</p>
          <p><strong>Tiempo máximo:</strong> {{ property.max_lease_term }} meses</p>
          <p><strong>Tipo de propiedad:</strong> {{ formatPropertyType(property.property_type) }}</p>
        </section>

        <section class="info-section">
          <h2>Servicios incluidos</h2>
          <div class="amenities">
            <span v-for="amenity in parseAmenities(property.amenities)" 
                  :key="amenity" 
                  class="amenity-tag">
              {{ formatAmenity(amenity) }}
            </span>
          </div>
        </section>
      </div>

      <div class="contact-sidebar">
        <div class="contact-card">
          <h2>Información de contacto</h2>
          <div v-if="ownerInfo" class="owner-info">
            <div class="owner-header">
              <img :src="ownerInfo.profile_img_url" alt="Foto de perfil" class="owner-avatar">
              <div>
                <h3>{{ ownerInfo.first_name }} {{ ownerInfo.last_name }}</h3>
                <p>{{ ownerInfo.email }}</p>
              </div>
            </div>
            <button class="contact-button" @click="handleContact">
              Contactar al propietario
            </button>
          </div>
          <p v-else>Cargando información del propietario...</p>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="loading">
    <p>Cargando detalles de la propiedad...</p>
  </div>
</template>

<script setup>
  import { ref, onMounted, computed } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { supabase } from '@/lib/supabase'

  const route = useRoute()
  const router = useRouter()
  const property = ref(null)
  const ownerInfo = ref(null)
  const currentIndex = ref(0)
  const additionalImages = ref([])

  const formatPropertyType = (type) => {
    const types = {
      house: 'Casa',
      apartment: 'Departamento',
      room: 'Habitación',
      office: 'Oficina'
    }
    return types[type] || type
  }

  const formatStatus = (status) => {
    const statuses = {
      available: 'Disponible',
      rented: 'Rentada',
      unavailable: 'No disponible'
    }
    return statuses[status] || status
  }

  const formatAmenity = (amenity) => {
    const amenities = {
      wifi: 'WiFi',
      water: 'Agua',
      electricity: 'Luz',
      gas: 'Gas',
      furniture: 'Amueblado',
      parking: 'Estacionamiento'
    }
    return amenities[amenity] || amenity
  }

  const parseAmenities = (amenitiesString) => {
    try {
      return JSON.parse(amenitiesString)
    } catch {
      return []
    }
  }

  const handleContact = () => {
    if (ownerInfo.value?.email) {
      window.location.href = `mailto:${ownerInfo.value.email}?subject=Consulta sobre propiedad: ${property.value.title}`
    }
  }

  const allImages = computed(() => {
    return [property.value?.main_image_url, ...additionalImages.value.map(img => img.image_url)].filter(Boolean)
  })

  const currentImage = computed(() => {
    return allImages.value[currentIndex.value] || ''
  })

  const nextImage = () => {
    if (currentIndex.value < allImages.value.length - 1) {
      currentIndex.value++
    }
  }

  const prevImage = () => {
    if (currentIndex.value > 0) {
      currentIndex.value--
    }
  }

  const setImage = (index) => {
    currentIndex.value = index
  }

  onMounted(async () => {
    try {
      const { data: propertyData, error: propertyError } = await supabase
        .from('properties')
        .select('*')
        .eq('property_id', route.params.id)
        .single()

      if (propertyError) throw propertyError
      property.value = propertyData

      // Fetch additional images
      const { data: images, error: imagesError } = await supabase
        .from('property_images')
        .select('*')
        .eq('property_id', route.params.id)

      if (imagesError) throw imagesError
      additionalImages.value = images || []

      const { data: userData, error: userError } = await supabase
        .from('user_info')
        .select('*')
        .eq('user_uuid', propertyData.owner_uuid)
        .single()

      if (userError) throw userError

      ownerInfo.value = userData
    } catch (error) {
      console.error('Error:', error)
      router.push('/posts')
    }
  })
</script>

<style scoped>
.post-detail {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.property-header {
  margin-bottom: 2rem;
}

.property-image {
  width: 100%;
  height: 400px;
  object-fit: cover;
  border-radius: 12px;
  margin-bottom: 1rem;
}

.image-carousel {
  position: relative;
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
}

.carousel-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  padding: 1rem;
  cursor: pointer;
  font-size: 1.5rem;
  transition: all 0.2s ease;
  z-index: 2;
}

.carousel-button:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.7);
}

.carousel-button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.carousel-button.prev {
  left: 1rem;
}

.carousel-button.next {
  right: 1rem;
}

.image-counter {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
}

.thumbnail-container {
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 0.5rem;
  padding: 0.5rem;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 20px;
}

.thumbnail {
  width: 60px;
  height: 40px;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  opacity: 0.7;
  transition: all 0.2s ease;
}

.thumbnail.active {
  opacity: 1;
  border: 2px solid #7fcdbb;
}

.thumbnail:hover {
  opacity: 1;
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

.info-section {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.info-section h2 {
  margin-bottom: 1rem;
  color: #2c3e50;
}

.amenities {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.amenity-tag {
  background: #f0f9f7;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  color: #2c3e50;
}

.contact-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  position: sticky;
  top: 2rem;
}

.owner-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.owner-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
}

.contact-button {
  width: 100%;
  padding: 1rem;
  background-color: #7fcdbb;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.contact-button:hover {
  background-color: #6bb3a3;
}

.status-badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
  margin: 1rem 0rem;
}

.status-badge.available {
  background: #dcfce7;
  color: #166534;
}

.status-badge.rented {
  background: #fee2e2;
  color: #991b1b;
}

.status-badge.unavailable {
  background: #f3f4f6;
  color: #374151;
}

@media (max-width: 768px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .contact-card {
    position: static;
    margin-top: 1.5rem;
  }

  .carousel-button {
    padding: 0.5rem;
    font-size: 1rem;
  }

  .thumbnail {
    width: 40px;
    height: 30px;
  }
}
</style>