<script setup>
import { ref, onMounted, computed } from "vue";
import SongCard from "@/components/SongCard.vue";
import { getSystemRecs, getCommunityRecs } from "@/api/recommendations.js";

const emit = defineEmits(["close"]);
const props = defineProps({ country: { type: String, default: "Taiwan" } });
const country = computed(() => props.country || "Taiwan");

const ourPicks = ref([]);
const communityPicks = ref([]);
const loading = ref(false);
const error = ref(null);

onMounted(async () => {
  loading.value = true;
  error.value = null;

  try {
    const [systemRecs, commRecs] = await Promise.all([
      getSystemRecs(country.value),
      getCommunityRecs(country.value),
    ]);

    ourPicks.value = systemRecs || [];
    communityPicks.value = commRecs || [];
  } catch (e) {
    console.error("Failed to fetch recommendations", e);
    error.value = "Failed to load recommendations";
    ourPicks.value = [];
    communityPicks.value = [];
  } finally {
    loading.value = false;
  }
});

function handleClose() {
  emit("close");
}
</script>

<template>
  <div class="modal-backdrop" @click.self="handleClose">
    <div class="modal-panel">
      <button class="close-btn" aria-label="Close" @click="handleClose">
        ×
      </button>
      <div class="modal-content">
        <div class="title-container">
          <h1>{{ country }}</h1>
        </div>
        <div v-if="loading" class="loading">Loading recommendations…</div>
        <div v-else class="main-container">
          <div class="panel-container">
            <h1>Our Picks</h1>
            <div class="song-container">
              <SongCard
                v-for="s in ourPicks"
                :key="s.title"
                :song-id="s._id || ''"
                :title="s.title"
                :artist="s.artist"
                :genre="s.genre"
                :language="s.language"
                :youtube-url="s.youtubeUrl"
                :country="country"
                :rec-type="s.recType || 'System'"
              />
            </div>
          </div>
          <div class="panel-container">
            <h1>Community Picks</h1>
            <div class="song-container">
              <SongCard
                v-for="s in communityPicks"
                :key="s.title"
                :song-id="s._id || ''"
                :title="s.title"
                :artist="s.artist"
                :genre="s.genre"
                :language="s.language"
                :youtube-url="s.youtubeUrl"
                :country="country"
                :rec-type="s.recType || 'Community'"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-panel {
  position: relative;
  width: min(1100px, 92vw);
  max-height: 86vh;
  background: #0b0b0b;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
  overflow: hidden;
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  font-size: 24px;
  line-height: 24px;
  cursor: pointer;
}
.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.modal-content {
  padding: 16px 20px 20px 20px;
  color: #fff;
  overflow-y: auto;
  max-height: 86vh;
}

.title-container {
  display: flex;
  padding: 0;
  margin-bottom: 8px;
  gap: 0;
}
.title-container h1 {
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  font-size: 2rem;
  font-weight: 600;
  margin: 0;
  color: #38bdf8;
  letter-spacing: 0.05em;
}

.main-container {
  display: flex;
  flex-direction: row;
  gap: 2rem;
  justify-content: space-around;
  padding: 0rem 0.5rem 0.5rem;
  flex: 1;
  max-width: 100%;
  width: 100%;
  height: 100%;
  max-height: 100%;
  min-height: 0%;
}

.panel-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: start;
  gap: 1rem;
  padding: 0rem 0.5rem 0.5rem;
  flex: 1;
}
.panel-container h1 {
  font-size: 1.4rem;
  font-weight: 600;
  margin: 0;
  color: #38bdf8;
  letter-spacing: 0.05em;
}

.song-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow-y: auto;
  scrollbar-gutter: stable;
  scrollbar-width: thin;
  width: 100%;
  max-width: 100%;
}

.song-container::-webkit-scrollbar {
  width: 6px;
}
.song-container::-webkit-scrollbar-track {
  background: transparent;
}
.song-container::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.25);
  border-radius: 4px;
}
.song-container::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.4);
}

.loading {
  padding: 8px;
  color: #ddd;
}
</style>
