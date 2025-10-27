<template>
  <PropertyForm 
    v-if="property"
    :is-editing="true"
    :property-data="property"
    @submit="handleSubmit"
  />
  <div v-else>Cargando...</div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { supabase } from '@/lib/supabase';
import PropertyForm from '@/components/PropertyForm.vue';

const router = useRouter();
const route = useRoute();
const property = ref(null);

const handleSubmit = async (formData) => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Inicia sesión antes de continuar.');
    }

    let propertyImageUrl = formData.preview || property.value.main_image_url;

    // actualizar la imagen si es q se cambio
    if (formData.photo) {
      const fileExt = formData.photo.name.split('.').pop();
      const fileName = `${user.id}_${Date.now()}.${fileExt}`;
      const filePath = `properties/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('properties')
        .upload(filePath, formData.photo, {
          upsert: true,
          contentType: formData.photo.type || 'image/jpeg',
        });

      if (uploadError) {
        throw new Error(`Error al subir imagen: ${uploadError.message}`);
      }

      const { data: publicUrlData } = await supabase.storage
        .from('properties')
        .getPublicUrl(filePath);

      propertyImageUrl = publicUrlData.publicUrl;
    }

    const propertyData = {
      title: formData.title,
      description: formData.description,
      address: formData.address,
      monthly_price: formData.monthly_price,
      min_lease_term: formData.min_lease_term,
      max_lease_term: formData.max_lease_term,
      property_type: formData.property_type,
      amenities: formData.amenities,
      main_image_url: propertyImageUrl
    };

    const { error: updateError } = await supabase
      .from('properties')
      .update(propertyData)
      .eq('property_id', route.params.id);

    if (updateError) {
      throw updateError;
    }

    router.push('/my-properties');
  } catch (err) {
    console.error('Error al actualizar:', err.message);
  }
};

onMounted(async () => {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('property_id', route.params.id)
    .single();

  if (error) {
    router.push('/posts');
    return;
  }

  property.value = data;
});
</script>