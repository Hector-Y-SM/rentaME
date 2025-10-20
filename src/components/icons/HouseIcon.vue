<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 64 64"
    :width="width"
    :height="height"
    fill="none"
    :stroke="color"
    stroke-width="3"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <circle cx="32" cy="32" r="30" :stroke="color" fill="rgba(255,255,255,0.1)" />
    <path d="M16 30 L32 16 L48 30" />
    <path d="M20 30 V46 H44 V30" />
    <path d="M28 46 V36 H36 V46" />
  </svg>
</template>

<script setup>
defineProps({
  width: {
    type: [Number, String],
    default: 150
  },
  height: {
    type: [Number, String],
    default: 150
  },
  color: {
    type: String,
    default: '#ffffff'
  }
})
</script>