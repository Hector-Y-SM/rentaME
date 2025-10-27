<template>
  <div class="my-properties">
    <h1>Mis Propiedades</h1>
    
    <div class="properties-grid">
      <PropertyCard
        v-for="property in properties"
        :key="property.property_id"
        :property="property"
        :is-editable="true"
        :current-user-id="userId"
        @edit="handleEdit"
        @delete="handleDelete"
        @show-interested="showInterestedUsers"
        @vacate="handleVacate"
      />
    </div>

    <div v-if="showModal" class="modal">
      <div class="modal-content">
        <h3>Usuarios Interesados</h3>
        <div v-if="interestedUsersDetails.length" class="interested-users">
          <div v-for="user in interestedUsersDetails" :key="user.user_uuid" class="interested-user-item">
            <p>{{ user.first_name }} {{ user.last_name }}</p>
            <button 
              @click="assignTenant(selectedProperty, user.user_uuid)"
              class="assign-button"
              :disabled="loading"
            >
              {{ loading ? 'Asignando...' : 'Asignar propiedad' }}
            </button>
          </div>
        </div>
        <p v-else>No hay usuarios interesados aún</p>
        <button @click="showModal = false" class="close-button">Cerrar</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { supabase } from '@/lib/supabase';
import { ref, onMounted } from 'vue';
import PropertyCard from '@/components/PropertyCard.vue';
import { useRouter } from 'vue-router';

const properties = ref([]);
const router = useRouter()
const showModal = ref(false);
const interestedUsersDetails = ref([]);
const userId = ref('');
const selectedProperty = ref(null);
const loading = ref(false);

const handleEdit = (property) => {
  router.push(`/edit-property/${property.property_id}`)
  console.log('editando propiedad ', property);
};

const handleDelete = async (property) =>{
  try {
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('property_id', property.property_id); 

    if (error) throw error;

    //actualizar la lista de propiedades
    properties.value = properties.value.filter(p => p.property_id !== property.property_id);
    
  } catch (error) {
    console.error('error al eliminar:', error.message);
  }

}

const showInterestedUsers = async (property) => {
  try {
    selectedProperty.value = property; 
    const interestedIds = JSON.parse(property.interested_users || '[]');
    
    if (interestedIds.length) {
      const { data, error } = await supabase
        .from('user_info')
        .select('user_uuid, first_name, last_name')
        .in('user_uuid', interestedIds);

      if (error) throw error;
      interestedUsersDetails.value = data;
    }
    
    showModal.value = true;
  } catch (error) {
    console.error('error ', error);
  }
};

const assignTenant = async (property, tenantId) => {
  loading.value = true;
  try {
    
    const { error: updateError } = await supabase
      .from('properties')
      .update({
        tenant_id: tenantId,
        interested_users: '[]',
        status: 'rented'
      })
      .eq('property_id', property.property_id);

    if (updateError) throw updateError;


    const updatedProperty = properties.value.find(p => p.property_id === property.property_id);
    if (updatedProperty) {
      updatedProperty.tenant_id = tenantId;
      updatedProperty.interested_users = '[]';
      updatedProperty.status = 'rented';
    }

    showModal.value = false;
    alert('propiedad asignada exitosamente');

  } catch (error) {
    console.error('error con la propiedad:', error);
    alert('error al asignar la propiedad');
  } finally {
    loading.value = false;
  }
};

const handleVacate = async (property) => {
  try {
    const { error: updateError } = await supabase
      .from('properties')
      .update({
        tenant_id: null,
        status: 'available'
      })
      .eq('property_id', property.property_id);

    if (updateError) throw updateError;


    const updatedProperty = properties.value.find(p => p.property_id === property.property_id);
    if (updatedProperty) {
      updatedProperty.tenant_id = null;
      updatedProperty.status = 'available';
    }

    alert('propiedad marcada como desocupada exitosamente');

  } catch (error) {
    console.error('error al desocupar la propiedad:', error);
    alert('error al marcar la propiedad como desocupada');
  }
};

onMounted(async () => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Inicia sesión antes de continuar.');
    }
    
    userId.value = user.id;

    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('owner_uuid', user.id);

    if (error) throw error;
    properties.value = data;
    
  } catch (error) {
    console.error('Error:', error.message);
  }
});
</script>

<style scoped>
  @import '../../assets/styles/posts/myProperties.css';
</style>