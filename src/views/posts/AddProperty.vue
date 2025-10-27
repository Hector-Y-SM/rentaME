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

// Constantes para límites
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_IMAGES = 5;
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const validateFile = (file) => {
  console.log('Validating file:', file.type); // Debug log
  
  if (!file || !file.type) {
    throw new Error('Archivo inválido');
  }

  const fileType = file.type.toLowerCase();
  if (!ALLOWED_TYPES.includes(fileType)) {
    throw new Error(`Tipo de archivo no permitido (${fileType}). Solo se permiten imágenes JPG, PNG y WEBP.`);
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error('El tamaño del archivo excede el límite de 5MB.');
  }
};

const handleSubmit = async (formData) => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('inicia sesión antes de continuar.');
    }

    // Validar número de imágenes
    if (formData.photos?.length > MAX_IMAGES) {
      throw new Error(`No puedes subir más de ${MAX_IMAGES} imágenes.`);
    }

    let propertyImageUrl = defaultPropertyImg;
    let additionalImages = [];

    // Procesar la imagen principal
    if (formData.photo && formData.photo instanceof File) {
      validateFile(formData.photo);
      const mainImageUrl = await uploadImage(formData.photo, user.id);
      propertyImageUrl = mainImageUrl;
    }

    // Procesar imágenes adicionales
    if (formData.photos && formData.photos.length > 0) {
      for (const photo of formData.photos) {
        if (photo.file instanceof File) {
          validateFile(photo.file);
          const imageUrl = await uploadImage(photo.file, user.id);
          additionalImages.push({
            image_url: imageUrl,
            category: photo.category || 'general'
          });
        }
      }
    }

    // Insertar propiedad principal
    const { data: propertyData, error: propertyError } = await supabase
      .from('properties')
      .insert({
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
      })
      .select()
      .single();

    if (propertyError) throw propertyError;

    // Insertar imágenes adicionales
    if (additionalImages.length > 0) {
      const { error: imagesError } = await supabase
        .from('property_images')
        .insert(
          additionalImages.map(img => ({
            property_id: propertyData.property_id,
            image_url: img.image_url,
            category: img.category
          }))
        );

      if (imagesError) throw imagesError;
    }

    router.push('/posts');
  } catch (err) {
    console.error('Error completo:', err);
    alert(err.message);
  }
};

const uploadImage = async (file, userId) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `properties/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('properties')
    .upload(filePath, file, {
      upsert: true,
      contentType: file.type || 'image/jpeg',
    });

  if (uploadError) {
    throw new Error(`Error al subir imagen: ${uploadError.message}`);
  }

  const { data: publicUrlData } = await supabase.storage
    .from('properties')
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
};
</script>