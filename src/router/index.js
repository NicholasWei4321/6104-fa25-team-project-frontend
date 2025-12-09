import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import { useAuthStore } from "../stores/auth.js";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "login",
      component: () => import("../views/LoginView.vue"),
    },
    {
      path: "/home",
      name: "home",
      component: HomeView,
      meta: { requiresAuth: true },
    },
    {
      path: "/profile",
      name: "profile",
      component: () => import("../views/ProfileView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/playlists",
      name: "playlists",
      component: () => import("../views/PlaylistView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/recommendations/:country",
      name: "recommendations",
      component: () => import("../views/RecommendationsView.vue"),
      meta: { requiresAuth: true },
    },
  ],
});

// Navigation guard to check authentication
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  authStore.init(); // Initialize from localStorage

  // If user is authenticated and trying to access login, redirect to home
  if (to.name === 'login' && authStore.isAuthenticated) {
    next("/home");
  } else if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    // Redirect to login if route requires auth and user is not authenticated
    next("/");
  } else {
    next();
  }
});

export default router;
