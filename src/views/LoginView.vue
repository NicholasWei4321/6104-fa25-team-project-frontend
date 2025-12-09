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
    router.push('/home');
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
      router.push('/home');
    }
  } else {
    const result = await authStore.login(username.value, password.value);
    if (result.error) {
      alert(result.error);
    } else {
      // Login successful
      router.push('/home');
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
    <!-- Animated background -->
    <div class="animated-bg">
      <div class="gradient-orb orb-1"></div>
      <div class="gradient-orb orb-2"></div>
      <div class="gradient-orb orb-3"></div>
    </div>

    <!-- Floating musical notes -->
    <div class="music-notes">
      <span class="note" v-for="i in 20" :key="i" :style="{'--delay': i * 0.5 + 's'}">♪</span>
    </div>

    <div class="login-card">
      <!-- Branding header -->
      <div class="brand-header">
        <div class="logo-wrapper">
          <div class="logo-icon">🌍</div>
          <div class="music-wave">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
        <h1 class="app-title">SongBridge</h1>
        <p class="tagline">Connect Cultures Through Music</p>
      </div>

      <div class="card-content">
        <h2 class="form-title">{{ isRegistering ? 'Create Account' : 'Welcome Back' }}</h2>

        <form @submit.prevent="handleSubmit" class="login-form">
          <div class="form-group">
            <label for="username">
              Username
            </label>
            <div class="input-wrapper">
              <input
                id="username"
                v-model="username"
                type="text"
                placeholder="Enter your username"
                autocomplete="username"
                required
                class="input-field"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="password">
              Password
            </label>
            <div class="input-wrapper">
              <input
                id="password"
                v-model="password"
                type="password"
                placeholder="Enter your password"
                autocomplete="current-password"
                required
                class="input-field"
              />
            </div>
          </div>

          <button type="submit" class="btn-submit" :disabled="authStore.loading">
            <span v-if="!authStore.loading" class="btn-content">
              <span class="btn-icon">{{ isRegistering ? '🎵' : '🎧' }}</span>
              {{ isRegistering ? 'Create Account' : 'Sign In' }}
            </span>
            <span v-else class="btn-content loading">
              <span class="spinner"></span>
              {{ isRegistering ? 'Creating...' : 'Signing in...' }}
            </span>
          </button>
        </form>

        <div class="divider">
          <span>or</span>
        </div>

        <div class="toggle-mode">
          <p class="toggle-text">
            {{ isRegistering ? 'Already have an account?' : "Don't have an account?" }}
            <a @click="toggleMode" class="toggle-link">
              {{ isRegistering ? 'Sign In' : 'Sign Up' }}
            </a>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

/* Animated background */
.animated-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 0;
}

.gradient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.5;
  animation: float 20s infinite ease-in-out;
}

