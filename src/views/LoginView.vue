<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth.js';

const router = useRouter();
const authStore = useAuthStore();

const username = ref('');
const password = ref('');
const isRegistering = ref(false);

// Redirect if already logged in
onMounted(() => {
  authStore.init();
  if (authStore.isAuthenticated) {
    router.push('/');
  }
});

async function handleSubmit() {
  if (!username.value.trim() || !password.value.trim()) {
    alert('Please enter username and password');
    return;
  }

  if (isRegistering.value) {
    const result = await authStore.register(username.value, password.value);
    if (result.error) {
      alert(result.error);
    } else {
      // Registration successful and auto-logged in
      router.push('/');
    }
  } else {
    const result = await authStore.login(username.value, password.value);
    if (result.error) {
      alert(result.error);
    } else {
      // Login successful
      router.push('/');
    }
  }
}

function toggleMode() {
  isRegistering.value = !isRegistering.value;
  authStore.clearError();
}
</script>

<template>
  <div class="login-container">
    <div class="login-card">
      <h1>{{ isRegistering ? 'Register' : 'Login' }}</h1>

      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="username">Username</label>
          <input
            id="username"
            v-model="username"
            type="text"
            placeholder="Enter your username"
            autocomplete="username"
            required
          />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="Enter your password"
            autocomplete="current-password"
            required
          />
        </div>

        <button type="submit" class="btn-submit" :disabled="authStore.loading">
          <span v-if="!authStore.loading">{{ isRegistering ? 'Register' : 'Login' }}</span>
          <span v-else>{{ isRegistering ? 'Registering...' : 'Logging in...' }}</span>
        </button>
      </form>

      <div class="toggle-mode">
        <a @click="toggleMode" class="toggle-link">
          {{ isRegistering ? 'Login instead' : 'Create account' }}
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 60px);
  background: #f5f5f5;
  padding: 2rem;
}

.login-card {
  background: white;
  border-radius: 8px;
  padding: 2.5rem;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.login-card h1 {
  margin: 0 0 1.5rem 0;
  color: #333;
  font-size: 1.75rem;
  font-weight: 600;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #555;
  font-weight: 500;
  font-size: 0.9rem;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #333;
}

.btn-submit {
  width: 100%;
  padding: 0.875rem;
  background: #333;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  margin-top: 0.5rem;
}

.btn-submit:hover:not(:disabled) {
  background: #555;
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.toggle-mode {
  margin-top: 1.5rem;
  text-align: center;
}

.toggle-link {
  color: #333;
  font-size: 0.95rem;
  cursor: pointer;
  text-decoration: none;
}

.toggle-link:hover {
  text-decoration: underline;
}
</style>
