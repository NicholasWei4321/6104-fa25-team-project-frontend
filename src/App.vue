<script setup>
import { RouterView } from "vue-router";
import { onMounted } from "vue";
import { useAuthStore } from "./stores/auth.js";

const authStore = useAuthStore();

onMounted(() => {
  authStore.init();
});
</script>

<template>
  <RouterView />
</template>

<style scoped>
/* Styles removed - navigation now handled by FABs in individual views */
</style>
