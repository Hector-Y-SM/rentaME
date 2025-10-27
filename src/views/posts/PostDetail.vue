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
  @import '../../assets/styles/posts/postDetail.css'
</style>