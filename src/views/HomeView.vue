<script setup>
import { ref } from "vue";
import Globe from "../components/Globe.vue";
import RecommendationsView from "./RecommendationsView.vue";

const showRecommendations = ref(false);
const selectedCountry = ref("Taiwan");

function openRecommendations() {
  showRecommendations.value = true;
}
function closeRecommendations() {
  showRecommendations.value = false;
}
function onCountrySelected(country) {
  console.log("[Card Click] Country selected on globe:", country);
  selectedCountry.value = country || "Taiwan";
  showRecommendations.value = true;
}
</script>

<template>
  <main>
    <Globe @select-country="onCountrySelected" />

    <button class="open-recs" @click="openRecommendations">
      Show Recommendations
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
  height: 100vh;
  overflow: hidden;
  position: relative;
}

.open-recs {
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
}
.open-recs:hover {
  background: rgba(0, 0, 0, 0.75);
}
</style>
