<script setup>
import { ref } from "vue";
import Globe from "../components/Globe.vue";
import RecommendationsView from "./RecommendationsView.vue";

const showRecommendations = ref(false);
const selectedCountry = ref("Taiwan");
const globeRef = ref(null);

function closeRecommendations() {
  showRecommendations.value = false;

  // Reset globe view and resume rotation
  if (globeRef.value) {
    globeRef.value.resetView();
  }
}

function onCountrySelected(country) {
  console.log("[Card Click] Country selected on globe:", country);
  selectedCountry.value = country || "Taiwan";
  showRecommendations.value = true;

  // Hide the tooltip when recommendations open
  if (globeRef.value) {
    globeRef.value.hideTooltip();
  }
}

function selectRandomCountry() {
  if (globeRef.value) {
    globeRef.value.selectRandomCountry();
  }
}
</script>

<template>
  <main>
    <!-- Floating music notes -->
    <div class="floating-note note-1">♪</div>
    <div class="floating-note note-2">♫</div>
    <div class="floating-note note-3">♪</div>
    <div class="floating-note note-4">♫</div>
    <div class="floating-note note-5">♪</div>
    <div class="floating-note note-6">♫</div>
    <div class="floating-note note-7">♪</div>
    <div class="floating-note note-8">♫</div>
    <div class="floating-note note-9">♪</div>
    <div class="floating-note note-10">♫</div>

    <Globe ref="globeRef" @select-country="onCountrySelected" />

    <!-- Thinking bubble -->
    <div class="thinking-bubble">
      <div class="bubble-main">
        <p class="bubble-text">
          Click on any country to explore its unique music!
        </p>
      </div>
      <div class="bubble-small bubble-small-1"></div>
      <div class="bubble-small bubble-small-2"></div>
    </div>

    <button class="random-country-btn" @click="selectRandomCountry">
      Random Country
    </button>

    <Transition name="modal-fade">
      <RecommendationsView
        v-if="showRecommendations"
        :country="selectedCountry"
        @close="closeRecommendations"
      />
    </Transition>
  </main>
</template>

<style scoped>
main {
  width: 100%;
  height: calc(100vh - 50px);
  overflow: hidden;
  position: relative;
}

/* Floating music notes */
.floating-note {
  position: absolute;
  font-size: 2rem;
  color: rgba(79, 172, 254, 0.3);
  z-index: 1;
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(5deg);
  }
}

.note-1 {
  top: 15%;
  left: 10%;
  animation-delay: 0s;
}

.note-2 {
  top: 25%;
  right: 15%;
  animation-delay: 1.5s;
}

.note-3 {
  bottom: 20%;
  left: 15%;
  animation-delay: 3s;
}

.note-4 {
  bottom: 30%;
  right: 10%;
  animation-delay: 4.5s;
}

.note-5 {
  top: 40%;
  left: 5%;
  animation-delay: 2s;
  font-size: 1.5rem;
}

.note-6 {
  top: 60%;
  right: 8%;
  animation-delay: 3.5s;
  font-size: 1.8rem;
}

.note-7 {
  top: 10%;
  left: 25%;
  animation-delay: 1s;
  font-size: 1.6rem;
}

.note-8 {
  bottom: 15%;
  right: 25%;
  animation-delay: 5s;
  font-size: 1.7rem;
}

.note-9 {
  top: 35%;
  right: 30%;
  animation-delay: 2.5s;
  font-size: 1.4rem;
}

.note-10 {
  bottom: 25%;
  left: 8%;
  animation-delay: 4s;
  font-size: 1.9rem;
}

/* Modal fade animation */
.modal-fade-enter-active {
  animation: modalFadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-fade-leave-active {
  animation: modalFadeOut 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes modalFadeOut {
  from {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
  to {
    opacity: 0;
    transform: scale(0.95) translateY(-10px);
  }
}

/* Thinking bubble */
.thinking-bubble {
  position: absolute;
  top: 120px;
  right: 30px;
  z-index: 101;
  animation: fadeInFloat 0.8s ease-out;
}

@keyframes fadeInFloat {
  0% {
    opacity: 0;
    transform: translateY(-15px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.bubble-main {
  background: rgba(15, 15, 35, 0.9);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 2px solid rgba(79, 172, 254, 0.5);
  border-radius: 25px;
  padding: 18px 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4),
              0 0 25px rgba(79, 172, 254, 0.2);
  max-width: 260px;
  position: relative;
}

.bubble-text {
  margin: 0;
  color: #ffffff;
  font-size: 0.95rem;
  line-height: 1.5;
  text-align: center;
  font-weight: 500;
}

.bubble-small {
  position: absolute;
  background: rgba(15, 15, 35, 0.9);
  border: 2px solid rgba(79, 172, 254, 0.5);
  border-radius: 50%;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.bubble-small-1 {
  width: 18px;
  height: 18px;
  bottom: -28px;
  right: 25px;
}

.bubble-small-2 {
  width: 12px;
  height: 12px;
  bottom: -42px;
  right: 15px;
}

.random-country-btn {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(15, 15, 35, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  color: white;
  border: 2px solid rgba(79, 172, 254, 0.5);
  padding: 14px 32px;
  border-radius: 50px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3),
              0 0 30px rgba(79, 172, 254, 0.2);
  z-index: 100;
  letter-spacing: 1px;
  text-transform: uppercase;
  overflow: hidden;
}

.random-country-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(79, 172, 254, 0.3), transparent);
  transition: left 0.6s;
}

.random-country-btn:hover::before {
  left: 100%;
}

.random-country-btn:hover {
  transform: translateX(-50%) translateY(-3px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4),
              0 0 40px rgba(79, 172, 254, 0.4);
  border-color: rgba(79, 172, 254, 0.8);
  background: rgba(15, 15, 35, 0.95);
}

.random-country-btn:active {
  transform: translateX(-50%) translateY(-1px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3),
              0 0 30px rgba(79, 172, 254, 0.2);
}
</style>
