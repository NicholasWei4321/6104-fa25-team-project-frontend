<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import Globe from "../components/Globe.vue";
import RecommendationsView from "./RecommendationsView.vue";

const router = useRouter();
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

function navigateToPlaylists() {
  router.push("/playlists");
}

function navigateToPassport() {
  router.push("/profile");
}
</script>

<template>
  <main>
    <Globe @select-country="onCountrySelected" />

    <button class="open-recs" @click="openRecommendations">
      Show Recommendations
    </button>

    <!-- Navigation Buttons -->
    <div class="nav-buttons">
      <button class="nav-fab" @click="navigateToPlaylists" title="My Playlists">
        <font-awesome-icon :icon="['fas', 'music']" />
      </button>
      <button class="nav-fab" @click="navigateToPassport" title="My Passport">
        <font-awesome-icon :icon="['fas', 'passport']" />
      </button>
    </div>

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

/* Navigation Buttons */
.nav-buttons {
  position: absolute;
  bottom: 24px;
  left: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 100;
}

.nav-fab {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #3d5d7e;
  color: #feb503;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  transition: all 0.2s ease;
}

.nav-fab:hover {
  background: #2d4d6e;
  color: #ffc520;
  transform: scale(1.1);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.4);
}

.nav-fab:active {
  transform: scale(0.95);
}
</style>
