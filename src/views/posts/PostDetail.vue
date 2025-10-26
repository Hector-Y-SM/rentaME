<template>
  <div class="post-detail" v-if="property">
    <div class="property-header">
      <img :src="property.main_image_url" :alt="property.title" class="property-image">
      <div class="property-title">
        <h1>{{ property.title }}</h1>
        <span :class="['status-badge', property.status]">
          {{ formatStatus(property.status) }}
        </span>
      </div>
    </div>

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
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'

const route = useRoute()
const router = useRouter()
const property = ref(null)
const ownerInfo = ref(null)

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

const handleContact = async () => {
  if (ownerInfo.value?.email) {
    window.location.href = `mailto:${ownerInfo.value.email}?subject=Consulta sobre propiedad: ${property.value.title}`
  }
}

onMounted(async () => {
  try {
    // Fetch property details
    const { data: propertyData, error: propertyError } = await supabase
      .from('properties')
      .select('*')
      .eq('property_id', route.params.id)
      .single()

    if (propertyError) throw propertyError

    property.value = propertyData

    // Fetch owner information
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

.property-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
}
</style>