<template>
  <UserData
    v-if="!loading && firstLogin"
    :id-user="prop"
  />
  <div v-else>
    <h1>Bienveido </h1>
    <router-link to="/add-property">agregar un nuevo inmueble</router-link>
  
    <div class="properties-grid">
      <PropertyCard
        v-for="property in properties"
        :key="property.property_id"
        :property="property"
        :is-editable="false"
        :current-user-id="userId"
      />
    </div>
  </div>


  <!--<div class="post-list">
    <h2>Lista de Posts</h2>
    <div class="filters">
      <input 
        v-model="filters.search" 
        @input="updateQueryParams"
        placeholder="Buscar..."
      >
      <select 
        v-model="filters.category" 
        @change="updateQueryParams"
      >
        <option value="">Todas las categorías</option>
        <option value="vue">Vue</option>
        <option value="router">Router</option>
      </select>
      <select 
        v-model="filters.author" 
        @change="updateQueryParams"
      >
        <option value="">Todos los autores</option>
        <option value="juan">Juan</option>
        <option value="maria">María</option>
        <option value="pedro">Pedro</option>
      </select>
    </div>

    <div v-for="post in filteredPosts" :key="post.id" class="post-card">
      <h3>{{ post.title }}</h3>
      <p>{{ post.excerpt }}</p>
      <div class="post-meta">
        <span>{{ post.author }}</span>
        <span>{{ post.category }}</span>
      </div>
      <router-link :to="{ name: 'post-detail', params: { id: post.id } }">
        Leer más
      </router-link>
    </div>
    <button @click="()=> router.push('/')">Inicio</button>
  </div>-->
</template>

<script setup>
  import { supabase } from '@/lib/supabase' 
  import { ref, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import UserData from '@/components/UserData.vue'
  import PropertyCard from '@/components/PropertyCard.vue'

  const properties = ref([]);
  const router = useRouter();
  const loading = ref(true);
  const firstLogin = ref(false);
  const prop = ref('');
  const userId = ref('');

  onMounted(async () => {
    try{
    const {data, error: sesionError} = await supabase.auth.getSession();

    if(sesionError || !data.session){
      router.push('/login');
      return
    }

    userId.value = data.session.user.id;

    const {data: userID, error} = await supabase
      .from('user_info')
      .select('is_initialized')
      .eq('user_uuid', data.session.user.id) 
      .single();

    if (error) {
      console.error('Error fetching user info:', error);
      router.push('/login');
      return;
    }

    if(!userID?.is_initialized){
      firstLogin.value = true;
      prop.value = data.session.user.id;
    } else {
      firstLogin.value = false;
    }

    const {data: postList, error: errorData} = await supabase
      .from('properties')
      .select('*')
  

    if(errorData) throw errorData;
    properties.value = postList;
  } catch (error) {
    console.error('error:', error);
    router.push('/login');
  } finally {
    loading.value = false;
  }
  })

  /*
const posts = ref([
  { 
    id: 1, 
    title: 'Introducción a Vue 3', 
    excerpt: 'Aprende los básicos...', 
    author: 'juan',
    category: 'vue',
  },
  { 
    id: 2, 
    title: 'Composition API', 
    excerpt: 'Nueva forma de escribir...', 
    author: 'maria',
    category: 'vue',
  },
  { 
    id: 3, 
    title: 'Vue Router 4', 
    excerpt: 'Navegación en Vue...', 
    author: 'pedro',
    category: 'router',
  },
])

const filters = ref({
  category: '',
  author: '',
  search: '',
  sort: 'reciente'
})

// Posts filtrados
const filteredPosts = computed(() => {
  let result = posts.value

  if (filters.value.category) {
    result = result.filter(post => 
      post.category === filters.value.category
    )
  }

  if (filters.value.author) {
    result = result.filter(post => 
      post.author === filters.value.author
    )
  }

  if (filters.value.search) {
    const searchLower = filters.value.search.toLowerCase()
    result = result.filter(post => 
      post.title.toLowerCase().includes(searchLower) ||
      post.excerpt.toLowerCase().includes(searchLower)
    )
  }

  return result
})

// leer query params al cargar
const readQueryParams = () => {
  filters.value.category = route.query.category || ''
  filters.value.author = route.query.author || ''
  filters.value.search = route.query.search || ''
  filters.value.sort = route.query.sort || 'reciente'
}

// actualizar URL cuando cambian los filtros
const updateQueryParams = () => {
  const query = {}
  
  if (filters.value.category) query.category = filters.value.category
  if (filters.value.author) query.author = filters.value.author
  if (filters.value.search) query.search = filters.value.search
  if (filters.value.sort && filters.value.sort !== 'reciente') query.sort = filters.value.sort

  router.push({ name: 'Posts', query })
}

// watch para detectar cambios en la URL
watch(() => route.query, () => {
  readQueryParams()
}, { deep: true })

onMounted(() => {
  readQueryParams()
})*/
</script>

<style scoped>
  @import '../../assets/styles/posts/postList.css'
</style>