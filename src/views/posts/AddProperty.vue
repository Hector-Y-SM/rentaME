<template>
  <PropertyForm 
    :is-editing="false"
    :property-data="{}"
    @submit="handleSubmit" 
  />
</template>

<script setup>
import { supabase } from '@/lib/supabase';
import { useRouter } from 'vue-router';
import PropertyForm from '@/components/PropertyForm.vue';

const router = useRouter();
const defaultPropertyImg = 'https://placehold.co/600x400/e2e8f0/cccccc?text=Sin+Imagen';

const handleSubmit = async (formData) => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('inicia sesión antes de continuar.');
    }

    let propertyImageUrl = formData.preview || defaultPropertyImg;

    if (formData.photo) {
      const fileExt = formData.photo.name.split('.').pop();
      const fileName = `${user.id}_${Date.now()}.${fileExt}`;
      const filePath = `properties/${fileName}`;
  
      const { data: uploadData, error: uploadError } = await supabase.storage
          .from('properties')
          .upload(filePath, formData.photo, {
              upsert: true,
              contentType: formData.photo.type || 'image/jpeg',
          });
  
      if (uploadError) {
          throw new Error(`error al subir imagen: ${uploadError.message}`);
      }

      const { data: publicUrlData } = await supabase.storage
          .from('properties')
          .getPublicUrl(filePath);
    
      propertyImageUrl = publicUrlData.publicUrl;
    }

    const propertyData = {
      owner_uuid: user.id,
      title: formData.title,
      description: formData.description,
      address: formData.address,
      monthly_price: formData.monthly_price,
      min_lease_term: formData.min_lease_term,
      max_lease_term: formData.max_lease_term,
      property_type: formData.property_type,
      amenities: formData.amenities,
      main_image_url: propertyImageUrl,
      status: 'available'
    };

    const { error: propertyError } = await supabase
      .from('properties')
      .insert(propertyData);

    if (propertyError) throw propertyError;

    router.push('/posts');
  } catch (err) {
    console.error('Error:', err.message);
  }
};
</script>