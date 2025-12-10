<script setup>
import { RouterLink, RouterView, useRouter, useRoute } from "vue-router";
import { onMounted, computed } from "vue";
import { useAuthStore } from "./stores/auth.js";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const showNav = computed(() => route.name !== 'login');

onMounted(() => {
  authStore.init();
});

async function handleLogout() {
  await authStore.logout();
  router.push("/");
}
</script>

<template>
  <header v-if="showNav">
    <div class="wrapper">
      <nav>
        <RouterLink to="/home">Home</RouterLink>
        <template v-if="authStore.isAuthenticated">
          <RouterLink to="/profile">Passport</RouterLink>
          <RouterLink to="/playlists">Playlists</RouterLink>
          <a @click="handleLogout" class="logout-link"
            >Logout ({{ authStore.username }})</a
          >
        </template>
      </nav>
    </div>
  </header>

  <RouterView v-slot="{ Component }">
    <Transition name="fade" mode="out-in">
      <component :is="Component" />
    </Transition>
  </RouterView>
</template>

<style scoped>
/* Page transition animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

header {
  line-height: 1.5;
  background: rgba(15, 15, 35, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  padding: 0.75rem 2rem;
  width: 100%;
  position: sticky;
  top: 0;
  z-index: 1000;
  border-bottom: 1px solid rgba(79, 172, 254, 0.2);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);
}

nav {
  width: 100%;
  font-size: 15px;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
}

nav a {
  display: inline-block;
  padding: 0.6rem 1.5rem;
  text-decoration: none;
  color: #e4e4e7;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 10px;
  position: relative;
}

nav a:hover {
  color: #4facfe;
  background: rgba(79, 172, 254, 0.1);
}

nav a.router-link-exact-active {
  color: #4facfe;
  background: rgba(79, 172, 254, 0.15);
  box-shadow: 0 0 20px rgba(79, 172, 254, 0.2);
}

.logout-link {
  color: #f0abfc;
  margin-left: 0.5rem;
}

.logout-link:hover {
  color: #e879f9;
  background: rgba(240, 171, 252, 0.1);
}
</style>
