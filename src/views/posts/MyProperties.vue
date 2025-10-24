<template>
  <div class="my-properties">
    <h1>Mis Propiedades</h1>
    
    <div class="properties-grid">
      <PropertyCard
        v-for="property in properties"
        :key="property.property_id"
        :property="property"
        :is-editable="true"
        @edit="handleEdit"
      />
    </div>
  </div>
</template>

<script setup>
import { supabase } from '@/lib/supabase';
import { ref, onMounted } from 'vue';
import PropertyCard from '@/components/PropertyCard.vue';

const properties = ref([]);

const handleEdit = (property) => {
  console.log('editando propiedad ', property);
};

onMounted(async () => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Inicia sesión antes de continuar.');
    }

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
.my-properties {
  padding: 2rem;
}

.properties-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}
</style>