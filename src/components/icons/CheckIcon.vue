<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    :width="width"
    :height="height"
    fill="none"
    :stroke="color"
    stroke-width="3"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="M20 6L9 17l-5-5" />
  </svg>
</template>

<script setup>
defineProps({
  width: {
    type: [Number, String],
    default: 60
  },
  height: {
    type: [Number, String],
    default: 60
  },
  color: {
    type: String,
    default: '#10b981'
  }
})
</script>