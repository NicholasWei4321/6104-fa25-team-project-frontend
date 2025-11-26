<script setup>
import Globe from '../components/Globe.vue';
</script>

<template>
  <div class="profile">
    <Globe />
  </div>
</template>

<style scoped>
.profile {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  margin: 0;
  padding: 0;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1; /* Ensure it sits behind the navbar if needed, or just at base level */
}
</style>
