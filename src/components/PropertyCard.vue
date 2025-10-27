<template>
  <div class="property-card">
    <!-- Agregar div clickeable alrededor de la imagen y contenido básico -->
    <div class="property-main" @click="navigateToDetail">
      <img :src="property.main_image_url" :alt="property.title" class="property-image">
      
      <div class="property-content">
        <h2>{{ property.title }}</h2>
        <p class="description">{{ property.description }}</p>
        
        <div class="property-details">
          <p><strong>Dirección:</strong> {{ property.address.state }} {{ property.address.city }}</p>
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
        </div>
      </div>
    </div>

    <div class="property-actions">
      <template v-if="isEditable">
        <button @click="handleEdit" class="edit-button">
          Editar propiedad
        </button>
        <button @click="handleDelete" class="delete-button">
          Eliminar propiedad
        </button>
        <button 
          v-if="interestedUsers.length > 0"
          @click="showInterested"
          class="interested-button"
        >
          Ver interesados ({{ interestedUsers.length }})
        </button>
        <button 
          v-if="property.status === 'rented'"
          @click="$emit('vacate', property)"
          class="vacate-button"
        >
          Marcar como desocupada
        </button>
      </template>
      <template v-else-if="!isEditable && !isOwner"> 
        <button 
          @click="handleInterest"
          :class="['interest-button', { 'interested': isInterested }]"
          :disabled="loading"
        >
          {{ isInterested ? 'Ya no me interesa' : 'Me interesa' }}
        </button>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'vue-router';

const router = useRouter();

const props = defineProps({
  property: {
    type: Object,
    required: true
  },
  isEditable: {
    type: Boolean,
    default: false
  },
  currentUserId: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['edit', 'delete', 'showInterested', 'vacate']);

const loading = ref(false);
const interestedUsers = computed(() => {
  try {
    return JSON.parse(props.property.interested_users || '[]');
  } catch {
    return [];
  }
});

const isOwner = computed(() => {
  return props.property.owner_uuid === props.currentUserId;
});

const isInterested = computed(() => {
  return interestedUsers.value.includes(props.currentUserId);
});

const handleInterest = async () => {
  loading.value = true;
  try {
    const currentUsers = interestedUsers.value;
    
    const newInterestedUsers = isInterested.value
      ? currentUsers.filter(id => id !== props.currentUserId)
      : [...currentUsers, props.currentUserId];

    const { error } = await supabase
      .from('properties')
      .update({
        interested_users: JSON.stringify(newInterestedUsers)
      })
      .eq('property_id', props.property.property_id)
      .select();

    if (error) throw error;

    props.property.interested_users = JSON.stringify(newInterestedUsers);
  } catch (error) {
    console.error('Error ', error);
  } finally {
    loading.value = false;
  }
};

const showInterested = () => {
  emit('showInterested', props.property);
};

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

const handleDelete = async () => {
    emit('delete', props.property)
};

const navigateToDetail = () => {
  router.push(`/posts/${props.property.property_id}`);
};
</script>

<style scoped>
  @import '../assets/styles/components/propertyCard.css';
</style>