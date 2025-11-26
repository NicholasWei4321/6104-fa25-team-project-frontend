<script setup>
import Globe from '../components/Globe.vue';
</script>

<template>
  <div class="profile">
    <Globe />
    <div class="passport-menu">
      <h1>Passport</h1>
      <p>To be hooked up to the API</p>
    </div>
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
  z-index: 1;
}

.passport-menu {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(12px);
  padding: 3rem 5rem;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  color: white;
  text-align: center;
  min-width: 300px;
}

.passport-menu h1 {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-size: 2.5rem;
  font-weight: 600;
  margin: 0;
  color: #38bdf8;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
</style>
