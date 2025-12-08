<script setup>
import { ref } from "vue";
import Globe from "../components/Globe.vue";
import RecommendationsView from "./RecommendationsView.vue";

const showRecommendations = ref(false);
const selectedCountry = ref("Taiwan");
const globeRef = ref(null);

function closeRecommendations() {
  showRecommendations.value = false;
}

function onCountrySelected(country) {
  console.log("[Card Click] Country selected on globe:", country);
  selectedCountry.value = country || "Taiwan";
  showRecommendations.value = true;
}

function selectRandomCountry() {
  if (globeRef.value) {
    globeRef.value.selectRandomCountry();
  }
}
</script>

<template>
  <main>
    <Globe ref="globeRef" @select-country="onCountrySelected" />

    <button class="random-country-btn" @click="selectRandomCountry">
      Random Country
    </button>

    <RecommendationsView
      v-if="showRecommendations"
      :country="selectedCountry"
      @close="closeRecommendations"
    />
  </main>
</template>

<style scoped>
main {
  width: 100%;
  height: calc(100vh - 60px); /* Account for navbar height */
  overflow: hidden;
  position: relative;
}

.random-country-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  background: #feb503;
  color: #333;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(254, 181, 3, 0.4);
  z-index: 100;
}

.random-country-btn:hover {
  background: #ffc520;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(254, 181, 3, 0.6);
}

.random-country-btn:active {
  transform: translateY(0px);
  box-shadow: 0 2px 8px rgba(254, 181, 3, 0.4);
}
</style>