.orb-1 {
  width: 400px;
  height: 400px;
  background: linear-gradient(45deg, #f093fb 0%, #f5576c 100%);
  top: -100px;
  left: -100px;
  animation-delay: 0s;
}

.orb-2 {
  width: 350px;
  height: 350px;
  background: linear-gradient(45deg, #4facfe 0%, #00f2fe 100%);
  bottom: -100px;
  right: -100px;
  animation-delay: -7s;
}

.orb-3 {
  width: 300px;
  height: 300px;
  background: linear-gradient(45deg, #43e97b 0%, #38f9d7 100%);
  top: 50%;
  left: 50%;
  animation-delay: -14s;
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(50px, -50px) scale(1.1);
  }
  66% {
    transform: translate(-50px, 50px) scale(0.9);
  }
}

/* Floating musical notes */
.music-notes {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.note {
  position: absolute;
  font-size: 2rem;
  color: rgba(255, 255, 255, 0.6);
  animation: floatNote 15s infinite linear;
  animation-delay: var(--delay);
}

.note:nth-child(1) { left: 10%; bottom: 15%; }
.note:nth-child(2) { left: 20%; animation-duration: 12s; bottom: 45%; }
.note:nth-child(3) { left: 30%; animation-duration: 18s; bottom: 30%; }
.note:nth-child(4) { left: 50%; animation-duration: 14s; bottom: 60%; }
.note:nth-child(5) { left: 60%; animation-duration: 16s; bottom: 20%; }
.note:nth-child(6) { left: 70%; animation-duration: 13s; bottom: 55%; }
.note:nth-child(7) { left: 80%; animation-duration: 17s; bottom: 10%; }
.note:nth-child(8) { left: 90%; animation-duration: 15s; bottom: 40%; }
.note:nth-child(9) { left: 5%; animation-duration: 19s; bottom: 35%; }
.note:nth-child(10) { left: 15%; animation-duration: 11s; bottom: 50%; }
.note:nth-child(11) { left: 25%; animation-duration: 16s; bottom: 25%; }
.note:nth-child(12) { left: 35%; animation-duration: 14s; bottom: 70%; }
.note:nth-child(13) { left: 45%; animation-duration: 13s; bottom: 5%; }
.note:nth-child(14) { left: 55%; animation-duration: 17s; bottom: 65%; }
.note:nth-child(15) { left: 65%; animation-duration: 12s; bottom: 38%; }
.note:nth-child(16) { left: 75%; animation-duration: 18s; bottom: 48%; }
.note:nth-child(17) { left: 85%; animation-duration: 15s; bottom: 22%; }
.note:nth-child(18) { left: 95%; animation-duration: 14s; bottom: 58%; }
.note:nth-child(19) { left: 12%; animation-duration: 16s; bottom: 42%; }
.note:nth-child(20) { left: 88%; animation-duration: 13s; bottom: 28%; }

@keyframes floatNote {
  0% {
    bottom: -10%;
    opacity: 0;
    transform: translateX(0) rotate(0deg);
  }
  10% {
    opacity: 0.6;
  }
  90% {
    opacity: 0.6;
  }
  100% {
    bottom: 110%;
    opacity: 0;
    transform: translateX(100px) rotate(360deg);
  }
}

/* Login card */
.login-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 0;
  max-width: 440px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  position: relative;
  z-index: 2;
  overflow: hidden;
  animation: slideIn 0.5s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Brand header */
.brand-header {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  padding: 2.5rem 2rem;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.brand-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%);
  animation: shine 3s infinite;
}

@keyframes shine {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.logo-wrapper {
  position: relative;
  display: inline-block;
  margin-bottom: 1rem;
}

.logo-icon {
  font-size: 4rem;
  animation: rotate 10s linear infinite;
  display: inline-block;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.music-wave {
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 4px;
}

.music-wave span {
  width: 3px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 3px;
  animation: wave 1s infinite ease-in-out;
}

.music-wave span:nth-child(1) { height: 8px; animation-delay: 0s; }
.music-wave span:nth-child(2) { height: 12px; animation-delay: 0.1s; }
.music-wave span:nth-child(3) { height: 16px; animation-delay: 0.2s; }
.music-wave span:nth-child(4) { height: 12px; animation-delay: 0.3s; }

@keyframes wave {
  0%, 100% {
    transform: scaleY(1);
  }
  50% {
    transform: scaleY(1.5);
  }
}

.app-title {
  margin: 0;
  color: white;
  font-size: 2.5rem;
  font-weight: 700;
  letter-spacing: -0.5px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  position: relative;
}

.tagline {
  margin: 0.5rem 0 0;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.95rem;
  font-weight: 300;
  letter-spacing: 0.5px;
}

/* Card content */
.card-content {
  padding: 2.5rem;
}

.form-title {
  margin: 0 0 2rem 0;
  color: #333;
  font-size: 1.5rem;
  font-weight: 600;
  text-align: center;
}

.login-form {
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.75rem;
  color: #444;
  font-weight: 600;
  font-size: 0.9rem;
}

.input-wrapper {
  position: relative;
}

.input-field {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: white;
  box-sizing: border-box;
}

.input-field:focus {
  outline: none;
  border-color: #4facfe;
  box-shadow: 0 0 0 4px rgba(79, 172, 254, 0.1);
  transform: translateY(-2px);
}

.input-field::placeholder {
  color: #aaa;
}

.btn-submit {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.05rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 0.5rem;
  position: relative;
  overflow: hidden;
}

.btn-submit::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s;
}

.btn-submit:hover:not(:disabled)::before {
  left: 100%;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(79, 172, 254, 0.4);
}

.btn-submit:active:not(:disabled) {
  transform: translateY(0);
}

.btn-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-icon {
  font-size: 1.2rem;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.divider {
  position: relative;
  text-align: center;
  margin: 1.5rem 0;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(to right, transparent, #e0e0e0, transparent);
}

.divider span {
  background: white;
  padding: 0 1rem;
  color: #999;
  font-size: 0.85rem;
  position: relative;
  z-index: 1;
}

.toggle-mode {
  text-align: center;
}

.toggle-text {
  margin: 0;
  color: #666;
  font-size: 0.95rem;
}

.toggle-link {
  color: #4facfe;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  margin-left: 0.3rem;
  transition: all 0.2s ease;
}

.toggle-link:hover {
  color: #00f2fe;
  text-decoration: underline;
}
</style>
