<template>
  <div class="property-card">
    <img :src="property.main_image_url" :alt="property.title" class="property-image">
    
    <div class="property-content">
      <h2>{{ property.title }}</h2>
      <p class="description">{{ property.description }}</p>
      
      <div class="property-details">
        <p><strong>Dirección:</strong> {{ property.address }}</p>
        <p><strong>Precio mensual:</strong> ${{ property.monthly_price }}</p>
        <p><strong>Tiempo de renta:</strong> {{ property.min_lease_term }} - {{ property.max_lease_term }} meses</p>
        <p><strong>Tipo:</strong> {{ formatPropertyType(property.property_type) }}</p>
        
        <div class="amenities">
          <strong>Servicios incluidos:</strong>
          <ul>
            <li v-for="amenity in parseAmenities(property.amenities)" :key="amenity">
              {{ formatAmenity(amenity) }}
            </li>
          </ul>
        </div>

        <span :class="['status-badge', property.status]">
          {{ formatStatus(property.status) }}
        </span>

        <button 
          v-if="isEditable" 
          @click="handleEdit"
          class="edit-button"
        >
          Editar propiedad
        </button>
        <button 
          v-if="isEditable" 
          @click="handleDelete"
          class="delete-button"
        >
          eliminar propiedad
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  property: {
    type: Object,
    required: true
  },
  isEditable: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['edit']);

const parseAmenities = (amenitiesString) => {
  try {
    return JSON.parse(amenitiesString);
  } catch {
    return [];
  }
};

const formatPropertyType = (type) => {
  const types = {
    house: 'Casa',
    apartment: 'Departamento',
    room: 'Habitación',
    office: 'Oficina'
  };
  return types[type] || type;
};

const formatAmenity = (amenity) => {
  const amenities = {
    wifi: 'WiFi',
    water: 'Agua',
    electricity: 'Luz',
    gas: 'Gas',
    furniture: 'Amueblado',
    parking: 'Estacionamiento'
  };
  return amenities[amenity] || amenity;
};

const formatStatus = (status) => {
  const statuses = {
    available: 'Disponible',
    rented: 'Rentada',
    unavailable: 'No disponible'
  };
  return statuses[status] || status;
};

const handleEdit = () => {
  emit('edit', props.property);
};
</script>

<style scoped>
.property-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.property-card:hover {
  transform: translateY(-4px);
}

.property-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.property-content {
  padding: 1.5rem;
}

.property-content h2 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
  font-size: 1.5rem;
}

.description {
  color: #666;
  margin-bottom: 1rem;
}

.property-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.property-details p {
  margin: 0;
}

.amenities {
  margin-top: 1rem;
}

.amenities ul {
  list-style: none;
  padding: 0;
  margin: 0.5rem 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.amenities li {
  background: #f0f9f7;
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.9rem;
  color: #2c3e50;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.9rem;
  font-weight: 500;
  margin-top: 1rem;
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

.edit-button {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background-color: #7fcdbb;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.edit-button:hover {
  background-color: #6bb3a3;
}

.delete-button {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background-color: #ec3232;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.delete-button:hover {
  background-color: #ee1313;
}
</style>