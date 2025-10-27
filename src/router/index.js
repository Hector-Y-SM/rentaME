import { createRouter, createWebHistory } from 'vue-router'
import PostDetail from '../views/posts/PostDetail.vue'
import NotFound from '../views/NotFound.vue'
import { supabase } from '@/lib/supabase'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/auth/Login.vue'),
  },
  {
    path: '/signup',
    name: 'SignUp',
    component: () => import('../views/auth/SignUp.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/reset-password',
    name:'resetPassword',
    component: () => import('../views/auth/ResetPassword.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('../views/auth/ForgotPassword.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    name: 'HomeView',
    component: () => import('../views/HomeView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/posts',
    name: 'Posts',
    component: () => import('../views/posts/PostList.vue'),
    meta: { requiresAuth: true }
  },
  {
    // Ruta dinámica con parámetro :id
    path: '/posts/:id',
    name: 'post-detail',
    component: PostDetail,
    // Guard: Requiere autenticación para ver detalles
    meta: { requiresAuth: true },
    // Pasar el id como prop al componente
    props: true
  },
  {
    // Ruta dinámica con parámetro :id
    path: '/add-property',
    name: 'add-property',
    component: () => import('../views/posts/AddProperty.vue'),
    // Guard: Requiere autenticación para ver detalles
    meta: { requiresAuth: true },
    // Pasar el id como prop al componente
    props: true
  },
  {
    // Ruta dinámica con parámetro :id
    path: '/my-properties',
    name: 'my-properties',
    component: () => import('../views/posts/MyProperties.vue'),
    // Guard: Requiere autenticación para ver detalles
    meta: { requiresAuth: true },
    // Pasar el id como prop al componente
    props: true
  },
  {
    // Ruta dinámica con parámetro :id
    path: '/edit-property/:id',
    name: 'edit-property',
    component: () => import('../views/posts/EditProperty.vue'),
    // Guard: Requiere autenticación para ver detalles
    meta: { requiresAuth: true },
    // Pasar el id como prop al componente
    props: true
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/user/Profile.vue'),
    meta: { requiresAuth: true },

    //ruta anidada
    children: [{
      path: 'settings',
      name: 'ProfileSettings',
      component: () => import('../views/user/ProfileSettings.vue'),
      meta: { requiresAuth: true },

    }]
  },
  {
    // Ruta catch-all para 404
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFound
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation Guard
router.beforeEach(async (to, from, next) => {
  const { data: { user } } = await supabase.auth.getUser()

  if (to.meta.requiresAuth && !user) {
    next('/login')
  } else if (to.path === '/login' && user) {
    next('/')
  } else {
    next()
  }
})

export default router