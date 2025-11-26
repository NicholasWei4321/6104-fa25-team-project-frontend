<script setup>
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { onMounted } from 'vue'
import { useAuthStore } from './stores/auth.js'

const router = useRouter()
const authStore = useAuthStore()

onMounted(() => {
  authStore.init()
})

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}
</script>

<template>
  <header>
    <div class="wrapper">
      <nav>
        <RouterLink to="/">Home</RouterLink>
        <template v-if="authStore.isAuthenticated">
          <RouterLink to="/profile">Profile</RouterLink>
          <RouterLink to="/playlists">Playlists</RouterLink>
          <a @click="handleLogout" class="logout-link">Logout ({{ authStore.username }})</a>
        </template>
        <RouterLink v-else to="/login">Login</RouterLink>
      </nav>
    </div>
  </header>

  <RouterView />
</template>

<style scoped>
header {
  line-height: 1.5;
  background-color: #f8f9fa;
  padding: 1rem;
  width: 100%;
  position: relative;
  z-index: 10; /* Ensure header is above content */
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
  text-decoration: none;
  color: #2c3e50;
  font-weight: bold;
  cursor: pointer;
}

nav a:first-of-type {
  border: 0;
}

nav a.router-link-exact-active {
  color: #42b983;
}

.logout-link {
  color: #e74c3c;
}

.logout-link:hover {
  color: #c0392b;
}
</style>
